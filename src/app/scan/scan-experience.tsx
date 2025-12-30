"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Camera, FileUp, Loader2, RefreshCw, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EntryMode, Extraction } from "@/app/wine-details/types";
import { useCaptureStore } from "@/stores/capture-store";
import { isNative } from "@/lib/capacitor";
import { useNativeCamera } from "@/hooks/use-native-camera";
import { saveWineAction } from "@/app/wine-details/actions";

interface ScanExperienceProps {
  mode: EntryMode;
  redirect: string;
}

export const ScanExperience = ({ mode, redirect }: ScanExperienceProps) => {
  const isCamera = mode === "camera";
  const router = useRouter();
  const setCapture = useCaptureStore((state) => state.setCapture);
  const nativeCamera = useNativeCamera();
  const isNativePlatform = isNative();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const capturedBlobRef = useRef<Blob | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewRatio, setPreviewRatio] = useState(3 / 4);

  const stopStream = useCallback(() => {
    videoRef.current?.pause();
    (videoRef.current?.srcObject as MediaStream | null)
      ?.getTracks()
      .forEach((track) => track.stop());
    setIsStreaming(false);
  }, []);

  const startStream = useCallback(async () => {
    // On native platforms, we don't use web camera stream
    if (isNativePlatform) {
      return;
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError("Din browser understøtter ikke kamera. Vælg upload i stedet.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
    } catch (err) {
      console.error(err);
      setError(
        "Kunne ikke få adgang til kameraet. Tillad kamerabrug eller upload et billede.",
      );
    }
  }, [isNativePlatform]);

  const [autoPickerOpened, setAutoPickerOpened] = useState(false);

useEffect(() => {
  // On native platforms, don't auto-start camera or file picker
  if (isNativePlatform) {
    return;
  }

  if (isCamera) {
    void startStream();
  } else if (!autoPickerOpened) {
    const raf = requestAnimationFrame(() => {
      if (fileInputRef.current) {
        const node = fileInputRef.current as HTMLInputElement & {
          showPicker?: () => void;
        };
        if (node.showPicker) {
          node.showPicker();
        } else {
          node.click();
        }
        setAutoPickerOpened(true);
      }
    });
    return () => cancelAnimationFrame(raf);
  }

  return () => {
    stopStream();
  };
}, [isCamera, startStream, stopStream, autoPickerOpened, isNativePlatform]);

useEffect(() => {
  return () => {
    if (capturedImage?.startsWith("blob:")) {
      URL.revokeObjectURL(capturedImage);
    }
  };
}, [capturedImage]);

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Kunne ikke læse billedet"));
    reader.readAsDataURL(blob);
  });

const runAnalysis = useCallback(
  async (blob: Blob) => {
    const normalizedFile =
      blob instanceof File
        ? blob
        : new File([blob], "wine-label.webp", {
            type: blob.type || "image/webp",
          });
    const previewDataUrl = await blobToDataUrl(normalizedFile);
    capturedBlobRef.current = normalizedFile;
    setCapturedImage(previewDataUrl);
      setError(null);
      setIsAnalyzing(true);
      setStatus("Analyserer etiketten …");

      try {
        const formData = new FormData();
        formData.append(
          "file",
          new File([blob], "wine-label.webp", {
            type: blob.type || "image/webp",
          }),
        );

        const response = await fetch("/api/extract-wine", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Ukendt fejl fra AI tjenesten.");
        }

        const payload = (await response.json()) as { data: Extraction };

        console.log("[ScanExperience] AI analyse færdig:", {
          hasData: !!payload.data,
          extraction: payload.data,
        });

        // Hvis der er en producer, gem vinen før redirect
        if (payload.data.producer?.trim()) {
          setStatus("Gemmer vinen …");
          setIsAnalyzing(true); // Behold loading state
          
          try {
            // normalizedFile er allerede et File objekt (defineret tidligere)
            const fileToUpload = normalizedFile;
            
            const fileSizeMB = (fileToUpload.size / (1024 * 1024)).toFixed(2);
            console.log("[ScanExperience] Forbereder FormData med fil:", {
              fileName: fileToUpload.name,
              fileSize: `${fileSizeMB} MB`,
              fileSizeBytes: fileToUpload.size,
              fileType: fileToUpload.type,
              producer: payload.data.producer,
            });
            
            if (fileToUpload.size > 10 * 1024 * 1024) {
              console.warn("[ScanExperience] ⚠️ Stor fil:", `${fileSizeMB} MB - upload kan tage lang tid`);
            }
            
            const saveFormData = new FormData();
            saveFormData.append("file", fileToUpload);
            saveFormData.append("producer", payload.data.producer);
            saveFormData.append("appellation", payload.data.appellation || "");
            saveFormData.append("cuvee", payload.data.cuvee || "");
            saveFormData.append("vintage", payload.data.vintage || "");
            saveFormData.append("type", payload.data.type || "rød");
            saveFormData.append("country", payload.data.country || "");
            saveFormData.append("wine_district", payload.data.wine_district || "");
            saveFormData.append("grapes", payload.data.grapes || "");
            saveFormData.append("alcohol", payload.data.alcohol || "");
            saveFormData.append("vineyard", payload.data.vineyard || "");
            saveFormData.append("consumed_date", new Date().toISOString().split("T")[0]);
            saveFormData.append("smagsnote", "");
            saveFormData.append("balance", "");
            saveFormData.append("length", "");
            saveFormData.append("intensity", "");
            saveFormData.append("complexity", "");

            console.log("[ScanExperience] Kalder saveWineAction...", new Date().toISOString());
            
            let saveResult;
            try {
              // Tilføj timeout protection
              const timeoutMs = 60000; // 60 sekunder timeout
              const startTime = Date.now();
              
              const savePromise = saveWineAction(saveFormData);
              const timeoutPromise = new Promise<null>((_, reject) => 
                setTimeout(() => reject(new Error(`Timeout: Gemning tog længere end ${timeoutMs/1000} sekunder`)), timeoutMs)
              );
              
              saveResult = await Promise.race([savePromise, timeoutPromise]);
              const duration = ((Date.now() - startTime) / 1000).toFixed(2);
              console.log(`[ScanExperience] ✅ saveWineAction færdig efter ${duration}s:`, saveResult);
            } catch (saveErr) {
              console.error("[ScanExperience] Exception fra saveWineAction:", saveErr);
              setIsAnalyzing(false);
              // Hvis gemning fejler, redirect til wine-details så brugeren kan gemme manuelt
              setError(`Kunne ikke gemme vinen: ${saveErr instanceof Error ? saveErr.message : 'Ukendt fejl'}. Prøv at gemme manuelt på næste side.`);
              setCapture({
                file: normalizedFile,
                previewUrl: previewDataUrl,
                extraction: payload.data,
              });
              await new Promise((resolve) => setTimeout(resolve, 2000));
              window.location.href = redirect;
              return;
            }
            
            setIsAnalyzing(false);
            
            if (saveResult && saveResult.ok && saveResult.wineId) {
              console.log("[ScanExperience] ✅ Vinen gemt med ID:", saveResult.wineId);
              setStatus("Vinen er gemt – sender dig videre …");
              
              // Vent længere for at sikre at Supabase og cache er synkroniseret
              await new Promise((resolve) => setTimeout(resolve, 800));
              
              // Brug window.location for at tvinge en fuld page reload og cache revalidation
              // Dette sikrer at vinen faktisk er synlig på forsiden
              window.location.href = `/wines/${saveResult.wineId}/edit`;
              return;
            } else {
              console.error("[ScanExperience] ❌ Kunne ikke gemme vinen:", saveResult);
              setError("Kunne ikke gemme vinen. Prøv at gemme manuelt på næste side.");
              setIsAnalyzing(false);
              // Hvis gemning fejler, redirect til wine-details så brugeren kan gemme manuelt
              setCapture({
                file: normalizedFile,
                previewUrl: previewDataUrl,
                extraction: payload.data,
              });
              await new Promise((resolve) => setTimeout(resolve, 200));
              window.location.href = redirect;
              return;
            }
          } catch (saveErr) {
            console.error("[ScanExperience] ❌ Exception ved gemning:", saveErr);
            setError("Kunne ikke gemme vinen. Prøv at gemme manuelt på næste side.");
            setIsAnalyzing(false);
            // Hvis gemning fejler, redirect til wine-details så brugeren kan gemme manuelt
            setCapture({
              file: normalizedFile,
              previewUrl: previewDataUrl,
              extraction: payload.data,
            });
            await new Promise((resolve) => setTimeout(resolve, 200));
            window.location.href = redirect;
            return;
          }
        } else {
          // Hvis der ikke er producer, redirect til wine-details som før
          console.log("[ScanExperience] Ingen producer, gemmer data i store");
          setIsAnalyzing(false);
          setCapture({
            file: normalizedFile,
            previewUrl: previewDataUrl,
            extraction: payload.data,
          });
          await new Promise((resolve) => setTimeout(resolve, 200));
          setStatus("Analyse færdig – sender dig videre …");
          window.location.href = redirect;
        }
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Noget gik galt under AI-analysen.",
        );
        setIsAnalyzing(false);
      }
    },
    [router, setCapture],
  );

  const removeBackground = useCallback(async (blob: Blob): Promise<Blob> => {
    try {
      const formData = new FormData();
      formData.append("file", blob);

      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Kunne ikke fjerne baggrund");
      }

      const result = await response.blob();
      return result;
    } catch (err) {
      console.error("Baggrundsfjerning fejlede, bruger original:", err);
      return blob; // Returner original hvis baggrundsfjerning fejler
    }
  }, []);

  const handleCapture = useCallback(async () => {
    // Use native camera on mobile devices
    if (isNativePlatform) {
      try {
        setStatus("Åbner kamera …");
        const { blob, dataUrl } = await nativeCamera.capturePhoto();
        setCapturedImage(dataUrl);
        setPreviewRatio(1); // Will be updated when image loads
        
        // Fjern baggrund før analyse
        setStatus("Fjerner baggrund …");
        const processedBlob = await removeBackground(blob);
        void runAnalysis(processedBlob);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Kunne ikke tage billede. Prøv igen.",
        );
      }
      return;
    }

    // Web camera fallback
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Kunne ikke læse videostrømmen.");
      return;
    }

    // Tegn video direkte uden spejlvendning - det gemte billede skal være normalt orienteret
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setError("Kunne ikke gemme billedet. Prøv igen.");
          return;
        }
        setPreviewRatio(canvas.width / canvas.height);
        stopStream();
        
        // Fjern baggrund før analyse
        setStatus("Fjerner baggrund …");
        const processedBlob = await removeBackground(blob);
        void runAnalysis(processedBlob);
      },
      "image/webp",
      0.92,
    );
  }, [runAnalysis, stopStream, removeBackground, isNativePlatform, nativeCamera]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Du skal vælge et billede.");
      return;
    }
    event.target.value = "";
    
    // Fjern baggrund før analyse
    setStatus("Fjerner baggrund …");
    const processedBlob = await removeBackground(file);
    void runAnalysis(processedBlob);
  };

  const handleNativePhotoPick = useCallback(async () => {
    try {
      setStatus("Åbner fotobibliotek …");
      const { blob, dataUrl } = await nativeCamera.pickPhoto();
      setCapturedImage(dataUrl);
      setPreviewRatio(1); // Will be updated when image loads
      
      // Fjern baggrund før analyse
      setStatus("Fjerner baggrund …");
      const processedBlob = await removeBackground(blob);
      void runAnalysis(processedBlob);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Kunne ikke vælge billede. Prøv igen.",
      );
    }
  }, [nativeCamera, removeBackground, runAnalysis]);

  const resetAndRetry = () => {
    setError(null);
    setStatus(null);
    setCapturedImage(null);
    capturedBlobRef.current = null;
    if (mode === "camera") {
      void startStream();
    } else {
      fileInputRef.current?.value && (fileInputRef.current.value = "");
      capturedBlobRef.current = null;
      setStatus("Vælg et nyt billede for at prøve igen.");
    }
  };

  return (
    <div className="flex max-h-[75vh] flex-1 flex-col gap-6 overflow-hidden rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-[var(--shadow-card)] backdrop-blur">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
          {isCamera ? "Tag billede" : "Upload billede"}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {isCamera ? "Fang etiketten — AI klarer detaljerne" : "Upload etiketten — vi klarer resten"}
        </h1>
        <p className="text-sm text-slate-500">
          {isCamera
            ? "Hold kameraet roligt. Når billedet er taget, analyserer vi automatisk."
            : "Vælg et billede af etiketten. Når upload er færdig, analyserer vi automatisk og sender dig videre."}
        </p>
      </div>

      <div
        className="relative mx-auto flex w-full max-w-[28rem] flex-1 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-100"
        style={{ aspectRatio: previewRatio }}
      >
        {capturedImage ? (
          <div className="relative flex h-full w-full items-center justify-center bg-slate-100">
            <img
              src={capturedImage}
              alt="Valgt vinbillede"
              className="h-full w-full object-contain"
              onLoad={(event) => {
                const img = event.currentTarget;
                if (img.naturalHeight > 0) {
                  setPreviewRatio(img.naturalWidth / img.naturalHeight);
                }
              }}
            />
            {isAnalyzing ? (
              <>
                <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" />
                <div className="ai-scan-overlay" />
                <div className="absolute inset-x-6 bottom-6 flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 shadow-lg">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>AI scanner</span>
                </div>
              </>
            ) : null}
          </div>
        ) : isCamera ? (
          <>
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {!isStreaming ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/60 text-center text-white">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Åbner kamera …</p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-3 px-8 py-16 text-center text-slate-500">
            <FileUp className="h-6 w-6 text-slate-600" />
            <p className="text-sm">
              {isNativePlatform
                ? "Vælg et billede fra dit fotobibliotek. Når upload er færdig, starter AI-analysen automatisk."
                : "Vælg et billede af etiketten. Når upload er færdig, starter AI-analysen automatisk."}
            </p>
            <Button
              onClick={() => {
                if (isNativePlatform) {
                  void handleNativePhotoPick();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="rounded-full bg-slate-900 px-4 text-sm"
            >
              {isNativePlatform ? "Vælg fra bibliotek" : "Vælg billede"}
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          {status ??
            (isCamera
              ? "Tryk “Tag billede” når etiketten fylder billedet."
              : "Vælg et billede via knappen ovenfor for at starte analysen.")}
        </div>
        <div className="flex gap-3">
          {isCamera ? (
            <Button
              onClick={handleCapture}
              disabled={isAnalyzing || (!isNativePlatform && !isStreaming) || nativeCamera.isLoading}
              className="rounded-full bg-slate-900 px-4"
            >
              <Camera className="mr-2 h-4 w-4" />
              Tag billede
            </Button>
          ) : null}
          {capturedImage && !isAnalyzing ? (
            <Button
              onClick={resetAndRetry}
              className="rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Prøv igen
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

