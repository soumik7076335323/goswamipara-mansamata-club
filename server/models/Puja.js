const mongoose = require('mongoose');
const { localizedString, localizedText } = require('../utils/helpers');

const pujaSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, unique: true, index: true, min: 1900, max: 2200 },
    title: { type: localizedString, required: true },
    theme: { type: localizedString, default: () => ({}) },
    description: { type: localizedText, default: () => ({}) },
    bannerImage: { type: String, default: '' },
    featuredImage: { type: String, default: '' },
    startDate: { type: Date, index: true },
    endDate: { type: Date },
    published: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pujaSchema.index({ published: 1, year: -1 });
module.exports = mongoose.model('Puja', pujaSchema);
