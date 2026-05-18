/**
 * Simple in-memory rate limiter with a sliding-window counter.
 *
 * Designed to protect outbound API calls from hammering.
 * In production with multiple serverless instances, replace this
 * with a Redis-backed rate limiter (e.g. Upstash).
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// keyed by arbitrary identifier (e.g. IP, API name, slug)
const store = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;

/**
 * Returns true if the request is allowed, false if rate-limited.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests = MAX_REQUESTS,
  windowMs = WINDOW_MS
): boolean {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now > record.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
