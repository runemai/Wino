/**
 * Script til at importere CSV data til wine_regions, vineyards og wine_producers tabeller
 * 
 * CSV format forventet:
 *   country,region,subregion,appellation_or_village,vineyard,classification,notes
 * 
 * Brug: pnpm tsx scripts/import-wine-data.ts <csv-file>
 * 
 * Eksempel:
 *   pnpm tsx scripts/import-wine-data.ts france_germany_cru_lage_template.csv
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Mangler SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY");
  console.error("Sørg for at have .env.local filen sat op korrekt");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface CSVRow {
  country: string;
  region: string;
  subregion?: string;
  appellation_or_village: string;
  vineyard: string;
  classification?: string; // Grand Cru, Premier Cru, Village, Regional
  notes?: string;
}

async function importData(filePath: string) {
  console.log(`Importerer data fra ${filePath}...`);

  const fileContent = readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CSVRow[];

  console.log(`Fundet ${records.length} rækker`);

  let regionsImported = 0;
  let vineyardsImported = 0;
  let errors = 0;

  for (const record of records) {
    if (!record.country) {
      console.warn("Skipper række uden country:", record);
      errors++;
      continue;
    }

    try {
      // Import appellation/region (appellation_or_village)
      if (record.appellation_or_village) {
        // Bestem appellation type baseret på classification
        // Hvis classification er Premier Cru eller Grand Cru, er appellationen stadig Village niveau
        // (da appellationen har Premier Cru/Grand Cru climats, men selve appellationen er Village)
        const appellationType = record.classification === "Regional" 
          ? "Regional" 
          : "Village"; // Premier Cru og Grand Cru er climats, ikke appellation niveau

        const { error: regionError } = await supabase
          .from("wine_regions")
          .upsert(
            {
              name: record.appellation_or_village,
              country: record.country,
              region: record.region || null,
              type: appellationType,
            },
            {
              onConflict: "name,country",
            },
          );

        if (regionError) {
          console.error(
            `Fejl ved import af region ${record.appellation_or_village}:`,
            regionError,
          );
          errors++;
        } else {
          regionsImported++;
        }
      }

      // Import vineyard
      if (record.vineyard) {
        // Bestem subclassification baseret på classification
        // Premier Cru og Grand Cru marker er Climats
        // Village marker er Lieux-dits
        let subclassification: string | null = null;
        if (record.classification === "Premier Cru" || record.classification === "Grand Cru") {
          subclassification = "Climat";
        } else if (record.classification === "Village") {
          subclassification = "Lieux-dit";
        }

        const { error: vineyardError } = await supabase
          .from("vineyards")
          .upsert(
            {
              name: record.vineyard,
              country: record.country,
              region: record.region || null,
              appellation: record.appellation_or_village || null,
              classification: record.classification || null,
              subclassification: subclassification,
            },
            {
              onConflict: "name,country",
            },
          );

        if (vineyardError) {
          console.error(
            `Fejl ved import af vineyard ${record.vineyard}:`,
            vineyardError,
          );
          errors++;
        } else {
          vineyardsImported++;
        }
      }
    } catch (err) {
      console.error(`Uventet fejl ved import:`, err);
      errors++;
    }
  }

  console.log(`\n✅ Import færdig!`);
  console.log(`   - Regioner/Appellationer: ${regionsImported}`);
  console.log(`   - Vinmarker: ${vineyardsImported}`);
  console.log(`   - Fejl: ${errors}`);
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("Brug: pnpm tsx scripts/import-wine-data.ts <csv-file>");
  console.error("Eksempel: pnpm tsx scripts/import-wine-data.ts france_germany_cru_lage_template.csv");
  process.exit(1);
}

const [filePath] = args;

void importData(filePath);
