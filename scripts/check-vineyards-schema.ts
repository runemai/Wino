/**
 * Script til at tjekke vineyards tabel struktur
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

async function checkSchema() {
  // Hent en vineyard for at se strukturen
  const { data: vineyard } = await supabase
    .from("vineyards")
    .select("*")
    .eq("name", "Les Santenots Dessous")
    .single();

  console.log("📋 Vineyards tabel struktur (via eksempel):\n");
  if (vineyard) {
    console.log(JSON.stringify(vineyard, null, 2));
  } else {
    console.log("❌ Ingen data fundet");
  }
}

void checkSchema();

