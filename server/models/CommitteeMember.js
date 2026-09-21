const mongoose = require('mongoose');
const { localizedString, localizedText } = require('../utils/helpers');

const committeeMemberSchema = new mongoose.Schema(
  {
    name: { type: localizedString, required: true },
    designation: { type: localizedString, default: () => ({}) },
    photo: { type: String, default: '' },
    bio: { type: localizedText, default: () => ({}) },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

committeeMemberSchema.index({ active: 1, displayOrder: 1 });
module.exports = mongoose.model('CommitteeMember', committeeMemberSchema);
