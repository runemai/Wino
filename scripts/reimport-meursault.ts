/**
 * Script til at slette alle Meursault data og reimportere korrekt fra burgundy-report.com
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

// De 19 rigtige Premier Cru marker fra burgundy-report.com
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
  "Porusot", // or Poruzot
  "Sous Blagny",
  "Sous le Dos d'Ane",
];

// Village Lieux-Dits fra burgundy-report.com
const villageVineyards = [
  "Au Moulin Judas",
  "Au Moulin Landin",
  "Au Murger de Monthélie",
  "Au Village",
  "Clos de la Barre",
  "Clos des Mouches",
  "En Gargouillot",
  "En l'Ormeau",
  "En la Barre",
  "En Marcausse",
  "La Barre Dessus",
  "Le Bois de Blagny",
  "Le Buisson Certaut",
  "Le Cromin",
  "Le Limozin",
  "Le Meix sous le Château",
  "Le Meix Tavaux",
  "Le Pré de Manche",
  "Le Tesson",
  "Les Casse-Têtes",
  "Les Chaumes",
  "Les Chaumes de Narvaux",
  "Les Chevalières",
  "Les Clous Dessous",
  "Les Clous Dessus",
  "Les Corbins",
  "Les Criots",
  "Les Dressoles",
  "Les Durots",
  "Les Forges",
  "Les Gorges de Narvaux",
  "Les Grands Charrons",
  "Les Gruyaches",
  "Les Luchets",
  "Les Magny",
  "Les Malpoiriers",
  "Les Meix Chavaux",
  "Les Millerands",
  "Les Narvaux Dessoux",
  "Les Narvaux Dessus",
  "Les Pellans",
  "Les Pelles-Dessous",
  "Les Pelles-Dessus",
  "Les Perchots",
  "Les Petits Charrons",
  "Les Peutes Vignes",
  "Les Rougeots",
  "Les Santenots Dessous",
  "Les Terres Blanches",
  "Les Tillets",
  "Les Vignes Blanches",
  "Les Vireuils Dessous",
  "Les Vireuils Dessus",
];

async function reimportMeursault() {
  console.log("🗑️  Sletter alle eksisterende Meursault data...\n");

  // Slet alle Meursault vinmarker
  const { error: deleteVineyardsError } = await supabase
    .from("vineyards")
    .delete()
    .eq("appellation", "Meursault")
    .eq("country", "France");

  if (deleteVineyardsError) {
    console.error("Fejl ved sletning af vinmarker:", deleteVineyardsError);
    return;
  }

  // Slet Meursault region
  const { error: deleteRegionError } = await supabase
    .from("wine_regions")
    .delete()
    .eq("name", "Meursault")
    .eq("country", "France");

  if (deleteRegionError) {
    console.error("Fejl ved sletning af region:", deleteRegionError);
  }

  console.log("✅ Alle Meursault data slettet\n");

  console.log("📥 Importerer Premier Cru marker...\n");

  // Importer Premier Cru marker
  for (const vineyard of premierCruVineyards) {
    // Opret/opdater region
    const { error: regionError } = await supabase
      .from("wine_regions")
      .upsert(
        {
          name: "Meursault",
          country: "France",
          region: "Burgundy",
          type: "Premier Cru",
        },
        {
          onConflict: "name,country",
        },
      );

    if (regionError) {
      console.error(`Fejl ved oprettelse af region:`, regionError);
      continue;
    }

    // Opret vineyard
    const { error: vineyardError } = await supabase
      .from("vineyards")
      .upsert(
        {
          name: vineyard,
          country: "France",
          region: "Burgundy",
          appellation: "Meursault",
        },
        {
          onConflict: "name,country",
        },
      );

    if (vineyardError) {
      console.error(`Fejl ved import af ${vineyard}:`, vineyardError);
    } else {
      console.log(`  ✅ ${vineyard} (Premier Cru)`);
    }
  }

  console.log(`\n📥 Importerer Village Lieux-Dits marker...\n`);

  // Importer Village marker
  for (const vineyard of villageVineyards) {
    // Opret vineyard
    const { error: vineyardError } = await supabase
      .from("vineyards")
      .upsert(
        {
          name: vineyard,
          country: "France",
          region: "Burgundy",
          appellation: "Meursault",
        },
        {
          onConflict: "name,country",
        },
      );

    if (vineyardError) {
      console.error(`Fejl ved import af ${vineyard}:`, vineyardError);
    } else {
      console.log(`  📍 ${vineyard} (Village)`);
    }
  }

  // Opdater region til at have både Premier Cru og Village type
  const { error: finalRegionError } = await supabase
    .from("wine_regions")
    .upsert(
      {
        name: "Meursault",
        country: "France",
        region: "Burgundy",
        type: "Premier Cru", // Meursault har Premier Cru climats
      },
      {
        onConflict: "name,country",
      },
    );

  if (finalRegionError) {
    console.error("Fejl ved final opdatering af region:", finalRegionError);
  }

  console.log(`\n✅ Import færdig!`);
  console.log(`   - Premier Cru marker: ${premierCruVineyards.length}`);
  console.log(`   - Village Lieux-Dits: ${villageVineyards.length}`);
  console.log(`   - Total: ${premierCruVineyards.length + villageVineyards.length}`);
}

void reimportMeursault();

