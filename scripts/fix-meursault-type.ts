/**
 * Script til at rette Meursault appellation type til Village
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

async function fixMeursaultType() {
  console.log("🔧 Retter Meursault appellation type...\n");

  // Opdater Meursault appellation til Village (ikke Premier Cru)
  // Meursault er en Village appellation der har Premier Cru climats
  const { error } = await supabase
    .from("wine_regions")
    .update({
      type: "Village", // Communal/Village appellation
    })
    .eq("name", "Meursault")
    .eq("country", "France");

  if (error) {
    console.error("Fejl ved opdatering:", error);
    return;
  }

  console.log("✅ Meursault appellation type opdateret til 'Village'\n");

  // Verificer
  const { data: region } = await supabase
    .from("wine_regions")
    .select("*")
    .eq("name", "Meursault")
    .eq("country", "France")
    .single();

  if (region) {
    console.log("📋 Meursault Appellation Information:\n");
    console.log(`  Navn: ${region.name}`);
    console.log(`  Land: ${region.country}`);
    console.log(`  Region: ${region.region}`);
    console.log(`  Type: ${region.type}`);
  }
}

void fixMeursaultType();

