const express = require('express');
const config = require('../config/env');
const { asyncHandler } = require('../utils/helpers');
const Event = require('../models/Event');
const GalleryAlbum = require('../models/GalleryAlbum');

const router = express.Router();

router.get('/robots.txt', (req, res) => {
  const base = config.publicUrl.replace(/\/$/, '');
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${base}/sitemap.xml\n`);
});

const STATIC_PATHS = [
  '', '/about', '/durga-puja', '/events', '/notices', '/gallery', '/videos',
  '/committee', '/members', '/social-activities', '/mansa-mandir',
  '/memories', '/souvenir', '/contact',
];

router.get(
  '/sitemap.xml',
  asyncHandler(async (req, res) => {
    const base = config.publicUrl.replace(/\/$/, '');
    const urls = STATIC_PATHS.map((p) => ({ loc: `${base}${p || '/'}`, priority: p === '' ? '1.0' : '0.7' }));
    const [events, albums] = await Promise.all([
      Event.find({ published: true }).select('_id updatedAt').lean(),
      GalleryAlbum.find({ published: true }).select('_id updatedAt').lean(),
    ]);
    events.forEach((e) => urls.push({ loc: `${base}/events/${e._id}`, priority: '0.5', lastmod: e.updatedAt }));
    albums.forEach((a) => urls.push({ loc: `${base}/gallery/${a._id}`, priority: '0.5', lastmod: a.updatedAt }));
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map(
          (u) =>
            `  <url>\n    <loc>${u.loc}</loc>\n` +
            (u.lastmod ? `    <lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>\n` : '') +
            `    <priority>${u.priority}</priority>\n  </url>`
        )
        .join('\n') +
      `\n</urlset>\n`;
    res.type('application/xml').send(xml);
  })
);

module.exports = router;
