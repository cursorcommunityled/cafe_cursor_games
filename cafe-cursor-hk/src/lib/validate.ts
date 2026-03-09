const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v);
}

export function isString(v: unknown, min: number, max: number): v is string {
  return typeof v === 'string' && v.trim().length >= min && v.length <= max;
}

export function isEmail(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) &&
    v.length <= 254
  );
}

export function isStringArray(
  v: unknown,
  maxItems: number,
  maxItemLen: number
): v is string[] {
  return (
    Array.isArray(v) &&
    v.length <= maxItems &&
    v.every((i) => typeof i === 'string' && i.length <= maxItemLen)
  );
}

export function err(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
