/**
 * Script til at tjekke om en vineyard er Premier Cru eller Village
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || ! SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Mangler SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

async function checkVineyard(vineyardName: string) {
  const { data: vineyard } = await supabase
    .from("vineyards")
    .select("*")
    .eq("name", vineyardName)
    .eq("appellation", "Meursault")
    .eq("country", "France")
    .single();

  if (!vineyard) {
    console.log(`❌ Vineyard "${vineyardName}" ikke fundet`);
    return;
  }

  console.log(`📋 Vineyard: ${vineyard.name}\n`);
  console.log(`  Land: ${vineyard.country}`);
  console.log(`  Region: ${vineyard.region}`);
  console.log(`  Appellation: ${vineyard.appellation}`);
  
  // Tjek om det er Premier Cru
  const isPremierCru = premierCruVineyards.some(
    (pc) => pc.toLowerCase() === vineyard.name.toLowerCase(),
  );

  console.log(`\n  Klassifikation: ${isPremierCru ? "🏆 Premier Cru" : "📍 Village"}`);
  
  if (vineyardName === "Les Santenots Dessous" && isPremierCru) {
    console.log(`\n  ⚠️  FEJL: Denne mark skal være Village, ikke Premier Cru!`);
  } else if (vineyardName === "Les Santenots Dessous" && !isPremierCru) {
    console.log(`\n  ✅ Korrekt: Denne mark er Village (ikke Premier Cru)`);
  }
}

const vineyardName = process.argv[2] || "Les Santenots Dessous";
void checkVineyard(vineyardName);

