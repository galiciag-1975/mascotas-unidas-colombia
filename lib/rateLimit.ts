import "server-only";
import { supabaseAdmin } from "./supabaseServer";

const LIMITE_DIARIO = 2;
const VENTANA_MS = 24 * 60 * 60 * 1000;

// Máximo 2 registros por día por dirección IP. La ventana se reinicia
// sola pasadas 24 horas desde el primer registro de esa IP.
export async function permitirRegistro(ip: string): Promise<boolean> {
  const ahora = Date.now();

  const { data: fila } = await supabaseAdmin
    .from("rate_limits")
    .select("count, window_start")
    .eq("ip_address", ip)
    .maybeSingle();

  if (!fila) {
    await supabaseAdmin
      .from("rate_limits")
      .insert({ ip_address: ip, count: 1, window_start: new Date(ahora).toISOString() });
    return true;
  }

  const ventanaVencida = ahora - new Date(fila.window_start).getTime() > VENTANA_MS;

  if (ventanaVencida) {
    await supabaseAdmin
      .from("rate_limits")
      .update({ count: 1, window_start: new Date(ahora).toISOString() })
      .eq("ip_address", ip);
    return true;
  }

  if (fila.count >= LIMITE_DIARIO) {
    return false;
  }

  await supabaseAdmin
    .from("rate_limits")
    .update({ count: fila.count + 1 })
    .eq("ip_address", ip);
  return true;
}
