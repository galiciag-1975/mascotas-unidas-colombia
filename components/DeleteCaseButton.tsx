"use client";

import { useTransition } from "react";
import { eliminarCaso } from "@/app/admin/actions";

export default function DeleteCaseButton({ caseId }: { caseId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("¿Eliminar este caso permanentemente? Esta acción no se puede deshacer.")) {
      return;
    }
    startTransition(() => {
      eliminarCaso(caseId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "..." : "Eliminar"}
    </button>
  );
}
