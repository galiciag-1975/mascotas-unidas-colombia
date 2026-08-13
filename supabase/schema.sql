-- Mascotas Unidas Colombia — esquema de base de datos
-- Cómo usarlo: Supabase Dashboard -> SQL Editor -> pegar todo este archivo -> Run

-- =========================================================
-- Tabla principal: casos de mascotas perdidas/encontradas
-- =========================================================
create extension if not exists pgcrypto;

create table if not exists pet_cases (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('perdido', 'encontrado')),
  especie text not null check (especie in ('perro', 'gato', 'otro')),
  raza_aproximada text,
  color text,
  forma_rostro text,
  patron_pelaje text,
  caracteristicas_visibles text,
  descripcion text,
  ciudad text not null,
  ubicacion_detalle text,
  nombre_contacto text not null,
  telefono_contacto text not null,
  email_contacto text,
  fotos jsonb not null default '[]'::jsonb,
  estado text not null default 'activo' check (estado in ('activo', 'reencontrado')),
  edit_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pet_cases_ciudad_idx on pet_cases (lower(ciudad));
create index if not exists pet_cases_especie_idx on pet_cases (especie);
create index if not exists pet_cases_tipo_idx on pet_cases (tipo);
create index if not exists pet_cases_estado_idx on pet_cases (estado);
create index if not exists pet_cases_created_at_idx on pet_cases (created_at desc);

alter table pet_cases enable row level security;

-- Cualquiera puede registrar un caso (no requiere login)
drop policy if exists "public_insert_cases" on pet_cases;
create policy "public_insert_cases" on pet_cases
  for insert
  to anon
  with check (estado = 'activo');

-- Cualquiera puede ver los casos (para buscar y compartir)
drop policy if exists "public_select_cases" on pet_cases;
create policy "public_select_cases" on pet_cases
  for select
  to anon
  using (true);

-- No hay policy de UPDATE/DELETE para "anon": los cambios de estado
-- pasan por la función mark_as_found() (más abajo) y el panel admin
-- usa la service role key, que ignora RLS.

-- =========================================================
-- Función para marcar un caso como REENCONTRADO usando el
-- edit_token que recibe la persona que registró el caso
-- (sin necesidad de crear una cuenta).
-- =========================================================
create or replace function mark_as_found(case_id uuid, token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count int;
begin
  update pet_cases
  set estado = 'reencontrado', updated_at = now()
  where id = case_id and edit_token = token and estado = 'activo';

  get diagnostics updated_count = row_count;
  return updated_count > 0;
end;
$$;

-- Permite que cualquiera (rol anon) ejecute la función, pero la función
-- solo actúa si el token coincide con el del caso.
grant execute on function mark_as_found(uuid, uuid) to anon;

-- =========================================================
-- Tabla de administradores del panel (sin acceso público)
-- =========================================================
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;
-- Sin políticas para "anon": la tabla solo es accesible desde el
-- servidor usando la service role key (login admin, ver lib/auth.ts).

-- Para crear el primer administrador, genera un hash con:
--   node scripts/crear-admin.mjs tu_usuario tu_contraseña
-- y pega el INSERT que te imprime.

-- =========================================================
-- Storage: bucket público para las fotos de las mascotas
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-mascotas',
  'fotos-mascotas',
  true,
  8388608, -- 8 MB por foto
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public_upload_fotos" on storage.objects;
create policy "public_upload_fotos" on storage.objects
  for insert
  to anon
  with check (bucket_id = 'fotos-mascotas');

drop policy if exists "public_read_fotos" on storage.objects;
create policy "public_read_fotos" on storage.objects
  for select
  to anon
  using (bucket_id = 'fotos-mascotas');
