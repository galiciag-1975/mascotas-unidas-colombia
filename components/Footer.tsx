export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-6 mt-auto">
      <div className="max-w-5xl mx-auto px-4 text-center text-sm text-zinc-500">
        <p>
          Mascotas Unidas Colombia — plataforma comunitaria para reunir mascotas con sus familias
          tras el terremoto.
        </p>
        <p className="mt-1">
          <a href="/admin/login" className="hover:text-amber-600 underline">
            Panel administrativo
          </a>
        </p>
      </div>
    </footer>
  );
}
