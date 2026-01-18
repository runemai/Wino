"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
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
    // Prevent multiple simultaneous saves
    if (isSaving) {
      console.warn("[WineDetails] Save already in progress, ignoring duplicate call");
      return;
    }

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
      // Only send BLIK ratings if they are valid values (80-100), otherwise send empty string
      const isValidBLIKValue = (value: number | null | undefined): boolean => {
        if (value === null || value === undefined) return false;
        return value >= 80 && value <= 100;
      };
      
      const balanceValue = isValidBLIKValue(form.balance) ? form.balance!.toString() : "";
      const lengthValue = isValidBLIKValue(form.length) ? form.length!.toString() : "";
      const intensityValue = isValidBLIKValue(form.intensity) ? form.intensity!.toString() : "";
      const complexityValue = isValidBLIKValue(form.complexity) ? form.complexity!.toString() : "";
      
      console.log("[WineDetails] Sending BLIK values:", {
        balance: balanceValue,
        length: lengthValue,
        intensity: intensityValue,
        complexity: complexityValue,
        balanceRaw: form.balance,
        lengthRaw: form.length,
        intensityRaw: form.intensity,
        complexityRaw: form.complexity,
      });
      
      data.append("balance", balanceValue);
      data.append("length", lengthValue);
      data.append("intensity", intensityValue);
      data.append("complexity", complexityValue);

      // Hvis vi har en wineId, opdater vinen
      if (wineId) {
        data.append("id", wineId);
        if (initialWine?.image_url && !capturedBlobRef.current) {
          data.append("existingImageUrl", initialWine.image_url);
        }
        
        // Tjek om producer, appellation eller vintage er ændret
        const hasProducerChanged = form.producer !== (initialWine?.producer ?? "");
        const hasAppellationChanged = form.appellation !== (initialWine?.appellation ?? "");
        const hasVintageChanged = form.vintage !== (initialWine?.vintage ?? "");
        const shouldRegenerateReviews = hasProducerChanged || hasAppellationChanged || hasVintageChanged;
        
        // Hvis nogle af felterne er ændret, regenerer wine critics reviews FØR gemning
        if (shouldRegenerateReviews) {
          try {
            console.log("[WineDetails] Regenerating wine critic reviews due to changes:", {
              producer: hasProducerChanged,
              appellation: hasAppellationChanged,
              vintage: hasVintageChanged,
            });
            
            const regenerateResponse = await fetch("/api/wine-critic-reviews", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                wineId,
                forceRegenerate: true,
                wineData: {
                  producer: form.producer,
                  cuvee: form.cuvee,
                  appellation: form.appellation,
                  vintage: form.vintage,
                  country: form.country,
                  wine_district: form.wine_district,
                  grapes: form.grapes,
                  type: form.type,
                },
              }),
            });
            
            if (!regenerateResponse.ok) {
              console.warn("[WineDetails] Failed to regenerate reviews, continuing with save:", regenerateResponse.status);
              // Fortsæt med gemning alligevel - reviews kan regenereres senere
            } else {
              console.log("[WineDetails] Successfully regenerated wine critic reviews");
            }
          } catch (regenerateErr) {
            console.error("[WineDetails] Error regenerating reviews, continuing with save:", regenerateErr);
            // Fortsæt med gemning alligevel - reviews kan regenereres senere
          }
        }
        
        console.log("[WineDetails] Calling updateWineAction with wineId:", wineId);
        
        // Call server action with Promise.race to handle timeouts and Server Components errors
        // Server Components errors often occur AFTER successful updates during re-rendering
        const updatePromise = updateWineAction(data);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 10000)
        );
        
        try {
          const result = await Promise.race([updatePromise, timeoutPromise]) as { ok: boolean; error?: string } | null;
          
          if (result && result.ok) {
            // Update succeeded - navigate immediately before any Server Components re-render
            console.log("[WineDetails] Update succeeded - navigating immediately");
            setIsSaving(false);
            // Use setTimeout(0) to ensure state update happens before navigation
            setTimeout(() => {
              window.location.href = "/";
            }, 0);
            return;
          } else if (result && !result.ok) {
            // Real error from server action
            console.error("[WineDetails] Update failed:", result.error);
            setIsSaving(false);
            setError(result.error || "Kunne ikke opdatere vinen. Prøv igen.");
            return;
          } else {
            // No result (shouldn't happen)
            console.warn("[WineDetails] No result returned - navigating anyway");
            setIsSaving(false);
            setTimeout(() => {
              window.location.href = "/";
            }, 0);
            return;
          }
        } catch (err: any) {
          // Exception caught - likely a Server Components render error
          // These often occur AFTER successful updates, so assume success
          console.warn("[WineDetails] Exception caught (likely Server Components error):", {
            message: err?.message,
            digest: err?.digest,
            name: err?.name,
          });
          
          // Check if it's explicitly a Server Components error
          const isServerComponentsError = err?.digest && 
            typeof err.digest === 'string' &&
            (err.digest.includes('NEXT_REDIRECT') || 
             err.digest.includes('DYNAMIC_SERVER_USAGE') ||
             err.message?.includes('Server Components'));
          
          // Reset state and navigate - assume update succeeded
          setIsSaving(false);
          if (isServerComponentsError) {
            // Definitely a Server Components error - navigate immediately
            console.warn("[WineDetails] Server Components error - assuming update succeeded");
            setTimeout(() => {
              window.location.href = "/";
            }, 0);
          } else {
            // Unknown error - still navigate but show message
            console.error("[WineDetails] Unknown error:", err);
            setError("Fejl ved gemning. Tjek om vinen blev gemt.");
            setTimeout(() => {
              window.location.href = "/";
            }, 2000);
          }
          return;
        }
      } else {
        // Opret ny vin
        const result = await saveWineAction(data);
        
        // Hvis vi får en result tilbage, betyder det at gemningen lykkedes
        // Selv hvis der er en fejl i server component rendering, vil vinen stadig være gemt
        if (result && result.ok && result.wineId) {
          setIsSaving(false);
          
          // Brug window.location.href for at undgå Server Components render fejl
          // Dette giver en ren full page reload og omgår Next.js cache issues
          window.location.href = `/wines/${result.wineId}/edit`;
          return;
        }
        
        // Hvis vi ikke får et valid result, vis fejl
        throw new Error("Kunne ikke gemme vinen. Prøv igen.");
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
      ? "border-rose-400/50 bg-rose-500/10 focus:border-rose-300"
      : "";

  const blicScores = [form.balance, form.length, form.intensity, form.complexity].filter(
    (score): score is number => score !== null && score !== undefined && score >= 80 && score <= 100,
  );
  const averageBlic =
    blicScores.length > 0
      ? blicScores.reduce((sum, score) => sum + score, 0) / blicScores.length
      : null;
  const blicDisplay = averageBlic ? (averageBlic / 10).toFixed(1) : null;

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 overflow-x-hidden px-4 pb-20 text-white sm:gap-8">
      <header className="space-y-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white"
        >
          ← Tilbage
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
              {initialWine?.producer || form.producer || "Ny vin"}
            </h1>
            {(form.cuvee || form.appellation) && (
              <p className="mt-2 text-base font-medium text-white/60 sm:text-lg">
                {form.cuvee || form.appellation}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          {/* Billede sektion */}
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[26px] border border-white/10 bg-[#0f0d12] shadow-[var(--shadow-card)]">
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
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/60">
                  <ImageIcon className="h-8 w-8" />
                  <p className="px-8 text-sm">
                    Intet billede endnu. Brug knapperne nedenfor for at scanne eller uploade.
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2">
              {form.vintage && (
                <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                  Vintage {form.vintage}
                </span>
              )}
              {blicDisplay && (
                <span className="rounded-full border border-white/15 bg-[#b21b3a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  {blicDisplay} PTS
                </span>
              )}
            </div>
            </div>

            {/* Billede actions */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                asChild
                className="rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 hover:bg-white/10"
              >
                <Link prefetch={false} href={scanningLink("camera")}>
                <Camera className="mr-2 h-4 w-4" />
                  Tag billede
                </Link>
              </Button>
              <Button
                asChild
                className="rounded-full border border-white/10 bg-white/5 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 hover:bg-white/10"
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
                  className="rounded-full border border-[#fb7185] bg-[#e11d48] px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#fb7185] disabled:opacity-50"
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
              <div className="rounded-[18px] border border-white/10 bg-[#151018] p-4 shadow-[var(--shadow-subtle)] sm:p-6 lg:p-7">
                <h2 className="mb-3 text-[18px] font-semibold leading-[24px] tracking-[0.2px] text-white">Description</h2>
                <p className="text-[14px] leading-[20px] tracking-[-0.1px] text-white/60">{analysis.label_summary}</p>
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
            <div className="rounded-[18px] border border-white/10 bg-[#151018] p-4 shadow-[var(--shadow-subtle)] sm:p-6 lg:p-7">
              <h2 className="mb-3 text-[18px] font-semibold leading-[24px] tracking-[0.2px] text-white">Smagsnote</h2>
              <label className="flex flex-col gap-2">
                <textarea
                  className="min-h-[120px] rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white leading-[22px] outline-none transition-colors focus:border-[#fb7185] focus:bg-white/10 focus:ring-2 focus:ring-[#fb7185]/30 focus:ring-inset resize-none"
                  value={form.smagsnote ?? ''}
                  onChange={(event) =>
                    updateForm("smagsnote", event.target.value)
                  }
                  placeholder="Skriv dine noter om oplevelsen, tonerne og smagen..."
                />
              </label>
            </div>

            {/* Form sektion */}
            <div className="rounded-[18px] border border-white/10 bg-[#151018] p-4 shadow-[var(--shadow-subtle)] sm:p-6 lg:p-7">
              <h2 className="mb-4 text-[18px] font-semibold leading-[24px] tracking-[0.2px] text-white sm:mb-6">Rediger oplysninger</h2>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSave();
              }}
              className="flex flex-col gap-4"
            >
              <label className="flex flex-col gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Producent
                </span>
                <input
                  type="text"
                  value={form.producer}
                  onChange={(event) => updateForm("producer", event.target.value)}
                  placeholder="fx Domaine de la Romanée-Conti"
                  className={`rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white leading-[22px] outline-none transition-colors focus:border-[#fb7185] focus:bg-white/10 focus:ring-2 focus:ring-[#fb7185]/30 focus:ring-inset ${highlightClass("producer")}`}
                />
              </label>

              <label 
                className="flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
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
                  className={`rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white leading-[22px] outline-none transition-colors focus:border-[#fb7185] focus:bg-white/10 focus:ring-2 focus:ring-[#fb7185]/30 focus:ring-inset ${highlightClass("appellation")}`}
                  fetchSuggestions={fetchAppellations}
                  minChars={1}
                  showOnFocus={false}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Cuvée
                </span>
                <input
                    className={`rounded-[14px] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#fb7185] focus:bg-white/10 ${highlightClass("cuvee")}`}
                  value={form.cuvee}
                  onChange={(event) => updateForm("cuvee", event.target.value)}
                  placeholder="fx Der Elefant im Porzellanladen"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Årgang
                  </span>
                  <input
                    className={`rounded-[14px] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#fb7185] focus:bg-white/10 ${highlightClass("vintage")}`}
                    value={form.vintage}
                    onChange={(event) =>
                      updateForm("vintage", event.target.value)
                    }
                    placeholder="fx 2019"
                  />
                </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                      Type
                    </span>
                    <select
                      className="rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white leading-[22px] outline-none transition-colors focus:border-[#fb7185] focus:bg-white/10 focus:ring-2 focus:ring-[#fb7185]/30 focus:ring-inset"
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
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Land
                  </span>
                  <input
                      className={`rounded-[14px] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#fb7185] focus:bg-white/10 ${highlightClass("country")}`}
                    value={form.country}
                    onChange={(event) =>
                      updateForm("country", event.target.value)
                    }
                    placeholder="fx Frankrig"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Vindistrikt
                  </span>
                  <input
                      className={`rounded-[14px] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#fb7185] focus:bg-white/10 ${highlightClass("wine_district")}`}
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
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Druer (fordeling)
                  </span>
                  <textarea
                      className={`h-24 rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white leading-[22px] outline-none transition-colors focus:border-[#fb7185] focus:bg-white/10 focus:ring-2 focus:ring-[#fb7185]/30 focus:ring-inset resize-none ${highlightClass("grapes")}`}
                    value={form.grapes}
                    onChange={(event) =>
                      updateForm("grapes", event.target.value)
                    }
                    placeholder="fx 60% Cabernet Sauvignon, 40% Merlot"
                  />
                </label>
                <div className="grid grid-rows-2 gap-3">
                  <label className="flex flex-col gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                      Alkohol (%)
                    </span>
                    <input
                      className={`rounded-[14px] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#fb7185] focus:bg-white/10 ${highlightClass("alcohol")}`}
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
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                      Vinmark
                    </span>
                    <AutocompleteInput
                      value={form.vineyard}
                      onChange={(value) => {
                        // KUN opdater vinmark - INGEN opdatering af appellation!
                        updateForm("vineyard", value);
                      }}
                      placeholder="fx G-Max"
                      className={`rounded-[14px] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#fb7185] focus:bg-white/10 ${highlightClass("vineyard")}`}
                      fetchSuggestions={fetchVineyards}
                      minChars={1}
                      showOnFocus={!!form.appellation}
                    />
                  </label>
                </div>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Dato
                </span>
                <input
                  type="date"
                  className="rounded-[14px] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#fb7185] focus:bg-white/10"
                  value={form.consumed_date}
                  onChange={(event) =>
                    updateForm("consumed_date", event.target.value)
                  }
                />
              </label>

              <Button
                type="submit"
                disabled={isSaving}
                className="mt-6 h-11 rounded-full bg-[#e11d48] px-6 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#fb7185] transition"
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
              <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-100 shadow-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-200" />
                <div className="flex-1">
                  <p className="font-semibold mb-1">Fejl ved gemning</p>
                  <p className="text-rose-100/80">{error}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

