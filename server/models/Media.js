const mongoose = require('mongoose');
const { localizedString } = require('../utils/helpers');

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true, index: true },
    publicId: { type: String, default: '' }, // cloudinary public id (cloud driver)
    originalName: { type: String, default: '' },
    mimeType: { type: String, required: true },
    kind: { type: String, enum: ['image', 'pdf', 'other'], default: 'image', index: true },
    size: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    driver: { type: String, enum: ['local', 'cloudinary'], default: 'local' },
    alt: { type: localizedString, default: () => ({}) },
    caption: { type: localizedString, default: () => ({}) },
    featured: { type: Boolean, default: false },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

mediaSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Media', mediaSchema);
