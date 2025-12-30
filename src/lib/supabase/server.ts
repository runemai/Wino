import { cookies } from "next/headers";
// @ts-ignore - Type definition issue with @supabase/ssr
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { env } from "../env";

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    env.client();

  return createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options?: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Ignore errors in server components
          }
        },
        remove(name: string, options?: any) {
          try {
            cookieStore.delete(name);
          } catch (error) {
            // Ignore errors in server components
          }
        },
      },
    },
  );
};

export const createSupabaseServiceClient = () => {
  const {
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_BUCKET,
  } = env.server();

  // Validate URL format
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
    throw new Error(`Invalid Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50)}`);
  }

  // Ensure URL ends with /rest/v1 for proper API endpoint
  const supabaseUrl = NEXT_PUBLIC_SUPABASE_URL.endsWith('/rest/v1') 
    ? NEXT_PUBLIC_SUPABASE_URL.replace('/rest/v1', '')
    : NEXT_PUBLIC_SUPABASE_URL;

  // Use createClient directly for service role key (no cookies needed)
  const client = createClient<Database>(
    supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    },
  );

  return {
    client,
    bucket: SUPABASE_STORAGE_BUCKET,
  };
};

