const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, default: '', maxlength: 20 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    read: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

contactMessageSchema.index({ archived: 1, read: 1, createdAt: -1 });
module.exports = mongoose.model('ContactMessage', contactMessageSchema);
