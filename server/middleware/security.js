/**
 * Security Middleware for EduVerse AI
 * Sanitizes inputs, validates API keys at startup, prevents key leaks
 */

/**
 * Sanitize search query - prevent injection and abuse
 */
const sanitizeQuery = (req, res, next) => {
  if (req.query.q) {
    // Remove potentially dangerous characters
    req.query.q = req.query.q
      .replace(/[<>{}]/g, '')     // Remove HTML/template chars
      .replace(/javascript:/gi, '')  // Prevent JS injection
      .replace(/on\w+=/gi, '')     // Remove event handlers
      .trim()
      .slice(0, 200);             // Max 200 chars for search query

    if (!req.query.q) {
      return res.status(400).json({ success: false, message: 'Invalid search query' });
    }
  }

  // Sanitize all string query params
  for (const key of Object.keys(req.query)) {
    if (typeof req.query[key] === 'string') {
      req.query[key] = req.query[key].replace(/[<>{}]/g, '').trim().slice(0, 100);
    }
  }

  next();
};

/**
 * Prevent API key leak - strip any env secrets from responses
 */
const preventKeyLeak = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    const jsonStr = JSON.stringify(data);
    // Check if any API key is accidentally in the response
    const sensitiveKeys = [
      process.env.YOUTUBE_API_KEY,
      process.env.GEMINI_API_KEY,
      process.env.JWT_SECRET,
      process.env.JWT_REFRESH_SECRET,
      process.env.GOOGLE_CLIENT_SECRET,
    ].filter(Boolean);

    for (const key of sensitiveKeys) {
      if (jsonStr.includes(key)) {
        console.error('🚨 SECURITY: Blocked response containing sensitive key!');
        return originalJson({ success: false, message: 'Internal server error' });
      }
    }
    return originalJson(data);
  };
  next();
};

/**
 * Validate required environment variables at startup
 */
const validateEnvKeys = () => {
  const required = ['YOUTUBE_API_KEY', 'GEMINI_API_KEY'];
  const warnings = ['MONGODB_URI', 'JWT_SECRET'];
  const errors = [];

  for (const key of required) {
    const val = process.env[key];
    if (!val || val.startsWith('your_')) {
      errors.push(`❌ ${key} is not configured`);
    }
  }

  for (const key of warnings) {
    const val = process.env[key];
    if (!val || val.startsWith('your_')) {
      console.warn(`⚠️  Warning: ${key} is not configured — some features may not work`);
    }
  }

  if (errors.length > 0) {
    console.error('\n🔒 Missing required environment variables:');
    errors.forEach(e => console.error(`   ${e}`));
    console.error('   → Update your .env file and restart\n');
  }

  // Validate YouTube API key format
  const ytKey = process.env.YOUTUBE_API_KEY;
  if (ytKey && !ytKey.startsWith('your_')) {
    if (!ytKey.startsWith('AIza') || ytKey.length < 30) {
      console.warn('⚠️  YOUTUBE_API_KEY format looks invalid (should start with AIza and be ~39 chars)');
    } else {
      console.log('✅ YouTube API key configured and valid format');
    }
  }

  // Validate Gemini API key format
  const gemKey = process.env.GEMINI_API_KEY;
  if (gemKey && !gemKey.startsWith('your_')) {
    if (gemKey.length < 20) {
      console.warn('⚠️  GEMINI_API_KEY format looks too short');
    } else {
      console.log('✅ Gemini API key configured and valid format');
    }
  }
};

/**
 * Sanitize AI request body inputs — prevent prompt injection
 */
const sanitizeAIInput = (req, res, next) => {
  if (req.body) {
    const stringFields = ['question', 'topic', 'goal', 'interests', 'skills', 'videoTitle', 'channelTitle'];
    for (const field of stringFields) {
      if (typeof req.body[field] === 'string') {
        req.body[field] = req.body[field]
          .replace(/[<>{}]/g, '')
          .replace(/```/g, '')          // Strip code blocks that could trick the model
          .replace(/\bsystem\s*:/gi, '') // Remove "system:" prompt injection attempts
          .replace(/\bignore\s+previous\b/gi, '') // Block "ignore previous instructions"
          .trim()
          .slice(0, 2000);              // Max 2000 chars per field
      }
    }
  }
  next();
};

/**
 * Add security headers beyond what helmet provides
 */
const extraSecurityHeaders = (req, res, next) => {
  // Never cache API responses containing sensitive data
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
  }
  // Prevent browser from sniffing MIME types
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

module.exports = { sanitizeQuery, sanitizeAIInput, preventKeyLeak, validateEnvKeys, extraSecurityHeaders };
