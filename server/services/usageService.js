/**
 * Computes where media URLs are referenced across content collections,
 * so the Media Library can show "Used in X places" and block unsafe deletes.
 */
const Event = require('../models/Event');
const Notice = require('../models/Notice');
const GalleryAlbum = require('../models/GalleryAlbum');
const Video = require('../models/Video');
const CommitteeMember = require('../models/CommitteeMember');
const Member = require('../models/Member');
const Puja = require('../models/Puja');
const MansaMandir = require('../models/MansaMandir');
const SocialActivity = require('../models/SocialActivity');
const History = require('../models/History');
const Memory = require('../models/Memory');
const Souvenir = require('../models/Souvenir');
const WebsiteSettings = require('../models/WebsiteSettings');

const MODELS = [
  { Model: Event, label: 'Events' },
  { Model: Notice, label: 'Notices' },
  { Model: GalleryAlbum, label: 'Gallery albums' },
  { Model: Video, label: 'Videos' },
  { Model: CommitteeMember, label: 'Committee' },
  { Model: Member, label: 'Members' },
  { Model: Puja, label: 'Durga Puja' },
  { Model: MansaMandir, label: 'Mansa Mandir' },
  { Model: SocialActivity, label: 'Social activities' },
  { Model: History, label: 'History' },
  { Model: Memory, label: 'Memories' },
  { Model: Souvenir, label: 'Souvenirs' },
  { Model: WebsiteSettings, label: 'Website settings' },
];

let cache = { at: 0, map: new Map() };
const TTL_MS = 15000;

async function computeUsageMap() {
  const map = new Map(); // url -> {count, places:[{label, title, id}]}
  const bump = (url, place) => {
    if (!url || typeof url !== 'string' || url.length > 500) return;
    const entry = map.get(url) || { count: 0, places: [] };
    entry.count += 1;
    if (entry.places.length < 12) entry.places.push(place);
    map.set(url, entry);
  };
  for (const { Model, label } of MODELS) {
    // Small collections for a club site; lean scan is fast and exact.
    const docs = await Model.find().lean().exec();
    for (const doc of docs) {
      const title =
        (doc.title && (doc.title.en || doc.title.bn)) ||
        (doc.name && (doc.name.en || doc.name.bn)) ||
        (doc.clubName && (doc.clubName.en || doc.clubName.bn)) ||
        doc.key ||
        doc.year ||
        doc._id.toString();
      const json = JSON.stringify(doc);
      // collect URLs present in doc
      const urlRegex = /(?:\/uploads\/[\w./-]+|https?:\/\/res\.cloudinary\.com\/[^\s"]+)/g;
      const found = json.match(urlRegex) || [];
      for (const url of new Set(found)) {
        bump(url, { collection: label, title: String(title).slice(0, 80), id: doc._id.toString() });
      }
    }
  }
  return map;
}

async function getUsageMap() {
  if (Date.now() - cache.at < TTL_MS) return cache.map;
  const map = await computeUsageMap();
  cache = { at: Date.now(), map };
  return map;
}

function invalidate() {
  cache.at = 0;
}

module.exports = { getUsageMap, invalidate };
