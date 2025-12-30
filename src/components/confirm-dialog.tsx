"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ReactNode, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type ConfirmDialogProps = {
  trigger: ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Bekræft",
  cancelLabel = "Annuller",
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
      setOpen(false);
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-opacity duration-300" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-[24px] border border-[#E5E7EB]/60 bg-white/95 backdrop-blur-xl p-8 text-[#1f2937] shadow-[0_4px_24px_rgba(0,0,0,0.08),0_12px_48px_rgba(0,0,0,0.1)]">
            <Dialog.Title className="text-xl font-semibold text-[#1f2937] tracking-tight">
              {title}
            </Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-3 text-sm text-[#6B7280] leading-relaxed">
                {description}
              </Dialog.Description>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                className="border border-[#E5E7EB]/60 bg-white text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_2px_8px_rgba(0,0,0,0.04)]"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={handleConfirm}
                className="bg-[#DC2626] hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Arbejder…
                  </>
                ) : (
                  confirmLabel
                )}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

