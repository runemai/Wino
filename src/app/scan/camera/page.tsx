import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

import { ScanExperience } from "../scan-experience";

export const metadata: Metadata = {
  title: "Scan vin — Kamera · Vinterest",
};

interface CameraScanPageProps {
  searchParams: { redirect?: string | string[] };
}

const sanitizeRedirect = (value?: string | string[]) => {
  const entries = Array.isArray(value) ? value[0] : value;
  if (!entries) return "/wine-details";
  return entries.startsWith("/") ? entries : "/wine-details";
};

export default function CameraScanPage({ searchParams }: CameraScanPageProps) {
  const redirect = sanitizeRedirect(searchParams?.redirect);

  return (
    <main className="flex min-h-screen w-full flex-col gap-6 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
          Tilbage
        </Link>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
          Wine scan
        </span>
      </div>

      <ScanExperience mode="camera" redirect={redirect} />
    </main>
  );
}

