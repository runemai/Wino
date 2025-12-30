/**
 * Script til at opdatere Meursault marker med korrekt type
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Mangler SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// De 19 Premier Cru marker
const premierCruVineyards = [
  "Blagny",
  "Charmes",
  "Clos des Perrières",
  "Genevrières",
  "La Jeunellotte",
  "La Pièce sous le Bois",
  "Le Porusot",
  "Les Bouchères",
  "Les Caillerets",
  "Les Cras",
  "Les Gouttes d'Or",
  "Les Plures",
  "Les Ravelles",
  "Les Santenots Blancs",
  "Les Santenots du Milieu",
  "Perrières",
  "Porusot",
  "Sous Blagny",
  "Sous le Dos d'Ane",
];

async function updateType() {
  console.log("🔧 Opdaterer Meursault marker med type...\n");

  // Hent alle Meursault marker
  const { data: vineyards, error } = await supabase
    .from("vineyards")
    .select("*")
    .eq("appellation", "Meursault")
    .eq("country", "France");

  if (error) {
    console.error("Fejl:", error);
    return;
  }

  let premierCruUpdated = 0;
  let lieuxDitsUpdated = 0;

  for (const vineyard of vineyards || []) {
    const isPremierCru = premierCruVineyards.some(
      (pc) => pc.toLowerCase() === vineyard.name.toLowerCase(),
    );

    const type = isPremierCru ? "Premier Cru" : "Lieux-Dits";

    const { error: updateError } = await supabase
      .from("vineyards")
      .update({ type })
      .eq("id", vineyard.id);

    if (updateError) {
      console.error(`Fejl ved opdatering af ${vineyard.name}:`, updateError);
    } else {
      if (isPremierCru) {
        premierCruUpdated++;
        console.log(`  ✅ ${vineyard.name} → Premier Cru`);
      } else {
        lieuxDitsUpdated++;
        console.log(`  📍 ${vineyard.name} → Lieux-Dits`);
      }
    }
  }

  console.log(`\n✅ Opdatering færdig!`);
  console.log(`   - Premier Cru: ${premierCruUpdated}`);
  console.log(`   - Lieux-Dits: ${lieuxDitsUpdated}`);
}

void updateType();

