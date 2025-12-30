"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Camera, FileUp, Edit3 } from "lucide-react";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  query?: Record<string, string>;
}

const menuItems: MenuItem[] = [
  {
    icon: <Camera className="h-4 w-4" />,
    label: "Tag billede",
    href: "/scan/camera",
    query: { redirect: "/wine-details" },
  },
  {
    icon: <FileUp className="h-4 w-4" />,
    label: "Upload billede",
    href: "/scan/upload",
    query: { redirect: "/wine-details" },
  },
  {
    icon: <Edit3 className="h-4 w-4" />,
    label: "Opret vin selv",
    href: "/wine-details",
  },
];

export function NewWineMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-[12px] bg-[#DC2626] px-4 py-2 text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(220,38,38,0.25)] transition-all duration-200 ease-out active:opacity-80 active:scale-[0.96] whitespace-nowrap"
        aria-label="Tilføj ny vin"
      >
        <span className="whitespace-nowrap">Ny vin</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ease-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[200px] rounded-[14px] bg-[#FFFFFF] shadow-[0_8px_24px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden">
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              prefetch={false}
              href={{
                pathname: item.href,
                query: item.query,
              }}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-[17px] text-[#000000] leading-[22px] transition-colors duration-150 active:bg-[#F2F2F7]"
              style={{ borderTop: index > 0 ? '0.5px solid rgba(60, 60, 67, 0.29)' : 'none' }}
            >
              <div className="text-[#DC2626]">{item.icon}</div>
              <span className="font-normal">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

