import { NextRequest, NextResponse } from "next/server";
import { analizarFotoConIA } from "@/lib/anthropic";
import type { Especie } from "@/lib/types";

const ESPECIES_VALIDAS: Especie[] = ["perro", "gato", "otro"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const imageUrl = body?.imageUrl;
  const especie = body?.especie;

  if (typeof imageUrl !== "string" || !ESPECIES_VALIDAS.includes(especie)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const resultado = await analizarFotoConIA(imageUrl, especie);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error analizando foto con IA:", error);
    return NextResponse.json(
      { error: "No se pudo analizar la foto en este momento" },
      { status: 502 }
    );
  }
}
