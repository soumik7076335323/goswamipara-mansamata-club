const express = require('express');
const WebsiteSettings = require('../models/WebsiteSettings');
const { requireAuth, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');
const usageService = require('../services/usageService');

const router = express.Router();

const PUBLIC_KEYS = [
  'clubName', 'establishedYear', 'registrationNumber', 'address', 'mapUrl',
  'contactEmail', 'contactPhone', 'logo', 'favicon', 'seo', 'socialLinks',
  'footerText', 'aboutIntro', 'hero', 'homeSections', 'updatedAt',
];

const publicView = (doc) => {
  const out = {};
  PUBLIC_KEYS.forEach((k) => {
    out[k] = doc[k];
  });
  return out;
};

const EDITABLE = [
  'clubName', 'establishedYear', 'registrationNumber', 'address', 'mapUrl',
  'contactEmail', 'contactPhone', 'logo', 'favicon', 'defaultLanguage', 'seo',
  'socialLinks', 'footerText', 'aboutIntro', 'hero', 'homeSections',
];

// Public read — the SPA needs site identity everywhere.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const doc = await WebsiteSettings.getMain();
    res.json(publicView(doc.toObject()));
  })
);

// Admin update
router.put(
  '/',
  requireAuth,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const update = {};
    EDITABLE.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) update[k] = req.body[k];
    });
    delete update.key;
    const doc = await WebsiteSettings.findOneAndUpdate(
      { key: 'main' },
      { $set: update, $setOnInsert: { key: 'main' } },
      { new: true, upsert: true, runValidators: true }
    );
    usageService.invalidate();
    res.json(doc);
  })
);

module.exports = router;
