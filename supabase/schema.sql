-- Family Chips Database Schema
-- Run this in your Supabase SQL editor

-- Players table
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  chips integer not null default 10,
  revived_count integer not null default 0,
  is_active boolean not null default true,
  is_playing boolean not null default false,
  created_at timestamptz not null default now()
);

-- Transactions table
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  amount integer not null,
  note text,
  type text not null check (type in ('initial','revival','cash_out','cash_in')),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists transactions_player_id_idx on transactions(player_id);
create index if not exists transactions_created_at_idx on transactions(created_at desc);
create index if not exists players_chips_idx on players(chips desc);

-- Enable real-time for the players table
-- (Run this or enable via Supabase dashboard: Table Editor > players > Realtime toggle)
alter publication supabase_realtime add table players;

-- Row Level Security (RLS)
-- Public can read players and transactions
alter table players enable row level security;
alter table transactions enable row level security;

create policy "Public can read players"
  on players for select
  using (true);

create policy "Public can read transactions"
  on transactions for select
  using (true);

-- Only service role (used by our API routes) can write
-- The service key bypasses RLS by default, so no insert/update policies needed
-- when using the service role key. If you're using the anon key for writes,
-- uncomment and adjust these:

-- create policy "Service role can write players"
--   on players for all
--   using (auth.role() = 'service_role');

-- create policy "Service role can write transactions"
--   on transactions for all
--   using (auth.role() = 'service_role');

-- ============================================================
-- MIGRATION: Run these if upgrading an existing database
-- (Skip if creating fresh from this schema)
-- ============================================================

-- alter table players add column if not exists is_playing boolean not null default false;

-- alter table transactions drop constraint if exists transactions_type_check;
-- alter table transactions add constraint transactions_type_check
--   check (type in ('initial','revival','cash_out','cash_in'));
