"use client";

import type { Wine } from "@/lib/supabase/types";

const STORAGE_KEY = "wino:wines:cache";
const CACHE_TIMESTAMP_KEY = "wino:wines:cache:timestamp";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dage

export function saveWinesToCache(wines: Wine[]) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wines));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn("Kunne ikke gemme vine i cache:", error);
  }
}

export function getWinesFromCache(): Wine[] | null {
  try {
    if (typeof window === "undefined") return null;
    
    const cached = localStorage.getItem(STORAGE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;
    
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > CACHE_DURATION) {
      // Cache er for gammel
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    return JSON.parse(cached) as Wine[];
  } catch (error) {
    console.warn("Kunne ikke læse vine fra cache:", error);
    return null;
  }
}

export function clearWinesCache() {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.warn("Kunne ikke rydde cache:", error);
  }
}

export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

