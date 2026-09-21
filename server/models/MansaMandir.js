const mongoose = require('mongoose');
const { localizedText } = require('../utils/helpers');

/**
 * Singleton document (key: 'main') holding Mansa Mata Mandir section content.
 * All text is CMS-editable; nothing is hard-coded in the frontend.
 */
const mansaMandirSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },
    intro: { type: localizedText, default: () => ({}) },
    history: { type: localizedText, default: () => ({}) },
    pujaInfo: { type: localizedText, default: () => ({}) },
    visitInfo: { type: localizedText, default: () => ({}) },
    specialOccasions: { type: localizedText, default: () => ({}) },
    featuredImage: { type: String, default: '' },
    images: { type: [String], default: [] },
    videoIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'Video', default: [] },
  },
  { timestamps: true }
);

mansaMandirSchema.statics.getMain = async function getMain() {
  let doc = await this.findOne({ key: 'main' });
  if (!doc) doc = await this.create({ key: 'main' });
  return doc;
};

module.exports = mongoose.model('MansaMandir', mansaMandirSchema);
