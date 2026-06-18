-- Sprint 5: licenses and license_activations tables

create type public.license_status as enum ('active', 'expired', 'suspended');

create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  license_key text not null unique,
  status public.license_status not null default 'active',
  expires_at timestamptz,
  activation_count integer not null default 0 check (activation_count >= 0),
  max_activations integer not null default 1 check (max_activations > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.license_activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses (id) on delete cascade,
  device_name text,
  domain_name text,
  ip_address text,
  activated_at timestamptz not null default now()
);

create index licenses_user_id_idx on public.licenses (user_id);
create index licenses_product_id_idx on public.licenses (product_id);
create index licenses_order_id_idx on public.licenses (order_id);
create index licenses_license_key_idx on public.licenses (license_key);
create index licenses_status_idx on public.licenses (status);
create index license_activations_license_id_idx on public.license_activations (license_id);

alter table public.licenses enable row level security;
alter table public.license_activations enable row level security;

create policy "Users can read own licenses"
  on public.licenses
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can read all licenses"
  on public.licenses
  for select
  to authenticated
  using (public.is_admin());

create policy "Users can read own license activations"
  on public.license_activations
  for select
  to authenticated
  using (
    exists (
      select 1 from public.licenses l
      where l.id = license_activations.license_id and l.user_id = auth.uid()
    )
  );

create policy "Admins can read all license activations"
  on public.license_activations
  for select
  to authenticated
  using (public.is_admin());

create trigger licenses_updated_at
  before update on public.licenses
  for each row
  execute function public.handle_updated_at();
