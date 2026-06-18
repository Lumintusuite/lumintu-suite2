-- Sprint 2: categories and products

create type public.product_status as enum ('draft', 'published');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null default 0 check (price >= 0),
  status public.product_status not null default 'draft',
  thumbnail_path text,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_status_idx on public.products (status);
create index categories_slug_idx on public.categories (slug);
create index products_slug_idx on public.products (slug);

alter table public.categories enable row level security;
alter table public.products enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Admins can manage categories"
  on public.categories
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Authenticated users can read categories"
  on public.categories
  for select
  to authenticated
  using (true);

create policy "Admins can manage products"
  on public.products
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can read published products"
  on public.products
  for select
  to authenticated
  using (status = 'published' or public.is_admin());

create trigger categories_updated_at
  before update on public.categories
  for each row
  execute function public.handle_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row
  execute function public.handle_updated_at();
