"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/adminAuth";

export async function marcarComoReencontrada(id: string) {
  await requireAdmin();
  await supabaseAdmin
    .from("pet_cases")
    .update({ estado: "reencontrado", updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin");
}

export async function marcarComoActiva(id: string) {
  await requireAdmin();
  await supabaseAdmin
    .from("pet_cases")
    .update({ estado: "activo", updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin");
}

function extraerRutaStorage(url: string): string | null {
  const marcador = "/fotos-mascotas/";
  const indice = url.indexOf(marcador);
  return indice === -1 ? null : url.slice(indice + marcador.length);
}

export async function eliminarCaso(id: string) {
  await requireAdmin();

  const { data: caso } = await supabaseAdmin
    .from("pet_cases")
    .select("fotos")
    .eq("id", id)
    .maybeSingle();

  const fotos = (caso?.fotos ?? []) as string[];
  const rutas = fotos
    .map(extraerRutaStorage)
    .filter((ruta): ruta is string => ruta !== null);

  if (rutas.length > 0) {
    await supabaseAdmin.storage.from("fotos-mascotas").remove(rutas);
  }

  await supabaseAdmin.from("pet_cases").delete().eq("id", id);
  revalidatePath("/admin");
}
