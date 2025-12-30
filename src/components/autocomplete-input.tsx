"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
  fetchSuggestions: (query: string) => Promise<string[]>;
  minChars?: number;
  showOnFocus?: boolean; // Vis forslag når feltet får fokus, selv hvis der ikke er skrevet noget
}

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder,
  className = "",
  fetchSuggestions,
  minChars = 2,
  showOnFocus = false,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const loadSuggestions = useCallback(
    async (query: string = "", forceLoad = false) => {
      // Hvis showOnFocus er true og query er tom, load alligevel
      if (!forceLoad && query.length < minChars) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await fetchSuggestions(query || "");
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Fejl ved hentning af forslag:", error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSuggestions, minChars],
  );

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      void loadSuggestions(value);
    }, 300); // Debounce 300ms

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, loadSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    if (onSelect) {
      onSelect(suggestion);
    }
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]!);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative"
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.value);
          }}
          onFocus={async (e) => {
            // Stop event propagation for at forhindre at andre felter åbner
            e.stopPropagation();
            if (showOnFocus) {
              // Hvis showOnFocus er true, load forslag når feltet får fokus
              await loadSuggestions("", true);
            } else if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onClick={(e) => {
            // Stop event propagation
            e.stopPropagation();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#DC2626] border-t-transparent" />
          </div>
        )}
        {!isLoading && isOpen && suggestions.length > 0 && (
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div 
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[#E5E7EB] bg-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(suggestion);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`w-full px-4 py-2.5 text-left text-sm transition ${
                index === selectedIndex
                  ? "bg-[#DC2626]/10 text-[#DC2626]"
                  : "text-[#1f2937] hover:bg-[#F9FAFB]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{suggestion}</span>
                {value.toLowerCase() === suggestion.toLowerCase() && (
                  <Check className="h-4 w-4 text-[#DC2626]" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

