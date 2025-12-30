"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function deleteWine(id: string) {
  const { client } = createSupabaseServiceClient();

  const { error } = await client.from("wines").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

