const WINDOW_MS = 60_000;

export type RateBucket = "default" | "export" | "subscribe" | "assistant";

const BUCKET_LIMITS: Record<RateBucket, number> = {
  default: 60,
  export: 20,
  subscribe: 10,
  assistant: 20,
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function pruneExpired(now: number): void {
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  bucket: RateBucket;
}

export function resolveRateBucket(pathname: string): RateBucket {
  if (pathname.startsWith("/api/v1/export")) {
    return "export";
  }
  if (
    pathname.startsWith("/api/v1/subscribe") ||
    pathname.startsWith("/api/v1/assistant")
  ) {
    return pathname.startsWith("/api/v1/subscribe") ? "subscribe" : "assistant";
  }
  if (pathname.includes("/assistant")) {
    return "assistant";
  }
  return "default";
}

export function checkRateLimit(
  key: string,
  bucket: RateBucket = "default",
): RateLimitResult {
  const now = Date.now();
  const maxRequests = BUCKET_LIMITS[bucket];
  pruneExpired(now);

  const storeKey = `${bucket}:${key}`;
  const existing = store.get(storeKey);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    store.set(storeKey, { count: 1, resetAt });
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetAt,
      bucket,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: existing.resetAt,
      bucket,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt,
    bucket,
  };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    "X-RateLimit-Bucket": result.bucket,
  };
}
