const buildCrudRoutes = require('../utils/crudFactory');
const CommitteeMember = require('../models/CommitteeMember');

module.exports = buildCrudRoutes({
  Model: CommitteeMember,
  allowedFields: ['name', 'designation', 'photo', 'bio', 'displayOrder', 'active', 'featured'],
  publicFilter: () => ({ active: true }),
  searchPaths: ['name.bn', 'name.en', 'designation.bn', 'designation.en'],
  listSort: { displayOrder: 1, createdAt: 1 },
  adminQueryExtra: (req) => {
    const f = {};
    if (req.query.active === 'true') f.active = true;
    if (req.query.active === 'false') f.active = false;
    return f;
  },
});
