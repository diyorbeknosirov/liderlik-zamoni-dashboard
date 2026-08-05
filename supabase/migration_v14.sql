-- =========================================================================
-- MIGRATSIYA v14 — AmoCRM qo'ng'iroq vaqti integratsiyasi
-- SQL Editor -> New Query -> to'liq joylashtiring -> Run
-- =========================================================================

-- 1. Har bir operatorni AmoCRM foydalanuvchisiga bog'lash uchun maydon
alter table profiles add column if not exists amocrm_user_id text;

-- 2. AmoCRM'dan kelgan qo'ng'iroqlar jurnali (webhook orqali to'ldiriladi)
create table if not exists amocrm_call_logs (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references profiles(id) on delete cascade,
  amocrm_user_id text,
  call_date date not null default current_date,
  duration_seconds int not null default 0,
  raw_payload jsonb,
  created_at timestamptz default now()
);

alter table amocrm_call_logs enable row level security;

drop policy if exists "amocrm_call_logs_select_own_or_admin" on amocrm_call_logs;
create policy "amocrm_call_logs_select_own_or_admin" on amocrm_call_logs
  for select using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Insert faqat SERVICE ROLE (webhook) orqali amalga oshadi — RLS'ni chetlab
-- o'tadi, shuning uchun bu yerda alohida insert siyosati shart emas.

alter publication supabase_realtime add table amocrm_call_logs;
