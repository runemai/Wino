import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { isNative } from "@/lib/capacitor";
import type { Database } from "./types";
import { env } from "../env";

export const createSupabaseBrowserClient = () => {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    env.client();

  // For Capacitor native apps, use createClient with localStorage
  // For web, use createBrowserClient (better SSR support)
  if (isNative()) {
    return createClient<Database>(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Disable URL-based session detection in native
      },
    });
  }

  // Web version - use createBrowserClient for SSR support
  return createBrowserClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
};

