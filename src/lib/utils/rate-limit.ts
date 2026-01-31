import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: false,
    prefix: 'rsvp',
  });

  return ratelimit;
}

/**
 * Check if an IP is rate limited.
 * Returns true if the request should be blocked.
 * Falls back to allowing all requests if Upstash is not configured.
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  const limiter = getRatelimit();

  if (!limiter) {
    // Upstash not configured — allow request (fail-open for dev)
    return false;
  }

  const { success } = await limiter.limit(ip);
  return !success;
}
