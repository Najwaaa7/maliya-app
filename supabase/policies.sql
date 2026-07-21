-- ============================================================
-- Maliya — Row Level Security (run SECOND)
-- Every exposed table: RLS ON + owner-only read/insert/update/delete.
-- The frontend uses ONLY the publishable (anon) key; these policies
-- are what actually isolate each user's data.
-- ============================================================
alter table public.maliya_state   enable row level security;
alter table public.maliya_backups enable row level security;

drop policy if exists "state_select_own" on public.maliya_state;
drop policy if exists "state_insert_own" on public.maliya_state;
drop policy if exists "state_update_own" on public.maliya_state;
drop policy if exists "state_delete_own" on public.maliya_state;

create policy "state_select_own" on public.maliya_state
  for select using (auth.uid() = user_id);
create policy "state_insert_own" on public.maliya_state
  for insert with check (auth.uid() = user_id);
create policy "state_update_own" on public.maliya_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "state_delete_own" on public.maliya_state
  for delete using (auth.uid() = user_id);

drop policy if exists "backups_select_own" on public.maliya_backups;
drop policy if exists "backups_insert_own" on public.maliya_backups;
drop policy if exists "backups_delete_own" on public.maliya_backups;

create policy "backups_select_own" on public.maliya_backups
  for select using (auth.uid() = user_id);
create policy "backups_insert_own" on public.maliya_backups
  for insert with check (auth.uid() = user_id);
create policy "backups_delete_own" on public.maliya_backups
  for delete using (auth.uid() = user_id);
