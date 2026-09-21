const buildCrudRoutes = require('../utils/crudFactory');
const SocialActivity = require('../models/SocialActivity');

module.exports = buildCrudRoutes({
  Model: SocialActivity,
  allowedFields: [
    'title', 'description', 'date', 'location', 'category',
    'coverImage', 'gallery', 'featured', 'published', 'displayOrder',
  ],
  searchPaths: ['title.bn', 'title.en', 'description.bn', 'description.en', 'category'],
  listSort: { date: -1, displayOrder: 1 },
  publicQueryExtra: (req) => (req.query.category ? { category: req.query.category } : {}),
});
