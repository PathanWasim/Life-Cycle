const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Campaign operations rate limiter
const campaignLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 campaign operations per minute
  message: {
    success: false,
    message: 'Too many campaign operations, please try again later.'
  }
});

// Registration rate limiter
const registrationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 registrations per minute
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later.'
  }
});

module.exports = {
  apiLimiter,
  campaignLimiter,
  registrationLimiter
};