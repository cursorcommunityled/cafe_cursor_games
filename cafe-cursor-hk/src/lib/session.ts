import { createHmac, timingSafeEqual } from 'crypto';
import { err } from '@/lib/validate';

const COOKIE = 'cafe_profile';
const MAX_AGE = 60 * 60 * 24 * 7;

function secret(): string {
  const value =
    process.env.SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    '';
  if (!value) {
    throw new Error('Missing SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY) for profile cookies');
  }
  return value;
}

function sign(profileId: string): string {
  return createHmac('sha256', secret()).update(profileId).digest('hex');
}

function cookieHeader(profileId: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=${profileId}.${sign(profileId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`;
}

export function withProfileCookie(response: Response, profileId: string): Response {
  response.headers.append('Set-Cookie', cookieHeader(profileId));
  return response;
}

export function readProfileId(request: Request): string | null {
  const raw = request.headers.get('cookie') ?? '';
  const match = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return null;
  const [profileId, mac] = match[1].split('.');
  if (!profileId || !mac) return null;
  const expected = sign(profileId);
  const a = Buffer.from(mac, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return profileId;
}

export function requireProfileId(request: Request, claimed?: unknown): string | Response {
  const cookieId = readProfileId(request);
  if (!cookieId) {
    return err('Not authenticated', 401);
  }
  if (typeof claimed === 'string' && claimed && claimed !== cookieId) {
    return err('Profile mismatch', 403);
  }
  return cookieId;
}
