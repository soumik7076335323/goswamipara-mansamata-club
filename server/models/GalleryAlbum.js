const mongoose = require('mongoose');
const { localizedString, localizedText } = require('../utils/helpers');

const photoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: localizedString, default: () => ({}) },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: true }
);

const albumSchema = new mongoose.Schema(
  {
    title: { type: localizedString, required: true },
    description: { type: localizedText, default: () => ({}) },
    coverImage: { type: String, default: '' },
    images: { type: [photoSchema], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

albumSchema.index({ published: 1, displayOrder: 1, createdAt: -1 });
module.exports = mongoose.model('GalleryAlbum', albumSchema);
