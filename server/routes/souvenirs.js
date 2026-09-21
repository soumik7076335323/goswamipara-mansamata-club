const buildCrudRoutes = require('../utils/crudFactory');
const Souvenir = require('../models/Souvenir');

module.exports = buildCrudRoutes({
  Model: Souvenir,
  allowedFields: ['editionYear', 'title', 'description', 'coverImage', 'pdfUrl', 'featured', 'published', 'displayOrder'],
  searchPaths: ['title.bn', 'title.en', 'description.bn', 'description.en'],
  listSort: { editionYear: -1, displayOrder: 1 },
});
