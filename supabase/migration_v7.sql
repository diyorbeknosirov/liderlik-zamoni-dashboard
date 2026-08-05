-- =========================================================================
-- MIGRATSIYA v7 — Sotuv skriptlari
-- SQL Editor -> New Query -> to'liq joylashtiring -> Run
-- =========================================================================

create table if not exists scripts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table scripts enable row level security;

drop policy if exists "scripts_select_all" on scripts;
create policy "scripts_select_all" on scripts
  for select using (auth.role() = 'authenticated');

drop policy if exists "scripts_insert_admin" on scripts;
create policy "scripts_insert_admin" on scripts
  for insert with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "scripts_update_admin" on scripts;
create policy "scripts_update_admin" on scripts
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "scripts_delete_admin" on scripts;
create policy "scripts_delete_admin" on scripts
  for delete using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

alter publication supabase_realtime add table scripts;
