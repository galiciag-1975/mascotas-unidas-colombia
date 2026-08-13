import { supabase } from "@/lib/supabaseClient";
import { CIUDADES_COLOMBIA } from "@/lib/cities";
import PetCaseCard from "@/components/PetCaseCard";
import type { PetCase } from "@/lib/types";

export const metadata = { title: "Buscar mascotas — Mascotas Unidas Colombia" };
export const revalidate = 0;

interface BuscarPageProps {
  searchParams: Promise<{ ciudad?: string; especie?: string; estado?: string }>;
}

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const { ciudad = "", especie = "", estado = "activo" } = await searchParams;

  let query = supabase.from("pet_cases").select("*").order("created_at", { ascending: false });

  if (ciudad.trim()) query = query.ilike("ciudad", `%${ciudad.trim()}%`);
  if (especie) query = query.eq("especie", especie);
  if (estado) query = query.eq("estado", estado);

  const { data } = await query.limit(60);
  const casos: PetCase[] = data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Buscar mascotas</h1>

      <form method="get" className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8 bg-white p-4 rounded-xl border border-zinc-200">
        <div>
          <label htmlFor="ciudad" className="block text-xs font-medium text-zinc-600 mb-1">
            Ciudad
          </label>
          <input
            id="ciudad"
            name="ciudad"
            list="ciudades-lista"
            defaultValue={ciudad}
            placeholder="Todas las ciudades"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <datalist id="ciudades-lista">
            {CIUDADES_COLOMBIA.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="especie" className="block text-xs font-medium text-zinc-600 mb-1">
            Especie
          </label>
          <select
            id="especie"
            name="especie"
            defaultValue={especie}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otra</option>
          </select>
        </div>

        <div>
          <label htmlFor="estado" className="block text-xs font-medium text-zinc-600 mb-1">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            defaultValue={estado}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="activo">Activos</option>
            <option value="reencontrado">Reencontradas</option>
            <option value="">Todos</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-lg bg-amber-500 text-white font-medium py-2 hover:bg-amber-600"
          >
            Buscar
          </button>
        </div>
      </form>

      {casos.length === 0 ? (
        <p className="text-zinc-500">No se encontraron casos con esos filtros.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {casos.map((caso) => (
            <PetCaseCard key={caso.id} caso={caso} />
          ))}
        </div>
      )}
    </div>
  );
}
