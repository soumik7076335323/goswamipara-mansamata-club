const path = require("path");
const fs = require("fs");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");

const config = require("./config/env");
const { csrfProtection } = require("./middleware/csrf");
const { apiLimiter } = require("./middleware/rateLimiters");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

/* =========================================================
   SECURITY HEADERS
========================================================= */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },

    contentSecurityPolicy:
      config.nodeEnv === "production"
        ? {
            directives: {
              defaultSrc: ["'self'"],

              imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],

              mediaSrc: ["'self'", "https://res.cloudinary.com"],

              frameSrc: [
                "https://www.youtube.com",
                "https://www.youtube-nocookie.com",
                "https://player.vimeo.com",
              ],

              scriptSrc: ["'self'"],

              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
              ],

              fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],

              connectSrc: [
                "'self'",
                "https://goswamipara-mansamata-club.onrender.com",
                "https://gmmc.vercel.app",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5000",
                "http://127.0.0.1:5000",
              ],
            },
          }
        : false,
  }),
);

/* =========================================================
   COMPRESSION
========================================================= */

app.use(compression());

/* =========================================================
   CORS
   Supports:
   - Local React: http://localhost:3000
   - Local React: http://127.0.0.1:3000
   - Vercel: https://gmmc.vercel.app
========================================================= */

app.use(
  cors({
    origin(origin, cb) {
      const allowedOrigins = new Set([
        // Frontend - Local
        "http://localhost:3000",
        "http://127.0.0.1:3000",

        // Backend - Local
        "http://localhost:5000",
        "http://127.0.0.1:5000",

        // Production Frontend
        "https://gmmc.vercel.app",

        // Production Backend
        "https://goswamipara-mansamata-club.onrender.com",

        // From .env
        ...config.allowedOrigins,
      ]);

      // Requests without Origin
      if (!origin) {
        return cb(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return cb(null, true);
      }

      console.error(`CORS blocked origin: ${origin}`);
      console.error(
        `Allowed origins: ${Array.from(allowedOrigins).join(", ")}`,
      );

      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },

    credentials: true,

    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }),
);

/* =========================================================
   BODY PARSERS
========================================================= */

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: false,
    limit: "1mb",
  }),
);

app.use(cookieParser());

/* =========================================================
   MONGO SANITIZATION
========================================================= */

app.use(mongoSanitize());

/* =========================================================
   LOGGER
========================================================= */

if (config.nodeEnv !== "production") {
  app.use(morgan("dev"));
}

/* =========================================================
   STATIC UPLOADS
========================================================= */

const uploadsDir = path.resolve(__dirname, "uploads");

fs.mkdirSync(uploadsDir, {
  recursive: true,
});

app.use(
  "/uploads",
  express.static(uploadsDir, {
    maxAge: "30d",
    immutable: true,

    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");

      res.setHeader("Content-Disposition", "inline");
    },
  }),
);

/* =========================================================
   CSRF PROTECTION
========================================================= */

app.use("/api", csrfProtection);

/* =========================================================
   API RATE LIMITER
========================================================= */

app.use("/api", apiLimiter);

/* =========================================================
   API ROUTES
========================================================= */

app.use("/api/auth", require("./routes/auth"));

app.use("/api/events", require("./routes/events"));

app.use("/api/notices", require("./routes/notices"));

app.use("/api/gallery", require("./routes/gallery"));

app.use("/api/videos", require("./routes/videos"));

app.use("/api/committee", require("./routes/committee"));

app.use("/api/members", require("./routes/members"));

app.use("/api/puja", require("./routes/puja"));

app.use("/api/mansa-mandir", require("./routes/singletons").mansaMandir);

app.use("/api/history", require("./routes/singletons").history);

app.use("/api/social-activities", require("./routes/socialActivities"));

app.use("/api/memories", require("./routes/memories"));

app.use("/api/souvenir", require("./routes/souvenirs"));

app.use("/api/contact", require("./routes/contact"));

app.use("/api/settings", require("./routes/settings"));

app.use("/api/media", require("./routes/media"));

app.use("/api/admin", require("./routes/admin"));

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
  });
});

/* =========================================================
   SITEMAP
========================================================= */

app.use("/", require("./routes/sitemap"));

/* =========================================================
   PRODUCTION REACT BUILD
========================================================= */

const buildDir = path.resolve(__dirname, "../client/build");

if (fs.existsSync(buildDir)) {
  app.use(
    express.static(buildDir, {
      maxAge: "1d",
      index: false,
    }),
  );

  app.get(/^(?!\/(?:api|uploads)(?:\/|$)).*/, (req, res) => {
    res.sendFile(path.join(buildDir, "index.html"));
  });
}

/* =========================================================
   404 + ERROR HANDLER
========================================================= */

app.use("/api", notFound);

app.use(errorHandler);

module.exports = app;
