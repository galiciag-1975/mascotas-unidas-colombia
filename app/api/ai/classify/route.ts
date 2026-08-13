import { NextRequest, NextResponse } from "next/server";
import { clasificarRazaAutomatica } from "@/lib/huggingface";
import type { Especie } from "@/lib/types";

const ESPECIES_VALIDAS: Especie[] = ["perro", "gato", "otro"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const imageUrl = body?.imageUrl;
  const especie = body?.especie;

  if (typeof imageUrl !== "string" || !ESPECIES_VALIDAS.includes(especie)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const raza = await clasificarRazaAutomatica(imageUrl, especie);
  return NextResponse.json({ raza });
}
