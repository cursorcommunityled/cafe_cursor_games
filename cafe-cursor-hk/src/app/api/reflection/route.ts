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

  const { matchId, profileId, reflection } = body as Record<string, unknown>;

  if (!isUUID(matchId)) return err('Invalid matchId');
  if (!isUUID(profileId)) return err('Invalid profileId');
  if (!isString(reflection, 1, 2000)) return err('Reflection required (max 2000 chars)');

  const { data: match } = await supabaseAdmin
    .from('matches')
    .select('profile_a, profile_b')
    .eq('id', matchId)
    .single();

  if (!match || (match.profile_a !== profileId && match.profile_b !== profileId)) {
    return err('Profile is not part of this match', 403);
  }

  const { data: existing } = await supabaseAdmin
    .from('reflections')
    .select('id')
    .eq('match_id', matchId)
    .eq('profile_id', profileId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return err('Reflection already submitted for this match');
  }

  const { error: insertErr } = await supabaseAdmin.from('reflections').insert({
    match_id: matchId,
    profile_id: profileId,
    reflection: (reflection as string).trim(),
  });

  if (insertErr) {
    return err('Failed to save reflection', 500);
  }

  const { data: newXp, error: xpErr } = await supabaseAdmin.rpc('log_conversation_xp', {
    p_profile_id: profileId,
    p_xp: 10,
  });

  if (xpErr) {
    return err('Failed to award XP', 500);
  }

  return Response.json({ newXp });
}
