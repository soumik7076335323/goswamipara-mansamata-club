const buildCrudRoutes = require('../utils/crudFactory');
const Member = require('../models/Member');

/**
 * Public serializer enforces privacy server-side:
 * phone/address are only emitted when the corresponding flag is enabled.
 */
const transformPublic = (doc) => {
  const out = {
    _id: doc._id,
    name: doc.name,
    designation: doc.designation,
    photo: doc.photo,
    bio: doc.bio,
    displayOrder: doc.displayOrder,
    featured: doc.featured,
  };
  if (doc.showPhone && doc.phone) out.phone = doc.phone;
  if (doc.showAddress && doc.address && (doc.address.bn || doc.address.en)) out.address = doc.address;
  return out;
};

module.exports = buildCrudRoutes({
  Model: Member,
  allowedFields: [
    'name', 'designation', 'phone', 'photo', 'address', 'bio',
    'showPhone', 'showAddress', 'displayOrder', 'active', 'featured',
  ],
  publicFilter: () => ({ active: true }),
  searchPaths: ['name.bn', 'name.en', 'designation.bn', 'designation.en'],
  listSort: { displayOrder: 1, 'name.en': 1, createdAt: 1 },
  transformPublic,
  adminQueryExtra: (req) => {
    const f = {};
    if (req.query.active === 'true') f.active = true;
    if (req.query.active === 'false') f.active = false;
    if (req.query.featured === 'true') f.featured = true;
    return f;
  },
});
