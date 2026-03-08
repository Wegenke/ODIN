const rateLimit = require('express-rate-limit')

const loginRateLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 3,
  keyGenerator: (req) => `login_${req.body.user_id}`,
  skipSuccessfulRequests: true,
  handler: (req,res) => {
    res.status(429).json({message: 'Too many failed attempts. Try again in 30 seconds.'})
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = loginRateLimiter