-- =========================================================================
-- MIGRATSIYA v15 — Moslashtiriladigan bonus qoidalari tizimi
-- SQL Editor -> New Query -> to'liq joylashtiring -> Run
-- =========================================================================

create table if not exists bonus_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  metric text not null check (metric in (
    'sales_amount', 'conversion_rate', 'attendance_days',
    'call_minutes', 'customers_brought', 'call_quality_score'
  )),
  comparison text not null default '>=' check (comparison in ('>=', '<=', 'between')),
  threshold_min numeric not null default 0,
  threshold_max numeric,
  amount_type text not null default 'fixed' check (amount_type in ('fixed', 'percentage')),
  amount numeric not null default 0,
  active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table bonus_rules enable row level security;

drop policy if exists "bonus_rules_select_all" on bonus_rules;
create policy "bonus_rules_select_all" on bonus_rules
  for select using (auth.role() = 'authenticated');

drop policy if exists "bonus_rules_insert_admin" on bonus_rules;
create policy "bonus_rules_insert_admin" on bonus_rules
  for insert with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "bonus_rules_update_admin" on bonus_rules;
create policy "bonus_rules_update_admin" on bonus_rules
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "bonus_rules_delete_admin" on bonus_rules;
create policy "bonus_rules_delete_admin" on bonus_rules
  for delete using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

alter publication supabase_realtime add table bonus_rules;
