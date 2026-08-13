import { supabase } from "@/lib/supabaseClient";

export default async function Stats() {
  const [{ count: activos }, { count: reencontrados }] = await Promise.all([
    supabase
      .from("pet_cases")
      .select("id", { count: "exact", head: true })
      .eq("estado", "activo"),
    supabase
      .from("pet_cases")
      .select("id", { count: "exact", head: true })
      .eq("estado", "reencontrado"),
  ]);

  return (
    <div className="flex gap-6 justify-center text-center">
      <div>
        <p className="text-3xl font-bold text-zinc-900">{activos ?? 0}</p>
        <p className="text-sm text-zinc-500">Casos activos</p>
      </div>
      <div>
        <p className="text-3xl font-bold text-emerald-600">{reencontrados ?? 0}</p>
        <p className="text-sm text-zinc-500">Reencontradas</p>
      </div>
    </div>
  );
}
