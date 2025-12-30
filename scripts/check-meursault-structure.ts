/**
 * Script til at tjekke Meursault struktur i databasen
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

async function checkStructure() {
  // Tjek Meursault region
  const { data: region } = await supabase
    .from("wine_regions")
    .select("*")
    .eq("name", "Meursault")
    .eq("country", "France")
    .single();

  console.log("🌍 Meursault Appellation:\n");
  if (region) {
    console.log(JSON.stringify(region, null, 2));
  } else {
    console.log("❌ Ikke fundet");
  }

  // Tjek et eksempel vineyard
  const { data: vineyard } = await supabase
    .from("vineyards")
    .select("*")
    .eq("name", "Les Santenots Dessous")
    .eq("appellation", "Meursault")
    .single();

  console.log("\n🍷 Les Santenots Dessous Vineyard:\n");
  if (vineyard) {
    console.log(JSON.stringify(vineyard, null, 2));
  } else {
    console.log("❌ Ikke fundet");
  }
}

void checkStructure();

