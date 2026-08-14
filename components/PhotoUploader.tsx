"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import type { Especie } from "@/lib/types";

interface PhotoUploaderProps {
  fotos: string[];
  onChange: (fotos: string[]) => void;
  especie: Especie;
  onAutoClassified?: (raza: string) => void;
  maxFotos?: number;
}

export default function PhotoUploader({
  fotos,
  onChange,
  especie,
  onAutoClassified,
  maxFotos = 4,
}: PhotoUploaderProps) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const disponibles = maxFotos - fotos.length;
    const archivos = Array.from(files).slice(0, disponibles);
    if (archivos.length === 0) {
      setError(`Ya subiste el máximo de ${maxFotos} fotos.`);
      return;
    }

    setSubiendo(true);
    const nuevasUrls: string[] = [];

    for (const archivo of archivos) {
      if (!archivo.type.startsWith("image/")) continue;

      const extension = archivo.name.split(".").pop() || "jpg";
      const ruta = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("fotos-mascotas")
        .upload(ruta, archivo, { contentType: archivo.type });

      if (uploadError) {
        setError("No se pudo subir una de las fotos. Intenta de nuevo.");
        continue;
      }

      const { data } = supabase.storage.from("fotos-mascotas").getPublicUrl(ruta);
      nuevasUrls.push(data.publicUrl);
    }

    if (nuevasUrls.length > 0) {
      const todasLasFotos = [...fotos, ...nuevasUrls];
      onChange(todasLasFotos);

      // Clasificación automática y gratuita en segundo plano con la primera foto.
      if (fotos.length === 0 && onAutoClassified) {
        fetch("/api/ai/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: nuevasUrls[0], especie }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.raza) onAutoClassified(data.raza);
          })
          .catch(() => {});
      }
    }

    setSubiendo(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function eliminarFoto(url: string) {
    onChange(fotos.filter((f) => f !== url));
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {fotos.map((url) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100"
          >
            <Image src={url} alt="Foto de la mascota" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => eliminarFoto(url)}
              className="absolute top-1 right-1 bg-black/60 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
              aria-label="Eliminar foto"
            >
              ×
            </button>
          </div>
        ))}

        {fotos.length < maxFotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-500 text-sm hover:border-amber-500 hover:text-amber-600 transition-colors disabled:opacity-50"
          >
            {subiendo ? "Subiendo..." : "+ Añadir foto"}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-zinc-500">
        Hasta {maxFotos} fotos. La primera se usa para sugerir automáticamente la raza.
      </p>
    </div>
  );
}
