/**
 * Script til at vise importerede vin data
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

async function showData() {
  console.log("🍷 Vinmarker (Vineyards):\n");
  const { data: vineyards, error: vineyardsError } = await supabase
    .from("vineyards")
    .select("*")
    .order("country")
    .order("name");

  if (vineyardsError) {
    console.error("Fejl ved hentning af vinmarker:", vineyardsError);
  } else {
    console.log(`Total: ${vineyards?.length || 0} vinmarker\n`);
    vineyards?.forEach((v) => {
      console.log(`  - ${v.name}`);
      console.log(`    Land: ${v.country}`);
      if (v.region) console.log(`    Region: ${v.region}`);
      if (v.appellation) console.log(`    Appellation: ${v.appellation}`);
      console.log("");
    });
  }

  console.log("\n🌍 Regioner/Appellationer:\n");
  const { data: regions, error: regionsError } = await supabase
    .from("wine_regions")
    .select("*")
    .order("country")
    .order("name");

  if (regionsError) {
    console.error("Fejl ved hentning af regioner:", regionsError);
  } else {
    console.log(`Total: ${regions?.length || 0} regioner/appellationer\n`);
    regions?.forEach((r) => {
      console.log(`  - ${r.name}`);
      console.log(`    Land: ${r.country}`);
      if (r.region) console.log(`    Region: ${r.region}`);
      if (r.type) console.log(`    Type: ${r.type}`);
      console.log("");
    });
  }

  console.log("\n🏭 Producenter:\n");
  const { data: producers, error: producersError } = await supabase
    .from("wine_producers")
    .select("*")
    .order("country")
    .order("name");

  if (producersError) {
    console.error("Fejl ved hentning af producenter:", producersError);
  } else {
    console.log(`Total: ${producers?.length || 0} producenter\n`);
    if (producers && producers.length > 0) {
      producers.forEach((p) => {
        console.log(`  - ${p.name}`);
        console.log(`    Land: ${p.country}`);
        if (p.region) console.log(`    Region: ${p.region}`);
        console.log("");
      });
    } else {
      console.log("  (Ingen producenter importeret endnu)");
    }
  }
}

void showData();

