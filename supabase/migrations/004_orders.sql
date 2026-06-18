-- Sprint 3: orders and order_items

create type public.order_status as enum ('pending', 'completed', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.order_status not null default 'pending',
  total numeric(10, 2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  price numeric(10, 2) not null check (price >= 0),
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users can read own orders"
  on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can read all orders"
  on public.orders
  for select
  to authenticated
  using (public.is_admin());

create policy "Users can create own orders"
  on public.orders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can read own order items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can read all order items"
  on public.order_items
  for select
  to authenticated
  using (public.is_admin());

create trigger orders_updated_at
  before update on public.orders
  for each row
  execute function public.handle_updated_at();
