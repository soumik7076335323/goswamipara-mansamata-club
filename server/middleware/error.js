const config = require('../config/env');

function notFound(req, res, next) {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Mongoose validation
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ error: 'Validation failed', code: 'VALIDATION', details });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid identifier', code: 'BAD_ID' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate value', code: 'DUPLICATE', details: err.keyValue });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large', code: 'TOO_LARGE' });
  }
  if (err.name === 'MulterError') {
    const map = { LIMIT_FILE_SIZE: 'File too large', LIMIT_UNEXPECTED_FILE: 'Unexpected file field' };
    return res.status(400).json({ error: map[err.code] || err.message, code: 'UPLOAD_ERROR' });
  }
  if (err.status && err.expose) {
    return res.status(err.status).json({ error: err.message, code: err.code || 'REQUEST_ERROR' });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL',
    ...(config.nodeEnv !== 'production' ? { detail: err.message } : {}),
  });
}

module.exports = { notFound, errorHandler };
