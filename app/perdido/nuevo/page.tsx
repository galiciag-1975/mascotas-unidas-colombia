import PetCaseForm from "@/components/PetCaseForm";

export const metadata = { title: "Reportar mascota perdida — Mascotas Unidas Colombia" };

export default function NuevaMascotaPerdida() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Reportar mascota perdida</h1>
      <p className="text-zinc-600 mb-6">
        Completa los datos con la mayor precisión posible. Entre más información y fotos, más
        fácil será que alguien la reconozca.
      </p>
      <PetCaseForm tipo="perdido" />
    </div>
  );
}
