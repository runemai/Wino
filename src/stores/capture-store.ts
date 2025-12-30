"use client";

import { create } from "zustand";
import type { Extraction } from "@/app/wine-details/types";

export type CapturePayload = {
  file: File;
  previewUrl: string;
  extraction?: Extraction;
};

type CaptureStore = {
  payload: CapturePayload | null;
  setCapture: (payload: CapturePayload) => void;
  consumeCapture: () => CapturePayload | null;
  clear: () => void;
};

const STORAGE_KEY = "wino:lastCapture";

const dataUrlToFile = (dataUrl: string, name: string, mime: string) => {
  const arr = dataUrl.split(",");
  const match = arr[0].match(/:(.*?);/);
  const type = match?.[1] || mime || "image/webp";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], name, { type });
};

const persistPayload = (payload: CapturePayload) => {
  if (typeof window === "undefined") return;
  try {
    const dataToStore = {
      previewUrl: payload.previewUrl,
      extraction: payload.extraction,
      mime: payload.file.type,
      name: payload.file.name,
    };
    console.log("[CaptureStore] Gemmer payload i sessionStorage:", {
      hasExtraction: !!dataToStore.extraction,
      extraction: dataToStore.extraction,
    });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.warn("Kunne ikke gemme capture payload i sessionStorage", error);
  }
};

const consumePersistedPayload = (): CapturePayload | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log("[CaptureStore] Ingen data i sessionStorage");
      return null;
    }
    sessionStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw) as {
      previewUrl: string;
      extraction?: Extraction;
      mime?: string;
      name?: string;
    };
    console.log("[CaptureStore] Læser payload fra sessionStorage:", {
      hasExtraction: !!parsed.extraction,
      extraction: parsed.extraction,
    });
    const file = dataUrlToFile(
      parsed.previewUrl,
      parsed.name ?? "wine-label.webp",
      parsed.mime ?? "image/webp",
    );
    return {
      file,
      previewUrl: parsed.previewUrl,
      extraction: parsed.extraction,
    };
  } catch (error) {
    console.warn("Kunne ikke læse capture payload fra sessionStorage", error);
    return null;
  }
};

export const useCaptureStore = create<CaptureStore>((set, get) => ({
  payload: null,
  setCapture: (payload) => {
    persistPayload(payload);
    set({ payload });
  },
  consumeCapture: () => {
    const current = get().payload;
    if (current) {
      set({ payload: null });
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      return current;
    }
    return consumePersistedPayload();
  },
  clear: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    set({ payload: null });
  },
}));

