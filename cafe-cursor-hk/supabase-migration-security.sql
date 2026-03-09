-- ============================================================
-- Security migration for existing Cafe Cursor HK deployments
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Drop old permissive "Allow all" policies
drop policy if exists "Allow all on profiles" on profiles;
drop policy if exists "Allow all on matching_pool" on matching_pool;
drop policy if exists "Allow all on matches" on matches;
drop policy if exists "Allow all on reflections" on reflections;
drop policy if exists "Allow all on rewards" on rewards;
drop policy if exists "Allow all on bug_stories" on bug_stories;
drop policy if exists "Allow all on story_votes" on story_votes;

-- 2. Create restrictive RLS policies (read-only for most tables)
create policy "Profiles: select" on profiles for select using (true);
create policy "Profiles: update" on profiles for update using (true) with check (true);

create policy "Matching pool: select" on matching_pool for select using (true);
create policy "Matches: select" on matches for select using (true);

create policy "Reflections: select" on reflections for select using (true);
create policy "Rewards: select" on rewards for select using (true);
create policy "Bug stories: select" on bug_stories for select using (true);
create policy "Story votes: select" on story_votes for select using (true);

-- 3. Restrict anon role grants

-- Profiles: select + column-restricted update only
revoke insert, delete on profiles from anon;
revoke update on profiles from anon;
grant update (name, wearing, fun_fact, interests, updated_at) on profiles to anon;

-- All other tables: select only
revoke insert, update, delete on matching_pool from anon;
revoke insert, update, delete on matches from anon;
revoke insert, update, delete on reflections from anon;
revoke insert, update, delete on rewards from anon;
revoke insert, update, delete on bug_stories from anon;
revoke insert, update, delete on story_votes from anon;

-- 4. Make matching RPCs SECURITY DEFINER so they can write
--    to matching_pool/matches despite anon having no write access
create or replace function find_and_create_match(p_profile_id uuid)
returns jsonb as $$
declare
  v_other_id uuid;
  v_match_id uuid;
  v_other_profile jsonb;
begin
  select profile_id into v_other_id
  from matching_pool
  where profile_id != p_profile_id
  order by created_at asc
  limit 1
  for update skip locked;

  if v_other_id is null then
    insert into matching_pool (profile_id)
    values (p_profile_id)
    on conflict (profile_id) do nothing;
    return null;
  end if;

  insert into matches (profile_a, profile_b)
  values (p_profile_id, v_other_id)
  returning id into v_match_id;

  delete from matching_pool
  where profile_id in (p_profile_id, v_other_id);

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

create or replace function leave_matching_pool(p_profile_id uuid)
returns void as $$
begin
  delete from matching_pool where profile_id = p_profile_id;
end;
$$ language plpgsql security definer set search_path = public;

-- 5. Revoke execute on sensitive RPCs from anon
--    These are now called only from server API routes via service_role
revoke execute on function award_xp(uuid, integer) from anon;
revoke execute on function log_conversation_xp(uuid, integer) from anon;
revoke execute on function record_daily_visit(uuid) from anon;
revoke execute on function toggle_story_vote(uuid, uuid) from anon;
