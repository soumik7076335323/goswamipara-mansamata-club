const mongoose = require("mongoose");
const { localizedString, localizedText } = require("../utils/helpers");

const videoSchema = new mongoose.Schema(
  {
    title: { type: localizedString, required: true },
    description: { type: localizedText, default: () => ({}) },
    provider: {
      type: String,
      enum: ["youtube", "vimeo", "file"],
      required: true,
    },
    videoId: {
      type: String,
      trim: true,
      default: "",
      required: function requiredForEmbed() {
        return this.provider !== "file";
      },
    },
    url: { type: String, trim: true, default: "" },
    // Uploaded video file (media library URL) — used when provider === 'file'
    fileUrl: {
      type: String,
      trim: true,
      default: "",
      required: function requiredForFile() {
        return this.provider === "file";
      },
    },
    thumbnail: { type: String, default: "" },
    category: { type: String, trim: true, default: "" },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Video", videoSchema);
