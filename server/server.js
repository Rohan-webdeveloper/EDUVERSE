const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const connectDB = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');
const { preventKeyLeak, validateEnvKeys, extraSecurityHeaders } = require('./middleware/security');
const User = require('./models/User');

// Validate environment variables at startup
validateEnvKeys();

// Route imports
const authRoutes = require('./routes/auth.routes');
const videoRoutes = require('./routes/video.routes');
const aiRoutes = require('./routes/ai.routes');
const playlistRoutes = require('./routes/playlist.routes');
const notesRoutes = require('./routes/notes.routes');
const communityRoutes = require('./routes/community.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Connect to database
connectDB();

const app = express();

// ━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE
// ━━━━━━━━━━━━━━━━━━━━━━
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5174',
    ];
    // Allow same-origin requests (no origin header) and Vercel preview URLs
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);
app.use(extraSecurityHeaders);
app.use(preventKeyLeak);

// ━━━━━━━━━━━━━━━━━━━━━━
// GOOGLE OAUTH SETUP
// ━━━━━━━━━━━━━━━━━━━━━━
const googleClientId = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id' ? process.env.GOOGLE_CLIENT_ID : 'dummy-google-client-id';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret' ? process.env.GOOGLE_CLIENT_SECRET : 'dummy-google-client-secret';
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback';

passport.use(new GoogleStrategy({
  clientID: googleClientId,
  clientSecret: googleClientSecret,
  callbackURL: googleCallbackUrl,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        if (!user.avatar) user.avatar = profile.photos[0]?.value;
        await user.save({ validateBeforeSave: false });
      } else {
        const role = profile.emails[0].value === process.env.ADMIN_EMAIL ? 'admin' : 'student';
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value,
          isEmailVerified: true,
          role,
        });
      }
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

app.use(passport.initialize());

// ━━━━━━━━━━━━━━━━━━━━━━
// ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'EduVerse AI Server is running 🚀', timestamp: new Date().toISOString() });
});

// ━━━━━━━━━━━━━━━━━━━━━━
// ERROR HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━
// START SERVER
// ━━━━━━━━━━━━━━━━━━━━━━
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 EduVerse AI Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
