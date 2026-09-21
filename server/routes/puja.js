const express = require('express');
const Puja = require('../models/Puja');
const PujaSchedule = require('../models/PujaSchedule');
const { requireAuth, authorize } = require('../middleware/auth');
const { asyncHandler, todayRangeIST, parsePagination } = require('../utils/helpers');

const router = express.Router();
const ADMIN_ROLES = ['admin', 'editor'];

const pujaFields = [
  'year', 'title', 'theme', 'description', 'bannerImage', 'featuredImage',
  'startDate', 'endDate', 'published', 'featured', 'displayOrder',
];
const scheduleFields = [
  'puja', 'dayLabel', 'date', 'time', 'title', 'description', 'location', 'displayOrder', 'published',
];
const pick = (body, fields) => {
  const out = {};
  fields.forEach((f) => {
    if (Object.prototype.hasOwnProperty.call(body, f)) out[f] = body[f];
  });
  return out;
};

/** Resolve the "current" puja: featured published, else latest published. */
async function getCurrentPuja() {
  const featured = await Puja.findOne({ published: true, featured: true }).sort({ year: -1 }).lean();
  if (featured) return featured;
  return Puja.findOne({ published: true }).sort({ year: -1 }).lean();
}

// ---------- PUBLIC ----------

router.get(
  '/current',
  asyncHandler(async (req, res) => {
    const puja = await getCurrentPuja();
    if (!puja) return res.json(null);
    res.json(puja);
  })
);

/** Countdown target: the current published puja start date, or null. */
router.get(
  '/countdown',
  asyncHandler(async (req, res) => {
    const puja = await Puja.findOne({ published: true, startDate: { $ne: null } })
      .sort({ featured: -1, year: -1 })
      .select('year title startDate endDate featured')
      .lean();
    if (!puja) return res.json(null);
    res.json(puja);
  })
);

/** Today's programme, computed in Asia/Kolkata. */
router.get(
  '/schedule/today',
  asyncHandler(async (req, res) => {
    const [start, end] = todayRangeIST();
    const items = await PujaSchedule.find({
      published: true,
      date: { $gte: start, $lt: end },
    })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    res.json({ date: start.toISOString(), items });
  })
);

router.get(
  '/:id/schedule',
  asyncHandler(async (req, res) => {
    const items = await PujaSchedule.find({ puja: req.params.id, published: true })
      .sort({ date: 1, displayOrder: 1 })
      .lean();
    res.json({ items });
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = { published: true };
    if (req.query.year) filter.year = Number(req.query.year);
    const { page, limit, skip } = parsePagination(req.query, { limit: 12 });
    const [items, total] = await Promise.all([
      Puja.find(filter).sort({ year: -1 }).skip(skip).limit(limit).lean(),
      Puja.countDocuments(filter),
    ]);
    res.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Puja.findOne({ _id: req.params.id, published: true }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    res.json(doc);
  })
);

// ---------- ADMIN ----------
router.use(requireAuth, authorize(...ADMIN_ROLES));

router.get(
  '/admin/list',
  asyncHandler(async (req, res) => {
    const items = await Puja.find().sort({ year: -1 }).limit(200).lean();
    res.json({ items, pagination: { page: 1, limit: 200, total: items.length, pages: 1 } });
  })
);

router.get(
  '/admin/:id',
  asyncHandler(async (req, res) => {
    const doc = await Puja.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    res.json(doc);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const doc = await Puja.create(pick(req.body, pujaFields));
    res.status(201).json(doc);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Puja.findByIdAndUpdate(req.params.id, { $set: pick(req.body, pujaFields) }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    res.json(doc);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Puja.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    await PujaSchedule.deleteMany({ puja: req.params.id });
    res.json({ ok: true });
  })
);

// ---- Schedule CRUD (admin) ----
router.get(
  '/:id/schedule/all',
  asyncHandler(async (req, res) => {
    const items = await PujaSchedule.find({ puja: req.params.id }).sort({ date: 1, displayOrder: 1 }).lean();
    res.json({ items });
  })
);

router.post(
  '/:id/schedule',
  asyncHandler(async (req, res) => {
    const data = { ...pick(req.body, scheduleFields), puja: req.params.id };
    const doc = await PujaSchedule.create(data);
    res.status(201).json(doc);
  })
);

router.put(
  '/schedule/:sid',
  asyncHandler(async (req, res) => {
    const data = pick(req.body, scheduleFields);
    delete data.puja; // schedule items cannot be moved between pujas
    const doc = await PujaSchedule.findByIdAndUpdate(req.params.sid, { $set: data }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    res.json(doc);
  })
);

router.delete(
  '/schedule/:sid',
  asyncHandler(async (req, res) => {
    const doc = await PujaSchedule.findByIdAndDelete(req.params.sid);
    if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    res.json({ ok: true });
  })
);

module.exports = router;
