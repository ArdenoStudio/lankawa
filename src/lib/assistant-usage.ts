/**
 * Daily per-key usage caps for the OpenAI-backed civic assistant (pre-launch P7).
 *
 * The per-minute rate limiter (src/lib/rate-limit.ts) bounds burst traffic,
 * but nothing bounded total daily LLM spend. These in-memory counters cap
 * each caller at ASSISTANT_DAILY_CAP questions per UTC day and fail closed
 * with a clear 429 once exhausted. Same caveat as the rate limiter: the
 * store is per serverless instance, so this is a backstop, not a distributed
 * quota — pair with OpenAI dashboard budgets for hard spend control.
 */

const DAY_MS = 86_400_000;

export function assistantDailyCap(): number {
  const raw = Number(process.env.ASSISTANT_DAILY_CAP);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 50;
}

interface UsageEntry {
  count: number;
  dayStart: number;
}

const usage = new Map<string, UsageEntry>();

function pruneStale(now: number): void {
  const dayStart = now - (now % DAY_MS);
  for (const [key, entry] of usage) {
    if (entry.dayStart !== dayStart) {
      usage.delete(key);
    }
  }
}

export interface AssistantUsageResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Unix seconds at which the daily window resets. */
  resetAt: number;
}

export function checkAssistantDailyUsage(key: string): AssistantUsageResult {
  const limit = assistantDailyCap();
  const now = Date.now();
  const dayStart = now - (now % DAY_MS);
  pruneStale(now);

  const existing = usage.get(key);
  if (!existing || existing.dayStart !== dayStart) {
    usage.set(key, { count: 1, dayStart });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt: Math.ceil((dayStart + DAY_MS) / 1000),
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: Math.ceil((dayStart + DAY_MS) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit,
    remaining: limit - existing.count,
    resetAt: Math.ceil((dayStart + DAY_MS) / 1000),
  };
}
