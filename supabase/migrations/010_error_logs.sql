-- Sprint 8: error logs for production monitoring

create table public.error_logs (
  id uuid primary key default gen_random_uuid(),
  error_type text not null,
  error_message text,
  stack_trace text,
  user_id uuid references auth.users (id) on delete set null,
  path text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index error_logs_type_idx on public.error_logs (error_type);
create index error_logs_user_id_idx on public.error_logs (user_id);
create index error_logs_created_at_idx on public.error_logs (created_at);

alter table public.error_logs enable row level security;

create policy "Admins can read all error logs"
  on public.error_logs
  for select
  to authenticated
  using (public.is_admin());
