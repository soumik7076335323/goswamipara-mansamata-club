const buildCrudRoutes = require('../utils/crudFactory');
const Notice = require('../models/Notice');

module.exports = buildCrudRoutes({
  Model: Notice,
  allowedFields: ['title', 'content', 'date', 'attachmentUrl', 'attachmentName', 'pinned', 'published'],
  searchPaths: ['title.bn', 'title.en', 'content.bn', 'content.en'],
  listSort: { pinned: -1, date: -1 },
  publicQueryExtra: (req) => (req.query.pinned === 'true' ? { pinned: true } : {}),
  adminQueryExtra: (req) => {
    const f = {};
    if (req.query.published === 'true') f.published = true;
    if (req.query.published === 'false') f.published = false;
    if (req.query.pinned === 'true') f.pinned = true;
    return f;
  },
});
