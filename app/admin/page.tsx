import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabaseServer";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import DeleteCaseButton from "@/components/DeleteCaseButton";
import { marcarComoActiva, marcarComoReencontrada } from "./actions";
import type { PetCase } from "@/lib/types";

export const revalidate = 0;

const ESPECIE_LABEL: Record<string, string> = { perro: "Perro", gato: "Gato", otro: "Otra" };

interface AdminPageProps {
  searchParams: Promise<{ ciudad?: string; especie?: string; estado?: string; tipo?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { ciudad = "", especie = "", estado = "", tipo = "" } = await searchParams;

  let query = supabaseAdmin.from("pet_cases").select("*").order("created_at", { ascending: false });
  if (ciudad.trim()) query = query.ilike("ciudad", `%${ciudad.trim()}%`);
  if (especie) query = query.eq("especie", especie);
  if (estado) query = query.eq("estado", estado);
  if (tipo) query = query.eq("tipo", tipo);

  const { data } = await query.limit(200);
  const casos: PetCase[] = data ?? [];

  const [{ count: totalActivos }, { count: totalReencontrados }] = await Promise.all([
    supabaseAdmin.from("pet_cases").select("id", { count: "exact", head: true }).eq("estado", "activo"),
    supabaseAdmin.from("pet_cases").select("id", { count: "exact", head: true }).eq("estado", "reencontrado"),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Panel administrativo</h1>
          <p className="text-sm text-zinc-500">
            {totalActivos ?? 0} activos · {totalReencontrados ?? 0} reencontrados
          </p>
        </div>
        <AdminLogoutButton />
      </div>

      <form method="get" className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 bg-white p-4 rounded-xl border border-zinc-200">
        <input
          name="ciudad"
          defaultValue={ciudad}
          placeholder="Ciudad"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <select name="especie" defaultValue={especie} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          <option value="">Toda especie</option>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="otro">Otra</option>
        </select>
        <select name="tipo" defaultValue={tipo} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          <option value="">Perdida/Encontrada</option>
          <option value="perdido">Perdida</option>
          <option value="encontrado">Encontrada</option>
        </select>
        <select name="estado" defaultValue={estado} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          <option value="">Todo estado</option>
          <option value="activo">Activo</option>
          <option value="reencontrado">Reencontrado</option>
        </select>
        <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800">
          Filtrar
        </button>
      </form>

      <div className="overflow-x-auto bg-white border border-zinc-200 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500 border-b border-zinc-200">
              <th className="p-3">Foto</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Mascota</th>
              <th className="p-3">Ciudad</th>
              <th className="p-3">Contacto</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {casos.map((caso) => (
              <tr key={caso.id} className="border-b border-zinc-100 last:border-0">
                <td className="p-3">
                  {caso.fotos[0] ? (
                    <div className="relative w-12 h-12 rounded overflow-hidden bg-zinc-100">
                      <Image src={caso.fotos[0]} alt="" fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded bg-zinc-100" />
                  )}
                </td>
                <td className="p-3">{caso.tipo === "perdido" ? "Perdida" : "Encontrada"}</td>
                <td className="p-3">
                  {ESPECIE_LABEL[caso.especie]}
                  {caso.raza_aproximada ? ` · ${caso.raza_aproximada}` : ""}
                </td>
                <td className="p-3">{caso.ciudad}</td>
                <td className="p-3">
                  <div>{caso.nombre_contacto}</div>
                  <div className="text-zinc-500">{caso.telefono_contacto}</div>
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      caso.estado === "activo" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {caso.estado === "activo" ? "Activo" : "Reencontrado"}
                  </span>
                </td>
                <td className="p-3 text-zinc-500 whitespace-nowrap">
                  {new Date(caso.created_at).toLocaleDateString("es-CO")}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/caso/${caso.id}`}
                      target="_blank"
                      className="text-xs px-2 py-1 rounded border border-zinc-300 hover:bg-zinc-50"
                    >
                      Ver
                    </a>
                    {caso.estado === "activo" ? (
                      <form action={marcarComoReencontrada.bind(null, caso.id)}>
                        <button className="text-xs px-2 py-1 rounded border border-amber-300 text-amber-700 hover:bg-amber-50">
                          Marcar reencontrada
                        </button>
                      </form>
                    ) : (
                      <form action={marcarComoActiva.bind(null, caso.id)}>
                        <button className="text-xs px-2 py-1 rounded border border-zinc-300 hover:bg-zinc-50">
                          Reactivar
                        </button>
                      </form>
                    )}
                    <DeleteCaseButton caseId={caso.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {casos.length === 0 && (
          <p className="text-center text-zinc-500 py-8">No hay casos con esos filtros.</p>
        )}
      </div>
    </div>
  );
}
