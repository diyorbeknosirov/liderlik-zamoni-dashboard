-- =========================================================================
-- MIGRATSIYA v2 — Yangi funksiyalar uchun
-- Bu faylni SQL Editor -> New Query orqali BUTUNLAY joylashtirib, Run bosing.
-- Xavfsiz: mavjud ma'lumotlarga ta'sir qilmaydi, faqat qo'shimcha qiladi.
-- =========================================================================

-- 1. Tarif narxlari — bu qism endi migration_v17.sql orqali boshqariladi
--    (eski tariflar o'chirilib, yangilari kiritiladi). Bu yerda hech narsa
--    qilinmaydi, faqat tarixiy izoh sifatida qoldirilgan.

-- 2. sales jadvaliga tariff_label ustuni (ixtiyoriy summa uchun)
alter table sales add column if not exists tariff_label text;

-- 3. NOTIFICATIONS jadvali (kurs tugashi haqida bildirishnoma)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id) on delete cascade,
  operator_id uuid references profiles(id) on delete cascade,
  type text not null default 'course_ended',
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

drop policy if exists "notifications_select_own_or_admin" on notifications;
create policy "notifications_select_own_or_admin" on notifications
  for select using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "notifications_update_own_or_admin" on notifications;
create policy "notifications_update_own_or_admin" on notifications
  for update using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

alter publication supabase_realtime add table notifications;

-- 4. Har kuni avtomatik tekshiruvchi funksiya:
--    Xarid sanasidan 30 kun o'tgan, hali bildirishnoma yaratilmagan sotuvlar uchun
--    "kurs tugadi" bildirishnomasini yaratadi.
create or replace function public.generate_course_end_notifications()
returns void as $$
begin
  insert into notifications (sale_id, operator_id, type, message)
  select
    s.id,
    s.operator_id,
    'course_ended',
    'Mijoz ' || s.client_name || ' (' || coalesce(t.name, s.tariff_label, 'kurs') || ') sotib olganiga 1 oy bo''ldi — kurs muddati tugadi.'
  from sales s
  left join tariffs t on t.id = s.tariff_id
  where s.status = 'Tasdiqlangan'
    and s.operator_id is not null
    and s.sale_date <= (current_date - interval '30 days')
    and not exists (
      select 1 from notifications n where n.sale_id = s.id and n.type = 'course_ended'
    );
end;
$$ language plpgsql security definer;

-- 5. Har kuni avtomatik ishga tushirish (pg_cron kengaytmasi)
create extension if not exists pg_cron;

select cron.unschedule('daily-course-end-check')
where exists (select 1 from cron.job where jobname = 'daily-course-end-check');

select cron.schedule(
  'daily-course-end-check',
  '0 3 * * *',  -- har kuni soat 03:00 da (UTC)
  $$select public.generate_course_end_notifications();$$
);

-- 6. Hozirgi vaqtda allaqachon 30 kundan oshgan sotuvlar bo'lsa,
--    ularni ham darhol tekshirib, bildirishnoma yaratamiz (birinchi marta ishga tushirish)
select public.generate_course_end_notifications();
