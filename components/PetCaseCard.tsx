import Link from "next/link";
import Image from "next/image";
import type { PetCase } from "@/lib/types";

const ESPECIE_LABEL: Record<string, string> = {
  perro: "Perro",
  gato: "Gato",
  otro: "Otra mascota",
};

export default function PetCaseCard({ caso }: { caso: PetCase }) {
  const foto = caso.fotos?.[0];

  return (
    <Link
      href={`/caso/${caso.id}`}
      className="group block rounded-xl border border-zinc-200 overflow-hidden bg-white hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-zinc-100">
        {foto ? (
          <Image
            src={foto}
            alt={`Foto de ${ESPECIE_LABEL[caso.especie]} en ${caso.ciudad}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
            Sin foto
          </div>
        )}

        <span
          className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full text-white ${
            caso.tipo === "perdido" ? "bg-red-500" : "bg-emerald-600"
          }`}
        >
          {caso.tipo === "perdido" ? "Perdida" : "Encontrada"}
        </span>

        {caso.estado === "reencontrado" && (
          <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full bg-amber-400 text-black">
            Reencontrada
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="font-medium text-zinc-900">
          {ESPECIE_LABEL[caso.especie]}
          {caso.raza_aproximada ? ` · ${caso.raza_aproximada}` : ""}
        </p>
        <p className="text-sm text-zinc-500">{caso.ciudad}</p>
      </div>
    </Link>
  );
}
