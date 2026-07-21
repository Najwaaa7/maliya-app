-- ============================================================
-- Maliya — Supabase schema (run FIRST, in the SQL editor)
-- One state document per user + cloud backups.
-- ============================================================
create table if not exists public.maliya_state (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  data           jsonb       not null,
  schema_version int         not null default 8,
  updated_at     text        not null,          -- app-side ISO stamp (optimistic concurrency token)
  device_id      text,
  saved_at       timestamptz not null default now()
);

create table if not exists public.maliya_backups (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  data       jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists maliya_backups_user_idx
  on public.maliya_backups (user_id, created_at desc);
