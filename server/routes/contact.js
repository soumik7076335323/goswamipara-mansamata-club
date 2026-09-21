const express = require('express');
const { body, validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');
const { requireAuth, authorize } = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiters');
const { asyncHandler, parsePagination } = require('../utils/helpers');

const router = express.Router();

// Public submit
router.post(
  '/',
  contactLimiter,
  [
    body('name').trim().isLength({ min: 1, max: 120 }).withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
    body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
    body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('Subject is required'),
    body('message').trim().isLength({ min: 1, max: 5000 }).withMessage('Message is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg, code: 'VALIDATION' });
    }
    const { name, email, phone, subject, message } = req.body;
    await ContactMessage.create({ name, email, phone: phone || '', subject, message });
    res.status(201).json({ ok: true });
  })
);

// Admin inbox
router.get(
  '/messages',
  requireAuth,
  authorize('admin', 'editor'),
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.archived === 'true') filter.archived = true;
    else filter.archived = { $ne: true };
    if (req.query.read === 'true') filter.read = true;
    if (req.query.read === 'false') filter.read = false;
    const { page, limit, skip } = parsePagination(req.query, { limit: 15 });
    const [items, total, unread] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ContactMessage.countDocuments(filter),
      ContactMessage.countDocuments({ read: false, archived: { $ne: true } }),
    ]);
    res.json({ items, unread, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  })
);

router.patch(
  '/messages/:id',
  requireAuth,
  authorize('admin', 'editor'),
  asyncHandler(async (req, res) => {
    const update = {};
    if (typeof req.body.read === 'boolean') update.read = req.body.read;
    if (typeof req.body.archived === 'boolean') update.archived = req.body.archived;
    const doc = await ContactMessage.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    res.json(doc);
  })
);

router.delete(
  '/messages/:id',
  requireAuth,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const doc = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    res.json({ ok: true });
  })
);

module.exports = router;
