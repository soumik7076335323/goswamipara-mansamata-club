const multer = require('multer');
const config = require('../config/env');

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PDF_MIMES = ['application/pdf'];
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const PDF_EXTS = ['.pdf'];

const storage = multer.memoryStorage();

const imageUpload = multer({
  storage,
  limits: { fileSize: config.uploadMaxImageMb * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_MIMES.includes(file.mimetype)) return cb(null, true);
    const err = new Error('Only JPEG, PNG, WebP or GIF images are allowed');
    err.status = 400;
    err.expose = true;
    return cb(err);
  },
});

const pdfUpload = multer({
  storage,
  limits: { fileSize: config.uploadMaxPdfMb * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    // Some browsers send generic mime for PDFs; verify by magic bytes later too.
    if (PDF_MIMES.includes(file.mimetype) || file.mimetype === 'application/octet-stream') return cb(null, true);
    const err = new Error('Only PDF files are allowed');
    err.status = 400;
    err.expose = true;
    return cb(err);
  },
});

module.exports = { imageUpload, pdfUpload, IMAGE_MIMES, PDF_MIMES, IMAGE_EXTS, PDF_EXTS };
