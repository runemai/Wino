/**
 * Script til at vise information om en specifik vineyard
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

async function showVineyard(vineyardName: string) {
  console.log(`🔍 Søger efter: "${vineyardName}"\n`);

  // Find vineyard
  const { data: vineyards, error: vineyardsError } = await supabase
    .from("vineyards")
    .select("*")
    .ilike("name", `%${vineyardName}%`);

  if (vineyardsError) {
    console.error("Fejl ved hentning af vineyard:", vineyardsError);
    return;
  }

  if (!vineyards || vineyards.length === 0) {
    console.log("❌ Ingen vineyard fundet med dette navn");
    return;
  }

  // Find specifik match
  const exactMatch = vineyards.find(
    (v) => v.name.toLowerCase() === vineyardName.toLowerCase(),
  );

  const vineyard = exactMatch || vineyards[0];

  console.log("📋 Vineyard Information:\n");
  console.log(`  Navn: ${vineyard.name}`);
  console.log(`  Land: ${vineyard.country || "Ikke angivet"}`);
  console.log(`  Region: ${vineyard.region || "Ikke angivet"}`);
  console.log(`  Appellation: ${vineyard.appellation || "Ikke angivet"}`);
  console.log(`  Classification: ${vineyard.classification || "Ikke angivet"}`);
  console.log(`  Subclassification: ${vineyard.subclassification || "Ikke angivet"}`);
  console.log(`  ID: ${vineyard.id}`);
  console.log(`  Oprettet: ${new Date(vineyard.created_at).toLocaleString("da-DK")}`);

  // Find relateret region/appellation info
  if (vineyard.appellation) {
    console.log(`\n🌍 Appellation Information:\n`);
    const { data: region } = await supabase
      .from("wine_regions")
      .select("*")
      .eq("name", vineyard.appellation)
      .eq("country", vineyard.country)
      .single();

    if (region) {
      console.log(`  Navn: ${region.name}`);
      console.log(`  Land: ${region.country}`);
      console.log(`  Region: ${region.region || "Ikke angivet"}`);
      console.log(`  Type: ${region.type || "Ikke angivet"}`);
    } else {
      console.log("  (Ingen appellation information fundet)");
    }
  }

  // Vis alle matches hvis der er flere
  if (vineyards.length > 1) {
    console.log(`\n⚠️  Fundet ${vineyards.length} matches:\n`);
    vineyards.forEach((v, i) => {
      console.log(`  ${i + 1}. ${v.name} (${v.country}, ${v.appellation || "N/A"})`);
    });
  }
}

const vineyardName = process.argv[2] || "Les Santenots Dessous";
void showVineyard(vineyardName);

