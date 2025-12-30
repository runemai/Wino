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
        <div className="rounded-[10px] bg-[#FFF4E5] px-4 py-3 flex items-center gap-3 mx-4">
          <WifiOff className="h-5 w-5 text-[#FF9500] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[15px] font-medium text-[#000000] leading-[20px] tracking-[-0.24px]">
              {usingCache ? "Offline mode - Viser cached vine" : "Ingen internetforbindelse"}
            </p>
            <p className="text-[13px] text-[#3C3C43] leading-[18px] mt-1">
              {usingCache 
                ? "Du kan se dine gemte vine, men nye opdateringer kræver internet"
                : "Nogle funktioner er ikke tilgængelige offline"}
            </p>
          </div>
        </div>
      )}

      <WineFilterBar wines={initialWines} onFilterChange={handleFilterChange} />

      {filteredWines.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[#6B7280] mb-2">
            {isOffline 
              ? "Ingen cached vine fundet. Tilslut til internettet for at hente dine vine."
              : "Ingen vine endnu. Tilføj din første vin!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredWines.map((wine) => (
            <WineCard
              key={wine.id}
              wine={wine}
              actionSlot={!isOffline ? <DeleteWineButton wineId={wine.id} producer={wine.producer} /> : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

