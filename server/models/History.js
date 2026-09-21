const mongoose = require('mongoose');
const { localizedText } = require('../utils/helpers');

/** Singleton (key 'main') — editable club history. Ships empty by design. */
const historySchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },
    content: { type: localizedText, default: () => ({}) },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

historySchema.statics.getMain = async function getMain() {
  let doc = await this.findOne({ key: 'main' });
  if (!doc) doc = await this.create({ key: 'main' });
  return doc;
};

module.exports = mongoose.model('History', historySchema);
