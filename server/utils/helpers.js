/**
 * Shared helpers: localized schema fragments, IST date utilities,
 * pagination parsing and safe regex escaping.
 */

const localizedString = {
  bn: { type: String, trim: true, default: '' },
  en: { type: String, trim: true, default: '' },
};

const localizedText = {
  bn: { type: String, default: '' },
  en: { type: String, default: '' },
};

/** Returns [start, end) Date range of "today" in Asia/Kolkata. */
function todayRangeIST() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const y = get('year');
  const m = get('month');
  const d = get('day');
  const start = new Date(`${y}-${m}-${d}T00:00:00.000+05:30`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return [start, end];
}

/** Same in a specific timezone offset — India does not observe DST, +05:30 is constant. */
function istNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePagination(query, defaults = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaults.limit || 12));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/** Strip fields from a plain object. */
function omit(obj, keys) {
  const out = { ...obj };
  keys.forEach((k) => delete out[k]);
  return out;
}

module.exports = {
  localizedString,
  localizedText,
  todayRangeIST,
  istNow,
  escapeRegex,
  parsePagination,
  asyncHandler,
  omit,
};
