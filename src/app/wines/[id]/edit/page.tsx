import { notFound } from "next/navigation";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { WineDetailsExperience } from "@/app/wine-details/wine-details-experience";
import type { Wine } from "@/lib/supabase/types";

type ParamsInput = { id: string };

export async function generateStaticParams() {
  // For static export, return empty array - pages will be generated client-side
  return [];
}

interface EditWinePageProps {
  params: ParamsInput | Promise<ParamsInput>;
}

export default async function EditWinePage({ params }: EditWinePageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let wine: Wine | null = null;

  try {
    const { client } = createSupabaseServiceClient();
    const { data, error } = await client
      .from("wines")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.warn(
        `Kunne ikke hente vin med id ${id} fra Supabase, bruger fallback`,
        error,
      );
    } else {
      wine = data as Wine | null;
    }
  } catch (error) {
    console.warn(
      `Fejl ved opkobling til Supabase for vin-id ${id}, bruger fallback`,
      error,
    );
  }

  if (!wine) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-12 lg:px-0">
      <WineDetailsExperience
        initialWine={wine}
        redirectPath={`/wines/${wine.id}/edit`}
      />
    </main>
  );
}

