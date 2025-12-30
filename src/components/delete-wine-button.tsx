"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteWine } from "@/app/actions/delete-wine";

type DeleteWineButtonProps = {
  wineId: string;
  producer: string;
};

export function DeleteWineButton({ wineId, producer }: DeleteWineButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      title="Slet vin?"
      description={`Er du sikker på, at du vil slette ${
        producer || "denne vin"
      } fra min samling? Denne handling kan ikke fortrydes.`}
      confirmLabel="Ja, slet"
      cancelLabel="Behold"
      onConfirm={() =>
        startTransition(async () => {
          await deleteWine(wineId);
        })
      }
      trigger={
        <Button
          type="button"
          disabled={isPending}
          className="h-10 w-10 rounded-[12px] border border-[#E5E7EB]/60 bg-white/95 backdrop-blur-md p-0 text-[#6B7280] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#DC2626]/40 hover:text-[#DC2626] hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
    />
  );
}

