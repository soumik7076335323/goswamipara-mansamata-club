const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

const config = require('./config/env');
const { csrfProtection } = require('./middleware/csrf');
const { apiLimiter } = require('./middleware/rateLimiters');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images to be embedded by the SPA
    contentSecurityPolicy:
      config.nodeEnv === 'production'
        ? {
            directives: {
              defaultSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
              mediaSrc: ["'self'", 'https://res.cloudinary.com'],
              frameSrc: ['https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://player.vimeo.com'],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
              connectSrc: ["'self'"],
            },
          }
        : false,
  })
);
app.use(compression());
app.use(
  cors({
    origin(origin, cb) {
      // Same-origin (SPA via proxy / production static) has no Origin header.
      if (!origin || config.allowedOrigins.includes(origin) || config.nodeEnv !== 'production') return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
if (config.nodeEnv !== 'production') app.use(morgan('dev'));

// Static uploads (local media driver)
const uploadsDir = path.resolve(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '30d',
    immutable: true,
    setHeaders(res) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline');
    },
  })
);

// CSRF guard for all mutating API calls
app.use('/api', csrfProtection);
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/committee', require('./routes/committee'));
app.use('/api/members', require('./routes/members'));
app.use('/api/puja', require('./routes/puja'));
app.use('/api/mansa-mandir', require('./routes/singletons').mansaMandir);
app.use('/api/history', require('./routes/singletons').history);
app.use('/api/social-activities', require('./routes/socialActivities'));
app.use('/api/memories', require('./routes/memories'));
app.use('/api/souvenir', require('./routes/souvenirs'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/media', require('./routes/media'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/', require('./routes/sitemap'));

// Serve the production React build
const buildDir = path.resolve(__dirname, '../client/build');
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir, { maxAge: '1d', index: false }));
  app.get(/^(?!\/(api|uploads)\/).*/, (req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });
}

app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
