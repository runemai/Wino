import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

const baseStyles =
  "inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 shadow-[0_8px_20px_rgba(6,4,8,0.4)] backdrop-blur";

export const Badge = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) => (
  <span className={twMerge(baseStyles, className)} {...props} />
);

