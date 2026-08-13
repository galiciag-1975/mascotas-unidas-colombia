import "server-only";
import type { Especie } from "./types";

const MODELOS_POR_ESPECIE: Partial<Record<Especie, string>> = {
  perro: "dima806/dog_breeds_image_detection",
  gato: "dima806/cat_breeds_image_detection",
};

interface HfClassificationResult {
  label: string;
  score: number;
}

function limpiarEtiqueta(label: string) {
  return label
    .replace(/_/g, " ")
    .split(" ")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

// Clasificación automática y gratuita (best-effort) al subir una foto.
// Si el modelo está "despertando" (503) o falla, devuelve null sin romper
// el registro del caso: la raza aproximada queda vacía y editable.
export async function clasificarRazaAutomatica(
  imageUrl: string,
  especie: Especie
): Promise<string | null> {
  const modelo = MODELOS_POR_ESPECIE[especie];
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!modelo || !token) return null;

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) return null;
    const imageBuffer = await imageResponse.arrayBuffer();

    const hfResponse = await fetch(
      `https://api-inference.huggingface.co/models/${modelo}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
        },
        body: imageBuffer,
      }
    );

    if (!hfResponse.ok) return null;

    const data = (await hfResponse.json()) as
      | HfClassificationResult[]
      | { error?: string };

    if (!Array.isArray(data) || data.length === 0) return null;

    const mejor = data.reduce((max, actual) =>
      actual.score > max.score ? actual : max
    );

    return limpiarEtiqueta(mejor.label);
  } catch {
    return null;
  }
}
