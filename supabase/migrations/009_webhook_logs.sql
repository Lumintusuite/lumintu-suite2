-- Sprint 8: webhook logs for production monitoring

create table public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  webhook_type text not null,
  payload jsonb,
  response_status integer,
  response_body text,
  error_message text,
  created_at timestamptz not null default now()
);

create index webhook_logs_type_idx on public.webhook_logs (webhook_type);
create index webhook_logs_created_at_idx on public.webhook_logs (created_at);

alter table public.webhook_logs enable row level security;

create policy "Admins can read all webhook logs"
  on public.webhook_logs
  for select
  to authenticated
  using (public.is_admin());
