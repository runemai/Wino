"use client";

import { useState } from "react";
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

const BLIK_DESCRIPTIONS = {
  balance: "Harmoni mellem sødme, syre, alkohol og tanniner. Ingen element bør dominere.",
  længde: "Hvor længe smagen og andre sensoriske indtryk bliver på ganen efter at du har slugt eller spyttet vinen. Højere kvalitet = længere finish.",
  intensitet: "Hvor stærke og tydelige vinens aromaer og smage er. En vin med høj intensitet har klare, kraftfulde karakteristika.",
  kompleksitet: "Antallet og variationen af aromaer og smage. En kompleks vin har mange distinkte 'lag' af smag der kan udvikle sig.",
};

// Score-baserede beskrivelser for hver kategori
const SCORE_DESCRIPTIONS = {
  balance: {
    "85-89": "God balance: Elementerne (sødme, syre, alkohol, tanniner) er i harmoni, men nogle kan være lidt mere fremtrædende end andre.",
    "90-94": "Meget god balance: Alle elementer er velafbalancerede og arbejder sammen. Ingen dominerer, og vinen føles harmonisk.",
    "95-99": "Fremragende balance: Perfekt harmoni mellem alle elementer. Vinen er ekstremt velafbalanceret med ingen ubehagelige overvægter.",
    "100": "Exceptionel balance: Absolut perfekt harmoni. Alle elementer er i ideel balance, og vinen demonstrerer eksemplarisk integration af alle komponenter.",
  },
  længde: {
    "85-89": "God længde: Smagen forsvinder efter 5-10 sekunder. Acceptabel finish, men ikke særligt langvarig.",
    "90-94": "Meget god længde: Smagen varer 15-30 sekunder. Klar og vedvarende finish der efterlader et positivt indtryk.",
    "95-99": "Fremragende længde: Smagen varer 30-60 sekunder eller længere. Lang, kompleks finish med udviklende smagsnoter.",
    "100": "Exceptionel længde: Ekstremt lang finish (60+ sekunder). Smagen udvikler sig og forbliver på ganen med mange lag af kompleksitet.",
  },
  intensitet: {
    "85-89": "God intensitet: Aromaer og smage er tydelige og genkendelige, men ikke særligt kraftfulde eller dominerende.",
    "90-94": "Meget god intensitet: Klare, kraftfulde aromaer og smage der er let at identificere. Vinen har god tilstedeværelse.",
    "95-99": "Fremragende intensitet: Meget kraftfulde og tydelige aromaer og smage. Vinen fylder munden og efterlader stærke indtryk.",
    "100": "Exceptionel intensitet: Ekstremt kraftfulde og koncentrerede aromaer og smage. Vinen er intens og fylder hele sensoriske oplevelsen.",
  },
  kompleksitet: {
    "85-89": "God kompleksitet: Vinen har flere smagsnoter, men de er relativt simple og lette at identificere.",
    "90-94": "Meget god kompleksitet: Flere lag af smag og aromaer der udvikler sig. Vinen har dybde og variation.",
    "95-99": "Fremragende kompleksitet: Mange distinkte lag af smag der udvikler sig over tid. Vinen er meget kompleks med mange nuancer.",
    "100": "Exceptionel kompleksitet: Ekstremt kompleks med utallige lag af smag og aromaer. Vinen udvikler sig kontinuerligt og viser uendelig variation.",
  },
};

function getScoreDescription(
  category: keyof typeof SCORE_DESCRIPTIONS,
  score: number
): string {
  if (score >= 100) return SCORE_DESCRIPTIONS[category]["100"];
  if (score >= 95) return SCORE_DESCRIPTIONS[category]["95-99"];
  if (score >= 90) return SCORE_DESCRIPTIONS[category]["90-94"];
  return SCORE_DESCRIPTIONS[category]["85-89"];
}

function getCategoryKey(label: string): keyof typeof SCORE_DESCRIPTIONS {
  const labelLower = label.toLowerCase();
  if (labelLower === "balance") return "balance";
  if (labelLower === "længde" || labelLower === "length") return "længde";
  if (labelLower === "intensitet" || labelLower === "intensity") return "intensitet";
  if (labelLower === "kompleksitet" || labelLower === "complexity") return "kompleksitet";
  return "balance"; // fallback
}

const MIN_SCORE = 85;
const MAX_SCORE = 100;

function SliderWithInfo({
  label,
  value,
  onChange,
  description,
  letter,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: number) => void;
  description: string;
  letter: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const displayValue = value ?? MIN_SCORE;
  const normalizedValue = Math.max(MIN_SCORE, Math.min(MAX_SCORE, Math.round(displayValue)));
  const percentage = ((normalizedValue - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseInt(e.target.value, 10);
    const clampedValue = Math.max(MIN_SCORE, Math.min(MAX_SCORE, rawValue));
    onChange(clampedValue);
  };

  return (
    <div className="rounded-[14px] bg-[#FFFFFF] p-4 shadow-sm sm:p-5">
      {/* Top row: Letter badge og Score - fixed layout */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Letter badge - større og mere i fokus */}
          <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#FF3B30] text-[20px] font-bold text-white">
            {letter}
          </div>
          {/* Label og info icon */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[17px] font-semibold text-[#000000] leading-[22px] tracking-[-0.41px]">{label}</h4>
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
                {showTooltip && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-[#D1D5DB] bg-white p-3 text-xs text-[#374151] shadow-lg">
                    {description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Score display - fixed position */}
        <div className="flex items-baseline gap-1 rounded-[8px] bg-[#FF3B30]/10 px-3 py-2">
          <span className="text-[22px] font-bold text-[#FF3B30] leading-[28px]">{normalizedValue}</span>
          <span className="text-[13px] font-medium text-[#FF3B30] leading-[18px]">p</span>
        </div>
      </div>

      {/* Dynamic score description - fixed height (4 lines) to avoid jumping */}
      <div className="mb-4 h-[80px] flex items-start">
            {normalizedValue ? (
              <p className="text-[15px] leading-[20px] tracking-[-0.24px] text-[#3C3C43]">
            {getScoreDescription(
              getCategoryKey(label),
              normalizedValue
            )}
          </p>
        ) : (
          <p className="text-[15px] leading-[20px] tracking-[-0.24px] text-[#3C3C4399] italic">Vælg en score for at se beskrivelse</p>
        )}
      </div>

      {/* Range Slider - always visible */}
      <div className="relative">
        <input
          type="range"
          min={MIN_SCORE}
          max={MAX_SCORE}
          value={normalizedValue}
          onChange={handleSliderChange}
          className="blic-slider w-full appearance-none cursor-pointer bg-[#E5E5EA]"
          style={{
            background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${percentage}%, #E5E5EA ${percentage}%, #E5E5EA 100%)`,
          }}
        />
        {/* Score markers */}
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[13px] leading-[18px] text-[#3C3C4399]">{MIN_SCORE}</span>
          <span className="text-[13px] leading-[18px] text-[#3C3C4399]">{MAX_SCORE}</span>
        </div>
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
    <div className="rounded-[10px] bg-[#FFFFFF] p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-[#C6C6C8]/36 pb-3 sm:mb-5 sm:pb-4">
        <h3 className="text-[20px] font-semibold text-[#000000] leading-[25px] tracking-[0.38px]">Vurdering</h3>
        <div className="flex items-center justify-center rounded-[8px] bg-[#F2F2F7] px-4 py-2 w-[100px] h-[56px]">
          <span className="text-[28px] font-bold text-[#FF3B30] leading-[34px] tabular-nums">{averageScore}p</span>
        </div>
      </div>

      <div className="space-y-4">
        <SliderWithInfo
          letter="B"
          label="Balance"
          value={balance}
          onChange={onBalanceChange}
          description={BLIK_DESCRIPTIONS.balance}
        />
        <SliderWithInfo
          letter="L"
          label="Længde"
          value={længde}
          onChange={onLængdeChange}
          description={BLIK_DESCRIPTIONS.længde}
        />
        <SliderWithInfo
          letter="I"
          label="Intensitet"
          value={intensitet}
          onChange={onIntensitetChange}
          description={BLIK_DESCRIPTIONS.intensitet}
        />
        <SliderWithInfo
          letter="K"
          label="Kompleksitet"
          value={kompleksitet}
          onChange={onKompleksitetChange}
          description={BLIK_DESCRIPTIONS.kompleksitet}
        />
      </div>
    </div>
  );
}


