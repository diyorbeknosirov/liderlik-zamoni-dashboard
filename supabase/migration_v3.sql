-- =========================================================================
-- MIGRATSIYA v3 — Bonus tizimi, hisobot, tasklar, ish vaqti kuzatuvi
-- SQL Editor -> New Query -> to'liq joylashtiring -> Run
-- =========================================================================

-- 1. CALL LOGS (qo'ng'iroq/lid kundaligi — operator qo'lda kiritadi)
create table if not exists call_logs (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references profiles(id) on delete cascade,
  call_date date not null default current_date,
  duration_minutes numeric not null default 0,
  is_lead boolean not null default false,
  resulted_in_sale boolean not null default false,
  note text,
  created_at timestamptz default now()
);

alter table call_logs enable row level security;

drop policy if exists "call_logs_select_own_or_admin" on call_logs;
create policy "call_logs_select_own_or_admin" on call_logs
  for select using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "call_logs_insert_own" on call_logs;
create policy "call_logs_insert_own" on call_logs
  for insert with check (operator_id = auth.uid());

drop policy if exists "call_logs_delete_own_or_admin" on call_logs;
create policy "call_logs_delete_own_or_admin" on call_logs
  for delete using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 2. TASKS (admin yoki operatorning o'zi qo'yadigan vazifalar)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references profiles(id) on delete cascade,
  created_by uuid references profiles(id),
  title text not null,
  due_time text,          -- masalan "10:00"
  due_date date not null default current_date,
  status text not null default 'pending' check (status in ('pending','done')),
  created_at timestamptz default now()
);

alter table tasks enable row level security;

drop policy if exists "tasks_select_own_or_admin" on tasks;
create policy "tasks_select_own_or_admin" on tasks
  for select using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "tasks_insert_own_or_admin" on tasks;
create policy "tasks_insert_own_or_admin" on tasks
  for insert with check (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "tasks_update_own_or_admin" on tasks;
create policy "tasks_update_own_or_admin" on tasks
  for update using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "tasks_delete_own_or_admin" on tasks;
create policy "tasks_delete_own_or_admin" on tasks
  for delete using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

alter publication supabase_realtime add table tasks;

-- 3. WORK SESSIONS (ish vaqti kuzatuvi — login/pauza/tugatish)
create table if not exists work_sessions (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references profiles(id) on delete cascade,
  work_date date not null default current_date,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  active_seconds numeric not null default 0,   -- faol (yurgan) vaqt, sekundlarda
  status text not null default 'running' check (status in ('running','paused','stopped')),
  last_ping_at timestamptz not null default now(),
  created_at timestamptz default now()
);

alter table work_sessions enable row level security;

drop policy if exists "work_sessions_select_own_or_admin" on work_sessions;
create policy "work_sessions_select_own_or_admin" on work_sessions
  for select using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "work_sessions_insert_own" on work_sessions;
create policy "work_sessions_insert_own" on work_sessions
  for insert with check (operator_id = auth.uid());

drop policy if exists "work_sessions_update_own" on work_sessions;
create policy "work_sessions_update_own" on work_sessions
  for update using (operator_id = auth.uid());

-- 4. PROFILES jadvaliga logo/avatar uchun maxsus maydon shart emas —
--    avatar_url bo'sh bo'lganda frontend avtomatik logotipni ko'rsatadi.
