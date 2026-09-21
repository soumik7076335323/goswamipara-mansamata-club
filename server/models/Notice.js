const mongoose = require('mongoose');
const { localizedString, localizedText } = require('../utils/helpers');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: localizedString, required: true },
    content: { type: localizedText, default: () => ({}) },
    date: { type: Date, default: Date.now, index: true },
    attachmentUrl: { type: String, default: '' },
    attachmentName: { type: String, default: '' },
    pinned: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

noticeSchema.index({ published: 1, pinned: -1, date: -1 });
module.exports = mongoose.model('Notice', noticeSchema);
