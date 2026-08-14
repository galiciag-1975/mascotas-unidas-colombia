import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { verificarRecaptcha } from "@/lib/recaptcha";
import { permitirRegistro } from "@/lib/rateLimit";
import type { Especie, TipoCaso } from "@/lib/types";

const TIPOS_VALIDOS: TipoCaso[] = ["perdido", "encontrado"];
const ESPECIES_VALIDAS: Especie[] = ["perro", "gato", "otro"];

function obtenerIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "desconocida";
}

function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() !== "" ? valor : null;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { tipo, especie, fotos, nombre_contacto, telefono_contacto, ciudad, recaptchaToken } = body;

  if (!TIPOS_VALIDOS.includes(tipo) || !ESPECIES_VALIDAS.includes(especie)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  if (!Array.isArray(fotos) || fotos.length === 0) {
    return NextResponse.json({ error: "Sube al menos una foto de la mascota" }, { status: 400 });
  }
  if (!texto(nombre_contacto) || !texto(telefono_contacto) || !texto(ciudad)) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }
  if (typeof recaptchaToken !== "string" || !recaptchaToken) {
    return NextResponse.json({ error: "Completa la verificación de seguridad" }, { status: 400 });
  }

  const ip = obtenerIp(request);

  const captchaValido = await verificarRecaptcha(recaptchaToken, ip);
  if (!captchaValido) {
    return NextResponse.json(
      { error: "No se pudo verificar que no eres un robot. Intenta de nuevo." },
      { status: 400 }
    );
  }

  const permitido = await permitirRegistro(ip);
  if (!permitido) {
    return NextResponse.json(
      {
        error:
          "Alcanzaste el máximo de 2 registros por día desde esta conexión. Intenta de nuevo mañana.",
      },
      { status: 429 }
    );
  }

  const nuevoCaso = {
    tipo,
    especie,
    raza_aproximada: texto(body.raza_aproximada),
    color: texto(body.color),
    forma_rostro: texto(body.forma_rostro),
    patron_pelaje: texto(body.patron_pelaje),
    caracteristicas_visibles: texto(body.caracteristicas_visibles),
    descripcion: texto(body.descripcion),
    ciudad,
    ubicacion_detalle: texto(body.ubicacion_detalle),
    nombre_contacto,
    telefono_contacto,
    email_contacto: texto(body.email_contacto),
    fotos,
  };

  const { data, error } = await supabaseAdmin
    .from("pet_cases")
    .insert(nuevoCaso)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo registrar el caso" }, { status: 500 });
  }

  return NextResponse.json(data);
}
