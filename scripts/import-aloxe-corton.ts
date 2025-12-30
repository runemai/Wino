/**
 * Script til at importere Aloxe-Corton data fra bourgogne-wines.com
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

// Premier Cru Climats fra bourgogne-wines.com
const premierCruVineyards = [
  "Clos des Maréchaudes",
  "Clos du Chapitre",
  "La Coutière",
  "La Maréchaude",
  "La Toppe au Vert",
  "Les Chaillots",
  "Les Fournières",
  "Les Guérets",
  "Les Maréchaudes",
  "Les Moutottes",
  "Les Paulands",
  "Les Petites Folières",
  "Les Valozières",
  "Les Vercots",
];

// Village Lieux-dits fra bourgogne-wines.com
const villageVineyards = [
  "Boulmeau",
  "La Boulotte",
  "La Toppe Marteneau",
  "Les Boutières",
  "Les Brunettes et Planchots",
  "Les Bruyères",
];

async function importAloxeCorton() {
  console.log("🗑️  Sletter eksisterende Aloxe-Corton data...\n");

  // Slet alle Aloxe-Corton vinmarker
  const { error: deleteVineyardsError } = await supabase
    .from("vineyards")
    .delete()
    .eq("appellation", "Aloxe-Corton")
    .eq("country", "France");

  if (deleteVineyardsError) {
    console.error("Fejl ved sletning af vinmarker:", deleteVineyardsError);
  }

  // Slet Aloxe-Corton region
  const { error: deleteRegionError } = await supabase
    .from("wine_regions")
    .delete()
    .eq("name", "Aloxe-Corton")
    .eq("country", "France");

  if (deleteRegionError) {
    console.error("Fejl ved sletning af region:", deleteRegionError);
  }

  console.log("✅ Eksisterende data slettet\n");

  // Opret/opdater Aloxe-Corton appellation
  console.log("📥 Opretter Aloxe-Corton appellation...\n");
  const { error: regionError } = await supabase
    .from("wine_regions")
    .upsert(
      {
        name: "Aloxe-Corton",
        country: "France",
        region: "Burgundy",
        type: "Village", // Village appellation med Premier Cru climats
      },
      {
        onConflict: "name,country",
      },
    );

  if (regionError) {
    console.error("Fejl ved oprettelse af appellation:", regionError);
    return;
  }

  console.log("✅ Aloxe-Corton appellation oprettet\n");

  // Importer Premier Cru Climats
  console.log("📥 Importerer Premier Cru Climats...\n");
  let premierCruCount = 0;
  for (const vineyard of premierCruVineyards) {
    const { error: vineyardError } = await supabase
      .from("vineyards")
      .upsert(
        {
          name: vineyard,
          country: "France",
          region: "Burgundy",
          appellation: "Aloxe-Corton",
          classification: "Premier Cru",
          subclassification: "Climat",
        },
        {
          onConflict: "name,country",
        },
      );

    if (vineyardError) {
      console.error(`Fejl ved import af ${vineyard}:`, vineyardError);
    } else {
      premierCruCount++;
      console.log(`  ✅ ${vineyard} → Premier Cru / Climat`);
    }
  }

  // Importer Village Lieux-dits
  console.log("\n📥 Importerer Village Lieux-dits...\n");
  let villageCount = 0;
  for (const vineyard of villageVineyards) {
    const { error: vineyardError } = await supabase
      .from("vineyards")
      .upsert(
        {
          name: vineyard,
          country: "France",
          region: "Burgundy",
          appellation: "Aloxe-Corton",
          classification: "Village",
          subclassification: "Lieux-dit",
        },
        {
          onConflict: "name,country",
        },
      );

    if (vineyardError) {
      console.error(`Fejl ved import af ${vineyard}:`, vineyardError);
    } else {
      villageCount++;
      console.log(`  📍 ${vineyard} → Village / Lieux-dit`);
    }
  }

  console.log(`\n✅ Import færdig!`);
  console.log(`   - Premier Cru / Climat: ${premierCruCount}`);
  console.log(`   - Village / Lieux-dit: ${villageCount}`);
  console.log(`   - Total: ${premierCruCount + villageCount}`);
}

void importAloxeCorton();

