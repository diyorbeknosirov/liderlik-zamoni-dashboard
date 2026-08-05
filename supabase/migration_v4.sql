-- =========================================================================
-- MIGRATSIYA v4 — Jamoa nomlarini yangilash (Kunduzgi / Kechki)
-- SQL Editor -> New Query -> to'liq joylashtiring -> Run
-- =========================================================================

-- Mavjud operatorlarning eski jamoa nomlarini (Alpha/Beta/Gamma) "Kunduzgi"
-- ga o'tkazamiz — buni bajargandan so'ng, admin panel orqali har bir
-- operatorni kerakli jamoaga (Kunduzgi/Kechki) qo'lda belgilashingiz mumkin.
update profiles
set team = 'Kunduzgi'
where team in ('Alpha', 'Beta', 'Gamma') or team is null;

-- Yangi operatorlar uchun standart jamoa nomini o'zgartiramiz.
alter table profiles alter column team set default 'Kunduzgi';
