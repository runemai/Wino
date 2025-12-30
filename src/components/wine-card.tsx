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
}

export const WineCard = ({ wine, actionSlot }: WineCardProps) => {
  const preventNavigation = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const cardContent = (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] bg-gradient-to-br from-[#DC2626] via-[#B91C1C] to-[#991B1B] shadow-[0_8px_24px_rgba(220,38,38,0.25)] transition-all duration-300 ease-out active:scale-[0.98]">
      {/* Gradient overlay for texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none z-10"></div>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[24px] bg-white">
        {wine.image_url ? (
          <Image
            src={wine.image_url}
            alt={`${wine.producer} ${wine.vintage ?? ""}`.trim() || wine.producer}
            fill
            sizes="(min-width: 1024px) 384px, (min-width: 768px) 384px, 100vw"
            className="object-cover object-[50%_60%] transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#F2F2F7] to-[#FFFFFF] text-center">
            <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#DC2626]/60">
              Ingen billede
            </span>
            <p className="px-8 text-[13px] text-[#3C3C4399] leading-[18px]">
              Denne vin er tilføjet uden foto.
            </p>
          </div>
        )}
        {/* Type badge overlay */}
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-white/95 backdrop-blur-md text-[12px] font-bold px-3 py-1.5 rounded-[8px] text-[#DC2626] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            {wineTypeLabel[wine.type]}
          </Badge>
        </div>
        {actionSlot ? (
          <div
            className="absolute right-4 top-4 z-10 opacity-100 transition-opacity duration-200"
            onClick={preventNavigation}
          >
            {actionSlot}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6 relative z-10">
        {/* Producer - hovedtitel */}
        <div className="space-y-2">
          <h3 className="text-[24px] font-bold text-white leading-[30px] tracking-[-0.5px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            {wine.producer}
          </h3>
          {/* Cuvée eller Appellation */}
          {(wine.cuvee || wine.appellation) && (
            <p className="text-[16px] text-white/90 leading-[22px] tracking-[-0.3px] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
              {wine.cuvee || wine.appellation}
            </p>
          )}
        </div>

        {/* Details sektion - Region, Year */}
        <div className="flex flex-wrap gap-2">
          {(wine.country || wine.wine_district) && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 border border-white/30">
              <span className="text-[11px] font-semibold text-white">📍</span>
              <span className="text-[13px] font-medium text-white leading-[18px]">{[wine.country, wine.wine_district].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {wine.vintage && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 border border-white/30">
              <span className="text-[11px] font-semibold text-white">📅</span>
              <span className="text-[13px] font-medium text-white leading-[18px]">{wine.vintage}</span>
            </div>
          )}
        </div>

        {/* Detaljer: Druer, Alkohol, Vinmark, Dato */}
        <div className="mt-auto space-y-2.5 pt-4 border-t border-white/20">
          {wine.grapes && (
            <div className="grid grid-cols-[70px_1fr] items-center gap-3">
              <span className="text-[12px] text-white/70 leading-[16px] font-medium">Druer</span>
              <span className="text-[14px] text-white leading-[20px] font-medium">{wine.grapes}</span>
            </div>
          )}
          {wine.alcohol && (
            <div className="grid grid-cols-[70px_1fr] items-center gap-3">
              <span className="text-[12px] text-white/70 leading-[16px] font-medium">Alkohol</span>
              <span className="text-[14px] text-white leading-[20px] font-medium">{wine.alcohol}</span>
            </div>
          )}
          {wine.vineyard && (
            <div className="grid grid-cols-[70px_1fr] items-center gap-3">
              <span className="text-[12px] text-white/70 leading-[16px] font-medium">Vinmark</span>
              <span className="text-[14px] text-white leading-[20px] font-medium">{wine.vineyard}</span>
            </div>
          )}
          <div className="grid grid-cols-[70px_1fr] items-center gap-3">
            <span className="text-[12px] text-white/70 leading-[16px] font-medium">Dato</span>
            <span className="text-[14px] text-white leading-[20px] font-medium">
              {format(new Date(wine.created_at), "d. MMM yyyy", { locale: da })}
            </span>
          </div>
        </div>

        {/* Noter */}
        {wine.notes && (
          <p className="line-clamp-2 text-sm text-[#6B7280]/90 leading-relaxed">
            {wine.notes}
          </p>
        )}
      </div>
    </article>
  );

  return (
    <Link
      href={`/wines/${wine.id}/edit`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#F2F2F7] rounded-[24px]"
    >
      {cardContent}
    </Link>
  );
};

