"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import PhotoUploader from "./PhotoUploader";
import CityFilter from "./CityFilter";
import type { Especie, TipoCaso } from "@/lib/types";

declare global {
  interface Window {
    grecaptcha?: {
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
    };
  }
}

interface PetCaseFormProps {
  tipo: TipoCaso;
}

const CAMPOS_VACIOS = {
  especie: "perro" as Especie,
  raza_aproximada: "",
  color: "",
  forma_rostro: "",
  patron_pelaje: "",
  caracteristicas_visibles: "",
  descripcion: "",
  ciudad: "",
  ubicacion_detalle: "",
  nombre_contacto: "",
  telefono_contacto: "",
  email_contacto: "",
};

export default function PetCaseForm({ tipo }: PetCaseFormProps) {
  const router = useRouter();
  const [campos, setCampos] = useState(CAMPOS_VACIOS);
  const [fotos, setFotos] = useState<string[]>([]);
  const [analizando, setAnalizando] = useState(false);
  const [analisisUsado, setAnalisisUsado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof campos>(campo: K, valor: (typeof campos)[K]) {
    setCampos((prev) => ({ ...prev, [campo]: valor }));
  }

  async function analizarConIA() {
    if (fotos.length === 0) {
      setError("Sube al menos una foto antes de analizarla con IA.");
      return;
    }
    if (analisisUsado) return;
    setAnalisisUsado(true);
    setAnalizando(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: fotos[0], especie: campos.especie }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCampos((prev) => ({
        ...prev,
        color: data.color || prev.color,
        forma_rostro: data.forma_rostro || prev.forma_rostro,
        patron_pelaje: data.patron_pelaje || prev.patron_pelaje,
        caracteristicas_visibles: data.caracteristicas_visibles || prev.caracteristicas_visibles,
        raza_aproximada: data.raza_aproximada || prev.raza_aproximada,
      }));
    } catch {
      setError("No se pudo analizar la foto con IA en este momento. Puedes llenar los campos manualmente.");
    } finally {
      setAnalizando(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (fotos.length === 0) {
      setError("Sube al menos una foto de la mascota.");
      return;
    }

    const recaptchaToken = window.grecaptcha?.getResponse();
    if (!recaptchaToken) {
      setError("Marca la casilla de verificación antes de enviar.");
      return;
    }

    setEnviando(true);

    const camposLimpios = Object.fromEntries(
      Object.entries(campos).map(([clave, valor]) => [
        clave,
        typeof valor === "string" && valor.trim() === "" ? null : valor,
      ])
    );

    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, ...camposLimpios, fotos, recaptchaToken }),
    });

    const data = await res.json().catch(() => null);
    window.grecaptcha?.reset();
    setEnviando(false);

    if (!res.ok || !data) {
      setError(data?.error ?? "No se pudo registrar el caso. Intenta de nuevo en unos minutos.");
      return;
    }

    localStorage.setItem(`edit_token_${data.id}`, data.edit_token);
    router.push(`/caso/${data.id}?nuevo=1`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="especie" className="block text-sm font-medium text-zinc-700 mb-1">
          Especie
        </label>
        <select
          id="especie"
          value={campos.especie}
          onChange={(e) => set("especie", e.target.value as Especie)}
          className="w-full sm:w-64 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="otro">Otra</option>
        </select>
        <p className="text-xs text-zinc-500 mt-1">
          Elige la especie antes de subir la foto: así la IA sabe si debe reconocer razas de perro o de gato.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Fotos</label>
        <PhotoUploader
          fotos={fotos}
          onChange={setFotos}
          especie={campos.especie}
          onAutoClassified={(raza) => set("raza_aproximada", raza)}
        />
        <button
          type="button"
          onClick={analizarConIA}
          disabled={analizando || analisisUsado || fotos.length === 0}
          className="mt-3 text-sm px-3 py-1.5 rounded-lg bg-violet-100 text-violet-700 font-medium hover:bg-violet-200 disabled:opacity-50"
        >
          {analizando
            ? "Analizando foto..."
            : analisisUsado
              ? "Ya usaste el análisis con IA"
              : "✨ Analizar con IA"}
        </button>
        <p className="text-xs text-zinc-500 mt-1">
          La IA sugiere color, forma del rostro, patrón de pelaje, características y raza a partir de la foto (solo se puede usar una vez por registro). Siempre puedes corregir los campos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="raza" className="block text-sm font-medium text-zinc-700 mb-1">
            Raza aproximada
          </label>
          <input
            id="raza"
            type="text"
            value={campos.raza_aproximada}
            onChange={(e) => set("raza_aproximada", e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-zinc-700 mb-1">
            Color
          </label>
          <input
            id="color"
            type="text"
            value={campos.color}
            onChange={(e) => set("color", e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="forma_rostro" className="block text-sm font-medium text-zinc-700 mb-1">
            Forma del rostro
          </label>
          <input
            id="forma_rostro"
            type="text"
            value={campos.forma_rostro}
            onChange={(e) => set("forma_rostro", e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="patron_pelaje" className="block text-sm font-medium text-zinc-700 mb-1">
            Patrón del pelaje
          </label>
          <input
            id="patron_pelaje"
            type="text"
            value={campos.patron_pelaje}
            onChange={(e) => set("patron_pelaje", e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="caracteristicas" className="block text-sm font-medium text-zinc-700 mb-1">
            Características visibles
          </label>
          <input
            id="caracteristicas"
            type="text"
            value={campos.caracteristicas_visibles}
            onChange={(e) => set("caracteristicas_visibles", e.target.value)}
            placeholder="Cicatrices, collar, manchas..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-zinc-700 mb-1">
          Descripción adicional
        </label>
        <textarea
          id="descripcion"
          value={campos.descripcion}
          onChange={(e) => set("descripcion", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ciudad" className="block text-sm font-medium text-zinc-700 mb-1">
            Ciudad {tipo === "perdido" ? "donde se perdió" : "donde se encontró"} *
          </label>
          <CityFilter value={campos.ciudad} onChange={(v) => set("ciudad", v)} required />
        </div>

        <div>
          <label htmlFor="ubicacion" className="block text-sm font-medium text-zinc-700 mb-1">
            Ubicación / barrio aproximado
          </label>
          <input
            id="ubicacion"
            type="text"
            value={campos.ubicacion_detalle}
            onChange={(e) => set("ubicacion_detalle", e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      <fieldset className="border border-zinc-200 rounded-lg p-4">
        <legend className="text-sm font-medium text-zinc-700 px-1">Datos de contacto</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre_contacto" className="block text-sm font-medium text-zinc-700 mb-1">
              Nombre *
            </label>
            <input
              id="nombre_contacto"
              type="text"
              required
              value={campos.nombre_contacto}
              onChange={(e) => set("nombre_contacto", e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label htmlFor="telefono_contacto" className="block text-sm font-medium text-zinc-700 mb-1">
              Teléfono / WhatsApp *
            </label>
            <input
              id="telefono_contacto"
              type="tel"
              required
              value={campos.telefono_contacto}
              onChange={(e) => set("telefono_contacto", e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email_contacto" className="block text-sm font-medium text-zinc-700 mb-1">
              Correo (opcional)
            </label>
            <input
              id="email_contacto"
              type="email"
              value={campos.email_contacto}
              onChange={(e) => set("email_contacto", e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </fieldset>

      <div>
        <Script src="https://www.google.com/recaptcha/api.js" strategy="afterInteractive" />
        <div className="g-recaptcha" data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-amber-500 text-white font-semibold py-3 hover:bg-amber-600 disabled:opacity-50"
      >
        {enviando ? "Registrando..." : tipo === "perdido" ? "Registrar mascota perdida" : "Registrar mascota encontrada"}
      </button>
    </form>
  );
}
