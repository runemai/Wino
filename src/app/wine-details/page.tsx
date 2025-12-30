import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { WineDetailsExperience } from "./wine-details-experience";

export const metadata: Metadata = {
  title: "Vindetaljer · Vinterest",
};

export default function WineDetailsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-16 sm:px-10 lg:px-16">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/20"
      >
        <ChevronLeft className="h-4 w-4" />
        Tilbage til samlingen
      </Link>

      <WineDetailsExperience redirectPath="/wine-details" />
    </main>
  );
}

