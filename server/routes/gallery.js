const buildCrudRoutes = require('../utils/crudFactory');
const GalleryAlbum = require('../models/GalleryAlbum');

const transformPublic = (doc) => ({
  ...doc,
  imageCount: Array.isArray(doc.images) ? doc.images.length : 0,
  images: (doc.images || [])
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((img) => ({ _id: img._id, url: img.url, caption: img.caption })),
});

module.exports = buildCrudRoutes({
  Model: GalleryAlbum,
  allowedFields: ['title', 'description', 'coverImage', 'images', 'featured', 'published', 'displayOrder'],
  searchPaths: ['title.bn', 'title.en', 'description.bn', 'description.en'],
  listSort: { displayOrder: 1, createdAt: -1 },
  transformPublic,
  publicQueryExtra: (req) => (req.query.featured === 'true' ? { featured: true } : {}),
});
