const rateLimit = require('express-rate-limit');

/**
 * General rate limiter for all API endpoints
 * Allows 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the 100 requests in 15 minutes limit!',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Store in memory (for production, consider using Redis)
  // store: new RedisStore({ client: redisClient })
});

/**
 * Strict rate limiter for sensitive endpoints (auth, admin operations)
 * Allows only 5 requests per hour per IP
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the 5 requests in 1 hour limit for this endpoint!',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
});

/**
 * Medium rate limiter for webhook endpoints
 * Allows 30 requests per 15 minutes per IP
 */
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    error: 'Too many webhook requests',
    message: 'Webhook rate limit exceeded. Please wait before sending more requests.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Export rate limiter for data export endpoints
 * Allows 10 exports per hour per IP (exports can be resource-intensive)
 */
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: 'Too many export requests',
    message: 'You have exceeded the export limit. Please wait before requesting more exports.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  strictLimiter,
  webhookLimiter,
  exportLimiter
};
