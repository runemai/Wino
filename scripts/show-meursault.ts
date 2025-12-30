/**
 * Script til at vise alle Meursault marker i databasen
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

async function showMeursault() {
  console.log("🍷 Meursault Vinmarker:\n");

  // Find alle Meursault vinmarker
  const { data: vineyards, error: vineyardsError } = await supabase
    .from("vineyards")
    .select("*")
    .eq("appellation", "Meursault")
    .eq("country", "France")
    .order("name");

  if (vineyardsError) {
    console.error("Fejl ved hentning af vinmarker:", vineyardsError);
    return;
  }

  // Find Meursault region info
  const { data: region, error: regionError } = await supabase
    .from("wine_regions")
    .select("*")
    .eq("name", "Meursault")
    .eq("country", "France")
    .single();

  console.log(`Total: ${vineyards?.length || 0} vinmarker\n`);

  if (region) {
    console.log(`Appellation: ${region.name}`);
    console.log(`Type: ${region.type || "Ikke angivet"}`);
    console.log(`Region: ${region.region || "Ikke angivet"}\n`);
  }

  // De 19 rigtige Premier Cru marker
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

  const premierCru: typeof vineyards = [];
  const village: typeof vineyards = [];

  vineyards?.forEach((v) => {
    const isPremierCru = premierCruVineyards.some(
      (pc) => pc === v.name.toLowerCase().trim(),
    );
    if (isPremierCru) {
      premierCru.push(v);
    } else {
      village.push(v);
    }
  });

  console.log("🏆 Premier Cru marker:\n");
  if (premierCru.length > 0) {
    premierCru.forEach((v) => {
      console.log(`  ✅ ${v.name}`);
    });
  } else {
    console.log("  (Ingen Premier Cru marker fundet)");
  }

  console.log(`\n📍 Village marker (${village.length}):\n`);
  if (village.length > 0) {
    village.forEach((v) => {
      console.log(`  ${v.name}`);
    });
  } else {
    console.log("  (Ingen Village marker fundet)");
  }

  console.log(`\n📊 Oversigt:`);
  console.log(`   - Premier Cru: ${premierCru.length}`);
  console.log(`   - Village: ${village.length}`);
  console.log(`   - Total: ${vineyards?.length || 0}`);
}

void showMeursault();

