-- CatatUang Storage Setup Migration
-- 1. Create storage buckets if they do not exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('receipts', 'receipts', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set 
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Create RLS Policies for receipts bucket
-- Allow public select access to receipts (since public is true, anyone can view receipts with URL)
create policy "Allow public read receipts"
on storage.objects for select
using (bucket_id = 'receipts');

-- Allow authenticated users to upload receipts to their own folder (folder name is their user id)
create policy "Allow authenticated upload receipts"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own uploaded receipts
create policy "Allow authenticated update receipts"
on storage.objects for update
to authenticated
using (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own uploaded receipts
create policy "Allow authenticated delete receipts"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Create RLS Policies for avatars bucket
-- Allow public select access to avatars
create policy "Allow public read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars to their own folder (folder name is their user id)
create policy "Allow authenticated upload avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own uploaded avatars
create policy "Allow authenticated update avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own uploaded avatars
create policy "Allow authenticated delete avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
