const mongoose = require('mongoose');
const { localizedString, localizedText } = require('../utils/helpers');

const memoryPhotoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: localizedString, default: () => ({}) },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: true }
);

const memorySchema = new mongoose.Schema(
  {
    title: { type: localizedString, required: true },
    description: { type: localizedText, default: () => ({}) },
    year: { type: Number, min: 1900, max: 2200 },
    date: { type: Date },
    photos: { type: [memoryPhotoSchema], default: [] },
    videoIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'Video', default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

memorySchema.index({ published: 1, year: -1, displayOrder: 1 });
module.exports = mongoose.model('Memory', memorySchema);
