import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-zinc-900 flex items-center gap-2">
          🐾 Mascotas Unidas Colombia
        </Link>
        <nav className="flex gap-4 text-sm font-medium text-zinc-600">
          <Link href="/buscar" className="hover:text-amber-600">
            Buscar
          </Link>
          <Link href="/perdido/nuevo" className="hover:text-amber-600">
            Reportar perdida
          </Link>
          <Link href="/encontrado/nuevo" className="hover:text-amber-600">
            Reportar encontrada
          </Link>
        </nav>
      </div>
    </header>
  );
}
