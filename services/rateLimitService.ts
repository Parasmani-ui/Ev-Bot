/**
 * Rate Limiting Service
 * Prevents API abuse by tracking requests per IP
 * Vercel-compatible implementation (works with serverless)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

/**
 * Get client IP address (works in Vercel environment)
 */
const getClientIP = (headers?: any): string => {
  if (typeof window !== 'undefined') {
    // Client-side, use a fixed identifier
    return 'client-session';
  }

  // Server-side: extract from headers
  const forwardedFor = headers?.['x-forwarded-for'];
  const realIP = headers?.['x-real-ip'];
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown-client';
};

/**
 * Check if request should be rate limited
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export const checkRateLimit = (clientIdentifier?: string): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
  retryAfter?: number;
} => {
  const key = clientIdentifier || getClientIP();
  const now = Date.now();

  // Initialize or check existing entry
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetTime: store[key].resetTime,
    };
  }

  const entry = store[key];

  // Check if window has expired
  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + WINDOW_MS;
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
};

/**
 * Clean up old entries from store (run periodically)
 * Prevents memory issues in long-running processes
 */
export const cleanupRateLimitStore = (): void => {
  const now = Date.now();
  let cleaned = 0;

  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
      cleaned++;
    }
  }

  console.log(`[RateLimit] Cleaned up ${cleaned} expired entries`);
};

/**
 * Reset limit for a specific client (admin function)
 */
export const resetRateLimit = (clientIdentifier: string): void => {
  delete store[clientIdentifier];
  console.log(`[RateLimit] Reset limit for ${clientIdentifier}`);
};

/**
 * Get current rate limit stats
 */
export const getRateLimitStats = () => {
  return {
    windowMs: WINDOW_MS,
    maxRequests: MAX_REQUESTS,
    activeClients: Object.keys(store).length,
    totalRequests: Object.values(store).reduce((sum, entry) => sum + entry.count, 0),
  };
};
