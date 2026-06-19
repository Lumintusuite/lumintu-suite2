-- Fix missing UPDATE RLS policies for orders, payments, licenses, and referrals

-- Orders table: Add UPDATE policy for admins
create policy "Admins can update orders"
  on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Payments table: Add UPDATE policy for admins
create policy "Admins can update payments"
  on public.payments
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Licenses table: Add UPDATE policy for admins
create policy "Admins can update licenses"
  on public.licenses
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Referrals table: Add UPDATE policy for admins
create policy "Admins can update referrals"
  on public.referrals
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
