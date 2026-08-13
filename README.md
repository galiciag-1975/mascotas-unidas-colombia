# 🐾 Mascotas Unidas Colombia

Plataforma comunitaria para registrar y reencontrar mascotas perdidas y encontradas tras el
terremoto en Colombia. Incluye reconocimiento de imagen con IA (color, forma del rostro, patrón
de pelaje, características visibles y raza aproximada), búsqueda por ciudad/especie, panel
administrativo y botones para compartir cada caso por WhatsApp y redes sociales.

Todo el hosting usado aquí tiene un **plan gratuito** suficiente para este proyecto. La única
pieza de pago es Claude (Anthropic), y solo se cobra por uso real, con un costo aproximado de
**menos de 1 centavo de dólar por foto analizada**.

## Antes de empezar: cuentas necesarias (todas gratis de crear)

1. **GitHub** — [github.com/signup](https://github.com/signup) — para guardar el código.
2. **Vercel** — [vercel.com/signup](https://vercel.com/signup) — hosting gratis, inicia sesión con tu cuenta de GitHub.
3. **Supabase** — [supabase.com/dashboard/sign-up](https://supabase.com/dashboard/sign-up) — base de datos, fotos y panel de datos.
4. **Hugging Face** — [huggingface.co/join](https://huggingface.co/join) — clasificación gratuita de razas.
5. **Anthropic Console** — [console.anthropic.com](https://console.anthropic.com) — análisis detallado con IA (requiere tarjeta y unos dólares de crédito, ej. $5 USD alcanzan para miles de análisis).

---

## Paso 1 — Subir el código a GitHub

```bash
git init
git add .
git commit -m "Primera versión de Mascotas Unidas Colombia"
```

Luego crea un repositorio nuevo (vacío, sin README) en GitHub llamado `mascotas-unidas-colombia`
y sigue las instrucciones que te da GitHub para conectar tu repo local:

```bash
git remote add origin https://github.com/TU-USUARIO/mascotas-unidas-colombia.git
git branch -M main
git push -u origin main
```

## Paso 2 — Crear el proyecto en Supabase

1. En [supabase.com/dashboard](https://supabase.com/dashboard), crea un **New Project**. Elige
   una contraseña de base de datos segura y una región cercana (ej. `South America (São Paulo)`).
2. Ve a **SQL Editor** → pega todo el contenido de [`supabase/schema.sql`](supabase/schema.sql)
   → **Run**. Esto crea las tablas, permisos y el bucket de fotos.
3. Ve a **Project Settings → API** y copia:
   - `Project URL` → será tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (sección "Project API keys", **secreta**) → será tu `SUPABASE_SERVICE_ROLE_KEY`

### Crear tu usuario administrador

En tu computador, dentro de la carpeta del proyecto:

```bash
node scripts/crear-admin.mjs tu_usuario "una-contraseña-segura"
```

Copia el `insert into admins (...)` que imprime y pégalo en el **SQL Editor** de Supabase → Run.
Puedes repetir esto para crear varios administradores.

## Paso 3 — Token gratuito de Hugging Face

1. Entra a [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) → **New token**
   → tipo `Read` → créalo.
2. Copia el token (empieza con `hf_...`) → será tu `HUGGINGFACE_API_TOKEN`.

## Paso 4 — API key de Anthropic (Claude, análisis detallado con IA)

1. Entra a [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) →
   **Create Key**.
2. Copia la key (empieza con `sk-ant-...`) → será tu `ANTHROPIC_API_KEY`.
3. En **Billing**, agrega unos dólares de crédito (con $5 USD alcanza para miles de fotos
   analizadas con el botón "Analizar con IA").

## Paso 5 — Desplegar en Vercel (dominio gratis incluido)

1. Entra a [vercel.com/new](https://vercel.com/new) e importa tu repositorio de GitHub
   `mascotas-unidas-colombia`.
2. En **Environment Variables**, agrega las 6 variables (puedes copiar y pegar desde tu
   `.env.local` una vez lo tengas armado localmente, ver `.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `HUGGINGFACE_API_TOKEN`
   - `ANTHROPIC_API_KEY`
   - `ADMIN_SESSION_SECRET` (genera uno con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
3. Click **Deploy**. En 1-2 minutos tu sitio queda publicado en una URL gratuita:
   **`https://mascotas-unidas-colombia.vercel.app`** (o `-tuusuario.vercel.app` si el nombre
   ya está tomado por otro proyecto de Vercel).

### ¿Y un dominio propio como `.com` o `.org`?

Los dominios totalmente gratuitos (`.tk`, `.ml`, etc.) ya no son confiables ni se recomiendan
para un proyecto serio. Si más adelante quieres algo como `mascotasunidascolombia.org`, puedes
comprar el dominio (~10-15 USD/año en [Namecheap](https://namecheap.com) o similar) y conectarlo
gratis desde **Vercel → Project Settings → Domains**. El subdominio `.vercel.app` gratuito
funciona perfectamente mientras tanto y se puede compartir igual por WhatsApp y redes.

## Paso 6 — Probar

Abre tu sitio publicado y prueba: registrar una mascota perdida con foto (verás la raza
sugerida automáticamente), usa el botón "Analizar con IA" para completar color/rostro/pelaje,
búscala en `/buscar`, compártela por WhatsApp, márcala como reencontrada, y entra a
`/admin/login` con el usuario que creaste para ver el panel.

---

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # completa los valores
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

- `app/` — páginas y rutas de API (Next.js App Router)
- `components/` — componentes de UI reutilizables
- `lib/` — clientes de Supabase, IA (Hugging Face / Claude) y utilidades
- `supabase/schema.sql` — esquema completo de base de datos, permisos y bucket de fotos
- `scripts/crear-admin.mjs` — genera el INSERT para dar de alta un administrador
