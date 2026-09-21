const express = require('express');
const MansaMandir = require('../models/MansaMandir');
const History = require('../models/History');
const { requireAuth, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');
const usageService = require('../services/usageService');

/** Factory for singleton-document sections (Mansa Mandir, Club History). */
function singletonRoutes(Model, editableFields, populate) {
  const router = express.Router();

  const load = async () => {
    let query = Model.findOne({ key: 'main' });
    if (populate) query = query.populate(populate);
    let doc = await query.lean();
    if (!doc) {
      await Model.create({ key: 'main' });
      let q2 = Model.findOne({ key: 'main' });
      if (populate) q2 = q2.populate(populate);
      doc = await q2.lean();
    }
    return doc;
  };

  // Public read
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      res.json(await load());
    })
  );

  // Admin update
  router.put(
    '/',
    requireAuth,
    authorize('admin', 'editor'),
    asyncHandler(async (req, res) => {
      const update = {};
      editableFields.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(req.body, k)) update[k] = req.body[k];
      });
      await Model.findOneAndUpdate({ key: 'main' }, { $set: update }, { upsert: true, runValidators: true });
      usageService.invalidate();
      res.json(await load());
    })
  );

  return router;
}

const mansaMandir = singletonRoutes(
  MansaMandir,
  ['intro', 'history', 'pujaInfo', 'visitInfo', 'specialOccasions', 'featuredImage', 'images', 'videoIds'],
  { path: 'videoIds', select: 'title provider videoId url thumbnail' }
);

const history = singletonRoutes(History, ['content', 'images']);

module.exports = { mansaMandir, history };
