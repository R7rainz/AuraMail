import { Request, Response, NextFunction } from "express";

interface rateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface userRateLimit {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, userRateLimit>();

setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) rateLimitStore.delete(userId);
  }
}, 5 * 60 * 1000);

//per-user rate limiter - this prevents quota exhaustion by limiting requests per user
export function createRateLimiter(config: rateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = "Too many requests, please try again later",
  } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body.userId || req.query.userId;

    const now = Date.now();
    const userLimit = rateLimitStore.get(userId as string);

    if (!userLimit || now > userLimit.resetTime) {
      rateLimitStore.set(userId as string, {
        //new window
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      const resetIn = Math.ceil((userLimit.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: resetIn,
        limit: maxRequests,
        window: windowMs / 1000,
      });
    }

    userLimit.count++;
    next();
  };
}

//get current rate limit status for a user
export function getRateLimitStatus(userId: string): {
  remaining: number;
  resetTime: number;
  total: number;
} | null {
  const userLimit = rateLimitStore.get(userId);
  if (!userLimit) return null;

  return {
    remaining: Math.max(0, 100 - userLimit.count),
    resetTime: userLimit.resetTime,
    total: 100,
  };
}

//clear rate limit for a specific user - useful for testing or admin override
export function clearRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
}
