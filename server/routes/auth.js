const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");

const {
  signToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
  authorize,
} = require("../middleware/auth");

const { issueCsrfToken, CSRF_COOKIE } = require("../middleware/csrf");

const { loginLimiter } = require("../middleware/rateLimiters");
const { asyncHandler } = require("../utils/helpers");

const router = express.Router();

const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  lastLoginAt: u.lastLoginAt,
});

router.post(
  "/login",
  loginLimiter,
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),

    body("password")
      .isString()
      .isLength({ min: 1, max: 128 })
      .withMessage("Password is required"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
        code: "VALIDATION",
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    const dummyHash =
      "$2a$10$C6UzMDM.H6dfI/f/IKcEeO7ZBDSfZ1NbeiJ/1mVCQdNVXA03vbW0W";

    const ok = await bcrypt.compare(
      password,
      user ? user.passwordHash : dummyHash,
    );

    if (!user || !ok || !user.active) {
      return res.status(401).json({
        error: "Invalid email or password",
        code: "BAD_CREDENTIALS",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    // Create JWT
    const token = signToken(user);

    // Keep HttpOnly cookie for browsers that support the
    // Vercel -> Render cross-site cookie flow.
    setAuthCookie(res, token);

    // CSRF token
    const csrf = issueCsrfToken(res);

    // Also return JWT to the frontend.
    // The frontend stores it temporarily in sessionStorage
    // and sends it as Authorization: Bearer <token>.
    res.json({
      user: publicUser(user),
      token,
      csrfToken: csrf,
    });
  }),
);

router.post("/logout", (req, res) => {
  clearAuthCookie(res);

  res.clearCookie(CSRF_COOKIE, {
    path: "/",
  });

  res.json({
    ok: true,
  });
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const csrf = issueCsrfToken(res);

    res.json({
      user: publicUser(req.user),
      csrfToken: csrf,
    });
  }),
);

router.post(
  "/change-password",
  requireAuth,
  [
    body("currentPassword").isString().isLength({ min: 1, max: 128 }),

    body("newPassword")
      .isString()
      .isLength({ min: 8, max: 128 })
      .matches(/[0-9]/)
      .matches(/[a-zA-Z]/)
      .withMessage(
        "Password must be at least 8 characters with letters and numbers",
      ),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
        code: "VALIDATION",
      });
    }

    const user = await User.findById(req.user._id);

    const ok = await bcrypt.compare(
      req.body.currentPassword,
      user.passwordHash,
    );

    if (!ok) {
      return res.status(400).json({
        error: "Current password is incorrect",
        code: "BAD_CREDENTIALS",
      });
    }

    user.passwordHash = await bcrypt.hash(req.body.newPassword, 10);

    await user.save();

    const token = signToken(user);

    setAuthCookie(res, token);

    res.json({
      ok: true,
      token,
    });
  }),
);

// ---- User management (admin only) ----

router.get(
  "/users",
  requireAuth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      items: users,
    });
  }),
);

router.post(
  "/users",
  requireAuth,
  authorize("admin"),
  [
    body("name").trim().isLength({ min: 1, max: 120 }),

    body("email").isEmail().normalizeEmail(),

    body("password").isString().isLength({ min: 8, max: 128 }),

    body("role").optional().isIn(["admin", "editor"]),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
        code: "VALIDATION",
      });
    }

    const exists = await User.findOne({
      email: req.body.email,
    });

    if (exists) {
      return res.status(409).json({
        error: "Email already in use",
        code: "DUPLICATE",
      });
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role === "admin" ? "admin" : "editor",
      passwordHash: await bcrypt.hash(req.body.password, 10),
    });

    res.status(201).json(publicUser(user));
  }),
);

router.patch(
  "/users/:id",
  requireAuth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const update = {};

    if (typeof req.body.active === "boolean") {
      update.active = req.body.active;
    }

    if (req.body.role && ["admin", "editor"].includes(req.body.role)) {
      update.role = req.body.role;
    }

    if (req.body.name) {
      update.name = String(req.body.name).slice(0, 120);
    }

    if (req.params.id === req.user._id.toString() && update.active === false) {
      return res.status(400).json({
        error: "You cannot deactivate your own account",
        code: "SELF_DEACTIVATE",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        error: "Not found",
        code: "NOT_FOUND",
      });
    }

    res.json(publicUser(user));
  }),
);

module.exports = router;
