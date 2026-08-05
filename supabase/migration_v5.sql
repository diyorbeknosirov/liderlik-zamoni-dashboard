-- =========================================================================
-- MIGRATSIYA v5 — Lid analitikasi, otkaz sabablari, davomat/maosh tizimi
-- SQL Editor -> New Query -> to'liq joylashtiring -> Run
-- =========================================================================

create table if not exists daily_lead_stats (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references profiles(id) on delete cascade,
  stat_date date not null default current_date,

  -- Lid bosqichlari (operator kiritadi)
  prioritet int not null default 0,
  aloqa_ornatildi int not null default 0,
  qayta_aloqa int not null default 0,
  malumot_berildi int not null default 0,
  tolovga_rozi int not null default 0,
  birinchi_tolov int not null default 0,
  sotuv int not null default 0,

  -- Otkaz sabablari (operator kiritadi)
  otkaz_qimmat int not null default 0,
  otkaz_adashgan int not null default 0,
  otkaz_nedozvon int not null default 0,
  otkaz_kerak_emas int not null default 0,
  otkaz_hozir_emas int not null default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(operator_id, stat_date)
);

alter table daily_lead_stats enable row level security;

drop policy if exists "lead_stats_select_own_or_admin" on daily_lead_stats;
create policy "lead_stats_select_own_or_admin" on daily_lead_stats
  for select using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "lead_stats_insert_own" on daily_lead_stats;
create policy "lead_stats_insert_own" on daily_lead_stats
  for insert with check (operator_id = auth.uid());

drop policy if exists "lead_stats_update_own" on daily_lead_stats;
create policy "lead_stats_update_own" on daily_lead_stats
  for update using (operator_id = auth.uid());

alter publication supabase_realtime add table daily_lead_stats;
