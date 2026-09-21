const mongoose = require('mongoose');
const { localizedString, localizedText } = require('../utils/helpers');

const memberSchema = new mongoose.Schema(
  {
    name: { type: localizedString, required: true },
    designation: { type: localizedString, default: () => ({}) },
    phone: { type: String, trim: true, default: '', maxlength: 20 },
    photo: { type: String, default: '' },
    address: { type: localizedText, default: () => ({}) },
    bio: { type: localizedText, default: () => ({}) },
    // Privacy flags — enforced at API serialization level, never only in CSS.
    showPhone: { type: Boolean, default: false },
    showAddress: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

memberSchema.index({ active: 1, displayOrder: 1 });

/**
 * Public serialization — privacy enforced server-side.
 * Phone/address are projected out at query level AND removed here as a second gate.
 */
memberSchema.statics.publicFields =
  'name designation photo bio displayOrder featured showPhone showAddress createdAt updatedAt';

memberSchema.methods.toPublic = function toPublic() {
  const doc = this.toObject ? this.toObject() : this;
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
  if (doc.showAddress && doc.address) out.address = doc.address;
  return out;
};

module.exports = mongoose.model('Member', memberSchema);
