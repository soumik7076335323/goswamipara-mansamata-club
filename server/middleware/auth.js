const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

const TOKEN_COOKIE = 'gmmc_token';

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

function setAuthCookie(res, token) {
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookieSecure,
    maxAge: 12 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearAuthCookie(res) {
  res.clearCookie(TOKEN_COOKIE, { httpOnly: true, sameSite: 'lax', secure: config.cookieSecure, path: '/' });
}

/** Require a valid JWT (from HttpOnly cookie or Authorization: Bearer). */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token =
      req.cookies[TOKEN_COOKIE] ||
      (header && header.startsWith('Bearer ') ? header.slice(7) : null);
    if (!token) return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch (e) {
      return res.status(401).json({ error: 'Session expired or invalid', code: 'AUTH_INVALID' });
    }
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Account not available', code: 'AUTH_INVALID' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** Role-based authorization. Usage: authorize('admin') or authorize('admin', 'editor') */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
    }
    next();
  };
}

module.exports = { signToken, setAuthCookie, clearAuthCookie, requireAuth, authorize, TOKEN_COOKIE };
