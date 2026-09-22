const express = require("express");
const Media = require("../models/Media");
const { requireAuth, authorize } = require("../middleware/auth");
const {
  imageUpload,
  pdfUpload,
  videoUpload,
} = require("../middleware/uploadMiddleware");
const { uploadLimiter } = require("../middleware/rateLimiters");
const {
  persistImage,
  persistPdf,
  persistVideo,
  deleteStoredFile,
} = require("../services/mediaService");
const usageService = require("../services/usageService");
const { asyncHandler, parsePagination } = require("../utils/helpers");

const router = express.Router();

// Public list of published-for-frontend media is not needed publicly;
// all media endpoints are admin-only by design (media URLs surface via content).
router.use(requireAuth, authorize("admin", "editor"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (
      req.query.kind &&
      ["image", "pdf", "video", "other"].includes(req.query.kind)
    )
      filter.kind = req.query.kind;
    if (req.query.q) {
      const rx = new RegExp(
        String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filter.$or = [
        { originalName: rx },
        { "alt.en": rx },
        { "alt.bn": rx },
        { "caption.en": rx },
        { "caption.bn": rx },
      ];
    }
    const { page, limit, skip } = parsePagination(req.query, { limit: 24 });
    const [items, total, usageMap] = await Promise.all([
      Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Media.countDocuments(filter),
      usageService.getUsageMap(),
    ]);
    const withUsage = items.map((m) => {
      const u = usageMap.get(m.url);
      return { ...m, usageCount: u ? u.count : 0, usedIn: u ? u.places : [] };
    });
    res.json({
      items: withUsage,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }),
);

router.post(
  "/upload",
  uploadLimiter,
  imageUpload.array("files", 10),
  asyncHandler(async (req, res) => {
    if (!req.files || !req.files.length) {
      return res
        .status(400)
        .json({ error: "No file uploaded", code: "NO_FILE" });
    }
    const created = [];
    for (const file of req.files) {
      const meta = await persistImage(file);
      const doc = await Media.create({ ...meta, uploadedBy: req.user._id });
      created.push(doc);
    }
    usageService.invalidate();
    res.status(201).json({ items: created });
  }),
);

router.post(
  "/upload-pdf",
  uploadLimiter,
  pdfUpload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ error: "No file uploaded", code: "NO_FILE" });
    const meta = await persistPdf(req.file);
    const doc = await Media.create({ ...meta, uploadedBy: req.user._id });
    usageService.invalidate();
    res.status(201).json(doc);
  }),
);

router.post(
  "/upload-video",
  uploadLimiter,
  videoUpload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ error: "No file uploaded", code: "NO_FILE" });
    const meta = await persistVideo(req.file);
    const doc = await Media.create({ ...meta, uploadedBy: req.user._id });
    usageService.invalidate();
    res.status(201).json(doc);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const update = {};
    ["alt", "caption"].forEach((k) => {
      if (req.body[k]) update[k] = req.body[k];
    });
    if (typeof req.body.featured === "boolean")
      update.featured = req.body.featured;
    const doc = await Media.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true },
    );
    if (!doc)
      return res.status(404).json({ error: "Not found", code: "NOT_FOUND" });
    res.json(doc);
  }),
);

/** Replace file content of an existing media record (keeps the same record/id). */
router.post(
  "/:id/replace",
  uploadLimiter,
  imageUpload.single("file"),
  asyncHandler(async (req, res) => {
    const doc = await Media.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ error: "Not found", code: "NOT_FOUND" });
    if (!req.file)
      return res
        .status(400)
        .json({ error: "No file uploaded", code: "NO_FILE" });
    const meta = await persistImage(req.file);
    await deleteStoredFile(doc);
    Object.assign(doc, meta, {
      alt: doc.alt,
      caption: doc.caption,
      featured: doc.featured,
    });
    await doc.save();
    usageService.invalidate();
    res.json(doc);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const doc = await Media.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ error: "Not found", code: "NOT_FOUND" });
    const usageMap = await usageService.getUsageMap();
    const usage = usageMap.get(doc.url);
    if (usage && usage.count > 0 && req.query.force !== "true") {
      return res.status(409).json({
        error: "This file is in use",
        code: "IN_USE",
        usageCount: usage.count,
        usedIn: usage.places,
      });
    }
    await deleteStoredFile(doc);
    await doc.deleteOne();
    usageService.invalidate();
    res.json({ ok: true });
  }),
);

module.exports = router;
