/**
 * Script til at rette appellations for Grand Cru climats
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

// Grand Cru climats der skal rettes
const fixes: Array<{ name: string; appellation: string }> = [
  { name: "Bonnes-Mares", appellation: "Chambolle-Musigny" }, // eller Morey-Saint-Denis, men primært Chambolle
  { name: "Chambertin-Clos de Bèze", appellation: "Gevrey-Chambertin" },
  { name: "Charlemagne", appellation: "Aloxe-Corton" }, // eller Pernand-Vergelesses, men primært Aloxe-Corton
  { name: "Clos de la Roche", appellation: "Morey-Saint-Denis" },
  { name: "Échezeaux", appellation: "Vosne-Romanée" }, // Flagey-Échezeaux er en del af Vosne-Romanée
  { name: "Grands Échezeaux", appellation: "Vosne-Romanée" }, // Flagey-Échezeaux er en del af Vosne-Romanée
  { name: "Griotte-Chambertin", appellation: "Gevrey-Chambertin" },
  { name: "La Romanée", appellation: "Vosne-Romanée" }, // Ikke Gevrey-Chambertin!
];

async function fixGrandCruAppellations() {
  console.log("🔧 Retter appellations for Grand Cru climats...\n");

  let fixed = 0;
  let errors = 0;

  for (const fix of fixes) {
    const { error } = await supabase
      .from("vineyards")
      .update({ appellation: fix.appellation })
      .eq("name", fix.name)
      .eq("country", "France");

    if (error) {
      console.error(`Fejl ved opdatering af ${fix.name}:`, error);
      errors++;
    } else {
      console.log(`  ✅ ${fix.name} → ${fix.appellation}`);
      fixed++;
    }
  }

  console.log(`\n✅ Færdig!`);
  console.log(`   - Rettet: ${fixed}`);
  console.log(`   - Fejl: ${errors}`);
}

void fixGrandCruAppellations();

