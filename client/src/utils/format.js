/** Date/number formatting helpers, Bengali & English aware. */

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBnDigits(str) {
  return String(str).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

export function formatDate(iso, lang = 'bn', opts = {}) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const locale = lang === 'bn' ? 'bn-IN' : 'en-IN';
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
      ...opts,
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

export function formatDateShort(iso, lang = 'bn') {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const locale = lang === 'bn' ? 'bn-IN' : 'en-IN';
  try {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/** {day, month, fullYear} parts for calendar-style date chips. */
export function dateParts(iso, lang = 'bn') {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return { day: '', month: '', year: '' };
  const locale = lang === 'bn' ? 'bn-IN' : 'en-IN';
  const fmt = (o) => new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Kolkata', ...o }).format(d);
  return {
    day: fmt({ day: 'numeric' }),
    month: fmt({ month: 'long' }),
    year: fmt({ year: 'numeric' }),
    weekday: fmt({ weekday: 'long' }),
  };
}

export function toDateInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function num(n, lang = 'bn') {
  if (n === undefined || n === null) return '';
  const s = String(n);
  return lang === 'bn' ? toBnDigits(s) : s;
}

/** Parse YouTube/Vimeo URLs into provider + id. */
export function parseVideoUrl(url) {
  if (!url) return null;
  const yt = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { provider: 'youtube', videoId: yt[1] };
  const vm = String(url).match(/vimeo\.com\/(\d+)/);
  if (vm) return { provider: 'vimeo', videoId: vm[1] };
  return null;
}

export function videoThumb(provider, videoId) {
  if (provider === 'youtube') return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return '';
}

export function videoEmbedUrl(provider, videoId) {
  if (provider === 'youtube') return `https://www.youtube-nocookie.com/embed/${videoId}`;
  if (provider === 'vimeo') return `https://player.vimeo.com/video/${videoId}`;
  return '';
}
