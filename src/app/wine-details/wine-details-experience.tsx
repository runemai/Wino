"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  FileUp,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";

import type { Wine } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { AutocompleteInput } from "@/components/autocomplete-input";
import { saveWineAction } from "./actions";
import { updateWineAction } from "@/app/wines/actions";
import { useCaptureStore } from "@/stores/capture-store";
import type {
  Extraction,
  FormShape,
} from "./types";
import { aiTrackableFields, createEmptyFormState } from "./types";
import { BLIKRating } from "@/components/blic-rating";
import { WineCriticReviews } from "@/components/wine-critic-reviews";

const wineTypeLabel: Record<Wine["type"], string> = {
  rød: "Rødvin",
  hvid: "Hvidvin",
  rosé: "Rosé",
  mousserende: "Mousserende",
};

interface WineDetailsExperienceProps {
  initialWine?: Wine | null;
  redirectPath?: string;
}

export const WineDetailsExperience = ({
  initialWine,
  redirectPath = "/wine-details",
}: WineDetailsExperienceProps) => {
  const router = useRouter();
  const consumeCapture = useCaptureStore((state) => state.consumeCapture);

  // Fetch funktioner til autocomplete
  const fetchProducers = async (query: string): Promise<string[]> => {
    const response = await fetch(`/api/search-wine-terms?q=${encodeURIComponent(query)}&type=producer`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.suggestions || [];
  };

  const fetchAppellations = async (query: string): Promise<string[]> => {
    const response = await fetch(`/api/search-wine-terms?q=${encodeURIComponent(query)}&type=appellation`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.suggestions || [];
  };

  const baseFormState = useMemo<FormShape>(
    () => ({
      producer: initialWine?.producer ?? "",
      appellation: initialWine?.appellation ?? "",
      cuvee: initialWine?.cuvee ?? "",
      vintage: initialWine?.vintage ?? "",
      type: initialWine?.type ?? "rød",
      country: initialWine?.country ?? "",
      wine_district: initialWine?.wine_district ?? "",
      grapes: initialWine?.grapes ?? "",
      alcohol: initialWine?.alcohol ?? "",
      vineyard: initialWine?.vineyard ?? "",
      consumed_date: initialWine?.created_at 
        ? new Date(initialWine.created_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      balance: initialWine?.balance ?? null,
      length: initialWine?.length ?? null,
      intensity: initialWine?.intensity ?? null,
      complexity: initialWine?.complexity ?? null,
      smagsnote: initialWine?.smagsnote ?? "",
    }),
    [initialWine],
  );

  const capturedBlobRef = useRef<File | null>(null);

  const [form, setForm] = useState<FormShape>(baseFormState);

  // Opdater form og wineId når initialWine ændres (fx når vi redirecter til edit-siden)
  useEffect(() => {
    if (initialWine) {
      setForm(baseFormState);
      setWineId(initialWine.id);
    }
  }, [initialWine, baseFormState]);

  const fetchVineyards = useCallback(
    async (query: string): Promise<string[]> => {
      // Hvis der er valgt en appellation, filtrer vinmarker efter den
      const currentAppellation = form.appellation;
      const appellationParam = currentAppellation
        ? `&appellation=${encodeURIComponent(currentAppellation)}`
        : "";
      // Send tom string hvis query er tom, så API'en kan håndtere det
      const queryParam = query || "";
      const response = await fetch(
        `/api/search-wine-terms?q=${encodeURIComponent(queryParam)}&type=vineyard${appellationParam}`,
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.suggestions || [];
    },
    [form.appellation],
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(
    initialWine?.image_url ?? null,
  );
  const [analysis, setAnalysis] = useState<Extraction | null>(null);
  const [missingFields, setMissingFields] = useState<Set<keyof FormShape>>(
    new Set(),
  );
  const [highlightMissing, setHighlightMissing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wineId, setWineId] = useState<string | null>(initialWine?.id ?? null);
  const hasProcessedCaptureRef = useRef(false); // Forhindre at processCapture kører flere gange

  useEffect(() => {
      setForm(baseFormState);
  }, [baseFormState]);

  useEffect(() => {
    const processCapture = async () => {
      // Forhindre at dette kører flere gange
      if (hasProcessedCaptureRef.current) {
        console.log("[WineDetails] processCapture allerede kørt, springer over");
        return;
      }
      hasProcessedCaptureRef.current = true;
      
      try {
        const payload = consumeCapture();
        console.log("[WineDetails] consumeCapture() returnerede:", {
          hasPayload: !!payload,
          hasExtraction: !!payload?.extraction,
          extraction: payload?.extraction,
        });
        
        if (!payload) return;

        capturedBlobRef.current = payload.file;
        setCapturedImage(payload.previewUrl);
        setError(null);

        // Hvis vi allerede har en vin (initialWine), giv brugeren valget om de vil bruge extraction data
        if (initialWine) {
          // Vis ikke extraction data automatisk - brugeren skal aktivt vælge det
          return;
        }

        // Hvis vi ikke har en vin endnu, kør automatisk analyse (vinen bliver gemt i scan-experience.tsx)

        if (payload.extraction) {
        console.log("[WineDetails] Udfylder felter med extraction data:", payload.extraction);
        setAnalysis(payload.extraction);
        const nextForm: FormShape = {
          producer: payload.extraction.producer ?? "",
          appellation: payload.extraction.appellation ?? "",
          cuvee: payload.extraction.cuvee ?? "",
          vintage: payload.extraction.vintage ?? "",
          type: payload.extraction.type ?? "rød",
          country: payload.extraction.country ?? "",
          wine_district: payload.extraction.wine_district ?? "",
          grapes: payload.extraction.grapes ?? "",
          alcohol: payload.extraction.alcohol ?? "",
          vineyard: payload.extraction.vineyard ?? "",
          consumed_date: form.consumed_date || new Date().toISOString().split("T")[0],
          balance: null,
          length: null,
          intensity: null,
          complexity: null,
          smagsnote: "",
        };
        console.log("[WineDetails] Næste form state:", nextForm);
        setForm(nextForm);
        const nextMissing = aiTrackableFields.filter((field) => {
          const value = nextForm[field];
          const stringValue = typeof value === 'string' ? value.trim() : String(value || '');
          return !stringValue;
        });
        setMissingFields(new Set(nextMissing));
        setHighlightMissing(nextMissing.length > 0);

        // Vinen er allerede gemt i scan-experience.tsx hvis producer findes
        // Hvis producer ikke findes, skal brugeren manuelt udfylde og gemme
        } else {
          console.warn("[WineDetails] INGEN extraction data i payload!");
        }
      } catch (outerErr) {
        console.error("[WineDetails] Fejl i processCapture:", outerErr);
        // Hvis der er en fejl i hele processCapture, vis den ikke i UI
        // Da det kan være en fejl ved consumeCapture eller andet setup
      }
    };

    void processCapture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateForm = <K extends keyof FormShape>(key: K, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (typeof value === "string" && value.trim()) {
      setMissingFields((prev) => {
        if (!prev.has(key)) return prev;
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleSave = async () => {
    if (!form.producer.trim()) {
      setError("Producent skal udfyldes.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const data = new FormData();
      if (capturedBlobRef.current) {
        data.append("file", capturedBlobRef.current);
      }
      data.append("producer", form.producer);
      data.append("appellation", form.appellation);
      data.append("cuvee", form.cuvee);
      data.append("vintage", form.vintage);
      data.append("type", form.type);
      data.append("country", form.country);
      data.append("wine_district", form.wine_district);
      data.append("grapes", form.grapes);
      data.append("alcohol", form.alcohol);
      data.append("vineyard", form.vineyard);
      data.append("consumed_date", form.consumed_date);
      data.append("smagsnote", form.smagsnote?.trim() || "");
      // Only send BLIK ratings if they are valid values (85-100), otherwise send empty string which will be converted to null
      if (form.balance !== null && form.balance !== undefined && form.balance >= 85 && form.balance <= 100) {
        data.append("balance", form.balance.toString());
      } else {
        data.append("balance", "");
      }
      if (form.length !== null && form.length !== undefined && form.length >= 85 && form.length <= 100) {
        data.append("length", form.length.toString());
      } else {
        data.append("length", "");
      }
      if (form.intensity !== null && form.intensity !== undefined && form.intensity >= 85 && form.intensity <= 100) {
        data.append("intensity", form.intensity.toString());
      } else {
        data.append("intensity", "");
      }
      if (form.complexity !== null && form.complexity !== undefined && form.complexity >= 85 && form.complexity <= 100) {
        data.append("complexity", form.complexity.toString());
      } else {
        data.append("complexity", "");
      }

      // Hvis vi har en wineId, opdater vinen
      if (wineId) {
        data.append("id", wineId);
        if (initialWine?.image_url && !capturedBlobRef.current) {
          data.append("existingImageUrl", initialWine.image_url);
        }
        await updateWineAction(data);
        setIsSaving(false);
        router.push("/");
      } else {
        // Opret ny vin
        const result = await saveWineAction(data);
        
        if (!result) {
          throw new Error("Ingen respons fra serveren");
        }
        
        if (!result.ok) {
          throw new Error("Serveren returnerede en fejl");
        }
        
        if (!result.wineId) {
          throw new Error("Vinen blev gemt, men mangler ID. Prøv at opdatere siden.");
        }
        
        // Sæt wineId så wine critics kan vises
        setWineId(result.wineId);
        
        // Refresh router cache før redirect
        router.refresh();
        
        // Redirect til edit siden så brugeren kan se wine critics sektionen
        setTimeout(() => {
          router.push(`/wines/${result.wineId}/edit`);
        }, 300);
      }
    } catch (err) {
      console.error("Fejl i handleSave:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'string' 
          ? err 
          : "Kunne ikke gemme vinen. Prøv igen.";
      setError(errorMessage);
      setIsSaving(false);
    }
  };


  const shouldHighlightMissing = highlightMissing;
  const highlightClass = (key: keyof FormShape) =>
    shouldHighlightMissing && missingFields.has(key)
      ? "border-rose-300 bg-rose-50 focus:border-rose-400"
      : "";

  const scanningLink = (mode: "camera" | "upload") =>
    `/scan/${mode}?redirect=${encodeURIComponent(redirectPath)}`;

  const handleAnalyzeImage = async () => {
    if (!capturedBlobRef.current) {
      setError("Intet billede at analysere.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", capturedBlobRef.current);

      const response = await fetch("/api/extract-wine", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kunne ikke analysere billedet.");
      }

      const { data: extraction } = await response.json();
      setAnalysis(extraction);

      // Opdater kun felter der ikke allerede er udfyldt, eller hvis extraction har bedre data
      setForm((prev) => ({
        producer: extraction.producer || prev.producer,
        appellation: extraction.appellation || prev.appellation,
        cuvee: extraction.cuvee || prev.cuvee,
        vintage: extraction.vintage || prev.vintage,
        type: extraction.type || prev.type,
        country: extraction.country || prev.country,
        wine_district: extraction.wine_district || prev.wine_district,
        grapes: extraction.grapes || prev.grapes,
        alcohol: extraction.alcohol || prev.alcohol,
        vineyard: extraction.vineyard || prev.vineyard,
        consumed_date: prev.consumed_date,
        balance: prev.balance,
        length: prev.length,
        intensity: prev.intensity,
        complexity: prev.complexity,
        smagsnote: prev.smagsnote,
      }));

      const nextMissing = aiTrackableFields.filter((field) => {
        const value = extraction[field]?.trim?.();
        return !value;
      });
      setMissingFields(new Set(nextMissing));
      setHighlightMissing(nextMissing.length > 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunne ikke analysere billedet.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-16 px-4 sm:gap-8 sm:pb-20 overflow-x-hidden">
      <header className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#DC2626] font-medium"
        >
          ← Tilbage
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#DC2626] sm:text-3xl lg:text-4xl xl:text-5xl">
              {initialWine?.producer || form.producer || "Ny vin"}
            </h1>
            {(form.cuvee || form.appellation) && (
              <p className="mt-2 text-base text-[#6B7280] font-medium sm:text-lg lg:text-xl">
                {form.cuvee || form.appellation}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          {/* Billede sektion */}
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-[#F9FAFB]">
            {capturedImage ? (
                capturedImage.startsWith("blob:") ? (
                  <img
                    src={capturedImage}
                    alt="Vinbillede"
                    className="h-full w-full object-cover object-[50%_60%]"
                  />
                ) : (
                <Image
                  src={capturedImage}
                  alt="Vinbillede"
                  fill
                  unoptimized
                  className="object-cover object-[50%_60%]"
                />
                )
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-[#6B7280]">
                  <ImageIcon className="h-8 w-8" />
                  <p className="px-8 text-sm">
                    Intet billede endnu. Brug knapperne nedenfor for at scanne eller uploade.
                </p>
              </div>
            )}
            </div>

            {/* Billede actions */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                asChild
                className="rounded-full border border-[#E5E7EB] bg-white px-4 text-xs font-semibold text-[#1f2937] hover:bg-[#F9FAFB]"
              >
                <Link prefetch={false} href={scanningLink("camera")}>
                <Camera className="mr-2 h-4 w-4" />
                  Tag billede
                </Link>
              </Button>
              <Button
                asChild
                className="rounded-full border border-[#E5E7EB] bg-white px-4 text-xs font-semibold text-[#1f2937] hover:bg-[#F9FAFB]"
              >
                <Link prefetch={false} href={scanningLink("upload")}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload billede
                </Link>
              </Button>
              {initialWine && capturedBlobRef.current && (
                <Button
                  type="button"
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing}
                  className="rounded-full border border-[#DC2626] bg-[#DC2626] px-4 text-xs font-semibold text-white hover:bg-[#B91C1C] disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyserer...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analysér billede
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* AI noter / Description */}
            {analysis?.label_summary ? (
              <div className="rounded-[10px] bg-[#FFFFFF] p-4 sm:p-6 lg:p-7">
                <h2 className="mb-3 text-[20px] font-semibold text-[#000000] leading-[25px] tracking-[0.38px]">Description</h2>
                <p className="text-[15px] leading-[20px] tracking-[-0.24px] text-[#3C3C43]">{analysis.label_summary}</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 sm:gap-6">
            {/* BLIK Rating Section */}
            <BLIKRating
              balance={form.balance}
              længde={form.length}
              intensitet={form.intensity}
              kompleksitet={form.complexity}
              onBalanceChange={(value) => updateForm("balance", value)}
              onLængdeChange={(value) => updateForm("length", value)}
              onIntensitetChange={(value) => updateForm("intensity", value)}
              onKompleksitetChange={(value) => updateForm("complexity", value)}
            />

            {/* Wine Critic Reviews Section - ALWAYS show when we have a wine ID */}
            {(() => {
              const effectiveWineId = wineId || initialWine?.id;
              if (!effectiveWineId) {
                return null;
              }
              return (
                <WineCriticReviews
                  key={effectiveWineId}
                  wineId={effectiveWineId}
                  wineData={{
                    producer: form.producer || initialWine?.producer || "",
                    cuvee: form.cuvee || initialWine?.cuvee || "",
                    appellation: form.appellation || initialWine?.appellation || "",
                    vintage: form.vintage || initialWine?.vintage || "",
                    country: form.country || initialWine?.country || "",
                    wine_district: form.wine_district || initialWine?.wine_district || "",
                    grapes: form.grapes || initialWine?.grapes || "",
                    type: form.type || initialWine?.type || "rød",
                  }}
                  autoFetch={true}
                />
              );
            })()}

            {/* Smagsnote Section */}
            <div className="rounded-[10px] bg-[#FFFFFF] p-4 sm:p-6 lg:p-7">
              <h2 className="mb-3 text-[20px] font-semibold text-[#000000] leading-[25px] tracking-[0.38px]">Smagsnote</h2>
              <label className="flex flex-col gap-2">
                <textarea
                  className="min-h-[120px] rounded-[10px] border-0 bg-[#F2F2F7] px-4 py-3 text-[17px] text-[#000000] leading-[22px] outline-none transition-colors focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#DC2626] focus:ring-inset resize-none"
                  value={form.smagsnote ?? ''}
                  onChange={(event) =>
                    updateForm("smagsnote", event.target.value)
                  }
                  placeholder="Skriv dine noter om oplevelsen, tonerne og smagen..."
                />
              </label>
            </div>

            {/* Form sektion */}
            <div className="rounded-[10px] bg-[#FFFFFF] p-4 sm:p-6 lg:p-7">
              <h2 className="mb-4 text-[20px] font-semibold text-[#000000] leading-[25px] tracking-[0.38px] sm:mb-6">Rediger oplysninger</h2>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSave();
              }}
              className="flex flex-col gap-4"
            >
              <label className="flex flex-col gap-2.5">
                <span className="text-[13px] font-medium text-[#000000] leading-[18px] uppercase tracking-[0.08em]">
                  Producent
                </span>
                <input
                  type="text"
                  value={form.producer}
                  onChange={(event) => updateForm("producer", event.target.value)}
                  placeholder="fx Domaine de la Romanée-Conti"
                  className={`rounded-[10px] border-0 bg-[#F2F2F7] px-4 py-3 text-[17px] text-[#000000] leading-[22px] outline-none transition-colors focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#DC2626] focus:ring-inset ${highlightClass("producer")}`}
                />
              </label>

              <label 
                className="flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              >
                <span className="text-[13px] font-medium text-[#000000] leading-[18px] uppercase tracking-[0.08em]">
                  Appellation
                </span>
                <AutocompleteInput
                  value={form.appellation}
                  onChange={(value) => {
                    updateForm("appellation", value);
                    // Ryd vinmark når appellation ændres, da den valgte vinmark muligvis ikke hører til den nye appellation
                    if (value !== form.appellation && form.vineyard) {
                      updateForm("vineyard", "");
                    }
                  }}
                  placeholder="fx Bourgogne AOC"
                  className={`rounded-[10px] border-0 bg-[#F2F2F7] px-4 py-3 text-[17px] text-[#000000] leading-[22px] outline-none transition-colors focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#DC2626] focus:ring-inset ${highlightClass("appellation")}`}
                  fetchSuggestions={fetchAppellations}
                  minChars={1}
                  showOnFocus={false}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[13px] font-medium text-[#000000] leading-[18px] uppercase tracking-[0.08em]">
                  Cuvée
                </span>
                <input
                    className={`rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#DC2626] focus:bg-white ${highlightClass("cuvee")}`}
                  value={form.cuvee}
                  onChange={(event) => updateForm("cuvee", event.target.value)}
                  placeholder="fx Der Elefant im Porzellanladen"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2">
                  <span className="text-[13px] font-medium text-[#000000] leading-[18px] uppercase tracking-[0.08em]">
                    Årgang
                  </span>
                  <input
                    className={`rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#DC2626] focus:bg-white ${highlightClass("vintage")}`}
                    value={form.vintage}
                    onChange={(event) =>
                      updateForm("vintage", event.target.value)
                    }
                    placeholder="fx 2019"
                  />
                </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-medium text-[#000000] leading-[18px] uppercase tracking-[0.08em]">
                      Type
                    </span>
                    <select
                      className="rounded-[10px] border-0 bg-[#F2F2F7] px-4 py-3 text-[17px] text-[#000000] leading-[22px] outline-none transition-colors focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#DC2626] focus:ring-inset"
                      value={form.type}
                    onChange={(event) => updateForm("type", event.target.value)}
                      required
                    >
                    <option value="rød">Rødvin</option>
                    <option value="hvid">Hvidvin</option>
                    <option value="rosé">Rosé</option>
                    <option value="mousserende">Mousserende</option>
                    </select>
                  </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2">
                  <span className="text-[13px] font-medium text-[#000000] leading-[18px] uppercase tracking-[0.08em]">
                    Land
                  </span>
                  <input
                      className={`rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#DC2626] focus:bg-white ${highlightClass("country")}`}
                    value={form.country}
                    onChange={(event) =>
                      updateForm("country", event.target.value)
                    }
                    placeholder="fx Frankrig"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[13px] font-medium text-[#000000] leading-[18px] uppercase tracking-[0.08em]">
                    Vindistrikt
                  </span>
                  <input
                      className={`rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#DC2626] focus:bg-white ${highlightClass("wine_district")}`}
                    value={form.wine_district}
                    onChange={(event) =>
                      updateForm("wine_district", event.target.value)
                    }
                    placeholder="fx Bourgogne"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-[13px] font-medium text-[#000000] leading-[18px] uppercase tracking-[0.08em]">
                    Druer (fordeling)
                  </span>
                  <textarea
                      className={`h-24 rounded-[10px] border-0 bg-[#F2F2F7] px-4 py-3 text-[17px] text-[#000000] leading-[22px] outline-none transition-colors focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#007AFF] focus:ring-inset resize-none ${highlightClass("grapes")}`}
                    value={form.grapes}
                    onChange={(event) =>
                      updateForm("grapes", event.target.value)
                    }
                    placeholder="fx 60% Cabernet Sauvignon, 40% Merlot"
                  />
                </label>
                <div className="grid grid-rows-2 gap-3">
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-medium text-[#000000] leading-[18px] uppercase tracking-[0.08em]">
                      Alkohol (%)
                    </span>
                    <input
                      className={`rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#DC2626] focus:bg-white ${highlightClass("alcohol")}`}
                      value={form.alcohol}
                      onChange={(event) =>
                        updateForm("alcohol", event.target.value)
                      }
                      placeholder="fx 13.5%"
                    />
                  </label>
                  <label 
                    className="flex flex-col gap-2"
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  >
                    <span className="text-[13px] font-medium text-[#000000] leading-[18px] uppercase tracking-[0.08em]">
                      Vinmark
                    </span>
                    <AutocompleteInput
                      value={form.vineyard}
                      onChange={(value) => {
                        // KUN opdater vinmark - INGEN opdatering af appellation!
                        updateForm("vineyard", value);
                      }}
                      placeholder="fx G-Max"
                      className={`rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#DC2626] focus:bg-white ${highlightClass("vineyard")}`}
                      fetchSuggestions={fetchVineyards}
                      minChars={1}
                      showOnFocus={!!form.appellation}
                    />
                  </label>
                </div>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-[13px] font-medium text-[#000000] leading-[18px] uppercase tracking-[0.08em]">
                  Dato
                </span>
                <input
                  type="date"
                  className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#1f2937] outline-none transition focus:border-[#DC2626] focus:bg-white"
                  value={form.consumed_date}
                  onChange={(event) =>
                    updateForm("consumed_date", event.target.value)
                  }
                />
              </label>

              <Button
                type="submit"
                disabled={isSaving}
                className="mt-6 h-11 rounded-full bg-[#DC2626] px-6 text-sm font-semibold text-white hover:bg-[#B91C1C] transition"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gemmer …
                  </>
                ) : (
                  <>
                    Gem vin
                  </>
                )}
              </Button>
            </form>

            {error ? (
              <div className="flex items-start gap-3 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 shadow-sm">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold mb-1">Fejl ved gemning</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

