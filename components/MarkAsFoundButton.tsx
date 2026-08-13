"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface MarkAsFoundButtonProps {
  caseId: string;
  estadoInicial: "activo" | "reencontrado";
}

export default function MarkAsFoundButton({ caseId, estadoInicial }: MarkAsFoundButtonProps) {
  const router = useRouter();
  const [token, setToken] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem(`edit_token_${caseId}`) ?? ""
  );
  const [mostrarInput, setMostrarInput] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  if (estadoInicial === "reencontrado") {
    return (
      <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm font-medium">
        🎉 Esta mascota ya fue marcada como reencontrada.
      </p>
    );
  }

  async function marcarComoEncontrada() {
    if (!token.trim()) {
      setMostrarInput(true);
      return;
    }
    setEnviando(true);
    setMensaje(null);

    const { data, error } = await supabase.rpc("mark_as_found", {
      case_id: caseId,
      token: token.trim(),
    });

    setEnviando(false);

    if (error || !data) {
      setMensaje(
        "No se pudo marcar el caso. Verifica el código o contacta al administrador del sitio."
      );
      setMostrarInput(true);
      return;
    }

    setMensaje("¡Listo! El caso quedó marcado como reencontrado.");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        onClick={marcarComoEncontrada}
        disabled={enviando}
        className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
      >
        {enviando ? "Marcando..." : "Marcar como REENCONTRADA"}
      </button>

      {mostrarInput && (
        <div className="max-w-sm">
          <label className="block text-xs text-zinc-600 mb-1">
            Ingresa el código que recibiste al registrar este caso
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Código de edición"
          />
        </div>
      )}

      {mensaje && <p className="text-sm text-zinc-600">{mensaje}</p>}
    </div>
  );
}
