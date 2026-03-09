-- ============================================================
-- Cafe Cursor HK — Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Profiles
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  wearing text default '',
  fun_fact text default '',
  interests text[] default '{}',
  xp integer default 0,
  conversations integer default 0,
  last_visit_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Matching pool (users currently looking for a match)
create table if not exists matching_pool (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(profile_id)
);

-- 3. Matches (paired users)
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  profile_a uuid references profiles(id) on delete cascade not null,
  profile_b uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- 4. Reflections (post-conversation logs)
create table if not exists reflections (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  reflection text not null,
  created_at timestamptz default now()
);

-- 5. Rewards (redeemable coffee codes)
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  code text unique not null,
  redeemed boolean default false,
  created_at timestamptz default now()
);

-- 6. Bug stories (worst dev story game)
create table if not exists bug_stories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  author_name text not null,
  text text not null,
  created_at timestamptz default now()
);

-- 7. Story votes
create table if not exists story_votes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references bug_stories(id) on delete cascade not null,
  voter_profile_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(story_id, voter_profile_id)
);

-- 8. Cursor credit URLs (one-time-use referral links)
create table if not exists cursor_credit_urls (
  id uuid primary key default gen_random_uuid(),
  url text unique not null,
  assigned_to uuid references profiles(id) on delete set null,
  assigned_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_matching_pool_profile on matching_pool(profile_id);
create index if not exists idx_matching_pool_created on matching_pool(created_at asc);
create index if not exists idx_matches_profile_a on matches(profile_a);
create index if not exists idx_matches_profile_b on matches(profile_b);
create index if not exists idx_reflections_match on reflections(match_id);
create index if not exists idx_rewards_profile on rewards(profile_id);
create index if not exists idx_bug_stories_created on bug_stories(created_at desc);
create index if not exists idx_story_votes_story on story_votes(story_id);
create index if not exists idx_story_votes_voter on story_votes(voter_profile_id);
create index if not exists idx_credit_urls_assigned on cursor_credit_urls(assigned_to);
create index if not exists idx_credit_urls_available on cursor_credit_urls(assigned_to) where assigned_to is null;

-- ============================================================
-- Atomic matching function
-- Uses row-level locking to prevent race conditions
-- ============================================================
create or replace function find_and_create_match(p_profile_id uuid)
returns jsonb as $$
declare
  v_other_id uuid;
  v_match_id uuid;
  v_other_profile jsonb;
begin
  -- Find the oldest waiting user who isn't us, lock their row
  select profile_id into v_other_id
  from matching_pool
  where profile_id != p_profile_id
  order by created_at asc
  limit 1
  for update skip locked;

  if v_other_id is null then
    -- No one else waiting — add ourselves to the pool
    insert into matching_pool (profile_id)
    values (p_profile_id)
    on conflict (profile_id) do nothing;
    return null;
  end if;

  -- Create the match
  insert into matches (profile_a, profile_b)
  values (p_profile_id, v_other_id)
  returning id into v_match_id;

  -- Remove both users from the pool
  delete from matching_pool
  where profile_id in (p_profile_id, v_other_id);

  -- Return the match info with the other person's profile
  select jsonb_build_object(
    'match_id', v_match_id,
    'other_profile_id', v_other_id,
    'name', p.name,
    'wearing', p.wearing,
    'fun_fact', p.fun_fact
  ) into v_other_profile
  from profiles p
  where p.id = v_other_id;

  return v_other_profile;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- Function to leave the matching pool
-- ============================================================
create or replace function leave_matching_pool(p_profile_id uuid)
returns void as $$
begin
  delete from matching_pool where profile_id = p_profile_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- Award XP (generic — does NOT touch conversations count)
-- ============================================================
create or replace function award_xp(p_profile_id uuid, p_xp integer)
returns integer as $$
declare
  v_new_xp integer;
begin
  update profiles
  set xp = xp + p_xp,
      updated_at = now()
  where id = p_profile_id
  returning xp into v_new_xp;

  return v_new_xp;
end;
$$ language plpgsql;

-- ============================================================
-- Log a conversation: award XP AND increment conversation count
-- ============================================================
create or replace function log_conversation_xp(p_profile_id uuid, p_xp integer)
returns integer as $$
declare
  v_new_xp integer;
begin
  update profiles
  set xp = xp + p_xp,
      conversations = conversations + 1,
      updated_at = now()
  where id = p_profile_id
  returning xp into v_new_xp;

  return v_new_xp;
end;
$$ language plpgsql;

-- ============================================================
-- Record daily visit — awards +2 XP once per calendar day
-- Returns the new XP total (or current XP if already visited today)
-- ============================================================
create or replace function record_daily_visit(p_profile_id uuid)
returns integer as $$
declare
  v_last date;
  v_new_xp integer;
begin
  select last_visit_date, xp into v_last, v_new_xp
  from profiles
  where id = p_profile_id;

  if v_last is null or v_last < current_date then
    update profiles
    set xp = xp + 2,
        last_visit_date = current_date,
        updated_at = now()
    where id = p_profile_id
    returning xp into v_new_xp;
  end if;

  return v_new_xp;
end;
$$ language plpgsql;

-- ============================================================
-- Cast a vote on a bug story (one-way, no un-voting)
-- Awards +5 XP to the story author and +1 XP to the voter
-- ============================================================
create or replace function cast_story_vote(p_story_id uuid, p_voter_id uuid)
returns boolean as $$
declare
  v_author_id uuid;
begin
  select profile_id into v_author_id from bug_stories where id = p_story_id;
  if v_author_id is null then return false; end if;
  if v_author_id = p_voter_id then return false; end if;

  if exists(
    select 1 from story_votes
    where story_id = p_story_id and voter_profile_id = p_voter_id
  ) then
    return false;
  end if;

  insert into story_votes (story_id, voter_profile_id)
  values (p_story_id, p_voter_id);

  update profiles set xp = xp + 5, updated_at = now()
  where id = v_author_id;

  update profiles set xp = xp + 1, updated_at = now()
  where id = p_voter_id;

  return true;
end;
$$ language plpgsql;

-- ============================================================
-- Claim a one-time-use credit URL atomically
-- Returns the URL text, or NULL if none are left
-- ============================================================
create or replace function claim_credit_url(p_profile_id uuid)
returns text as $$
declare
  v_url text;
begin
  -- Already assigned?
  select url into v_url
  from cursor_credit_urls
  where assigned_to = p_profile_id
  limit 1;

  if v_url is not null then
    return v_url;
  end if;

  -- Grab the next unclaimed row with a lock
  update cursor_credit_urls
  set assigned_to = p_profile_id,
      assigned_at = now()
  where id = (
    select id from cursor_credit_urls
    where assigned_to is null
    order by created_at asc
    limit 1
    for update skip locked
  )
  returning url into v_url;

  return v_url;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- Enable Realtime on matches table so clients get notified
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'matches'
  ) then
    alter publication supabase_realtime add table matches;
  end if;
end $$;

-- ============================================================
-- Row Level Security
-- Anon can read all tables. Writes go through server API
-- routes (service_role) or SECURITY DEFINER RPCs.
-- ============================================================
alter table profiles enable row level security;
alter table matching_pool enable row level security;
alter table matches enable row level security;
alter table reflections enable row level security;
alter table rewards enable row level security;
alter table bug_stories enable row level security;
alter table story_votes enable row level security;
alter table cursor_credit_urls enable row level security;

-- Profiles: read + update safe columns (anon INSERT handled by server API)
drop policy if exists "Profiles: select" on profiles;
create policy "Profiles: select" on profiles for select using (true);
drop policy if exists "Profiles: update" on profiles;
create policy "Profiles: update" on profiles for update using (true) with check (true);

-- Matching pool / matches: read only (writes via SECURITY DEFINER RPCs)
drop policy if exists "Matching pool: select" on matching_pool;
create policy "Matching pool: select" on matching_pool for select using (true);
drop policy if exists "Matches: select" on matches;
create policy "Matches: select" on matches for select using (true);

-- Reflections, rewards, stories, votes: read only (writes via server API)
drop policy if exists "Reflections: select" on reflections;
create policy "Reflections: select" on reflections for select using (true);
drop policy if exists "Rewards: select" on rewards;
create policy "Rewards: select" on rewards for select using (true);
drop policy if exists "Bug stories: select" on bug_stories;
create policy "Bug stories: select" on bug_stories for select using (true);
drop policy if exists "Story votes: select" on story_votes;
create policy "Story votes: select" on story_votes for select using (true);
drop policy if exists "Credit URLs: select" on cursor_credit_urls;
create policy "Credit URLs: select" on cursor_credit_urls for select using (true);

-- ============================================================
-- Grant / Revoke: restrict anon role to minimum needed
-- ============================================================

-- Profiles: allow select + column-restricted update (not insert/delete).
-- XP, conversations, last_visit_date can only be changed via service_role.
revoke insert, delete on profiles from anon;
revoke update on profiles from anon;
grant update (name, wearing, fun_fact, interests, updated_at) on profiles to anon;

-- All other tables: select only for anon
revoke insert, update, delete on matching_pool from anon;
revoke insert, update, delete on matches from anon;
revoke insert, update, delete on reflections from anon;
revoke insert, update, delete on rewards from anon;
revoke insert, update, delete on bug_stories from anon;
revoke insert, update, delete on story_votes from anon;
revoke insert, update, delete on cursor_credit_urls from anon;

-- Sensitive RPCs: only callable via service_role (server API routes)
revoke execute on function award_xp(uuid, integer) from anon;
revoke execute on function log_conversation_xp(uuid, integer) from anon;
revoke execute on function record_daily_visit(uuid) from anon;
revoke execute on function cast_story_vote(uuid, uuid) from anon;
