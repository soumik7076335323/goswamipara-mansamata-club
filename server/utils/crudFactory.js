const express = require('express');
const { requireAuth, authorize } = require('../middleware/auth');
const { asyncHandler, parsePagination, escapeRegex } = require('./helpers');

const ADMIN_ROLES = ['admin', 'editor'];

/**
 * Build a full CRUD router for a Mongoose model.
 *
 * options:
 *   Model            — Mongoose model (required)
 *   allowedFields    — whitelist of body fields accepted on create/update (required)
 *   defaults(body)   — extra fields merged in on create
 *   publicFilter(req)— base filter for public list/detail (default: published true)
 *   searchPaths      — dotted paths searched with ?q=
 *   listSort         — public sort object
 *   transformPublic(doc) — public serializer (default: identity)
 *   publicQueryExtra(req) — additional public filter derived from query params
 *   adminQueryExtra(req)  — additional admin filter derived from query params
 *   populate         — populate spec applied to public queries
 *   publicOnly       — skip admin CRUD (rare)
 */
function buildCrudRoutes(options) {
  const {
    Model,
    allowedFields = [],
    defaults,
    publicFilter = () => ({ published: true }),
    searchPaths = [],
    listSort = { displayOrder: 1, createdAt: -1 },
    transformPublic = (d) => d,
    publicQueryExtra,
    adminQueryExtra,
    populate,
    publicOnly = false,
  } = options;

  const router = express.Router();

  const pickAllowed = (body) => {
    const out = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, key)) out[key] = body[key];
    }
    return out;
  };

  // ---------- PUBLIC ----------
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const filter = { ...publicFilter(req) };
      if (publicQueryExtra) Object.assign(filter, publicQueryExtra(req));
      if (req.query.q && searchPaths.length) {
        const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
        filter.$or = searchPaths.map((p) => ({ [p]: rx }));
      }
      const { page, limit, skip } = parsePagination(req.query, { limit: 12 });
      let query = Model.find(filter).sort(listSort).skip(skip).limit(limit);
      if (populate) query = query.populate(populate);
      const [items, total] = await Promise.all([query.lean(), Model.countDocuments(filter)]);
      res.json({
        items: items.map(transformPublic),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const filter = { _id: req.params.id, ...publicFilter(req) };
      let query = Model.findOne(filter);
      if (populate) query = query.populate(populate);
      const doc = await query.lean();
      if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
      res.json(transformPublic(doc));
    })
  );

  if (publicOnly) return router;

  // ---------- ADMIN ----------
  router.use(requireAuth, authorize(...ADMIN_ROLES));

  router.get(
    '/admin/list',
    asyncHandler(async (req, res) => {
      const filter = {};
      if (adminQueryExtra) Object.assign(filter, adminQueryExtra(req));
      if (req.query.q && searchPaths.length) {
        const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
        filter.$or = searchPaths.map((p) => ({ [p]: rx }));
      }
      const { page, limit, skip } = parsePagination(req.query, { limit: 20 });
      const [items, total] = await Promise.all([
        Model.find(filter).sort(listSort).skip(skip).limit(limit).lean(),
        Model.countDocuments(filter),
      ]);
      res.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    })
  );

  router.get(
    '/admin/:id',
    asyncHandler(async (req, res) => {
      const doc = await Model.findById(req.params.id).lean();
      if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
      res.json(doc);
    })
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const data = { ...pickAllowed(req.body), ...(defaults ? defaults(req) : {}) };
      const doc = await Model.create(data);
      res.status(201).json(doc);
    })
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const data = pickAllowed(req.body);
      const doc = await Model.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
      res.json(doc);
    })
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
      res.json({ ok: true });
    })
  );

  // Bulk reorder: body { orders: [{id, displayOrder}] }
  router.patch(
    '/reorder',
    asyncHandler(async (req, res) => {
      const orders = Array.isArray(req.body.orders) ? req.body.orders.slice(0, 500) : [];
      await Promise.all(
        orders.map((o) =>
          o && o.id && Number.isFinite(Number(o.displayOrder))
            ? Model.findByIdAndUpdate(o.id, { displayOrder: Number(o.displayOrder) })
            : null
        )
      );
      res.json({ ok: true });
    })
  );

  return router;
}

module.exports = buildCrudRoutes;
