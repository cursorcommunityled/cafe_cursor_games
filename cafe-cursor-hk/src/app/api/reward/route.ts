import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUUID, err } from '@/lib/validate';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const XP_THRESHOLD = 30;

function generateRewardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () =>
    Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `CCR-${seg()}-${new Date().getFullYear()}`;
}

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

  const { profileId } = body as Record<string, unknown>;
  if (!isUUID(profileId)) return err('Invalid profileId');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('xp')
    .eq('id', profileId)
    .single();

  if (!profile) return err('Profile not found', 404);
  if (profile.xp < XP_THRESHOLD) return err('Not enough XP to claim a reward');

  const { data: existing } = await supabaseAdmin
    .from('rewards')
    .select('code')
    .eq('profile_id', profileId)
    .eq('redeemed', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return Response.json({ code: existing.code });
  }

  const code = generateRewardCode();
  const { error: insertErr } = await supabaseAdmin
    .from('rewards')
    .insert({ profile_id: profileId, code });

  if (insertErr) {
    return err('Failed to create reward', 500);
  }

  return Response.json({ code });
}
