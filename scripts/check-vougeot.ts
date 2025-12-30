/**
 * Script til at tjekke Vougeot data i databasen
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

async function checkVougeot() {
  const query = "Voug";

  console.log(`🔍 Søger efter "${query}" i appellations...\n`);

  // Tjek appellations
  const { data: appellations } = await supabase
    .from("wine_regions")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name");

  console.log("📋 Appellations der matcher:");
  appellations?.forEach((a) => {
    console.log(`  - ${a.name} (${a.country}, ${a.region || "N/A"}, type: ${a.type || "N/A"})`);
  });

  console.log(`\n🔍 Søger efter "${query}" i vinmarker...\n`);

  // Tjek vineyards
  const { data: vineyards } = await supabase
    .from("vineyards")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name");

  console.log("🍇 Vinmarker der matcher:");
  vineyards?.forEach((v) => {
    console.log(
      `  - ${v.name} (${v.country}, ${v.appellation || "N/A"}, ${v.classification || "N/A"})`,
    );
  });

  // Tjek specifikt for "Clos de Vougeot"
  console.log(`\n🔍 Tjekker specifikt for "Clos de Vougeot"...\n`);

  const { data: closVougeotAppellation } = await supabase
    .from("wine_regions")
    .select("*")
    .eq("name", "Clos de Vougeot")
    .single();

  const { data: closVougeotVineyard } = await supabase
    .from("vineyards")
    .select("*")
    .eq("name", "Clos de Vougeot")
    .single();

  if (closVougeotAppellation) {
    console.log("⚠️  'Clos de Vougeot' findes som APPellation:");
    console.log(`  - ${JSON.stringify(closVougeotAppellation, null, 2)}`);
  }

  if (closVougeotVineyard) {
    console.log("\n✅ 'Clos de Vougeot' findes som VINMARK:");
    console.log(`  - ${JSON.stringify(closVougeotVineyard, null, 2)}`);
  }

  if (!closVougeotAppellation && !closVougeotVineyard) {
    console.log("❌ 'Clos de Vougeot' findes ikke i databasen");
  }
}

void checkVougeot();

