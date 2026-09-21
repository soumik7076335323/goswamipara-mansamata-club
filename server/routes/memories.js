const buildCrudRoutes = require('../utils/crudFactory');
const Memory = require('../models/Memory');

const transformPublic = (doc) => ({
  ...doc,
  photos: (doc.photos || [])
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((p) => ({ _id: p._id, url: p.url, caption: p.caption })),
});

module.exports = buildCrudRoutes({
  Model: Memory,
  allowedFields: ['title', 'description', 'year', 'date', 'photos', 'videoIds', 'featured', 'published', 'displayOrder'],
  searchPaths: ['title.bn', 'title.en', 'description.bn', 'description.en'],
  listSort: { year: -1, displayOrder: 1, createdAt: -1 },
  transformPublic,
  populate: { path: 'videoIds', select: 'title provider videoId url thumbnail' },
  publicQueryExtra: (req) => (req.query.year ? { year: Number(req.query.year) } : {}),
});
