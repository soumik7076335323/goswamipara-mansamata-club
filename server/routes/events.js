const buildCrudRoutes = require('../utils/crudFactory');
const Event = require('../models/Event');

module.exports = buildCrudRoutes({
  Model: Event,
  allowedFields: [
    'title', 'description', 'date', 'time', 'location', 'category',
    'coverImage', 'gallery', 'featured', 'published', 'displayOrder',
  ],
  searchPaths: ['title.bn', 'title.en', 'description.bn', 'description.en', 'category'],
  listSort: { date: 1, displayOrder: 1 },
  publicQueryExtra: (req) => {
    const f = {};
    if (req.query.category) f.category = req.query.category;
    if (req.query.featured === 'true') f.featured = true;
    const now = new Date();
    if (req.query.when === 'upcoming') f.date = { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
    if (req.query.when === 'past') f.date = { $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
    return f;
  },
  adminQueryExtra: (req) => {
    const f = {};
    if (req.query.published === 'true') f.published = true;
    if (req.query.published === 'false') f.published = false;
    if (req.query.category) f.category = req.query.category;
    return f;
  },
});
