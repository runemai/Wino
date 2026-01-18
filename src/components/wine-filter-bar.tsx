"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Wine, WineType } from "@/lib/supabase/types";

const wineTypeLabel: Record<WineType, string> = {
  rød: "Rødvin",
  hvid: "Hvidvin",
  rosé: "Rosé",
  mousserende: "Mousserende",
};

interface WineFilterBarProps {
  wines: Wine[];
  onFilterChange: (filteredWines: Wine[]) => void;
}

export function WineFilterBar({ wines, onFilterChange }: WineFilterBarProps) {
  const [selectedType, setSelectedType] = useState<WineType | "alle">("alle");
  const [selectedVintage, setSelectedVintage] = useState<string>("alle");
  const [selectedCountry, setSelectedCountry] = useState<string>("alle");
  const [isVintageOpen, setIsVintageOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const filterBarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node)) {
        setIsVintageOpen(false);
        setIsCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Extract unique values for filters
  const uniqueVintages = useMemo(() => {
    const vintages = wines
      .map((w) => w.vintage)
      .filter((v): v is string => v !== null && v !== undefined);
    return Array.from(new Set(vintages)).sort((a, b) => b.localeCompare(a));
  }, [wines]);

  const uniqueCountries = useMemo(() => {
    const countries = wines
      .map((w) => w.country)
      .filter((c): c is string => c !== null && c !== undefined);
    return Array.from(new Set(countries)).sort();
  }, [wines]);

  // Filter wines based on selected filters
  const filteredWines = useMemo(() => {
    return wines.filter((wine) => {
      if (selectedType !== "alle" && wine.type !== selectedType) return false;
      if (selectedVintage !== "alle" && wine.vintage !== selectedVintage) return false;
      if (selectedCountry !== "alle" && wine.country !== selectedCountry) return false;
      return true;
    });
  }, [wines, selectedType, selectedVintage, selectedCountry]);

  // Notify parent of filtered wines
  useEffect(() => {
    onFilterChange(filteredWines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredWines]); // Exclude onFilterChange from dependencies to prevent infinite loop

  const handleTypeSelect = (type: WineType | "alle") => {
    setSelectedType(type);
  };

  const handleVintageSelect = (vintage: string) => {
    setSelectedVintage(vintage);
    setIsVintageOpen(false);
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
  };

  return (
    <div ref={filterBarRef} className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
        <span>Filter</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-white/60">
          {filteredWines.length} flasker
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleTypeSelect("alle")}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            selectedType === "alle"
              ? "bg-[#e11d48] text-white shadow-[0_10px_24px_rgba(225,29,72,0.35)]"
              : "border border-white/10 bg-white/5 text-white/70 hover:text-white"
          }`}
        >
          Alle vine
        </button>
        {Object.entries(wineTypeLabel).map(([value, label]) => (
          <button
            key={value}
            onClick={() => handleTypeSelect(value as WineType)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              selectedType === value
                ? "bg-[#e11d48] text-white shadow-[0_10px_24px_rgba(225,29,72,0.35)]"
                : "border border-white/10 bg-white/5 text-white/70 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}

        {uniqueVintages.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                setIsVintageOpen(!isVintageOpen);
                setIsCountryOpen(false);
              }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
            >
              <span>{selectedVintage === "alle" ? "Årgang" : selectedVintage}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${isVintageOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isVintageOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 max-h-60 w-36 overflow-y-auto rounded-[16px] border border-white/10 bg-[#1e1821]/95 shadow-[0_14px_40px_rgba(6,4,8,0.5)] backdrop-blur-xl">
                <button
                  onClick={() => handleVintageSelect("alle")}
                  className={`w-full px-4 py-3 text-left text-xs uppercase tracking-[0.12em] transition-colors ${
                    selectedVintage === "alle"
                      ? "bg-white/10 text-[#fb7185] font-semibold"
                      : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                  }`}
                >
                  Alle årgange
                </button>
                {uniqueVintages.map((vintage) => (
                  <button
                    key={vintage}
                    onClick={() => handleVintageSelect(vintage)}
                    className={`w-full px-4 py-3 text-left text-xs uppercase tracking-[0.12em] transition-colors ${
                      selectedVintage === vintage
                        ? "bg-white/10 text-[#fb7185] font-semibold"
                        : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                    }`}
                  >
                    {vintage}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {uniqueCountries.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                setIsCountryOpen(!isCountryOpen);
                setIsVintageOpen(false);
              }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
            >
              <span>{selectedCountry === "alle" ? "Land" : selectedCountry}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${isCountryOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isCountryOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 max-h-60 w-44 overflow-y-auto rounded-[16px] border border-white/10 bg-[#1e1821]/95 shadow-[0_14px_40px_rgba(6,4,8,0.5)] backdrop-blur-xl">
                <button
                  onClick={() => handleCountrySelect("alle")}
                  className={`w-full px-4 py-3 text-left text-xs uppercase tracking-[0.12em] transition-colors ${
                    selectedCountry === "alle"
                      ? "bg-white/10 text-[#fb7185] font-semibold"
                      : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                  }`}
                >
                  Alle lande
                </button>
                {uniqueCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full px-4 py-3 text-left text-xs uppercase tracking-[0.12em] transition-colors ${
                      selectedCountry === country
                        ? "bg-white/10 text-[#fb7185] font-semibold"
                        : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

