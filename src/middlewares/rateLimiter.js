//ratelimiter.js
const rateLimit = new Map();

module.exports = (req, res, next) => {
  const userId = req.user?.id;
  const now = Date.now();
  const limitTime = 60000; // 1 minute

  if (!userId) return next();

  if (!rateLimit.has(userId)) {
    rateLimit.set(userId, { count: 1, lastReset: now });
  } else {
    const userData = rateLimit.get(userId);
    if (now - userData.lastReset > limitTime) {
      userData.count = 1;
      userData.lastReset = now;
    } else if (userData.count >= 5) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    } else {
      userData.count++;
    }
  }
  next();
};