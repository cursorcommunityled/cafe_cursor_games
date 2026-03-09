// In-memory sliding-window rate limiter.
// For multi-instance deployments (e.g. Vercel), replace with
// Redis / Upstash for cross-instance enforcement.

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = store.get(ip);

  if (!bucket || now > bucket.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });

    if (store.size > 1000) {
      for (const [k, v] of store) {
        if (now > v.resetAt) store.delete(k);
      }
    }

    return true;
  }

  if (bucket.count >= MAX_REQUESTS) return false;
  bucket.count++;
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}
