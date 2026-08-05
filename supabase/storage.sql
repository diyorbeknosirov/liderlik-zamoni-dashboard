-- =========================================================================
-- Storage bucket'lar va siyosatlar
-- Avval Dashboard -> Storage bo'limida ikkita bucket yarating:
--   1. "avatars"  — Public bucket
--   2. "receipts" — Public bucket
-- (Yaratishda "Public bucket" belgisini yoqing, aks holda rasm/chek linklari ishlamaydi)
--
-- Keyin shu faylni SQL Editor -> New Query orqali ishga tushiring.
-- =========================================================================

-- AVATARS: har kim ko'radi, faqat o'z papkasiga yozadi (papka nomi = user id)
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_own_write"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_own_update"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_own_delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- RECEIPTS: har kim ko'radi (admin tasdiqlashi uchun), faqat o'z papkasiga yozadi
create policy "receipts_public_read"
  on storage.objects for select
  using (bucket_id = 'receipts');

create policy "receipts_own_write"
  on storage.objects for insert
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
