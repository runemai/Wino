"use client";

import { useState, useEffect, useCallback } from "react";
import { WineCard } from "@/components/wine-card";
import { WineFilterBar } from "@/components/wine-filter-bar";
import { DeleteWineButton } from "@/components/delete-wine-button";
import { getWinesFromCache, isOnline, saveWinesToCache } from "@/lib/offline-storage";
import { WifiOff } from "lucide-react";
import type { Wine } from "@/lib/supabase/types";

interface WineListProps {
  initialWines: Wine[];
}

export function WineList({ initialWines }: WineListProps) {
  const [filteredWines, setFilteredWines] = useState<Wine[]>(initialWines);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [usingCache, setUsingCache] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    // Gem i cache hvis vi har vine (kun online)
    if (initialWines.length > 0 && isOnline()) {
      saveWinesToCache(initialWines);
    }

    // Hvis der ikke er vine og vi er offline, prøv at hente fra cache
    if (initialWines.length === 0 && !isOnline()) {
      const cachedWines = getWinesFromCache();
      if (cachedWines && cachedWines.length > 0) {
        setFilteredWines(cachedWines);
        setUsingCache(true);
        setIsOffline(true);
        return;
      }
    }
    
    setFilteredWines(initialWines);
    setUsingCache(false);
    setIsOffline(!isOnline());
  }, [initialWines]);

  // Lyt til online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleFilterChange = useCallback((wines: Wine[]) => {
    setFilteredWines(wines);
  }, []);

  return (
    <section className="space-y-6">
      {(isOffline || usingCache) && (
        <div className="mx-1 flex items-center gap-3 rounded-[16px] border border-[#3b2a28] bg-[#241717] px-4 py-3 text-white/80 shadow-[0_10px_24px_rgba(6,4,8,0.4)]">
          <WifiOff className="h-5 w-5 text-[#fb7185] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[14px] font-semibold leading-[20px] tracking-[0.01em] text-white">
              {usingCache ? "Offline mode - Viser cached vine" : "Ingen internetforbindelse"}
            </p>
            <p className="mt-1 text-[12px] leading-[18px] text-white/60">
              {usingCache 
                ? "Du kan se dine gemte vine, men nye opdateringer kræver internet"
                : "Nogle funktioner er ikke tilgængelige offline"}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <div className="flex w-full max-w-xs items-center rounded-full border border-white/10 bg-[#151018] p-1 shadow-[var(--shadow-subtle)]">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
              viewMode === "grid"
                ? "bg-[#231721] text-white shadow-[0_12px_26px_rgba(6,4,8,0.45)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
              viewMode === "list"
                ? "bg-[#231721] text-white shadow-[0_12px_26px_rgba(6,4,8,0.45)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            Liste
          </button>
        </div>
      </div>

      <WineFilterBar wines={initialWines} onFilterChange={handleFilterChange} />

      {filteredWines.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-2 text-sm text-white/60">
            {isOffline 
              ? "Ingen cached vine fundet. Tilslut til internettet for at hente dine vine."
              : "Ingen vine endnu. Tilføj din første vin!"}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-5 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-4"
          }
        >
          {filteredWines.map((wine) => (
            <WineCard
              key={wine.id}
              wine={wine}
              layout={viewMode}
              actionSlot={!isOffline ? <DeleteWineButton wineId={wine.id} producer={wine.producer} /> : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

