"use client";

import { Info } from "lucide-react";

interface BLIKRatingProps {
  balance: number | null | undefined;
  længde: number | null | undefined;
  intensitet: number | null | undefined;
  kompleksitet: number | null | undefined;
  onBalanceChange: (value: number) => void;
  onLængdeChange: (value: number) => void;
  onIntensitetChange: (value: number) => void;
  onKompleksitetChange: (value: number) => void;
}

// BLIK scores can be any integer between 80-100
const MIN_SCORE = 80;
const MAX_SCORE = 100;

const BLIK_LABELS = [
  { key: "balance", label: "Balance" },
  { key: "længde", label: "Længde" },
  { key: "intensitet", label: "Intensitet" },
  { key: "kompleksitet", label: "Kompleksitet" },
] as const;

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: number) => void;
}) {
  const displayValue = value ?? MIN_SCORE;
  const normalizedValue = Math.max(MIN_SCORE, Math.min(MAX_SCORE, Math.round(displayValue)));
  const percentage = ((normalizedValue - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseInt(e.target.value, 10);
    // Clamp to valid range (80-100)
    const clampedValue = Math.max(MIN_SCORE, Math.min(MAX_SCORE, rawValue));
    onChange(clampedValue);
  };

  return (
    <div className="flex items-center gap-4 rounded-[16px] border border-white/10 bg-[#151018] px-4 py-3">
      <div className="w-24 text-sm font-semibold text-white/80">{label}</div>
      <div className="flex-1">
        <input
          type="range"
          min={MIN_SCORE}
          max={MAX_SCORE}
          step={1}
          value={normalizedValue}
          onChange={handleSliderChange}
          className="blic-slider w-full appearance-none cursor-pointer bg-white/10"
          style={{
            background: `linear-gradient(to right, #fb7185 0%, #fb7185 ${percentage}%, rgba(255,255,255,0.12) ${percentage}%, rgba(255,255,255,0.12) 100%)`,
          }}
        />
      </div>
      <div className="w-12 text-right text-sm font-semibold text-[#fb7185] tabular-nums">
        {(normalizedValue / 10).toFixed(1)}
      </div>
    </div>
  );
}

export function BLIKRating({
  balance,
  længde,
  intensitet,
  kompleksitet,
  onBalanceChange,
  onLængdeChange,
  onIntensitetChange,
  onKompleksitetChange,
}: BLIKRatingProps) {
  // Calculate average score (85-100 points)
  // Only include valid scores (85-100) in the calculation
  const validScores = [
    balance,
    længde,
    intensitet,
    kompleksitet,
  ].filter((score): score is number => 
    score !== null && 
    score !== undefined && 
    score >= MIN_SCORE && 
    score <= MAX_SCORE
  );
  
  const averageScore = validScores.length > 0
    ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
    : MIN_SCORE;

  return (
    <div className="rounded-[20px] border border-white/10 bg-[#151018] p-5 shadow-[var(--shadow-subtle)] sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-[18px] font-semibold text-white">BLIC Scoring Model</h3>
          <p className="text-sm text-white/50">Sæt din score på 8.0 - 10.0</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          <Info className="h-3.5 w-3.5" />
          {(averageScore / 10).toFixed(1)}
        </div>
      </div>

      <div className="space-y-3">
        <SliderRow label={BLIK_LABELS[0].label} value={balance} onChange={onBalanceChange} />
        <SliderRow label={BLIK_LABELS[1].label} value={længde} onChange={onLængdeChange} />
        <SliderRow label={BLIK_LABELS[2].label} value={intensitet} onChange={onIntensitetChange} />
        <SliderRow label={BLIK_LABELS[3].label} value={kompleksitet} onChange={onKompleksitetChange} />
      </div>
    </div>
  );
}


