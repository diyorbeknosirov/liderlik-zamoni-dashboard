-- =========================================================================
-- MIGRATSIYA v8 — Qo'ng'iroq tahlili (AI orqali)
-- SQL Editor -> New Query -> to'liq joylashtiring -> Run
-- =========================================================================

create table if not exists call_analyses (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references profiles(id) on delete cascade,
  client_name text,
  phone text,
  audio_path text not null,
  transcript text,
  analysis text,
  status text not null default 'processing' check (status in ('processing','done','error')),
  error_message text,
  created_at timestamptz default now()
);

alter table call_analyses enable row level security;

drop policy if exists "call_analyses_select_own_or_admin" on call_analyses;
create policy "call_analyses_select_own_or_admin" on call_analyses
  for select using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "call_analyses_insert_own" on call_analyses;
create policy "call_analyses_insert_own" on call_analyses
  for insert with check (operator_id = auth.uid());

drop policy if exists "call_analyses_update_own_or_admin" on call_analyses;
create policy "call_analyses_update_own_or_admin" on call_analyses
  for update using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

alter publication supabase_realtime add table call_analyses;

-- Storage: "call-recordings" bucket (PRIVATE — public emas!) yarating,
-- keyin quyidagi siyosatlarni ishga tushiring.
create policy "call_recordings_own_read"
  on storage.objects for select
  using (bucket_id = 'call-recordings' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "call_recordings_admin_read"
  on storage.objects for select
  using (
    bucket_id = 'call-recordings'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "call_recordings_own_write"
  on storage.objects for insert
  with check (bucket_id = 'call-recordings' and (storage.foldername(name))[1] = auth.uid()::text);
