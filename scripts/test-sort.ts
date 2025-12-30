/**
 * Test script til at verificere sortering af autocomplete forslag
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

async function testSort() {
  const query = "La";
  const searchQuery = `%${query}%`;

  const { data } = await supabase
    .from("vineyards")
    .select("name")
    .ilike("name", searchQuery)
    .limit(20)
    .order("name");

  const allNames = (data || []).map((row) => row.name);
  const queryLower = query.toLowerCase().trim();

  const sorted = allNames.sort((a, b) => {
    const aLower = a.toLowerCase().trim();
    const bLower = b.toLowerCase().trim();
    const aStarts = aLower.startsWith(queryLower);
    const bStarts = bLower.startsWith(queryLower);

    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    if (aStarts && bStarts) return a.localeCompare(b);
    return a.localeCompare(b);
  });

  console.log("Query:", query);
  console.log("Total matches:", allNames.length);
  console.log(
    "Starts with query:",
    sorted.filter((n) => n.toLowerCase().startsWith(queryLower)).length,
  );
  console.log("\nFirst 10 sorted:");
  sorted.slice(0, 10).forEach((n, i) => {
    const starts = n.toLowerCase().startsWith(queryLower);
    console.log(`${i + 1}. ${n} ${starts ? "[STARTS]" : "[CONTAINS]"}`);
  });
}

void testSort();

