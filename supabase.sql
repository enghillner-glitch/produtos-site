create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(12, 2) not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.products enable row level security;

create policy "Permitir leitura publica de produtos"
  on public.products
  for select
  using (true);

create policy "Permitir cadastro publico de produtos"
  on public.products
  for insert
  with check (true);

create policy "Permitir edicao publica de produtos"
  on public.products
  for update
  using (true)
  with check (true);

create policy "Permitir exclusao publica de produtos"
  on public.products
  for delete
  using (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Permitir leitura publica de imagens"
  on storage.objects
  for select
  using (bucket_id = 'product-images');

create policy "Permitir envio publico de imagens"
  on storage.objects
  for insert
  with check (bucket_id = 'product-images');
