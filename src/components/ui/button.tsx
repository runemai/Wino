import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { twMerge } from "tailwind-merge";

// iOS-style Button - Apple HIG with custom red theme
const baseStyles =
  "inline-flex items-center justify-center rounded-[10px] bg-[#DC2626] px-6 py-[10px] text-[17px] font-semibold text-white transition-all duration-150 ease-out active:opacity-70 active:scale-[0.97] focus-visible:outline-none disabled:opacity-30 disabled:cursor-not-allowed";

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

