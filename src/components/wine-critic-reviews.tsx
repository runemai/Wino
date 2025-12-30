"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Sparkles, X, CheckCircle2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import type { WineCriticReview } from "@/lib/supabase/types";

interface WineCriticReviewsProps {
  wineId: string;
  wineData: {
    producer: string;
    cuvee?: string | null;
    appellation?: string | null;
    vintage?: string | null;
    country?: string | null;
    wine_district?: string | null;
    grapes?: string | null;
    type?: string | null;
  };
  autoFetch?: boolean; // Hvis true, generer automatisk reviews hvis ingen findes
}

export function WineCriticReviews({ wineId, wineData, autoFetch = false }: WineCriticReviewsProps) {
  const [reviews, setReviews] = useState<WineCriticReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<WineCriticReview | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/wine-critic-reviews?wineId=${wineId}`);
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`Server fejl: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || "Kunne ikke hente reviews");
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.reviews)) {
        console.error("Uventet respons format:", data);
        setError("Uventet respons format fra serveren");
        return [];
      }
      setReviews(data.reviews || []);
      return data.reviews || [];
    } catch (err) {
      console.error("Fejl ved hentning af reviews:", err);
      setError(
        err instanceof Error ? err.message : "Kunne ikke hente reviews"
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  const generateReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/wine-critic-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wineId,
          wineData,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`Server fejl: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || "Kunne ikke generere reviews");
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.reviews)) {
        console.error("Uventet respons format:", data);
        throw new Error("Uventet respons format fra serveren");
      }
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Fejl ved generering af reviews:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Kunne ikke generere reviews. Prøv igen senere."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadReviews = async () => {
      const fetchedReviews = await fetchReviews();
      
      // Hvis autoFetch er true og der ikke er reviews, generer dem automatisk
      if (autoFetch && !hasAutoFetched && fetchedReviews.length === 0) {
        setHasAutoFetched(true);
        await generateReviews();
      }
    };
    
    void loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wineId, autoFetch]);

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-[#DC2626]";
    if (score >= 90) return "text-[#F59E0B]";
    if (score >= 85) return "text-[#10B981]";
    return "text-[#6B7280]";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 95) return "bg-[#DC2626]/10";
    if (score >= 90) return "bg-[#F59E0B]/10";
    if (score >= 85) return "bg-[#10B981]/10";
    return "bg-[#6B7280]/10";
  };

  // Beregn gennemsnitsscore
  const averageScore = reviews.length > 0
    ? Math.round(reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length)
    : null;

  // Tjek om review's årgang matcher vinens årgang
  const getVintageMismatch = (review: WineCriticReview): boolean => {
    if (!wineData.vintage || !review.review_text) return false;
    
    const wineVintage = wineData.vintage.trim();
    const vintageRegex = /\b(19|20)\d{2}\b/g;
    const matches = review.review_text.match(vintageRegex);
    
    if (!matches || matches.length === 0) return false;
    
    const hasMatchingVintage = matches.some(match => match === wineVintage);
    return !hasMatchingVintage;
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="rounded-xl border-2 border-[#D1D5DB] bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] p-6 shadow-md">
        <div className="flex items-center justify-center gap-2 py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#DC2626] border-t-transparent"></div>
          <span className="text-sm text-[#6B7280]">Henter critic reviews...</span>
        </div>
      </div>
    );
  }

  // Hvis der ikke er reviews endnu
  if (reviews.length === 0 && !loading) {
  return (
    <div className="rounded-xl border-2 border-[#D1D5DB] bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] p-6 shadow-md">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#DC2626]" />
          <h3 className="text-lg font-bold text-[#111827]">Critic Reviews</h3>
        </div>
          <button
            onClick={generateReviews}
            disabled={loading}
            className="rounded-[12px] bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(220,38,38,0.2)] transition-all duration-200 ease-out hover:bg-[#B91C1C] hover:shadow-[0_4px_12px_rgba(220,38,38,0.25)] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Genererer..." : "Find Reviews"}
          </button>
      </div>
      {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
        <div className="mt-6 py-4 text-center">
          <p className="text-sm text-[#6B7280]">
            Ingen critic reviews endnu. Klik på "Find Reviews" for at generere reviews fra kendte kritikere.
          </p>
        </div>
      </div>
    );
  }

            return (
    <>
      <div className="rounded-[10px] bg-[#FFFFFF] overflow-hidden">
        {/* Collapsed Header */}
                <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 text-left transition-colors hover:bg-white/50 sm:px-6 sm:py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#DC2626]" />
              <h3 className="text-[17px] font-semibold text-[#000000] leading-[22px] tracking-[-0.41px]">Critic Reviews</h3>
              {reviews.length > 0 && (
                <span className="text-sm text-[#6B7280]">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {averageScore !== null && (
                <div className={`flex items-baseline gap-1 rounded-lg px-3 py-1.5 ${getScoreBgColor(averageScore)}`}>
                  <span className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                    {averageScore}
                  </span>
                  <span className="text-sm font-semibold text-[#6B7280]">p</span>
                </div>
              )}
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#6B7280]" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-[#E5E7EB] bg-white">
            {error && (
              <div className="mb-4 mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:mx-6 sm:mt-4">
                {error}
                      </div>
            )}
            
            {/* Table View */}
            <div className="overflow-x-auto">
              <div className="min-w-[300px] px-4 py-3 sm:px-6 sm:py-4">
                <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280] sm:px-4 sm:py-3">
                      Kritiker
                    </th>
                    <th className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wider text-[#6B7280] sm:px-4 sm:py-3">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {reviews.map((review) => {
                    const vintageMismatch = getVintageMismatch(review);
                    return (
                      <tr
                        key={review.id}
                        onClick={() => setSelectedReview(review)}
                        className={`cursor-pointer transition-colors hover:bg-[#F9FAFB] ${
                          vintageMismatch ? "bg-amber-50/50" : ""
                        }`}
                      >
                        <td className="px-2 py-2 sm:px-4 sm:py-3">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-[#111827]">
                            {review.critic_name}
                            </span>
                            {!vintageMismatch && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                          {vintageMismatch && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              Anden årgang
                            </span>
                          )}
                        </div>
                        </td>
                        <td className="px-2 py-2 text-right sm:px-4 sm:py-3">
                          <div className="flex items-center justify-end gap-1">
                            <span className={`text-lg font-bold ${getScoreColor(review.score)}`}>
                              {review.score}
                          </span>
                            <span className="text-sm font-semibold text-[#6B7280]">p</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
                      </div>
                    </div>
                      </div>
                      )}
                    </div>

      {/* Review Detail Dialog */}
      <Dialog.Root open={selectedReview !== null} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-opacity duration-300" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {selectedReview && (
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#E5E7EB]/60 bg-white/95 backdrop-blur-xl p-4 sm:p-6 md:p-8 text-[#1f2937] shadow-[0_4px_24px_rgba(0,0,0,0.08),0_12px_48px_rgba(0,0,0,0.1)]">
                <div className="flex items-start justify-between mb-6">
                  <Dialog.Title className="text-2xl font-semibold text-[#1f2937] tracking-tight pr-4">
                    {selectedReview.critic_name}
                  </Dialog.Title>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  </div>

                {getVintageMismatch(selectedReview) && (
                  <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                            ⚠️ Denne review er for en anden årgang end {wineData.vintage || "din vin"}. Review'en kan stadig være relevant, men vær opmærksom på at årgangen kan påvirke smagen.
                          </p>
                        </div>
                      )}

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                    <div className="space-y-1">
                      {selectedReview.critic_publication && (
                        <p className="text-sm font-medium text-[#6B7280]">
                          {selectedReview.critic_publication}
                        </p>
                      )}
                      {selectedReview.review_date && (
                        <p className="text-xs text-[#9CA3AF]">
                          {new Date(selectedReview.review_date).toLocaleDateString("da-DK", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                          })}
                            </p>
                          )}
                        </div>
                    <div className={`flex items-baseline gap-1 rounded-lg px-4 py-2 ${getScoreBgColor(selectedReview.score)}`}>
                      <span className={`text-3xl font-bold ${getScoreColor(selectedReview.score)}`}>
                        {selectedReview.score}
                          </span>
                      <span className="text-lg font-semibold text-[#6B7280]">p</span>
                        </div>
                      </div>

                  <div className="rounded-lg bg-[#F9FAFB] p-6">
                        <p className="text-sm leading-relaxed text-[#374151] whitespace-pre-wrap">
                      {selectedReview.review_text}
                        </p>
                      </div>

                  {selectedReview.source_url && (
                        <a
                      href={selectedReview.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#DC2626] hover:underline font-medium"
                        >
                      <ExternalLink className="h-4 w-4" />
                          Læs original review
                        </a>
                      )}
                    </div>
                  </div>
                )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
