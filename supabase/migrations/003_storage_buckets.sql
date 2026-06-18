-- Sprint 2: storage buckets for product thumbnails and downloadable files

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'products',
    'products',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'downloads',
    'downloads',
    false,
    52428800,
    null
  )
on conflict (id) do nothing;

create policy "Public read product images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'products');

create policy "Admins upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'products' and public.is_admin());

create policy "Admins update product images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

create policy "Admins delete product images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'products' and public.is_admin());

create policy "Admins manage download files"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'downloads' and public.is_admin())
  with check (bucket_id = 'downloads' and public.is_admin());
