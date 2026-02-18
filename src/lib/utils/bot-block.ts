import { Redis } from '@upstash/redis';

const BLOCK_DURATION_SECONDS = 3600; // 1 hour
const BLOCK_KEY_PREFIX = 'bot-block:';

let redisInstance: Redis | null = null;

function getRedis(): Redis | null {
  if (redisInstance) return redisInstance;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  redisInstance = new Redis({ url, token });
  return redisInstance;
}

/** Block an IP address for 1 hour. */
export async function blockIp(ip: string): Promise<void> {
  const redis = getRedis();
  if (!redis || ip === 'unknown') return;

  try {
    await redis.set(`${BLOCK_KEY_PREFIX}${ip}`, '1', { ex: BLOCK_DURATION_SECONDS });
    console.log(`[BotBlock] Blocked IP: ${ip} for ${BLOCK_DURATION_SECONDS}s`);
  } catch (err) {
    console.error('[BotBlock] Failed to block IP:', err);
  }
}

/** Check if an IP is currently blocked. */
export async function isIpBlocked(ip: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis || ip === 'unknown') return false;

  try {
    const val = await redis.get(`${BLOCK_KEY_PREFIX}${ip}`);
    return val !== null;
  } catch (err) {
    console.error('[BotBlock] Redis lookup error:', err);
    return false; // fail open — don't block real users on Redis errors
  }
}

/**
 * Check request metadata for obvious bot signals.
 * Returns true if the request looks automated.
 */
export function hasBotSignals(data: {
  screenSize?: string;
  userAgent?: string;
}): boolean {
  // Screen size with any dimension > 10 000 is clearly fake
  if (data.screenSize) {
    const parts = data.screenSize.split('x').map(Number);
    if (parts.length === 2 && (parts[0] > 10000 || parts[1] > 10000)) {
      return true;
    }
  }

  return false;
}
