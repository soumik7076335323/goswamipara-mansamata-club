const mongoose = require('mongoose');
const { localizedString, localizedText } = require('../utils/helpers');

const pujaScheduleSchema = new mongoose.Schema(
  {
    puja: { type: mongoose.Schema.Types.ObjectId, ref: 'Puja', required: true, index: true },
    dayLabel: { type: localizedString, default: () => ({}) }, // e.g. মহাষ্টমী / Maha Ashtami
    date: { type: Date, required: true, index: true },
    time: { type: String, trim: true, default: '' }, // display string, e.g. "সকাল ৯টা"
    title: { type: localizedString, required: true },
    description: { type: localizedText, default: () => ({}) },
    location: { type: localizedString, default: () => ({}) },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

pujaScheduleSchema.index({ puja: 1, date: 1, displayOrder: 1 });
module.exports = mongoose.model('PujaSchedule', pujaScheduleSchema);
