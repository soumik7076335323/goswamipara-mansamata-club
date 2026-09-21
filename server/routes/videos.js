const buildCrudRoutes = require('../utils/crudFactory');
const Video = require('../models/Video');

module.exports = buildCrudRoutes({
  Model: Video,
  allowedFields: [
    'title', 'description', 'provider', 'videoId', 'url', 'thumbnail',
    'category', 'featured', 'published', 'displayOrder',
  ],
  searchPaths: ['title.bn', 'title.en', 'description.bn', 'description.en'],
  listSort: { displayOrder: 1, createdAt: -1 },
  publicQueryExtra: (req) => {
    const f = {};
    if (req.query.category) f.category = req.query.category;
    if (req.query.featured === 'true') f.featured = true;
    return f;
  },
});
