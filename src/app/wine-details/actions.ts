"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { Buffer } from "node:buffer";
import type { Database } from "@/lib/supabase/types";
import { createOpenAIClient } from "@/lib/ai";

const wineFormSchema = z.object({
  producer: z.string().min(1, "Producent skal udfyldes"),
  appellation: z
    .string()
    .max(200, "Appellation er for lang")
    .optional()
    .nullable(),
  cuvee: z
    .string()
    .max(200, "Cuvée-navn er for langt")
    .optional()
    .nullable(),
  vintage: z
    .string()
    .max(12, "Årgang er for lang")
    .optional()
    .nullable(),
  type: z.enum(["rød", "hvid", "rosé", "mousserende"]),
  country: z.string().optional().nullable(),
  wine_district: z.string().optional().nullable(),
  grapes: z.string().optional().nullable(),
  alcohol: z.string().optional().nullable(),
  vineyard: z.string().optional().nullable(),
  consumed_date: z.string().optional(),
  balance: z.preprocess(
    (val) => (val === null || val === "" || val === undefined ? null : val),
    z.coerce.number().int().refine((val) => val === null || (val >= 85 && val <= 100), {
      message: "Balance skal være mellem 85 og 100 point"
    }).nullable()
  ).optional().nullable(),
  length: z.preprocess(
    (val) => (val === null || val === "" || val === undefined ? null : val),
    z.coerce.number().int().refine((val) => val === null || (val >= 85 && val <= 100), {
      message: "Længde skal være mellem 85 og 100 point"
    }).nullable()
  ).optional().nullable(),
  intensity: z.preprocess(
    (val) => (val === null || val === "" || val === undefined ? null : val),
    z.coerce.number().int().refine((val) => val === null || (val >= 85 && val <= 100), {
      message: "Intensitet skal være mellem 85 og 100 point"
    }).nullable()
  ).optional().nullable(),
  complexity: z.preprocess(
    (val) => (val === null || val === "" || val === undefined ? null : val),
    z.coerce.number().int().refine((val) => val === null || (val >= 85 && val <= 100), {
      message: "Kompleksitet skal være mellem 85 og 100 point"
    }).nullable()
  ).optional().nullable(),
  smagsnote: z.string().optional().nullable(),
});

export async function saveWineAction(formData: FormData) {
  try {
    const file = formData.get("file");
    const hasFile = file instanceof Blob && file.size > 0;

    const parsed = wineFormSchema.safeParse({
      producer: formData.get("producer"),
      appellation: formData.get("appellation") || null,
      cuvee: formData.get("cuvee") || null,
      vintage: formData.get("vintage") || null,
      type: formData.get("type"),
      country: formData.get("country") || null,
      wine_district: formData.get("wine_district") || null,
      grapes: formData.get("grapes") || null,
      alcohol: formData.get("alcohol") || null,
      vineyard: formData.get("vineyard") || null,
      consumed_date: formData.get("consumed_date") || new Date().toISOString(),
      balance: (() => {
        const val = formData.get("balance");
        return val && typeof val === "string" && val.trim() ? val : null;
      })(),
      length: (() => {
        const val = formData.get("length");
        return val && typeof val === "string" && val.trim() ? val : null;
      })(),
      intensity: (() => {
        const val = formData.get("intensity");
        return val && typeof val === "string" && val.trim() ? val : null;
      })(),
      complexity: (() => {
        const val = formData.get("complexity");
        return val && typeof val === "string" && val.trim() ? val : null;
      })(),
      smagsnote: (() => {
        const val = formData.get("smagsnote");
        return val && typeof val === "string" && val.trim() ? val.trim() : null;
      })(),
    });

    if (!parsed.success) {
      console.error("Validation fejl:", parsed.error.issues);
      const firstError = parsed.error.issues[0];
      throw new Error(firstError?.message ?? "Ugyldige felter");
    }

    let serviceRole: SupabaseClient<Database>;
    let bucket: string;

    try {
      const resolved = createSupabaseServiceClient();
      serviceRole = resolved.client;
      bucket = resolved.bucket;
    } catch (cause) {
      console.error("Supabase service client misconfigured", cause);
      throw new Error(
        "Supabase mangler konfiguration. Udfyld dine miljøvariabler og prøv igen.",
      );
    }

    let imageUrl: string | null = null;

    if (hasFile && file instanceof Blob) {
      const filename = `${nanoid()}-${Date.now()}.webp`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { data: upload, error: uploadError } = await serviceRole.storage
        .from(bucket)
        .upload(`captures/${filename}`, buffer, {
          cacheControl: "3600",
          contentType: file.type || "image/webp",
        });

      if (uploadError) {
        throw new Error(
          `Kunne ikke gemme billedet i Supabase Storage: ${uploadError.message}`,
        );
      }

      const { data: publicUrlData } = serviceRole.storage
        .from(bucket)
        .getPublicUrl(upload.path);

      imageUrl = publicUrlData.publicUrl;
    }

    const consumedDate = parsed.data.consumed_date 
      ? new Date(parsed.data.consumed_date + "T00:00:00").toISOString()
      : new Date().toISOString();

    const { data: insertedWine, error: insertError } = await serviceRole.from("wines").insert({
      producer: parsed.data.producer,
      appellation: parsed.data.appellation ?? null,
      cuvee: parsed.data.cuvee ?? null,
      vintage: parsed.data.vintage ?? null,
      type: parsed.data.type,
      country: parsed.data.country ?? null,
      wine_district: parsed.data.wine_district ?? null,
      grapes: parsed.data.grapes ?? null,
      alcohol: parsed.data.alcohol ?? null,
      vineyard: parsed.data.vineyard ?? null,
      image_url: imageUrl ?? null,
      created_at: consumedDate,
      balance: parsed.data.balance ?? undefined,
      length: parsed.data.length ?? undefined,
      intensity: parsed.data.intensity ?? undefined,
      complexity: parsed.data.complexity ?? undefined,
      smagsnote: parsed.data.smagsnote ?? null,
    }).select().single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(
        `Kunne ikke gemme vinen i databasen: ${insertError.message}`,
      );
    }

    if (!insertedWine) {
      console.error("Inserted wine is null or undefined");
      throw new Error("Vinen blev gemt, men kunne ikke hentes tilbage fra databasen");
    }

    if (!insertedWine.id) {
      console.error("Inserted wine missing id:", insertedWine);
      throw new Error("Vinen blev gemt, men mangler ID");
    }

    const wineId = insertedWine.id as string;

    // Automatisk hent critic reviews i baggrunden (non-blocking)
    // Dette sker asynkront så det ikke blokerer response
    // Kald async funktion uden at vente - dette skal IKKE påvirke response
    generateCriticReviewsForWine(wineId, {
      producer: parsed.data.producer,
      cuvee: parsed.data.cuvee,
      appellation: parsed.data.appellation,
      vintage: parsed.data.vintage,
      country: parsed.data.country,
      wine_district: parsed.data.wine_district,
      grapes: parsed.data.grapes,
      type: parsed.data.type,
    }).catch((err) => {
      // Ignorer fejl - reviews kan hentes senere
      console.error("Kunne ikke hente critic reviews automatisk:", err);
    });

    revalidatePath("/");
    // Revalidate også den specifikke wine route
    revalidatePath(`/wines/${wineId}/edit`);

    return { ok: true, wineId };
  } catch (error) {
    console.error("Error in saveWineAction:", error);
    
    // Sikre at vi returnerer en serialiserbar fejl
    if (error instanceof Error) {
      throw error; // Next.js kan håndtere Error objekter
    }
    
    // Hvis det ikke er en Error, konverter til string
    const errorMessage = typeof error === 'string' 
      ? error 
      : error && typeof error === 'object' && 'message' in error 
        ? String(error.message) 
        : "Ukendt fejl ved gemning af vin";
    
    throw new Error(errorMessage);
  }
}

// Helper function til at generere critic reviews (samme logik som API route)
async function generateCriticReviewsForWine(
  wineId: string,
  wineData: {
    producer: string;
    cuvee?: string | null;
    appellation?: string | null;
    vintage?: string | null;
    country?: string | null;
    wine_district?: string | null;
    grapes?: string | null;
    type?: string | null;
  }
) {
  try {
    const { client } = createSupabaseServiceClient();
    
    // Tjek om der allerede findes reviews
    const { data: existingReviews } = await client
      .from("wine_critic_reviews")
      .select("id")
      .eq("wine_id", wineId)
      .limit(1);

    if (existingReviews && existingReviews.length > 0) {
      return; // Reviews findes allerede
    }

    // Generer reviews ved hjælp af AI
    const openai = createOpenAIClient();

    const wineDescription = [
      `Producer: ${wineData.producer || "Ukendt"}`,
      wineData.cuvee ? `Cuvée: ${wineData.cuvee}` : null,
      wineData.appellation ? `Appellation: ${wineData.appellation}` : null,
      wineData.vintage ? `Vintage: ${wineData.vintage}` : null,
      wineData.country ? `Country: ${wineData.country}` : null,
      wineData.wine_district ? `Region: ${wineData.wine_district}` : null,
      wineData.grapes ? `Grapes: ${wineData.grapes}` : null,
      wineData.type ? `Type: ${wineData.type}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `Du er en ekspert i vin-kritik og kender alle de store vin-kritikere og deres stil.

Baseret på følgende vininformation, generer realistiske reviews fra kendte vin-kritikere:

${wineDescription}

Generer 3-5 reviews fra forskellige kendte kritikere som:
- James Suckling (JamesSuckling.com)
- Robert Parker / Wine Advocate
- Decanter Magazine
- Jancis Robinson
- Wine Spectator
- Antonio Galloni (Vinous)
- Allen Meadows (Burghound - kun for Burgundy)
- Neal Martin (Vinous)

Hver review skal indeholde:
- critic_name: Kritikerens fulde navn
- critic_publication: Publikationen (fx "Wine Advocate", "Decanter Magazine")
- score: En score mellem 80-100 point (typisk 85-98 for gode vine)
- review_text: En detaljeret review tekst på dansk der beskriver vinen, smagen, strukturen, og begrundelsen for scoren. Skriv som om kritikeren faktisk har smagt vinen. INKLUDER årgangen i review teksten hvis den er relevant.
- review_date: Et realistisk dato (fx "2023-05-15" eller "2024-01-20")
- source_url: null (da disse er genererede)

Vigtigt:
- Reviews skal være realistiske og matche kritikerens stil
- Scores skal være konsistente med vinen (fx en simpel vin får ikke 98 point)
- Review teksten skal være detaljeret og professionel
- Brug dansk sprog i review teksterne
- Hvis årgangen er specificeret, inkluder den i review teksten

Returnér et JSON objekt med et "reviews" array.`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "wine_critic_reviews_schema",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["reviews"],
            properties: {
              reviews: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["critic_name", "critic_publication", "score", "review_text", "review_date", "source_url"],
                  properties: {
                    critic_name: { type: "string" },
                    critic_publication: { type: ["string", "null"] },
                    score: { type: "integer", minimum: 80, maximum: 100 },
                    review_text: { type: "string" },
                    review_date: { type: ["string", "null"] },
                    source_url: { type: ["string", "null"] },
                  },
                },
              },
            },
          },
        },
      },
    });

    const content = response.output_text;
    if (!content) {
      throw new Error("Ingen respons fra AI");
    }

    const parsed = JSON.parse(content);
    const reviews = parsed.reviews || [];

    // Gem reviews i databasen
    if (reviews.length > 0) {
      const reviewsToInsert = reviews.map((review: any) => ({
        wine_id: wineId,
        critic_name: review.critic_name,
        critic_publication: review.critic_publication || null,
        score: review.score,
        review_text: review.review_text,
        review_date: review.review_date || null,
        source_url: review.source_url || null,
      }));

      await client
        .from("wine_critic_reviews")
        .insert(reviewsToInsert as any);
    }
  } catch (error) {
    // Ignorer fejl - reviews kan hentes senere via UI
    console.error("Fejl ved automatisk generering af critic reviews:", error);
  }
}

