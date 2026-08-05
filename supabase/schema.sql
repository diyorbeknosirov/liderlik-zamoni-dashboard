-- =========================================================================
-- START Sales Dashboard — Supabase sxemasi
-- Supabase Dashboard -> SQL Editor -> New Query -> shu faylni joylashtiring -> Run
-- =========================================================================

-- 1. TARIFFS (kurs tariflari)
create table if not exists tariffs (
  id text primary key,
  name text not null,
  price numeric not null
);

insert into tariffs (id, name, price) values
  ('basic', 'Liderlik asoslari', 555000),
  ('advanced', 'Biznes strategiyasi', 888000),
  ('premium', 'Moliyaviy erkinlik', 1555000)
on conflict (id) do nothing;

-- 2. PROFILES (foydalanuvchi profili — auth.users bilan bog'liq)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','operator')) default 'operator',
  first_name text not null default '',
  last_name text not null default '',
  team text default 'Alpha',
  avatar_url text,
  monthly_plan numeric not null default 0,
  fixed_salary numeric not null default 0,
  bonus_rate numeric not null default 0.07,
  created_at timestamptz default now()
);

-- 3. SALES (sotuvlar / invoices)
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references profiles(id) on delete set null,
  client_name text not null,
  phone text not null,
  tariff_id text references tariffs(id),
  tariff_label text,
  amount numeric not null,
  status text not null check (status in ('Kutilmoqda','Tasdiqlangan')) default 'Kutilmoqda',
  receipt_url text,
  sale_date date not null default current_date,
  created_at timestamptz default now()
);

-- 4. TEAM_SETTINGS (umumiy jamoa rejasi — bitta qator, singleton)
create table if not exists team_settings (
  id int primary key default 1,
  monthly_plan numeric not null default 0,
  check (id = 1)
);

insert into team_settings (id, monthly_plan) values (1, 0)
on conflict (id) do nothing;

-- =========================================================================
-- RLS (Row Level Security) — har bir jadval uchun yoqiladi
-- =========================================================================
alter table profiles enable row level security;
alter table sales enable row level security;
alter table team_settings enable row level security;
alter table tariffs enable row level security;

-- Tariffs: hamma o'qiy oladi (login talab qilinadi)
create policy "tariffs_select_auth" on tariffs
  for select using (auth.role() = 'authenticated');

-- Profiles: har kim hammani ko'ra oladi (leaderboard uchun kerak),
-- lekin faqat o'zinikini yoki admin har kimni tahrirlay oladi
create policy "profiles_select_auth" on profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_update_own_or_admin" on profiles
  for update using (
    auth.uid() = id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles_insert_admin" on profiles
  for insert with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles_delete_admin" on profiles
  for delete using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Sales: hamma ko'radi (leaderboard/invoices uchun), operator faqat o'zinikini qo'sha oladi,
-- admin hammasini tahrirlay oladi
create policy "sales_select_auth" on sales
  for select using (auth.role() = 'authenticated');

create policy "sales_insert_own_or_admin" on sales
  for insert with check (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "sales_update_admin" on sales
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Team settings: hamma o'qiydi, faqat admin o'zgartiradi
create policy "team_settings_select_auth" on team_settings
  for select using (auth.role() = 'authenticated');

create policy "team_settings_update_admin" on team_settings
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- =========================================================================
-- Yangi foydalanuvchi ro'yxatdan o'tganda avtomatik profil yaratish
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'operator'),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- Realtime yoqish (yangi sotuv qo'shilganda live toast uchun)
-- =========================================================================
alter publication supabase_realtime add table sales;
