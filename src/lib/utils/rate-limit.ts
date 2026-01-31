import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const limiters = new Map<string, Ratelimit>();

function createRateLimiter(prefix: string, requests: number, window: string): Ratelimit | null {
  const existing = limiters.get(prefix);
  if (existing) return existing;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    analytics: false,
    prefix,
  });

  limiters.set(prefix, limiter);
  return limiter;
}

/**
 * Check if an IP is rate limited for RSVP requests.
 * Returns true if the request should be blocked.
 * Falls back to allowing all requests if Upstash is not configured.
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  const limiter = createRateLimiter('rsvp', 10, '60 s');

  if (!limiter) {
    return false;
  }

  const { success } = await limiter.limit(ip);
  return !success;
}

/**
 * Check if a user is rate limited for AI image generation.
 * 10 generations per hour per user.
 * Returns true if the request should be blocked.
 */
export async function isAiRateLimited(userId: string): Promise<boolean> {
  const limiter = createRateLimiter('ai-gen', 10, '3600 s');

  if (!limiter) {
    return false;
  }

  const { success } = await limiter.limit(userId);
  return !success;
}
