import PetCaseForm from "@/components/PetCaseForm";

export const metadata = { title: "Reportar mascota encontrada — Mascotas Unidas Colombia" };

export default function NuevaMascotaEncontrada() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Reportar mascota encontrada</h1>
      <p className="text-zinc-600 mb-6">
        Gracias por ayudar. Describe dónde la encontraste y sube fotos claras para que su
        familia pueda reconocerla.
      </p>
      <PetCaseForm tipo="encontrado" />
    </div>
  );
}
