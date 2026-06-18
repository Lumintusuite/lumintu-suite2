-- Sprint 4: payments table for Midtrans integration

create type public.payment_status as enum ('pending', 'paid', 'failed', 'expired');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  midtrans_order_id text,
  payment_method text,
  gross_amount numeric(10, 2) not null check (gross_amount >= 0),
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index payments_order_id_idx on public.payments (order_id);
create index payments_midtrans_order_id_idx on public.payments (midtrans_order_id);
create index payments_status_idx on public.payments (status);

alter table public.payments enable row level security;

create policy "Users can read own payments"
  on public.payments
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can read all payments"
  on public.payments
  for select
  to authenticated
  using (public.is_admin());

create policy "Users can create own payments"
  on public.payments
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id and o.user_id = auth.uid()
    )
  );
