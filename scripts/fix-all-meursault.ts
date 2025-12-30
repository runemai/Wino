/**
 * Script til at verificere og rette alle Meursault marker mod burgundy-report.com
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
  "Porusot", // or Poruzot - vi har begge
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
  "Les Santenots Dessous", // Village, IKKE Premier Cru!
  "Les Terres Blanches",
  "Les Tillets",
  "Les Vignes Blanches",
  "Les Vireuils Dessous",
  "Les Vireuils Dessus",
];

async function fixAllMeursault() {
  console.log("🔍 Finder alle Meursault marker i databasen...\n");

  const { data: allVineyards, error } = await supabase
    .from("vineyards")
    .select("*")
    .eq("appellation", "Meursault")
    .eq("country", "France")
    .order("name");

  if (error) {
    console.error("Fejl:", error);
    return;
  }

  console.log(`Fundet ${allVineyards?.length || 0} marker i databasen\n`);

  // Kombiner begge lister for at få alle korrekte navne
  const allCorrectVineyards = [
    ...premierCruVineyards.map((n) => ({ name: n, type: "Premier Cru" })),
    ...villageVineyards.map((n) => ({ name: n, type: "Village" })),
  ];

  // Find marker der ikke skal være der
  const toDelete: typeof allVineyards = [];
  const toKeep: typeof allVineyards = [];

  allVineyards?.forEach((v) => {
    const isCorrect = allCorrectVineyards.some(
      (cv) => cv.name.toLowerCase() === v.name.toLowerCase(),
    );
    if (isCorrect) {
      toKeep.push(v);
    } else {
      toDelete.push(v);
    }
  });

  // Find manglende marker
  const missing = allCorrectVineyards.filter(
    (cv) =>
      !allVineyards?.some(
        (v) => v.name.toLowerCase() === cv.name.toLowerCase(),
      ),
  );

  console.log("📊 Analyse:\n");
  console.log(`  ✅ Korrekte marker: ${toKeep.length}`);
  console.log(`  ❌ Marker der skal slettes: ${toDelete.length}`);
  console.log(`  ➕ Manglende marker: ${missing.length}\n`);

  if (toDelete.length > 0) {
    console.log("🗑️  Sletter forkerte marker:\n");
    for (const v of toDelete) {
      console.log(`  ❌ ${v.name}`);
      const { error: delError } = await supabase
        .from("vineyards")
        .delete()
        .eq("id", v.id);
      if (delError) {
        console.error(`    Fejl: ${delError.message}`);
      }
    }
  }

  if (missing.length > 0) {
    console.log("\n➕ Tilføjer manglende marker:\n");
    for (const cv of missing) {
      console.log(`  ➕ ${cv.name} (${cv.type})`);
      const { error: insError } = await supabase.from("vineyards").upsert({
        name: cv.name,
        country: "France",
        region: "Burgundy",
        appellation: "Meursault",
      });
      if (insError) {
        console.error(`    Fejl: ${insError.message}`);
      }
    }
  }

  // Verificer final status
  console.log("\n✅ Verificerer final status...\n");
  const { data: finalVineyards } = await supabase
    .from("vineyards")
    .select("*")
    .eq("appellation", "Meursault")
    .eq("country", "France")
    .order("name");

  const finalPremierCru = finalVineyards?.filter((v) =>
    premierCruVineyards.some((pc) => pc.toLowerCase() === v.name.toLowerCase()),
  ) || [];

  const finalVillage = finalVineyards?.filter((v) =>
    villageVineyards.some((vl) => vl.toLowerCase() === v.name.toLowerCase()),
  ) || [];

  console.log("📊 Final status:\n");
  console.log(`  🏆 Premier Cru: ${finalPremierCru.length} (skal være ${premierCruVineyards.length})`);
  console.log(`  📍 Village: ${finalVillage.length} (skal være ${villageVineyards.length})`);
  console.log(`  📦 Total: ${finalVineyards?.length || 0} (skal være ${premierCruVineyards.length + villageVineyards.length})`);

  // Vis hvilke Premier Cru marker der findes
  console.log("\n🏆 Premier Cru marker i databasen:\n");
  finalPremierCru.forEach((v) => {
    const isCorrect = premierCruVineyards.some(
      (pc) => pc.toLowerCase() === v.name.toLowerCase(),
    );
    console.log(`  ${isCorrect ? "✅" : "❌"} ${v.name}`);
  });

  // Vis hvilke Village marker der findes
  console.log("\n📍 Village marker i databasen:\n");
  finalVillage.forEach((v) => {
    const isCorrect = villageVineyards.some(
      (vl) => vl.toLowerCase() === v.name.toLowerCase(),
    );
    console.log(`  ${isCorrect ? "✅" : "❌"} ${v.name}`);
  });
}

void fixAllMeursault();

