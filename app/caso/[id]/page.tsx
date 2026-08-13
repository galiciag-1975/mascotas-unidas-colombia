import Image from "next/image";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabaseClient";
import ShareButtons from "@/components/ShareButtons";
import MarkAsFoundButton from "@/components/MarkAsFoundButton";
import type { PetCase } from "@/lib/types";

export const revalidate = 0;

const ESPECIE_LABEL: Record<string, string> = {
  perro: "Perro",
  gato: "Gato",
  otro: "Otra mascota",
};

async function getCaso(id: string): Promise<PetCase | null> {
  const { data } = await supabase.from("pet_cases").select("*").eq("id", id).maybeSingle();
  return data;
}

export default async function CasoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caso = await getCaso(id);
  if (!caso) notFound();

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const url = `${protocol}://${host}/caso/${caso.id}`;

  const titulo = `${caso.tipo === "perdido" ? "Mascota perdida" : "Mascota encontrada"} en ${caso.ciudad}: ${ESPECIE_LABEL[caso.especie]}${caso.raza_aproximada ? ` (${caso.raza_aproximada})` : ""}`;

  const detalles: [string, string | null][] = [
    ["Especie", ESPECIE_LABEL[caso.especie]],
    ["Raza aproximada", caso.raza_aproximada],
    ["Color", caso.color],
    ["Forma del rostro", caso.forma_rostro],
    ["Patrón del pelaje", caso.patron_pelaje],
    ["Características visibles", caso.caracteristicas_visibles],
    ["Ciudad", caso.ciudad],
    ["Ubicación", caso.ubicacion_detalle],
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
            caso.tipo === "perdido" ? "bg-red-500" : "bg-emerald-600"
          }`}
        >
          {caso.tipo === "perdido" ? "Mascota perdida" : "Mascota encontrada"}
        </span>
        {caso.estado === "reencontrado" && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-400 text-black">
            Reencontrada
          </span>
        )}
      </div>

      <h1 className="text-2xl font-bold text-zinc-900 mb-4">{titulo}</h1>

      {caso.fotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {caso.fotos.map((foto) => (
            <div key={foto} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100">
              <Image src={foto} alt={titulo} fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      )}

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-6 bg-white border border-zinc-200 rounded-xl p-4">
        {detalles
          .filter(([, valor]) => valor)
          .map(([etiqueta, valor]) => (
            <div key={etiqueta}>
              <dt className="text-xs text-zinc-500">{etiqueta}</dt>
              <dd className="text-sm text-zinc-900">{valor}</dd>
            </div>
          ))}
      </dl>

      {caso.descripcion && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-700 mb-1">Descripción</h2>
          <p className="text-sm text-zinc-800 whitespace-pre-wrap">{caso.descripcion}</p>
        </div>
      )}

      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-zinc-700 mb-2">Contacto</h2>
        <p className="text-sm text-zinc-900">{caso.nombre_contacto}</p>
        <p className="text-sm text-zinc-900">
          <a href={`tel:${caso.telefono_contacto}`} className="hover:underline">
            {caso.telefono_contacto}
          </a>
        </p>
        {caso.email_contacto && (
          <p className="text-sm text-zinc-900">
            <a href={`mailto:${caso.email_contacto}`} className="hover:underline">
              {caso.email_contacto}
            </a>
          </p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-2">Compartir este caso</h2>
        <ShareButtons url={url} titulo={titulo} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-zinc-700 mb-2">¿Ya se reencontraron?</h2>
        <MarkAsFoundButton caseId={caso.id} estadoInicial={caso.estado} />
      </div>
    </div>
  );
}
