import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { twMerge } from "tailwind-merge";

const baseStyles =
  "inline-flex items-center justify-center rounded-full bg-[#e11d48] px-6 py-[10px] text-[15px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_rgba(225,29,72,0.35)] transition-all duration-150 ease-out hover:translate-y-[-1px] hover:bg-[#fb7185] active:opacity-80 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb7185]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d] disabled:opacity-30 disabled:cursor-not-allowed";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
};

export const Button = forwardRef<ElementRef<"button">, ButtonProps>(function Button(
  { className, asChild = false, ...props },
  ref,
) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      ref={ref}
      className={twMerge(baseStyles, className)}
      {...props}
    />
  );
});

