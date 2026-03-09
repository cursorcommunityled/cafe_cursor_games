import { supabaseAdmin } from '@/lib/supabase-admin';
import { isEmail, isString, isStringArray, err } from '@/lib/validate';
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

  const { email, name, wearing, funFact, interests } = body as Record<string, unknown>;

  if (!isEmail(email)) return err('Invalid email');

  const { data: allowed } = await supabaseAdmin
    .from('allowed_emails')
    .select('id')
    .eq('email', (email as string).toLowerCase())
    .maybeSingle();

  if (!allowed) {
    return err('This email is not on the guest list. Please check with an organiser.', 403);
  }

  if (!isString(name, 1, 100)) return err('Name required (max 100 chars)');
  if (!isString(wearing, 1, 200)) return err('Wearing required (max 200 chars)');
  if (funFact !== undefined && funFact !== '' && !isString(funFact, 0, 500)) {
    return err('Fun fact too long (max 500 chars)');
  }
  if (interests !== undefined && !isStringArray(interests, 5, 50)) {
    return err('Invalid interests (max 5 items, 50 chars each)');
  }

  const { data: profile, error: upsertErr } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        email,
        name,
        wearing,
        fun_fact: (funFact as string) || '',
        interests: (interests as string[]) || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select()
    .single();

  if (upsertErr || !profile) {
    return err('Failed to create profile', 500);
  }

  if (profile.xp === 0) {
    const { data: newXp } = await supabaseAdmin.rpc('award_xp', {
      p_profile_id: profile.id,
      p_xp: 5,
    });
    profile.xp = newXp ?? 5;
  }

  return Response.json({ profile });
}
