/**
 * Script til at verificere at Grand Cru climats har korrekte appellations
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

// Grand Cru climats der blev fjernet fra appellations
const grandCruClimats = [
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

// Forventede appellations for hver Grand Cru
const expectedAppellations: Record<string, string> = {
  "Bâtard-Montrachet": "Puligny-Montrachet", // eller Chassagne-Montrachet (delt mellem begge)
  "Bienvenues-Bâtard-Montrachet": "Puligny-Montrachet",
  "Bonnes-Mares": "Chambolle-Musigny", // eller Morey-Saint-Denis (delt)
  "Chambertin-Clos de Bèze": "Gevrey-Chambertin",
  "Charlemagne": "Aloxe-Corton", // eller Pernand-Vergelesses (delt)
  "Charmes-Chambertin": "Gevrey-Chambertin",
  "Chevalier-Montrachet": "Puligny-Montrachet",
  "Clos de la Roche": "Morey-Saint-Denis",
  "Criots-Bâtard-Montrachet": "Chassagne-Montrachet",
  "Échezeaux": "Vosne-Romanée", // Flagey-Échezeaux er en del af Vosne-Romanée appellationen
  "Grands Échezeaux": "Vosne-Romanée", // Flagey-Échezeaux er en del af Vosne-Romanée appellationen
  "Griotte-Chambertin": "Gevrey-Chambertin",
  "La Grande Rue": "Vosne-Romanée",
  "La Romanée": "Vosne-Romanée",
  "La Tâche": "Vosne-Romanée",
  "Montrachet": "Puligny-Montrachet", // eller Chassagne-Montrachet (delt)
  "Richebourg": "Vosne-Romanée",
  "Romanée-Conti": "Vosne-Romanée",
  "Romanée-Saint-Vivant": "Vosne-Romanée",
};

async function verifyGrandCruAppellations() {
  console.log("🔍 Verificerer Grand Cru climats appellations...\n");

  let correct = 0;
  let missing = 0;
  let incorrect = 0;

  for (const climat of grandCruClimats) {
    const { data } = await supabase
      .from("vineyards")
      .select("*")
      .eq("name", climat)
      .single();

    if (!data) {
      console.log(`❌ ${climat}: Findes ikke som vinmark`);
      missing++;
      continue;
    }

    const expected = expectedAppellations[climat];
    const actual = data.appellation;

    if (!actual) {
      console.log(`⚠️  ${climat}: Mangler appellation (forventet: ${expected})`);
      incorrect++;
    } else if (actual === expected) {
      console.log(`✅ ${climat}: ${actual}`);
      correct++;
    } else {
      console.log(
        `❌ ${climat}: ${actual} (forventet: ${expected})`,
      );
      incorrect++;
    }
  }

  console.log(`\n📊 Resultat:`);
  console.log(`   ✅ Korrekt: ${correct}`);
  console.log(`   ❌ Forkert/mangler: ${incorrect}`);
  console.log(`   ⚠️  Mangler: ${missing}`);
}

void verifyGrandCruAppellations();

