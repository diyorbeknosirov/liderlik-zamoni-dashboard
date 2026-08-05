-- =========================================================================
-- MIGRATSIYA v9 — Qo'ng'iroq tahlili: struktura baholash tizimi
-- SQL Editor -> New Query -> to'liq joylashtiring -> Run
-- =========================================================================

alter table call_analyses add column if not exists score_voice_tone int;
alter table call_analyses add column if not exists score_speech int;
alter table call_analyses add column if not exists score_confidence int;
alter table call_analyses add column if not exists score_script_adherence int;
alter table call_analyses add column if not exists score_overall int;
alter table call_analyses add column if not exists success_rate numeric;
alter table call_analyses add column if not exists analysis_json jsonb;
