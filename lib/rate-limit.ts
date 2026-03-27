/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Not suitable for horizontally-scaled deployments without Redis,
 * but sufficient for a single-instance or low-traffic Next.js app.
 */

interface Window {
  timestamps: number[];
}

const store = new Map<string, Window>();

/**
 * Check and record a request for the given key.
 * Returns true if the request is allowed, false if rate-limited.
 *
 * @param key       Unique identifier (e.g. "ip:endpoint")
 * @param limit     Max number of requests allowed within windowMs
 * @param windowMs  Rolling window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;

  const entry = store.get(key);
  const timestamps = entry ? entry.timestamps.filter((t) => t > cutoff) : [];

  if (timestamps.length >= limit) {
    // Update filtered list even on rejection to evict old entries
    store.set(key, { timestamps });
    return false;
  }

  timestamps.push(now);
  store.set(key, { timestamps });
  return true;
}

/** Extract the client IP from a Next.js request (works behind Vercel/Nginx). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
