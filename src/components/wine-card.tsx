 "use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import type { Wine } from "@/lib/supabase/types";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { ReactNode, MouseEvent } from "react";

const wineTypeLabel: Record<Wine["type"], string> = {
  rød: "Rødvin",
  hvid: "Hvidvin",
  rosé: "Rosé",
  mousserende: "Mousserende",
};

interface WineCardProps {
  wine: Wine;
  actionSlot?: ReactNode;
  layout?: "grid" | "list";
}

export const WineCard = ({ wine, actionSlot, layout = "grid" }: WineCardProps) => {
  const preventNavigation = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const blicScores = [wine.balance, wine.length, wine.intensity, wine.complexity].filter(
    (score): score is number => score !== null && score !== undefined && score >= 80 && score <= 100,
  );
  const averageBlic =
    blicScores.length > 0
      ? blicScores.reduce((sum, score) => sum + score, 0) / blicScores.length
      : null;
  const blicDisplay = averageBlic ? (averageBlic / 10).toFixed(1) : null;

  const cardContent = (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#17121a] shadow-[var(--shadow-card)] transition-all duration-300 ease-out hover:translate-y-[-2px] hover:shadow-[var(--shadow-hover)] active:scale-[0.98]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/40 pointer-events-none z-10" />
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[26px] bg-[#0f0d12]">
        {wine.image_url ? (
          <Image
            src={wine.image_url}
            alt={`${wine.producer} ${wine.vintage ?? ""}`.trim() || wine.producer}
            fill
            sizes="(min-width: 1024px) 384px, (min-width: 768px) 384px, 100vw"
            className="object-cover object-[50%_60%] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#151016] to-[#0f0d12] text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Ingen billede
            </span>
            <p className="px-8 text-[12px] text-white/50 leading-[18px]">
              Denne vin er tilføjet uden foto.
            </p>
          </div>
        )}
        <div className="absolute bottom-4 left-4 z-20">
          <Badge className="bg-black/40 text-white/90 shadow-[0_12px_30px_rgba(4,2,6,0.45)]">
            {wine.appellation || wine.wine_district || wineTypeLabel[wine.type]}
          </Badge>
        </div>
        {blicDisplay ? (
          <div className="absolute right-4 top-4 z-20 flex h-12 w-12 flex-col items-center justify-center rounded-full border border-white/15 bg-[#b21b3a] text-white shadow-[0_12px_28px_rgba(178,27,58,0.35)]">
            <span className="text-[14px] font-semibold leading-none">{blicDisplay}</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Blic
            </span>
          </div>
        ) : null}
        {actionSlot ? (
          <div
            className={`absolute right-4 ${blicDisplay ? "top-16" : "top-4"} z-10 opacity-100 transition-opacity duration-200`}
            onClick={preventNavigation}
          >
            {actionSlot}
          </div>
        ) : null}
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <h3 className="text-[20px] font-semibold text-white leading-[26px] tracking-[-0.4px]">
            {wine.producer}
          </h3>
          {(wine.cuvee || wine.appellation) && (
            <p className="text-[13px] text-white/70 leading-[18px] tracking-[-0.2px]">
              {wine.cuvee || wine.appellation}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50">
          {wine.vintage && <span className="text-[#fb7185]">{wine.vintage} Vintage</span>}
          {(wine.country || wine.wine_district) && (
            <span>
              {wine.vintage ? "· " : ""}
              {[wine.wine_district, wine.country].filter(Boolean).join(", ")}
            </span>
          )}
        </div>

        {layout === "list" && (
          <div className="mt-2 space-y-2 border-t border-white/10 pt-4 text-xs text-white/60">
            {wine.grapes && (
              <p className="line-clamp-2">
                <span className="text-white/40">Druer:</span> {wine.grapes}
              </p>
            )}
            {wine.alcohol && (
              <p>
                <span className="text-white/40">Alkohol:</span> {wine.alcohol}
              </p>
            )}
            <p>
              <span className="text-white/40">Tilføjet:</span>{" "}
              {format(new Date(wine.created_at), "d. MMM yyyy", { locale: da })}
            </p>
          </div>
        )}

        {wine.notes && layout === "list" && (
          <p className="line-clamp-2 text-xs text-white/60 leading-relaxed">{wine.notes}</p>
        )}
      </div>
    </article>
  );

  return (
    <Link
      href={`/wines/${wine.id}/edit`}
      className="block rounded-[26px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb7185]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d]"
    >
      {cardContent}
    </Link>
  );
};

