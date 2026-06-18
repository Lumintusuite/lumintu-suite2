-- Sprint 6: affiliate system tables

create type public.affiliate_status as enum ('pending', 'approved', 'rejected');
create type public.referral_status as enum ('pending', 'approved');

create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  affiliate_code text not null unique,
  status public.affiliate_status not null default 'pending',
  commission_rate numeric(5, 2) not null default 10.00 check (commission_rate >= 0 and commission_rate <= 100),
  created_at timestamptz not null default now()
);

create table public.referral_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  commission_amount numeric(10, 2) not null default 0 check (commission_amount >= 0),
  status public.referral_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.affiliate_notifications (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index affiliates_user_id_idx on public.affiliates (user_id);
create index affiliates_affiliate_code_idx on public.affiliates (affiliate_code);
create index affiliates_status_idx on public.affiliates (status);
create index referral_clicks_affiliate_id_idx on public.referral_clicks (affiliate_id);
create index referrals_affiliate_id_idx on public.referrals (affiliate_id);
create index referrals_order_id_idx on public.referrals (order_id);
create index referrals_status_idx on public.referrals (status);
create index affiliate_notifications_affiliate_id_idx on public.affiliate_notifications (affiliate_id);
create index affiliate_notifications_is_read_idx on public.affiliate_notifications (is_read);

alter table public.affiliates enable row level security;
alter table public.referral_clicks enable row level security;
alter table public.referrals enable row level security;
alter table public.affiliate_notifications enable row level security;

create policy "Users can read own affiliate"
  on public.affiliates
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can read all affiliates"
  on public.affiliates
  for select
  to authenticated
  using (public.is_admin());

create policy "Users can create own affiliate"
  on public.affiliates
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Admins can update affiliates"
  on public.affiliates
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can read own referral clicks"
  on public.referral_clicks
  for select
  to authenticated
  using (
    exists (
      select 1 from public.affiliates a
      where a.id = referral_clicks.affiliate_id and a.user_id = auth.uid()
    )
  );

create policy "Admins can read all referral clicks"
  on public.referral_clicks
  for select
  to authenticated
  using (public.is_admin());

create policy "Users can read own referrals"
  on public.referrals
  for select
  to authenticated
  using (
    exists (
      select 1 from public.affiliates a
      where a.id = referrals.affiliate_id and a.user_id = auth.uid()
    )
  );

create policy "Admins can read all referrals"
  on public.referrals
  for select
  to authenticated
  using (public.is_admin());

create policy "Users can read own notifications"
  on public.affiliate_notifications
  for select
  to authenticated
  using (
    exists (
      select 1 from public.affiliates a
      where a.id = affiliate_notifications.affiliate_id and a.user_id = auth.uid()
    )
  );

create policy "Admins can read all notifications"
  on public.affiliate_notifications
  for select
  to authenticated
  using (public.is_admin());

create policy "Users can update own notifications"
  on public.affiliate_notifications
  for update
  to authenticated
  using (
    exists (
      select 1 from public.affiliates a
      where a.id = affiliate_notifications.affiliate_id and a.user_id = auth.uid()
    )
  );
