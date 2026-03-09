import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUUID, err } from '@/lib/validate';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const MAX_VOTES = 3;

export async function POST(request: Request) {
  if (!checkRateLimit(getClientIp(request))) {
    return err('Too many requests', 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err('Invalid JSON');
  }

  const { storyId, voterProfileId } = body as Record<string, unknown>;

  if (!isUUID(storyId)) return err('Invalid storyId');
  if (!isUUID(voterProfileId)) return err('Invalid voterProfileId');

  const { data: story } = await supabaseAdmin
    .from('bug_stories')
    .select('profile_id')
    .eq('id', storyId)
    .single();

  if (story && story.profile_id === voterProfileId) {
    return err('Cannot vote on your own story');
  }

  const { data: existingVote } = await supabaseAdmin
    .from('story_votes')
    .select('id')
    .eq('story_id', storyId)
    .eq('voter_profile_id', voterProfileId)
    .maybeSingle();

  if (existingVote) {
    return err('Already voted on this story');
  }

  const { count } = await supabaseAdmin
    .from('story_votes')
    .select('*', { count: 'exact', head: true })
    .eq('voter_profile_id', voterProfileId);

  if ((count ?? 0) >= MAX_VOTES) {
    return err('Maximum votes reached');
  }

  const { data, error: rpcErr } = await supabaseAdmin.rpc('cast_story_vote', {
    p_story_id: storyId,
    p_voter_id: voterProfileId,
  });

  if (rpcErr) {
    return err('Failed to cast vote', 500);
  }

  return Response.json({ voted: data as boolean });
}
