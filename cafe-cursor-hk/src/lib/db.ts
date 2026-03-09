import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ProfileRow {
  id: string;
  email: string;
  name: string;
  wearing: string;
  fun_fact: string;
  interests: string[];
  xp: number;
  conversations: number;
  created_at: string;
  updated_at: string;
}

export interface MatchRow {
  id: string;
  profile_a: string;
  profile_b: string;
  created_at: string;
}

export interface MatchResult {
  match_id: string;
  other_profile_id: string;
  name: string;
  wearing: string;
  fun_fact: string;
}

// ─── Stats ─────────────────────────────────────────────────

export async function getMatchCount(): Promise<number> {
  const { count, error } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching match count:', error);
    return 0;
  }

  return count || 0;
}

export async function getMemberCount(): Promise<number> {
  const { count, error } = await supabase
    .from('allowed_emails')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching member count:', error);
    return 0;
  }

  return count || 0;
}

const PROFILE_ID_KEY = 'cafe-cursor-hk-profile-id';

export function getStoredProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PROFILE_ID_KEY);
}

export function setStoredProfileId(id: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_ID_KEY, id);
  }
}

export function clearStoredProfileId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PROFILE_ID_KEY);
  }
}

// ─── Email Allowlist ──────────────────────────────────────

export async function isEmailAllowed(email: string): Promise<boolean> {
  const { data } = await supabase
    .from('allowed_emails')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  return !!data;
}

// ─── Profile Operations ────────────────────────────────────

export async function upsertProfile(data: {
  email: string;
  name: string;
  wearing: string;
  funFact: string;
  interests: string[];
}): Promise<ProfileRow | null> {
  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const { profile } = await res.json();
    setStoredProfileId(profile.id);
    return profile as ProfileRow;
  } catch (err) {
    console.error('Error upserting profile:', err);
    return null;
  }
}

export async function updateProfile(
  profileId: string,
  data: {
    name?: string;
    wearing?: string;
    funFact?: string;
    interests?: string[];
  }
): Promise<ProfileRow | null> {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.wearing !== undefined) updateData.wearing = data.wearing;
  if (data.funFact !== undefined) updateData.fun_fact = data.funFact;
  if (data.interests !== undefined) updateData.interests = data.interests;

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profileId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return profile as ProfileRow;
}

export async function getProfile(profileId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as ProfileRow;
}

export async function getProfileByEmail(email: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    return null;
  }

  return data as ProfileRow;
}

// ─── Matching Operations ───────────────────────────────────

export async function enterMatchingPool(profileId: string): Promise<MatchResult | null> {
  const { data, error } = await supabase.rpc('find_and_create_match', {
    p_profile_id: profileId,
  });

  if (error) {
    console.error('Error entering matching pool:', error);
    return null;
  }

  return data as MatchResult | null;
}

export async function leaveMatchingPool(profileId: string): Promise<void> {
  await supabase.rpc('leave_matching_pool', {
    p_profile_id: profileId,
  });
}

export function subscribeToMatches(
  profileId: string,
  onMatch: (match: MatchRow) => void
): RealtimeChannel {
  return supabase
    .channel(`matches:${profileId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
      },
      (payload) => {
        const match = payload.new as MatchRow;
        if (match.profile_a === profileId || match.profile_b === profileId) {
          onMatch(match);
        }
      }
    )
    .subscribe();
}

export async function getMatchPartnerProfile(
  match: MatchRow,
  myProfileId: string
): Promise<ProfileRow | null> {
  const partnerId = match.profile_a === myProfileId ? match.profile_b : match.profile_a;
  return getProfile(partnerId);
}

// ─── XP Operations ────────────────────────────────────────

export async function refreshXp(profileId: string): Promise<{ xp: number; conversations: number } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('xp, conversations')
    .eq('id', profileId)
    .single();

  if (error) {
    console.error('Error refreshing XP:', error);
    return null;
  }

  return data as { xp: number; conversations: number };
}

// ─── Reflection ───────────────────────────────────────────

export async function submitReflection(
  matchId: string,
  profileId: string,
  reflection: string
): Promise<number | null> {
  try {
    const res = await fetch('/api/reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, profileId, reflection }),
    });
    if (!res.ok) return null;
    const { newXp } = await res.json();
    return newXp as number;
  } catch (err) {
    console.error('Error submitting reflection:', err);
    return null;
  }
}

// ─── Bug Stories ──────────────────────────────────────────

export interface StoryRow {
  id: string;
  profile_id: string;
  author_name: string;
  text: string;
  created_at: string;
  vote_count: number;
  voted_by_me: boolean;
}

export async function fetchStories(viewerProfileId: string): Promise<StoryRow[]> {
  const { data: stories, error } = await supabase
    .from('bug_stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !stories) {
    console.error('Error fetching stories:', error);
    return [];
  }

  const storyIds = stories.map((s: { id: string }) => s.id);

  const { data: allVotes } = await supabase
    .from('story_votes')
    .select('story_id, voter_profile_id')
    .in('story_id', storyIds);

  const votes = allVotes || [];

  return stories.map((s: { id: string; profile_id: string; author_name: string; text: string; created_at: string }) => {
    const storyVotes = votes.filter((v: { story_id: string }) => v.story_id === s.id);
    return {
      id: s.id,
      profile_id: s.profile_id,
      author_name: s.author_name,
      text: s.text,
      created_at: s.created_at,
      vote_count: storyVotes.length,
      voted_by_me: storyVotes.some((v: { voter_profile_id: string }) => v.voter_profile_id === viewerProfileId),
    };
  });
}

export async function submitStory(
  profileId: string,
  authorName: string,
  text: string
): Promise<StoryRow | null> {
  try {
    const res = await fetch('/api/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, authorName, text }),
    });
    if (!res.ok) return null;
    const { story } = await res.json();
    return story as StoryRow;
  } catch (err) {
    console.error('Error submitting story:', err);
    return null;
  }
}

export async function toggleVote(
  storyId: string,
  voterProfileId: string
): Promise<boolean | null> {
  try {
    const res = await fetch('/api/story/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, voterProfileId }),
    });
    if (!res.ok) return null;
    const { voted } = await res.json();
    return voted as boolean;
  } catch (err) {
    console.error('Error toggling vote:', err);
    return null;
  }
}

export async function getVotesUsedCount(profileId: string): Promise<number> {
  const { count, error } = await supabase
    .from('story_votes')
    .select('*', { count: 'exact', head: true })
    .eq('voter_profile_id', profileId);

  if (error) {
    console.error('Error counting votes:', error);
    return 0;
  }

  return count || 0;
}

// ─── Rewards ──────────────────────────────────────────────

export async function getOrCreateReward(profileId: string): Promise<string | null> {
  try {
    const res = await fetch('/api/reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    });
    if (!res.ok) return null;
    const { code } = await res.json();
    return code as string;
  } catch (err) {
    console.error('Error getting reward:', err);
    return null;
  }
}

export async function claimCreditUrl(profileId: string): Promise<string | null> {
  try {
    const res = await fetch('/api/credit-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    });
    if (!res.ok) return null;
    const { url } = await res.json();
    return url as string;
  } catch (err) {
    console.error('Error claiming credit URL:', err);
    return null;
  }
}
