import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { createOpenAIClient } from "@/lib/ai";
import { z } from "zod";

export const runtime = "nodejs";

const reviewSchema = z.object({
  critic_name: z.string(),
  critic_publication: z.string().nullable().optional(),
  score: z.number().int().min(80).max(100),
  review_text: z.string(),
  review_date: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
});

const reviewsResponseSchema = z.object({
  reviews: z.array(reviewSchema),
});

/**
 * GET: Hent eksisterende critic reviews for en vin
 * POST: Generer nye critic reviews ved hjælp af AI
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wineId = searchParams.get("wineId");

    if (!wineId) {
      return NextResponse.json(
        { error: "wineId parameter er påkrævet" },
        { status: 400 }
      );
    }

    const { client } = createSupabaseServiceClient();
    const { data, error } = await client
      .from("wine_critic_reviews")
      .select("*")
      .eq("wine_id", wineId)
      .order("score", { ascending: false });

    if (error) {
      console.error("Fejl ved hentning af critic reviews:", error);
      return NextResponse.json(
        { error: "Kunne ikke hente reviews" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (error) {
    console.error("Uventet fejl:", error);
    return NextResponse.json(
      { error: "Uventet fejl ved hentning af reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wineId, wineData } = body;

    if (!wineId || !wineData) {
      return NextResponse.json(
        { error: "wineId og wineData er påkrævet" },
        { status: 400 }
      );
    }

    // Tjek om der allerede findes reviews for denne vin
    const { client } = createSupabaseServiceClient();
    const { data: existingReviews } = await client
      .from("wine_critic_reviews")
      .select("id")
      .eq("wine_id", wineId)
      .limit(1);

    if (existingReviews && existingReviews.length > 0) {
      // Hent eksisterende reviews i stedet for at generere nye
      const { data } = await client
        .from("wine_critic_reviews")
        .select("*")
        .eq("wine_id", wineId)
        .order("score", { ascending: false });

      return NextResponse.json({ reviews: data || [] });
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
- review_text: En detaljeret review tekst på dansk der beskriver vinen, smagen, strukturen, og begrundelsen for scoren. Skriv som om kritikeren faktisk har smagt vinen.
- review_date: Et realistisk dato (fx "2023-05-15" eller "2024-01-20")
- source_url: null (da disse er genererede)

Vigtigt:
- Reviews skal være realistiske og matche kritikerens stil
- Scores skal være konsistente med vinen (fx en simpel vin får ikke 98 point)
- Review teksten skal være detaljeret og professionel
- Brug dansk sprog i review teksterne

Returnér et JSON objekt med et "reviews" array.`;

    // Use the same API structure as extract-wine that works
    let response;
    try {
      response = await openai.responses.create({
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
    } catch (openaiError) {
      console.error("OpenAI API fejl:", openaiError);
      throw new Error(
        openaiError instanceof Error
          ? `OpenAI API fejl: ${openaiError.message}`
          : "Kunne ikke kommunikere med AI tjenesten"
      );
    }

    if (!response || !response.output_text) {
      console.error("OpenAI returnerede ugyldig respons:", response);
      throw new Error("Ingen respons fra AI");
    }

    const content = response.output_text;
    if (!content) {
      throw new Error("Ingen respons fra AI");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON parse fejl:", parseError);
      console.error("Raw content:", content);
      throw new Error("AI returnerede ugyldig JSON format");
    }

    let validated;
    try {
      validated = reviewsResponseSchema.parse(parsed);
    } catch (validationError) {
      console.error("Zod validering fejl:", validationError);
      console.error("Parsed data:", parsed);
      throw new Error("AI returnerede data der ikke matcher forventet format");
    }

    // Gem reviews i databasen
    const reviewsToInsert = validated.reviews.map((review) => ({
      wine_id: wineId,
      critic_name: review.critic_name,
      critic_publication: review.critic_publication || null,
      score: review.score,
      review_text: review.review_text,
      review_date: review.review_date || null,
      source_url: review.source_url || null,
    }));

    const { data: insertedReviews, error: insertError } = await client
      .from("wine_critic_reviews")
      .insert(reviewsToInsert as any)
      .select();

    if (insertError) {
      console.error("Fejl ved indsættelse af reviews:", insertError);
      // Returner reviews alligevel, selvom de ikke blev gemt
      return NextResponse.json({ reviews: validated.reviews });
    }

    return NextResponse.json({ reviews: insertedReviews || validated.reviews });
  } catch (error) {
    console.error("Fejl ved generering af critic reviews:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Uventet fejl ved generering af reviews",
      },
      { status: 500 }
    );
  }
}

