import { headers } from "next/headers";

type RateLimitBucket = {
  failures: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export const LOGIN_RATE_LIMIT = 5;
export const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

function getBucket(key: string): RateLimitBucket {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    return { failures: 0, resetAt: now + LOGIN_RATE_WINDOW_MS };
  }

  return existing;
}

export async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();

  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}

export function isRateLimited(
  key: string,
  limit = LOGIN_RATE_LIMIT,
): boolean {
  return getBucket(key).failures >= limit;
}

export function recordRateLimitFailure(key: string): void {
  const now = Date.now();
  const bucket = getBucket(key);

  buckets.set(key, {
    failures: bucket.failures + 1,
    resetAt: bucket.resetAt,
  });
}

export function clearRateLimit(key: string): void {
  buckets.delete(key);
}
