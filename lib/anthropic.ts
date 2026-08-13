import "server-only";
import type { AiAnalysisResult, Especie } from "./types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-haiku-4-5-20251001";

const CAMPOS: (keyof AiAnalysisResult)[] = [
  "color",
  "forma_rostro",
  "patron_pelaje",
  "caracteristicas_visibles",
  "raza_aproximada",
];

function extraerJson(texto: string): Record<string, unknown> | null {
  const inicio = texto.indexOf("{");
  const fin = texto.lastIndexOf("}");
  if (inicio === -1 || fin === -1) return null;
  try {
    return JSON.parse(texto.slice(inicio, fin + 1));
  } catch {
    return null;
  }
}

// Análisis detallado bajo demanda (botón "Analizar con IA"). Usa Claude
// Vision para describir la foto de la mascota en atributos estructurados,
// editables por la persona que reporta el caso.
export async function analizarFotoConIA(
  imageUrl: string,
  especie: Especie
): Promise<AiAnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la variable de entorno ANTHROPIC_API_KEY");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "url", url: imageUrl },
            },
            {
              type: "text",
              text:
                `Estás ayudando a describir una mascota (${especie}) en una plataforma ` +
                "de mascotas perdidas tras un terremoto en Colombia, a partir de una foto. " +
                "Observa solo lo visible en la imagen y responde ÚNICAMENTE con un JSON " +
                "válido (sin texto adicional, sin markdown) con este formato exacto, en " +
                "español, cada valor una frase corta (máximo 6 palabras):\n" +
                '{"color": "...", "forma_rostro": "...", "patron_pelaje": "...", ' +
                '"caracteristicas_visibles": "...", "raza_aproximada": "..."}\n' +
                "Si algo no se puede determinar con la foto, usa una cadena vacía en ese campo.",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const detalle = await response.text();
    throw new Error(`Error de Anthropic API (${response.status}): ${detalle}`);
  }

  const data = await response.json();
  const texto: string = data?.content?.[0]?.text ?? "";
  const json = extraerJson(texto);

  const resultado: AiAnalysisResult = {
    color: "",
    forma_rostro: "",
    patron_pelaje: "",
    caracteristicas_visibles: "",
    raza_aproximada: "",
  };

  if (json) {
    for (const campo of CAMPOS) {
      const valor = json[campo];
      if (typeof valor === "string") resultado[campo] = valor;
    }
  }

  return resultado;
}
