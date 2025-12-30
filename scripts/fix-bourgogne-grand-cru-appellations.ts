/**
 * Script til at fjerne Bourgogne Grand Cru climats fra appellations tabellen
 * da de kun skal være vinmarker, ikke appellations
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

// Bourgogne Grand Cru climats der skal fjernes fra appellations (de er vinmarker)
const grandCruClimatsToRemove = [
  "Bâtard-Montrachet",
  "Bienvenues-Bâtard-Montrachet",
  "Bonnes-Mares",
  "Chambertin-Clos de Bèze",
  "Charlemagne",
  "Charmes-Chambertin",
  "Chevalier-Montrachet",
  "Clos de la Roche",
  "Criots-Bâtard-Montrachet",
  "Échezeaux",
  "Grands Échezeaux",
  "Griotte-Chambertin",
  "La Grande Rue",
  "La Romanée",
  "La Tâche",
  "Montrachet",
  "Richebourg",
  "Romanée-Conti",
  "Romanée-Saint-Vivant",
];

async function fixBourgogneGrandCru() {
  console.log(
    "🗑️  Sletter Bourgogne Grand Cru climats fra appellations tabellen...\n",
  );

  let removed = 0;
  let errors = 0;

  for (const name of grandCruClimatsToRemove) {
    const { error } = await supabase
      .from("wine_regions")
      .delete()
      .eq("name", name)
      .eq("country", "France")
      .eq("region", "Burgundy");

    if (error) {
      console.error(`Fejl ved sletning af ${name}:`, error);
      errors++;
    } else {
      console.log(`  ✅ Fjernet: ${name}`);
      removed++;
    }
  }

  console.log(`\n✅ Færdig!`);
  console.log(`   - Fjernet: ${removed}`);
  console.log(`   - Fejl: ${errors}`);
  console.log(
    `\n💡 Bemærk: "Chablis Premier Cru" er en appellation og forbliver i databasen`,
  );
}

void fixBourgogneGrandCru();

