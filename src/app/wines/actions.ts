"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { nanoid } from "nanoid";
import { Buffer } from "node:buffer";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

const wineUpdateSchema = z.object({
  id: z.string().min(1),
  producer: z.string().min(1, "Producent skal udfyldes"),
  appellation: z.string().max(200).optional().nullable(),
  cuvee: z.string().max(200).optional().nullable(),
  vintage: z.string().max(12).optional().nullable(),
  type: z.enum(["rød", "hvid", "rosé", "mousserende"]),
  country: z.string().optional().nullable(),
  wine_district: z.string().optional().nullable(),
  grapes: z.string().optional().nullable(),
  alcohol: z.string().optional().nullable(),
  vineyard: z.string().optional().nullable(),
  existingImageUrl: z.string().optional().nullable(),
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

export async function updateWineAction(formData: FormData) {
  const file = formData.get("file");
  const hasFile = file instanceof Blob && file.size > 0;

  // Helper to parse BLIK values safely
  const parseBLIKValue = (value: FormDataEntryValue | null): string | null => {
    if (!value || typeof value !== "string" || value.trim() === "") {
      return null;
    }
    return value.trim();
  };

  const parsed = wineUpdateSchema.safeParse({
    id: formData.get("id"),
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
    existingImageUrl: formData.get("existingImageUrl") || null,
    consumed_date: formData.get("consumed_date") || null,
    balance: parseBLIKValue(formData.get("balance")),
    length: parseBLIKValue(formData.get("length")),
    intensity: parseBLIKValue(formData.get("intensity")),
    complexity: parseBLIKValue(formData.get("complexity")),
    smagsnote: (() => {
      const value = formData.get("smagsnote");
      return value && typeof value === "string" && value.trim() ? value.trim() : null;
    })(),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ugyldige felter");
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

  let imageUrl = parsed.data.existingImageUrl ?? null;

  if (hasFile && file instanceof Blob) {
    const filename = `${nanoid()}-${Date.now()}.webp`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data: upload, error: uploadError } = await serviceRole.storage
      .from(bucket)
      .upload(`captures/${filename}`, buffer, {
        cacheControl: "3600",
        contentType: file.type || "image/webp",
        upsert: true,
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

  // Helper to ensure value is valid (85-100) or null
  const ensureValidBLIK = (value: number | null | undefined): number | null => {
    if (value === null || value === undefined) return null;
    if (value >= 85 && value <= 100) return Math.round(value);
    console.warn(`Invalid BLIK value ${value}, must be between 85-100`);
    return null;
  };

  const updateData: Record<string, unknown> = {
    producer: parsed.data.producer,
    appellation: parsed.data.appellation,
    cuvee: parsed.data.cuvee,
    vintage: parsed.data.vintage,
    type: parsed.data.type,
    country: parsed.data.country,
    wine_district: parsed.data.wine_district,
    grapes: parsed.data.grapes,
    alcohol: parsed.data.alcohol,
    vineyard: parsed.data.vineyard,
    image_url: imageUrl,
    smagsnote: parsed.data.smagsnote ?? null,
    balance: ensureValidBLIK(parsed.data.balance),
    length: ensureValidBLIK(parsed.data.length),
    intensity: ensureValidBLIK(parsed.data.intensity),
    complexity: ensureValidBLIK(parsed.data.complexity),
  };

  if (parsed.data.consumed_date) {
    updateData.created_at = new Date(parsed.data.consumed_date + "T00:00:00").toISOString();
  }

  const { error: updateError } = await (serviceRole as any)
    .from("wines")
    .update(updateData)
    .eq("id", parsed.data.id);

  if (updateError) {
    throw new Error(
      `Kunne ikke opdatere vinen i databasen: ${updateError.message}`,
    );
  }

  revalidatePath("/");
  // Revalidate også den specifikke wine route
  revalidatePath(`/wines/${parsed.data.id}/edit`);
  return { ok: true };
}

