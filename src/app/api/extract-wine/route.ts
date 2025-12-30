import { Buffer } from "node:buffer";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createOpenAIClient } from "@/lib/ai";

export const runtime = "nodejs";

// Helper function to detect image MIME type from buffer
function detectImageType(buffer: Buffer): string {
  const bytes = buffer.subarray(0, 12);
  
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  
  // WebP: RIFF...WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  
  // GIF: 47 49 46 38
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return "image/gif";
  }
  
  // Default to JPEG if we can't detect
  return "image/jpeg";
}

const extractionSchema = z.object({
  producer: z.string().optional().nullable(),
  appellation: z.string().optional().nullable(),
  cuvee: z.string().optional().nullable(),
  vintage: z.string().optional().nullable(),
  type: z.enum(["rød", "hvid", "rosé", "mousserende"]).optional().nullable(),
  country: z.string().optional().nullable(),
  wine_district: z.string().optional().nullable(),
  grapes: z.string().optional().nullable(),
  alcohol: z.string().optional().nullable(),
  vineyard: z.string().optional().nullable(),
  label_summary: z.string().optional().nullable(),
  confidence: z.number().min(0).max(1).optional().nullable(),
  notes: z.string().optional().nullable(),
});

type Extraction = z.infer<typeof extractionSchema>;

const systemPrompt = [
  "Du er en dansk vinsommelier.",
  "Analyser billedet af vinetiketten og returnér et JSON-objekt med følgende felter:",
  "- producer: producentens navn. Udvid forkortelser til det fulde producentnavn ved hjælp af din vinviden.",
  "- appellation: den specifikke appellation/DOP/DAC fra etiketten (fx 'Neusiedlersee DAC', 'Bourgogne AOC', 'Alsace Grand Cru'). Hvis etiketten ikke nævner en specifik appellation, skal feltet være null. Dette er IKKE det samme som wine_district.",
  "- cuvee: navnet på cuvéen eller den specifikke vin, KUN hvis det står eksplicit på etiketten (fx \"Der Elefant im Porzellanladen\", \"Les Charmes\"). Hvis etiketten ikke nævner et cuvée-navn, skal feltet være null. Antag IKKE et cuvée-navn baseret på producentens andre vine - kun hvis det faktisk står på etiketten.",
  "- country: landet vinen kommer fra (på dansk). Hvis etiketten ikke nævner det, brug din viden om producenten til at finde landet.",
  "- wine_district: det større geografiske område/region (på dansk) – fx 'Burgenland', 'Bourgogne', 'Alsace'. Dette er det større område, som appellationen ligger i. Hvis appellation er 'Neusiedlersee DAC', så er wine_district 'Burgenland'.",
  "- vintage: årgang (brug 'NV' hvis etiketten angiver non-vintage).",
  "- type: én af værdierne rød, hvid, rosé eller mousserende. Afgør typen ud fra tekst, logoer, cuvée-navn og din vinviden – ignorér flaskens glasfarve og lysrefleksioner. VIGTIGT: Hvis etiketten nævner 'rosé', 'rose', 'rosato', 'rosado', eller hvis cuvée-navnet er kendt som en rosé (fx 'Der Elefant im Porzellanladen' fra Strehn er en rosé), skal typen være 'rosé'. Tjek også druesammensætning - Blaufränkisch kan bruges til rosé. Hvis du er i tvivl, slå op på producenten og cuvée-navnet i din vinviden for at verificere typen.",
  "- grapes: druefordelingen. Hvis vinen er 100% én drue, skriv '100% [drue]' (fx '100% Blaufränkisch' eller '100% Riesling'). Hvis det er en blend, skriv procentfordelingen (fx '60% Cabernet Sauvignon, 40% Merlot'). Hvis etiketten ikke nævner druer, slå op på producenten og cuvée-navnet i din vinviden for at finde den korrekte drue. Vær præcis - antag ikke en blend hvis vinen kun er én drue.",
  "- alcohol: alkoholprocent fra etiketten (fx '13.5%').",
  "- vineyard: navnet på vinmarken, hvis etiketten tydeligt angiver en specifik mark (fx 'G-Max', 'La Romanée', eller 'Schlossberg'). Hvis etiketten ikke nævner en specifik mark, men kun et område eller distrikt, skal dette felt være null - brug i stedet wine_district for området.",
  "- label_summary: en fri tekst hvor du nedskriver nøjagtigt hvad du ser på etiketten (navne, slogans, cuvée, druehint, grafiske elementer).",
  "- confidence: værdi mellem 0 og 1 for hvor sikker du er i den samlede fortolkning.",
  "- notes: korte noter, fx druesorter, marknavne eller særlige markeringer.",
  "Hvis et felt umuligt kan bestemmes efter bedste viden, returner null – men forsøg altid et kvalificeret bud baseret på etiketten og din vinviden.",
].join("\n");

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "producer",
    "appellation",
    "country",
    "wine_district",
    "grapes",
    "alcohol",
    "vineyard",
  "cuvee",
  "label_summary",
    "vintage",
    "type",
    "confidence",
    "notes",
  ],
  properties: {
    producer: { type: ["string", "null"] },
    appellation: { type: ["string", "null"] },
    cuvee: { type: ["string", "null"] },
    country: { type: ["string", "null"] },
    wine_district: { type: ["string", "null"] },
    grapes: { type: ["string", "null"] },
    alcohol: { type: ["string", "null"] },
    vineyard: { type: ["string", "null"] },
    label_summary: { type: ["string", "null"] },
    vintage: { type: ["string", "null"] },
    type: {
      type: ["string", "null"],
      enum: ["rød", "hvid", "rosé", "mousserende", null],
    },
    confidence: {
      type: ["number", "null"],
      minimum: 0,
      maximum: 1,
    },
    notes: { type: ["string", "null"] },
  },
} as const;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Intet billedfil modtaget." },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Billedet er for stort. Max 10MB." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Detect image type from buffer, fallback to file.type if valid, otherwise default to JPEG
    let mimeType = file.type;
    if (!mimeType || mimeType === "text/plain" || !mimeType.startsWith("image/")) {
      mimeType = detectImageType(buffer);
    }
    
    const client = createOpenAIClient();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: systemPrompt,
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${buffer.toString("base64")}`,
              detail: "high",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "wine_label_schema",
          schema: jsonSchema,
        },
      },
    });

    const raw = response.output_text;

    if (!raw) {
      throw new Error("Modellen returnerede ikke noget resultat.");
    }

    let parsed = extractionSchema.parse(JSON.parse(raw));

    const isEmpty = (value: unknown) =>
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim().length === 0);

    const enrichmentTargets: Array<keyof Extraction> = [
      "producer",
      "appellation",
      "cuvee",
      "country",
      "wine_district",
      "grapes",
      "alcohol",
      "vineyard",
      "label_summary",
      "notes",
    ];

    const missing = enrichmentTargets.filter((key) => isEmpty(parsed[key]));
    const hasContext = Boolean(
      parsed.producer || parsed.appellation || parsed.cuvee || parsed.notes,
    );

    if (hasContext) {
      const contextLines: string[] = [
        "Du er en dansk vinsommelier med adgang til omfattende vinviden og online ressourcer.",
        "Du får AI'ens første udlæsning og skal forbedre den ved at verificere information mod autoritative kilder.",
        "VERIFICER INFORMATION: Brug din viden om følgende kilder til at verificere og udfylde information:",
        "1. Producentens officielle hjemmeside - slå op på producenten og cuvée-navnet for at finde officiel information om druesammensætning, ABV, appellation, og vinmark.",
        "2. Vivino.com - brug din viden om, hvad der typisk står på Vivino for denne producent/cuvée (druer, ABV, region, type).",
        "3. CellarTracker.com - verificer druesammensætning og tekniske detaljer.",
        "4. Wine.com og andre autoritative vin-databaser - brug din viden om, hvad der typisk dokumenteres for denne vin.",
        "",
        "Udfyld manglende felter og ret dem, der kan være forkerte, baseret på verificeret information fra disse kilder.",
        "VIGTIGT for cuvée-feltet: Dette felt skal KUN udfyldes hvis cuvée-navnet faktisk står på etiketten (fx 'Der Elefant im Porzellanladen', 'Les Charmes'). Hvis etiketten ikke nævner et cuvée-navn, skal feltet være null - antag IKKE et cuvée-navn baseret på producentens andre vine eller din viden om producentens portefølje. Kun hvad der faktisk står på etiketten.",
        "Fokusér på label_summary: tolk cuvé-navne og slogans (fx 'Der Elefant im Porzellanladen' fra Strehn er en rosévin, IKKE rødvin) og slå dem op mentalt i din viden om producentens hjemmeside og vin-databaser.",
        "KRITISK: Vinens type skal være 100% korrekt. Bestem typen ud fra: (1) tekst på etiketten (rosé/rose/rosato/rosado), (2) cuvée-navn (fx 'Der Elefant im Porzellanladen' fra Strehn = rosé), (3) producentens hjemmeside, (4) Vivino/CellarTracker/Wine.com data. IGNORÉR flaskens glasfarve helt - mange rosévine har dyb farve. Hvis druen er Blaufränkisch og det er en rosé-cuvée, skal typen være 'rosé'. Verificer altid typen mod producentens hjemmeside eller vin-databaser hvis du er i tvivl.",
        "Hvis du kender druesammensætning eller ABV for den pågældende cuvée fra producentens hjemmeside eller vin-databaser, udfyld felterne præcist. Vær særligt opmærksom på grapes-feltet: hvis vinen kun er én drue ifølge producentens hjemmeside eller Vivino, skriv '100% [drue]' - antag ikke en blend medmindre du er sikker på det fra verificerede kilder.",
        "Vær præcis med vineyard-feltet: dette skal kun være navnet på en specifik vinmark (fx 'Schlossberg', 'G-Max'), ikke et område eller distrikt. Hvis der ikke er en specifik mark på producentens hjemmeside eller i vin-databaser, skal feltet være null. Brug wine_district for området i stedet.",
        "VIGTIGT: Skel mellem appellation og wine_district. appellation er den specifikke appellation/DOP/DAC fra etiketten eller producentens hjemmeside (fx 'Neusiedlersee DAC', 'Bourgogne AOC'). wine_district er det større geografiske område (fx 'Burgenland', 'Bourgogne'). Hvis appellation er 'Neusiedlersee DAC', så er wine_district 'Burgenland'. Hvis appellation er 'Bourgogne AOC', så er wine_district 'Bourgogne'. Hvis etiketten ikke nævner en specifik appellation, men producentens hjemmeside eller vin-databaser gør, brug den information. Hvis ingen kilder nævner en specifik appellation, skal appellation være null, men wine_district skal stadig udfyldes baseret på producentens lokation.",
        "Returner JSON i samme struktur. Brug null kun hvis oplysningerne er reelt ukendte selv efter at have slået op i producentens hjemmeside og vin-databaser.",
        "",
        `Første udlæsning (JSON): ${JSON.stringify(parsed)}`,
        "",
        missing.length
          ? `Felter med fokus: ${missing.join(", ")}`
          : "Gennemgå især: type, grapes, alcohol, wine_district, vineyard, country, notes.",
      ];

      const enrichmentResponse = await client.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: contextLines.join("\n"),
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "wine_label_schema",
            schema: jsonSchema,
          },
        },
      });

      const enrichmentRaw = enrichmentResponse.output_text;

      if (enrichmentRaw) {
        const enriched = extractionSchema.parse(JSON.parse(enrichmentRaw));
        const mergeKeys: Array<keyof Extraction> = [
          "producer",
          "appellation",
          "cuvee",
          "country",
          "wine_district",
          "grapes",
          "alcohol",
          "vineyard",
          "label_summary",
          "vintage",
          "type",
          "notes",
        ];

        for (const key of mergeKeys) {
          const proposed = enriched[key];
          if (!isEmpty(proposed)) {
            parsed = { ...parsed, [key]: proposed };
          }
        }
      }
    }

    return NextResponse.json({ data: parsed });
  } catch (error) {
    console.error("AI extract error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Uventet fejl ved AI-udlæsning",
      },
      { status: 500 },
    );
  }
}

