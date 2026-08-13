export type TipoCaso = "perdido" | "encontrado";
export type Especie = "perro" | "gato" | "otro";
export type Estado = "activo" | "reencontrado";

export interface PetCase {
  id: string;
  tipo: TipoCaso;
  especie: Especie;
  raza_aproximada: string | null;
  color: string | null;
  forma_rostro: string | null;
  patron_pelaje: string | null;
  caracteristicas_visibles: string | null;
  descripcion: string | null;
  ciudad: string;
  ubicacion_detalle: string | null;
  nombre_contacto: string;
  telefono_contacto: string;
  email_contacto: string | null;
  fotos: string[];
  estado: Estado;
  edit_token: string;
  created_at: string;
  updated_at: string;
}

export type PetCaseInsert = Omit<
  PetCase,
  "id" | "estado" | "edit_token" | "created_at" | "updated_at"
>;

export interface AiAnalysisResult {
  color: string;
  forma_rostro: string;
  patron_pelaje: string;
  caracteristicas_visibles: string;
  raza_aproximada: string;
}
