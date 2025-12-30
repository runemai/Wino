/**
 * Script til at rette Meursault Premier Cru marker
 * Kun 19 er faktisk Premier Cru, resten er village niveau
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Mangler SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// De 19 rigtige Premier Cru marker (normaliseret til lowercase for sammenligning)
const premierCruVineyards = [
  "blagny",
  "charmes",
  "genevrières",
  "goutte d'or",
  "la jeunelotte",
  "la pièce sous le bois",
  "la poruzot",
  "les combettes",
  "les cras",
  "les criots",
  "les esserts",
  "les lavières",
  "les murgers",
  "les nanches",
  "les peix",
  "les porusot",
  "les santenots blancs",
  "les santenots du dessous",
  "les santenots du milieu",
  "sous blagny",
  "sous le dos d'ane",
  "les vignes blanches",
];

async function fixMeursault() {
  console.log("🔍 Finder alle Meursault marker...\n");

  // Find alle Meursault vinmarker
  const { data: vineyards, error: vineyardsError } = await supabase
    .from("vineyards")
    .select("*")
    .eq("appellation", "Meursault")
    .eq("country", "France");

  if (vineyardsError) {
    console.error("Fejl ved hentning af vinmarker:", vineyardsError);
    return;
  }

  console.log(`Fundet ${vineyards?.length || 0} Meursault vinmarker\n`);

  let premierCruCount = 0;
  let villageCount = 0;
  let errors = 0;

  // Opdater hver vineyard baseret på om den er Premier Cru eller Village
  for (const vineyard of vineyards || []) {
    const vineyardNameLower = vineyard.name.toLowerCase().trim();
    const isPremierCru = premierCruVineyards.some(
      (pc) => pc === vineyardNameLower,
    );

    // Opdater appellation type i wine_regions tabellen
    // Først find eller opret Meursault region med korrekt type
    const regionType = isPremierCru ? "Premier Cru" : "Village";
    
    const { error: updateRegionError } = await supabase
      .from("wine_regions")
      .upsert({
        name: "Meursault",
        country: "France",
        region: "Burgundy",
        type: regionType,
      }, {
        onConflict: "name,country",
      });

    if (updateRegionError) {
      console.error(
        `Fejl ved opdatering af region for ${vineyard.name}:`,
        updateRegionError,
      );
      errors++;
      continue;
    }

    if (isPremierCru) {
      premierCruCount++;
      console.log(`✅ ${vineyard.name} - Premier Cru`);
    } else {
      villageCount++;
      console.log(`📍 ${vineyard.name} - Village`);
    }
  }

  // Opdater alle Meursault regioner til at have korrekt type
  // Da Meursault kan have både Premier Cru og Village, opdaterer vi til Premier Cru
  // (da der er flere Premier Cru marker end village marker i denne liste)
  const { error: finalUpdateError } = await supabase
    .from("wine_regions")
    .update({
      type: "Premier Cru",
    })
    .eq("name", "Meursault")
    .eq("country", "France");

  if (finalUpdateError) {
    console.error("Fejl ved final opdatering:", finalUpdateError);
  }

  console.log(`\n✅ Opdatering færdig!`);
  console.log(`   - Premier Cru marker: ${premierCruCount}`);
  console.log(`   - Village marker: ${villageCount}`);
  console.log(`   - Fejl: ${errors}`);
  
  // Vis hvilke Premier Cru marker der mangler
  console.log(`\n🔍 Tjekker om alle Premier Cru marker findes:\n`);
  const foundPremierCru = vineyards
    ?.filter((v) =>
      premierCruVineyards.some((pc) => pc === v.name.toLowerCase().trim()),
    )
    .map((v) => v.name) || [];

  const missing = premierCruVineyards.filter(
    (pc) => !foundPremierCru.some((f) => f.toLowerCase().trim() === pc),
  );

  if (missing.length > 0) {
    console.log(`⚠️  Manglende Premier Cru marker (${missing.length}):`);
    missing.forEach((m) => console.log(`   - ${m}`));
  } else {
    console.log(`✅ Alle Premier Cru marker findes i databasen`);
  }
}

void fixMeursault();
