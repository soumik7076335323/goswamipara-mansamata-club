const mongoose = require('mongoose');
const { localizedString, localizedText } = require('../utils/helpers');

const souvenirSchema = new mongoose.Schema(
  {
    editionYear: { type: Number, required: true, index: true, min: 1900, max: 2200 },
    title: { type: localizedString, required: true },
    description: { type: localizedText, default: () => ({}) },
    coverImage: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

souvenirSchema.index({ published: 1, editionYear: -1 });
module.exports = mongoose.model('Souvenir', souvenirSchema);
