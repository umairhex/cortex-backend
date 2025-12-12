import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication routes.
 * Limits to 5 attempts per 15 minutes per IP.
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});