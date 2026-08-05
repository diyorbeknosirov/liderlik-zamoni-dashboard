-- =========================================================================
-- MIGRATSIYA v16 — Liderlik Zamoni rasmiy maosh reglamenti
-- SQL Editor -> New Query -> to'liq joylashtiring -> Run
-- =========================================================================

-- 1. Konsultatsiya orqali yopilgan sotuvlarni belgilash uchun
--    (bu sotuvlar komissiya hisobidan chiqariladi, o'rniga rag'batlantirish
--    puli beriladi)
alter table sales add column if not exists is_consultation_referral boolean not null default false;

-- 2. Kunlik nazorat ko'rsatkichlari (CRM va Trening — admin tomonidan
--    belgilanadi; Demo mijozlar soni — operator o'zi kiritadi)
create table if not exists daily_criteria (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references profiles(id) on delete cascade,
  work_date date not null default current_date,
  crm_ok boolean,        -- null = hali belgilanmagan, true/false = admin bahosi
  training_ok boolean,   -- null = hali belgilanmagan, true/false = admin bahosi
  demo_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(operator_id, work_date)
);

alter table daily_criteria enable row level security;

drop policy if exists "daily_criteria_select_own_or_admin" on daily_criteria;
create policy "daily_criteria_select_own_or_admin" on daily_criteria
  for select using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Operator faqat o'zining demo_count'ini kiritadi (yangi qator yaratadi)
drop policy if exists "daily_criteria_insert_own_or_admin" on daily_criteria;
create policy "daily_criteria_insert_own_or_admin" on daily_criteria
  for insert with check (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Yangilashda: operator faqat demo_count'ini, admin esa hammasini o'zgartira oladi
-- (aniqroq cheklov ilova darajasida amalga oshiriladi)
drop policy if exists "daily_criteria_update_own_or_admin" on daily_criteria;
create policy "daily_criteria_update_own_or_admin" on daily_criteria
  for update using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

alter publication supabase_realtime add table daily_criteria;
