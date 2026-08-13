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

export async function eliminarCaso(id: string) {
  await requireAdmin();
  await supabaseAdmin.from("pet_cases").delete().eq("id", id);
  revalidatePath("/admin");
}
