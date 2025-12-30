import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Søger efter producenter, appellationer eller vinmarker baseret på query
 * Bruger nu database i stedet for OpenAI
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const type = searchParams.get("type"); // "producer", "appellation", eller "vineyard"
    const appellation = searchParams.get("appellation"); // Optional: filtrer vinmarker efter appellation

    if (!type || !["producer", "appellation", "vineyard"].includes(type)) {
      return NextResponse.json(
        { error: "Ugyldig type. Brug 'producer', 'appellation' eller 'vineyard'" },
        { status: 400 },
      );
    }

    const { client } = createSupabaseServiceClient();

    // For vineyard type, tillad tom query hvis appellation er angivet
    if (!query || query.length < 1) {
      if (type === "vineyard" && appellation) {
        // Hent alle vinmarker fra appellationen
        const { data, error } = await client
          .from("vineyards")
          .select("name")
          .eq("appellation", appellation)
          .limit(50)
          .order("name");

        if (error) {
          console.error("Fejl ved hentning af vinmarker:", error);
          return NextResponse.json({ suggestions: [] });
        }

        const suggestions = (data || []).map((row: { name: string }) => row.name);
        return NextResponse.json({ suggestions });
      }
      return NextResponse.json({ suggestions: [] });
    }
    const searchQuery = `%${query}%`;

    let suggestions: string[] = [];

    // Hent først dem der starter med query, derefter dem hvor query er inde i ordet
    const startsWithQuery = `${query}%`;
    const containsQuery = `%${query}%`;

    switch (type) {
      case "producer": {
        // Først: dem der starter med query (prioriteret)
        const { data: startsData, error: startsError } = await client
          .from("wine_producers")
          .select("name")
          .ilike("name", startsWithQuery)
          .limit(10)
          .order("name");

        if (startsError) {
          console.error("Fejl ved søgning efter producenter:", startsError);
          return NextResponse.json({ suggestions: [] });
        }

        const startsWith = (startsData || []).map((row: { name: string }) => row.name);
        const startsCount = startsWith.length;

        // Derefter: dem hvor query er inde i ordet (hvis vi ikke har nok)
        if (startsCount < 10) {
          const { data: containsData, error: containsError } = await client
            .from("wine_producers")
            .select("name")
            .ilike("name", containsQuery)
            .not("name", "ilike", startsWithQuery) // Ekskluder dem vi allerede har
            .limit(10 - startsCount)
            .order("name");

          if (!containsError && containsData) {
            const contains = containsData.map((row: { name: string }) => row.name);
            suggestions = [...startsWith, ...contains];
          } else {
            suggestions = startsWith;
          }
        } else {
          suggestions = startsWith;
        }
        break;
      }

      case "appellation": {
        // Først: dem der starter med query (prioriteret)
        const { data: startsData, error: startsError } = await client
          .from("wine_regions")
          .select("name")
          .ilike("name", startsWithQuery)
          .limit(10)
          .order("name");

        if (startsError) {
          console.error("Fejl ved søgning efter appellationer:", startsError);
          return NextResponse.json({ suggestions: [] });
        }

        const startsWith = (startsData || []).map((row: { name: string }) => row.name);
        const startsCount = startsWith.length;

        // Derefter: dem hvor query er inde i ordet (hvis vi ikke har nok)
        if (startsCount < 10) {
          const { data: containsData, error: containsError } = await client
            .from("wine_regions")
            .select("name")
            .ilike("name", containsQuery)
            .not("name", "ilike", startsWithQuery) // Ekskluder dem vi allerede har
            .limit(10 - startsCount)
            .order("name");

          if (!containsError && containsData) {
            const contains = containsData.map((row: { name: string }) => row.name);
            suggestions = [...startsWith, ...contains];
          } else {
            suggestions = startsWith;
          }
        } else {
          suggestions = startsWith;
        }
        break;
      }

      case "vineyard": {
        // Byg query med optional appellation filter
        let startsQuery = client
          .from("vineyards")
          .select("name")
          .ilike("name", startsWithQuery);

        let containsQueryBuilder = client
          .from("vineyards")
          .select("name")
          .ilike("name", containsQuery)
          .not("name", "ilike", startsWithQuery);

        // Filtrer efter appellation hvis den er angivet
        if (appellation) {
          startsQuery = startsQuery.eq("appellation", appellation);
          containsQueryBuilder = containsQueryBuilder.eq("appellation", appellation);
        }

        // Først: dem der starter med query (prioriteret)
        const { data: startsData, error: startsError } = await startsQuery
          .limit(10)
          .order("name");

        if (startsError) {
          console.error("Fejl ved søgning efter vinmarker:", startsError);
          return NextResponse.json({ suggestions: [] });
        }

        const startsWith = (startsData || []).map((row: { name: string }) => row.name);
        const startsCount = startsWith.length;

        // Derefter: dem hvor query er inde i ordet (hvis vi ikke har nok)
        if (startsCount < 10) {
          const { data: containsData, error: containsError } = await containsQueryBuilder
            .limit(10 - startsCount)
            .order("name");

          if (!containsError && containsData) {
            const contains = containsData.map((row: { name: string }) => row.name);
            suggestions = [...startsWith, ...contains];
          } else {
            suggestions = startsWith;
          }
        } else {
          suggestions = startsWith;
        }
        break;
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Søgning fejl:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Uventet fejl ved søgning",
      },
      { status: 500 },
    );
  }
}
