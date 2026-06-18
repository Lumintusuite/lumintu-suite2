-- Sprint 7: email logs table

create type public.email_status as enum ('pending', 'sent', 'failed');

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email_type text not null,
  status public.email_status not null default 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index email_logs_user_id_idx on public.email_logs (user_id);
create index email_logs_email_type_idx on public.email_logs (email_type);
create index email_logs_status_idx on public.email_logs (status);

alter table public.email_logs enable row level security;

create policy "Users can read own email logs"
  on public.email_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can read all email logs"
  on public.email_logs
  for select
  to authenticated
  using (public.is_admin());
