const crypto = require("crypto");
const config = require("../config/env");

const CSRF_COOKIE = "gmmc_csrf";

/**
 * Double-submit-cookie CSRF protection.
 *
 * A non-HttpOnly cookie carries a random token; the SPA mirrors it into the
 * X-CSRF-Token header.
 *
 * Local:
 *   sameSite = lax
 *
 * Production:
 *   Frontend = Vercel
 *   Backend  = Render
 *   Therefore sameSite = none.
 */
function issueCsrfToken(res) {
  const token = crypto.randomBytes(32).toString("hex");

  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,

    sameSite: config.nodeEnv === "production" ? "none" : "lax",

    secure: config.cookieSecure,

    maxAge: 12 * 60 * 60 * 1000,

    path: "/",
  });

  return token;
}

function csrfProtection(req, res, next) {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Login is exempt — it is credential-protected and establishes the session.
  const fullPath = (req.baseUrl || "") + (req.path || "");

  if (fullPath === "/api/auth/login") {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.get("X-CSRF-Token");

  const hasAuthCookie = Boolean(req.cookies.gmmc_token);

  if (!cookieToken || !headerToken) {
    // Bearer-token calls are not ambient-auth; anonymous public calls carry no
    // authority either. Only cookie-based sessions need CSRF proof.
    if (!hasAuthCookie) {
      return next();
    }

    return res.status(403).json({
      error: "CSRF validation failed",
      code: "CSRF_FAILED",
    });
  }

  const a = Buffer.from(String(cookieToken));
  const b = Buffer.from(String(headerToken));

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({
      error: "CSRF validation failed",
      code: "CSRF_FAILED",
    });
  }

  next();
}

module.exports = {
  issueCsrfToken,
  csrfProtection,
  CSRF_COOKIE,
};
