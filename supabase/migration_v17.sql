-- =========================================================================
-- MIGRATSIYA v17 — Yangi tariflar va to'liq lid voronkasi (CRM analitikasi)
-- SQL Editor -> New Query -> to'liq joylashtiring -> Run
-- =========================================================================

-- 1. Tariflarni yangilash
delete from tariffs where id in ('basic', 'advanced', 'premium');
insert into tariffs (id, name, price) values
  ('online_start', 'Onlayn Start', 3000000),
  ('premyum', 'Premyum (oflayn)', 7000000),
  ('vip', 'VIP', 10000000)
on conflict (id) do update set name = excluded.name, price = excluded.price;

-- 2. daily_lead_stats jadvalini yangi voronka bosqichlariga moslashtirish
--    (eski ustunlarni olib tashlab, yangilarini qo'shamiz)
alter table daily_lead_stats drop column if exists prioritet;
alter table daily_lead_stats drop column if exists aloqa_ornatildi;
alter table daily_lead_stats drop column if exists qayta_aloqa;
alter table daily_lead_stats drop column if exists malumot_berildi;
alter table daily_lead_stats drop column if exists tolovga_rozi;
alter table daily_lead_stats drop column if exists birinchi_tolov;
alter table daily_lead_stats drop column if exists sotuv;
alter table daily_lead_stats drop column if exists otkaz_qimmat;
alter table daily_lead_stats drop column if exists otkaz_adashgan;
alter table daily_lead_stats drop column if exists otkaz_nedozvon;
alter table daily_lead_stats drop column if exists otkaz_kerak_emas;
alter table daily_lead_stats drop column if exists otkaz_hozir_emas;

-- Yangi voronka bosqichlari
alter table daily_lead_stats add column if not exists yangi_lid int not null default 0;
alter table daily_lead_stats add column if not exists qayta_aloqa int not null default 0;
alter table daily_lead_stats add column if not exists aloqa_ornatildi int not null default 0;
alter table daily_lead_stats add column if not exists malumot_berildi int not null default 0;
alter table daily_lead_stats add column if not exists demoga_yozildi int not null default 0;
alter table daily_lead_stats add column if not exists demoga_keladi int not null default 0;
alter table daily_lead_stats add column if not exists shartnoma int not null default 0;
alter table daily_lead_stats add column if not exists won int not null default 0;

-- Yangi "lost" (otkaz) sabablari
alter table daily_lead_stats add column if not exists lost_sabab_nomalum int not null default 0;
alter table daily_lead_stats add column if not exists lost_qimmat int not null default 0;
alter table daily_lead_stats add column if not exists lost_nedozvon int not null default 0;
alter table daily_lead_stats add column if not exists lost_kerak_emas int not null default 0;
alter table daily_lead_stats add column if not exists lost_dubl int not null default 0;
alter table daily_lead_stats add column if not exists lost_adashib_otgan int not null default 0;
alter table daily_lead_stats add column if not exists lost_kontaktda_xatolik int not null default 0;
alter table daily_lead_stats add column if not exists lost_hozir_emas int not null default 0;
