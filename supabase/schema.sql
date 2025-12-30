create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'wines'
  ) then
    create table public.wines (
      id uuid primary key default gen_random_uuid(),
      image_url text,
      producer text not null,
      appellation text,
      vintage text,
      type text not null check (type in ('rød', 'hvid', 'rosé', 'mousserende')),
      country text,
      wine_district text,
      cuvee text,
      grapes text,
      alcohol text,
      vineyard text,
      notes text,
      created_at timestamptz not null default now()
    );
  end if;
end
$$;

alter table public.wines
  add column if not exists country text,
  add column if not exists wine_district text,
  add column if not exists cuvee text,
  add column if not exists grapes text,
  add column if not exists alcohol text,
  add column if not exists vineyard text,
  add column if not exists balance integer check (balance IS NULL OR balance IN (80, 85, 90, 95, 100)),
  add column if not exists length integer check (length IS NULL OR length IN (80, 85, 90, 95, 100)),
  add column if not exists intensity integer check (intensity IS NULL OR intensity IN (80, 85, 90, 95, 100)),
  add column if not exists complexity integer check (complexity IS NULL OR complexity IN (80, 85, 90, 95, 100)),
  add column if not exists smagsnote text;

alter table public.wines
  alter column image_url drop not null;

alter table public.wines enable row level security;

create policy "Enable read access for authenticated users" on public.wines
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users" on public.wines
  for insert with check (
    auth.role() = 'authenticated'
  );

create policy "Enable update for owners" on public.wines
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on public.wines
  for delete using (auth.role() = 'authenticated');

