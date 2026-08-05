-- =========================================================================
-- MIGRATSIYA v6 — Team Leader roli
-- SQL Editor -> New Query -> to'liq joylashtiring -> Run
-- =========================================================================

-- 1. Team Leader belgisi (role='operator' bo'lib qoladi, faqat qo'shimcha huquq)
alter table profiles add column if not exists is_team_leader boolean not null default false;

-- 2. Profiles: Team Leader o'z jamoasiga yangi a'zo qo'shishi/tahrirlashi mumkin
drop policy if exists "profiles_insert_admin" on profiles;
create policy "profiles_insert_admin_or_leader" on profiles
  for insert with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    or exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.is_team_leader = true and p.team = profiles.team
    )
  );

drop policy if exists "profiles_update_own_or_admin" on profiles;
create policy "profiles_update_own_or_admin" on profiles
  for update using (
    auth.uid() = id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    or exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.is_team_leader = true and p.team = profiles.team
    )
  );

-- 3. Tasks: Team Leader o'z jamoa a'zolariga vazifa tayinlashi mumkin
drop policy if exists "tasks_select_own_or_admin" on tasks;
create policy "tasks_select_own_or_admin" on tasks
  for select using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    or exists (
      select 1 from profiles leader
      join profiles target on target.team = leader.team
      where leader.id = auth.uid() and leader.is_team_leader = true and target.id = tasks.operator_id
    )
  );

drop policy if exists "tasks_insert_own_or_admin" on tasks;
create policy "tasks_insert_own_or_admin" on tasks
  for insert with check (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    or exists (
      select 1 from profiles leader
      join profiles target on target.team = leader.team
      where leader.id = auth.uid() and leader.is_team_leader = true and target.id = operator_id
    )
  );

drop policy if exists "tasks_update_own_or_admin" on tasks;
create policy "tasks_update_own_or_admin" on tasks
  for update using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    or exists (
      select 1 from profiles leader
      join profiles target on target.team = leader.team
      where leader.id = auth.uid() and leader.is_team_leader = true and target.id = tasks.operator_id
    )
  );

drop policy if exists "tasks_delete_own_or_admin" on tasks;
create policy "tasks_delete_own_or_admin" on tasks
  for delete using (
    operator_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    or exists (
      select 1 from profiles leader
      join profiles target on target.team = leader.team
      where leader.id = auth.uid() and leader.is_team_leader = true and target.id = tasks.operator_id
    )
  );
