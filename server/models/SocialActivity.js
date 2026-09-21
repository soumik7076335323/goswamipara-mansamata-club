const mongoose = require('mongoose');
const { localizedString, localizedText } = require('../utils/helpers');

const socialActivitySchema = new mongoose.Schema(
  {
    title: { type: localizedString, required: true },
    description: { type: localizedText, default: () => ({}) },
    date: { type: Date },
    location: { type: localizedString, default: () => ({}) },
    category: { type: String, trim: true, default: '', index: true },
    coverImage: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

socialActivitySchema.index({ published: 1, date: -1 });
module.exports = mongoose.model('SocialActivity', socialActivitySchema);
