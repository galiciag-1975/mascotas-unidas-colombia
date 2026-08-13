"use client";

import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  titulo: string;
}

export default function ShareButtons({ url, titulo }: ShareButtonsProps) {
  const [copiado, setCopiado] = useState(false);
  const textoCompartir = `${titulo} — ${url}`;

  async function compartirNativo() {
    try {
      await navigator.share({ title: titulo, text: titulo, url });
    } catch {
      // el usuario canceló o el navegador no soporta Web Share API
    }
  }

  async function copiarEnlace() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const puedeCompartirNativo =
    typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="flex flex-wrap gap-2">
      {puedeCompartirNativo && (
        <button
          onClick={compartirNativo}
          className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800"
        >
          Compartir
        </button>
      )}

      <a
        href={`https://wa.me/?text=${encodeURIComponent(textoCompartir)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:opacity-90"
      >
        WhatsApp
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-lg bg-[#1877F2] text-white text-sm font-medium hover:opacity-90"
      >
        Facebook
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(titulo)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90"
      >
        X
      </a>

      <button
        onClick={copiarEnlace}
        className="px-4 py-2 rounded-lg border border-zinc-300 text-sm font-medium hover:bg-zinc-50"
      >
        {copiado ? "¡Copiado!" : "Copiar enlace"}
      </button>
    </div>
  );
}
