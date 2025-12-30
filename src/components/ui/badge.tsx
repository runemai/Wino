import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

const baseStyles =
  "inline-flex items-center gap-1 rounded-[10px] border border-[#E5E7EB]/60 bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-[#6B7280] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_2px_8px_rgba(0,0,0,0.04)]";

export const Badge = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) => (
  <span className={twMerge(baseStyles, className)} {...props} />
);

