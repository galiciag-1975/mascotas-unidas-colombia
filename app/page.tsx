import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import PetCaseCard from "@/components/PetCaseCard";
import Stats from "@/components/Stats";
import type { PetCase } from "@/lib/types";

export const revalidate = 0;

async function getCasosRecientes(): Promise<PetCase[]> {
  const { data } = await supabase
    .from("pet_cases")
    .select("*")
    .eq("estado", "activo")
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

export default async function Home() {
  const casos = await getCasosRecientes();

  return (
    <div>
      <section className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900">
            Ayudemos a reunir a las mascotas con sus familias
          </h1>
          <p className="mt-3 text-zinc-600 max-w-xl mx-auto">
            Tras el terremoto, muchas mascotas se separaron de sus familias. Registra o busca
            casos de mascotas perdidas y encontradas en todo Colombia.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/perdido/nuevo"
              className="px-6 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
            >
              Reporté una mascota perdida
            </Link>
            <Link
              href="/encontrado/nuevo"
              className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Encontré una mascota
            </Link>
            <Link
              href="/buscar"
              className="px-6 py-3 rounded-lg border border-zinc-300 bg-white text-zinc-800 font-semibold hover:bg-zinc-50"
            >
              Buscar casos
            </Link>
          </div>

          <div className="mt-10">
            <Stats />
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">Casos recientes</h2>
        {casos.length === 0 ? (
          <p className="text-zinc-500">Todavía no hay casos registrados.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {casos.map((caso) => (
              <PetCaseCard key={caso.id} caso={caso} />
            ))}
          </div>
        )}
        <div className="mt-6 text-center">
          <Link href="/buscar" className="text-amber-600 font-medium hover:underline">
            Ver todos los casos →
          </Link>
        </div>
      </section>
    </div>
  );
}
