const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const imageSize = require("image-size");
const cloudinary = require("cloudinary").v2;
const config = require("../config/env");

const UPLOAD_DIR = path.resolve(__dirname, "../uploads");

if (config.mediaDriver === "cloudinary") {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

function safeBasename(original) {
  const ext = path
    .extname(original || "")
    .toLowerCase()
    .replace(/[^.a-z0-9]/g, "");
  const base = path
    .basename(original || "file", ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const rand = crypto.randomBytes(6).toString("hex");
  return `${base || "file"}-${rand}${ext}`;
}

/** Validate and persist an uploaded image buffer. Returns media metadata. */
async function persistImage(file) {
  let width = 0;
  let height = 0;
  try {
    const dims = imageSize.imageSize(file.buffer);
    width = dims.width || 0;
    height = dims.height || 0;
    if (!width || !height) {
      const err = new Error("The uploaded file is not a valid image");
      err.status = 400;
      err.expose = true;
      throw err;
    }
    if (width > 8000 || height > 8000) {
      const err = new Error("Image dimensions are too large (max 8000×8000)");
      err.status = 400;
      err.expose = true;
      throw err;
    }
  } catch (e) {
    if (e.status) throw e;
    const err = new Error("The uploaded file is not a valid image");
    err.status = 400;
    err.expose = true;
    throw err;
  }
  return persistBuffer(file, { width, height, kind: "image" });
}

/** Validate and persist an uploaded PDF buffer. */
async function persistPdf(file) {
  const buf = file.buffer;
  if (!buf || buf.length < 5 || buf.toString("latin1", 0, 5) !== "%PDF-") {
    const err = new Error("The uploaded file is not a valid PDF");
    err.status = 400;
    err.expose = true;
    throw err;
  }
  return persistBuffer(file, { width: 0, height: 0, kind: "pdf" });
}

/** Validate and persist an uploaded video buffer (magic-byte sniffed). */
async function persistVideo(file) {
  const buf = file.buffer;
  const looksLike =
    buf &&
    buf.length > 12 &&
    // MP4 / MOV / M4V: ....ftyp
    (buf.toString("latin1", 4, 8) === "ftyp" ||
      // WebM / MKV: EBML header
      (buf[0] === 0x1a &&
        buf[1] === 0x45 &&
        buf[2] === 0xdf &&
        buf[3] === 0xa3) ||
      // AVI: RIFF....AVI
      (buf.toString("latin1", 0, 4) === "RIFF" &&
        buf.toString("latin1", 8, 12) === "AVI ") ||
      // MPEG-PS/TS sync byte
      buf[0] === 0x47 ||
      (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01));
  if (!looksLike) {
    const err = new Error("The uploaded file is not a valid video");
    err.status = 400;
    err.expose = true;
    throw err;
  }
  return persistBuffer(file, { width: 0, height: 0, kind: "video" });
}

async function persistBuffer(file, meta) {
  const filename = safeBasename(file.originalname);
  if (config.mediaDriver === "cloudinary") {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "gmmc",
          resource_type:
            meta.kind === "pdf"
              ? "raw"
              : meta.kind === "video"
                ? "video"
                : "image",
        },
        (error, result) => (error ? reject(error) : resolve(result)),
      );
      stream.end(file.buffer);
    });
    return {
      filename,
      url: result.secure_url,
      publicId: result.public_id,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size || file.buffer.length,
      width: meta.width,
      height: meta.height,
      driver: "cloudinary",
      kind: meta.kind,
    };
  }
  await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
  return {
    filename,
    url: `/uploads/${filename}`,
    publicId: "",
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: Buffer.byteLength(file.buffer),
    width: meta.width,
    height: meta.height,
    driver: "local",
    kind: meta.kind,
  };
}

/** Remove the underlying file for a media record (local driver only). */
async function deleteStoredFile(media) {
  if (!media) return;
  if (media.driver === "cloudinary" && media.publicId) {
    const resourceType =
      media.kind === "pdf" ? "raw" : media.kind === "video" ? "video" : "image";
    try {
      await cloudinary.uploader.destroy(media.publicId, {
        resource_type: resourceType,
      });
    } catch (e) {
      /* best effort */
    }
    return;
  }
  if (media.url && media.url.startsWith("/uploads/")) {
    const filename = path.basename(media.url); // prevent traversal
    const full = path.join(UPLOAD_DIR, filename);
    fs.promises.unlink(full).catch(() => {});
  }
}

module.exports = {
  persistImage,
  persistPdf,
  persistVideo,
  deleteStoredFile,
  UPLOAD_DIR,
};
