import { NewWineMenu } from "@/components/new-wine-menu";
import { WineList } from "@/components/wine-list";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

async function getWines() {
  try {
    // Check if environment variables are available
    const envCheck = env.server();
    console.log("Environment check - URL exists:", !!envCheck.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Environment check - URL value:", envCheck.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...");
    console.log("Environment check - Service key exists:", !!envCheck.SUPABASE_SERVICE_ROLE_KEY);
    console.log("Environment check - Service key length:", envCheck.SUPABASE_SERVICE_ROLE_KEY?.length);
    
    const { client } = createSupabaseServiceClient();
    
    // Test the connection with a simple health check first
    console.log("Testing Supabase connection...");
    console.log("Supabase URL:", envCheck.NEXT_PUBLIC_SUPABASE_URL);
    
    // Try a simple query first
    const { data, error } = await client
      .from("wines")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(24);

    if (error) {
      // Log error properties individually
      console.error("Supabase error message:", error.message);
      console.error("Supabase error code:", error.code);
      console.error("Supabase error details:", error.details);
      console.error("Supabase error hint:", error.hint);
      
      // Check if it's a fetch error
      if (error.message?.includes("fetch failed")) {
        console.error("⚠️ Network error detected - check:");
        console.error("1. Supabase URL is correct:", envCheck.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40));
        console.error("2. Supabase project is active (not paused)");
        console.error("3. Internet connection is working");
        console.error("4. No firewall blocking the request");
      }
      
      throw error;
    }

    console.log("Successfully fetched wines, count:", data?.length ?? 0);
    
    // Cache bliver gemt fra client-side komponenten
    return data ?? [];
  } catch (error) {
    console.error("Kunne ikke hente vine fra Supabase");
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      console.error("Error stack:", error.stack);
      if (error.cause) {
        console.error("Error cause:", error.cause);
        if (error.cause instanceof Error) {
          console.error("Cause message:", error.cause.message);
          console.error("Cause stack:", error.cause.stack);
        }
      }
    } else {
      console.error("Unknown error:", error);
      // Try to convert to string
      try {
        console.error("Error as string:", String(error));
      } catch (e) {
        console.error("Could not convert error to string");
      }
    }
    // Returner tom array - client-side vil læse fra cache hvis offline
    return [];
  }
}

export default async function Home() {
  const wines = await getWines();

  return (
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 sm:px-6 lg:px-8" style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 60px)` }}>
      <header className="flex items-center justify-between gap-4 pb-8">
        <div>
          <h1 className="text-[32px] font-bold leading-[38px] tracking-[-0.5px] text-[#000000]">
            Min vinsamling
          </h1>
        </div>
        <div className="flex-shrink-0">
          <NewWineMenu />
        </div>
      </header>

      <WineList initialWines={wines} />
      </main>
    </>
  );
}
