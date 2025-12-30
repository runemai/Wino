/**
 * Script til at fjerne "Clos de Vougeot" fra appellations tabellen
 * da den kun skal være en vinmark, ikke en appellation
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

async function fixClosVougeot() {
  console.log("🗑️  Sletter 'Clos de Vougeot' fra appellations tabellen...\n");

  const { error } = await supabase
    .from("wine_regions")
    .delete()
    .eq("name", "Clos de Vougeot")
    .eq("country", "France");

  if (error) {
    console.error("Fejl ved sletning:", error);
    return;
  }

  console.log("✅ 'Clos de Vougeot' er nu fjernet fra appellations tabellen");
  console.log("✅ 'Clos de Vougeot' forbliver som vinmark i vineyards tabellen");
}

void fixClosVougeot();

