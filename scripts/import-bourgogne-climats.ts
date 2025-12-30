/**
 * Script til at importere Bourgogne Climats data fra Google Sheets CSV
 * 
 * CSV format:
 *   region,appellation,classification,vineyard
 * 
 * Eksempel:
 *   Côte Chalonnaise,Mercurey,Premier Cru,Clos de Paradis
 *   Côte Chalonnaise,Mercurey,Village - Lieux-dit,Bourg Bassot
 * 
 * Brug: pnpm tsx scripts/import-bourgogne-climats.ts <csv-file>
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
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

interface CSVRow {
  region: string;
  appellation: string;
  classification: string;
  vineyard: string;
}

async function importBourgogneClimats(filePath: string) {
  console.log(`📥 Importerer data fra ${filePath}...\n`);

  const fileContent = readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: false,
    skip_empty_lines: true,
    trim: true,
  }) as string[][];

  // Filtrer tomme rækker og rækker uden nødvendige data
  const validRecords = records
    .filter((row) => {
      // Skip tomme rækker eller rækker hvor de første 4 kolonner er tomme
      return row.length >= 4 && row[0] && row[1] && row[2] && row[3];
    })
    .map((row): CSVRow => {
      return {
        region: row[0] || "",
        appellation: row[1] || "",
        classification: row[2] || "",
        vineyard: row[3] || "",
      };
    });

  console.log(`Fundet ${validRecords.length} gyldige rækker\n`);

  let regionsImported = 0;
  let vineyardsImported = 0;
  let regionsUpdated = 0;
  let vineyardsUpdated = 0;
  let errors = 0;

  // Track hvilke appellations vi har set for at undgå duplikater
  const seenAppellations = new Set<string>();
  const seenVineyards = new Set<string>();

  for (const record of validRecords) {
    try {
      const { region, appellation, classification, vineyard } = record;

      // Bestem appellation type
      // Hvis classification indeholder "Premier Cru" eller "Grand Cru", er appellationen stadig Village niveau
      // (da appellationen har Premier Cru/Grand Cru climats, men selve appellationen er Village)
      const appellationType = classification.includes("Regional")
        ? "Regional"
        : "Village"; // Premier Cru og Grand Cru er climats, ikke appellation niveau

      // Import appellation/region (kun én gang per appellation)
      const appellationKey = `${appellation}|France`;
      if (!seenAppellations.has(appellationKey)) {
        const { error: regionError } = await supabase
          .from("wine_regions")
          .upsert(
            {
              name: appellation,
              country: "France",
              region: region || "Burgundy",
              type: appellationType,
            },
            {
              onConflict: "name,country",
            },
          );

        if (regionError) {
          console.error(
            `Fejl ved import af appellation ${appellation}:`,
            regionError,
          );
          errors++;
        } else {
          // Tjek om det var en opdatering eller ny
          const { data: existing } = await supabase
            .from("wine_regions")
            .select("id")
            .eq("name", appellation)
            .eq("country", "France")
            .single();

          if (existing) {
            regionsUpdated++;
          } else {
            regionsImported++;
          }
          seenAppellations.add(appellationKey);
        }
      }

      // Bestem classification og subclassification for vineyard
      let vineyardClassification: string | null = null;
      let subclassification: string | null = null;

      if (classification.includes("Premier Cru")) {
        vineyardClassification = "Premier Cru";
        subclassification = "Climat";
      } else if (classification.includes("Grand Cru")) {
        vineyardClassification = "Grand Cru";
        subclassification = "Climat";
      } else if (classification.includes("Village")) {
        vineyardClassification = "Village";
        subclassification = "Lieux-dit";
      } else if (classification.includes("Regional")) {
        vineyardClassification = "Regional";
        subclassification = null;
      }

      // Import vineyard (kun én gang per vineyard+country kombination)
      const vineyardKey = `${vineyard}|France`;
      if (!seenVineyards.has(vineyardKey)) {
        const { error: vineyardError } = await supabase
          .from("vineyards")
          .upsert(
            {
              name: vineyard,
              country: "France",
              region: region || "Burgundy",
              appellation: appellation || null,
              classification: vineyardClassification,
              subclassification: subclassification,
            },
            {
              onConflict: "name,country",
            },
          );

        if (vineyardError) {
          console.error(
            `Fejl ved import af vineyard ${vineyard}:`,
            vineyardError,
          );
          errors++;
        } else {
          // Tjek om det var en opdatering eller ny
          const { data: existing } = await supabase
            .from("vineyards")
            .select("id")
            .eq("name", vineyard)
            .eq("country", "France")
            .single();

          if (existing) {
            vineyardsUpdated++;
          } else {
            vineyardsImported++;
          }
          seenVineyards.add(vineyardKey);
        }
      }
    } catch (err) {
      console.error(`Uventet fejl ved import:`, err);
      errors++;
    }
  }

  console.log(`\n✅ Import færdig!`);
  console.log(`   - Nye appellations: ${regionsImported}`);
  console.log(`   - Opdaterede appellations: ${regionsUpdated}`);
  console.log(`   - Nye vinmarker: ${vineyardsImported}`);
  console.log(`   - Opdaterede vinmarker: ${vineyardsUpdated}`);
  console.log(`   - Fejl: ${errors}`);
  console.log(`   - Total unikke appellations: ${seenAppellations.size}`);
  console.log(`   - Total unikke vinmarker: ${seenVineyards.size}`);
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("Brug: pnpm tsx scripts/import-bourgogne-climats.ts <csv-file>");
  console.error(
    "Eksempel: pnpm tsx scripts/import-bourgogne-climats.ts 'Bourgogne Climats Liste - Sheet1 (1).csv'",
  );
  process.exit(1);
}

const [filePath] = args;

void importBourgogneClimats(filePath);

