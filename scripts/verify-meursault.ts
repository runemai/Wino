/**
 * Script til at verificere Meursault data i databasen
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

const expectedPremierCru = [
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

async function verify() {
  const { data: vineyards } = await supabase
    .from("vineyards")
    .select("*")
    .eq("appellation", "Meursault")
    .eq("country", "France")
    .order("name");

  console.log(`Total Meursault marker: ${vineyards?.length || 0}\n`);

  console.log("🏆 Premier Cru marker (fra burgundy-report.com):\n");
  expectedPremierCru.forEach((pc) => {
    const found = vineyards?.find(
      (v) => v.name.toLowerCase() === pc.toLowerCase(),
    );
    if (found) {
      console.log(`  ✅ ${pc}`);
    } else {
      console.log(`  ❌ ${pc} - MANGER!`);
    }
  });

  console.log(`\n📍 Alle Meursault marker i databasen (${vineyards?.length || 0}):\n`);
  vineyards?.forEach((v) => {
    const isPremierCru = expectedPremierCru.some(
      (pc) => pc.toLowerCase() === v.name.toLowerCase(),
    );
    console.log(
      `  ${isPremierCru ? "🏆" : "📍"} ${v.name} (${isPremierCru ? "Premier Cru" : "Village"})`,
    );
  });
}

void verify();

