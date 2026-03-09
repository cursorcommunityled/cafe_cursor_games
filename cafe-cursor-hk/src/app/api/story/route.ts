import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUUID, isString, err } from '@/lib/validate';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

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

  const { profileId, authorName, text } = body as Record<string, unknown>;

  if (!isUUID(profileId)) return err('Invalid profileId');
  if (!isString(authorName, 1, 100)) return err('Author name required (max 100 chars)');
  if (!isString(text, 20, 280)) return err('Story must be 20–280 characters');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .single();

  if (!profile) return err('Profile not found', 404);

  const { data, error: insertErr } = await supabaseAdmin
    .from('bug_stories')
    .insert({
      profile_id: profileId,
      author_name: (authorName as string).trim(),
      text: (text as string).trim(),
    })
    .select()
    .single();

  if (insertErr || !data) {
    return err('Failed to submit story', 500);
  }

  const { count: priorStories } = await supabaseAdmin
    .from('bug_stories')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .neq('id', data.id);

  let newXp: number | null = null;
  if (priorStories === 0) {
    const { data: xp } = await supabaseAdmin.rpc('award_xp', {
      p_profile_id: profileId,
      p_xp: 5,
    });
    newXp = xp as number | null;
  }

  return Response.json({
    story: {
      id: data.id,
      profile_id: data.profile_id,
      author_name: data.author_name,
      text: data.text,
      created_at: data.created_at,
      vote_count: 0,
      voted_by_me: false,
    },
    newXp,
    firstStory: priorStories === 0,
  });
}
