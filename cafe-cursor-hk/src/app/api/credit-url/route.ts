import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUUID, err } from '@/lib/validate';
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

  const { profileId } = body as Record<string, unknown>;
  if (!isUUID(profileId)) return err('Invalid profileId');

  // Check if this profile already has a URL assigned
  const { data: existing } = await supabaseAdmin
    .from('cursor_credit_urls')
    .select('url')
    .eq('assigned_to', profileId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return Response.json({ url: existing.url });
  }

  // Atomically claim the next available URL using row-level locking
  const { data: claimed, error: claimErr } = await supabaseAdmin.rpc(
    'claim_credit_url',
    { p_profile_id: profileId }
  );

  if (claimErr || !claimed) {
    return err('No credit URLs available', 503);
  }

  return Response.json({ url: claimed });
}
