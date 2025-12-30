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
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isVintageOpen, setIsVintageOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const filterBarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
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
    setIsTypeOpen(false);
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
    <div ref={filterBarRef} className="flex items-center justify-between gap-6 border-b border-[#E5E7EB]/60 pb-6">
      {/* Left: Count */}
      <div className="text-sm text-[#6B7280]">
        <span className="font-medium">Antal flasker:</span>{" "}
        <span className="font-semibold text-[#DC2626]">{filteredWines.length}</span>
      </div>

      {/* Right: Filters */}
      <div className="flex items-center gap-4">
        {/* Type Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setIsTypeOpen(!isTypeOpen);
              setIsVintageOpen(false);
              setIsCountryOpen(false);
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-[#6B7280] transition-colors duration-200 hover:text-[#DC2626]"
          >
            <span>{selectedType === "alle" ? "Type" : wineTypeLabel[selectedType]}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ease-out ${
                isTypeOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isTypeOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-[16px] border border-[#E5E7EB]/60 bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden">
              <button
                onClick={() => handleTypeSelect("alle")}
                className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${
                  selectedType === "alle"
                    ? "bg-[#F9FAFB] text-[#DC2626] font-semibold"
                    : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#DC2626] font-medium"
                }`}
              >
                Alle typer
              </button>
              {Object.entries(wineTypeLabel).map(([value, label], index) => (
                <button
                  key={value}
                  onClick={() => handleTypeSelect(value as WineType)}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${
                    selectedType === value
                      ? "bg-[#F9FAFB] text-[#DC2626] font-semibold"
                      : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#DC2626] font-medium"
                  }`}
                  style={{ borderTop: index >= 0 ? '1px solid rgba(229, 231, 235, 0.5)' : 'none' }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vintage Filter */}
        {uniqueVintages.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                setIsVintageOpen(!isVintageOpen);
                setIsTypeOpen(false);
                setIsCountryOpen(false);
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-[#6B7280] transition-colors duration-200 hover:text-[#DC2626]"
            >
              <span>{selectedVintage === "alle" ? "Årgang" : selectedVintage}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  isVintageOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isVintageOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 max-h-60 w-32 overflow-y-auto rounded-[16px] border border-[#E5E7EB]/60 bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden">
                <button
                  onClick={() => handleVintageSelect("alle")}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${
                    selectedVintage === "alle"
                      ? "bg-[#F9FAFB] text-[#DC2626] font-semibold"
                      : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#DC2626] font-medium"
                  }`}
                >
                  Alle årgange
                </button>
                {uniqueVintages.map((vintage, index) => (
                  <button
                    key={vintage}
                    onClick={() => handleVintageSelect(vintage)}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${
                      selectedVintage === vintage
                        ? "bg-[#F9FAFB] text-[#DC2626] font-semibold"
                        : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#DC2626] font-medium"
                    }`}
                    style={{ borderTop: index >= 0 ? '1px solid rgba(229, 231, 235, 0.5)' : 'none' }}
                  >
                    {vintage}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Country Filter */}
        {uniqueCountries.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                setIsCountryOpen(!isCountryOpen);
                setIsTypeOpen(false);
                setIsVintageOpen(false);
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-[#6B7280] transition-colors duration-200 hover:text-[#DC2626]"
            >
              <span>{selectedCountry === "alle" ? "Land" : selectedCountry}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  isCountryOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isCountryOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 max-h-60 w-40 overflow-y-auto rounded-[16px] border border-[#E5E7EB]/60 bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.06),0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden">
                <button
                  onClick={() => handleCountrySelect("alle")}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${
                    selectedCountry === "alle"
                      ? "bg-[#F9FAFB] text-[#DC2626] font-semibold"
                      : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#DC2626] font-medium"
                  }`}
                >
                  Alle lande
                </button>
                {uniqueCountries.map((country, index) => (
                  <button
                    key={country}
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${
                      selectedCountry === country
                        ? "bg-[#F9FAFB] text-[#DC2626] font-semibold"
                        : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#DC2626] font-medium"
                    }`}
                    style={{ borderTop: index >= 0 ? '1px solid rgba(229, 231, 235, 0.5)' : 'none' }}
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

