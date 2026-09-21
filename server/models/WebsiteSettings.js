const mongoose = require('mongoose');
const { localizedString, localizedText } = require('../utils/helpers');

const ctaSchema = new mongoose.Schema(
  {
    label: { type: localizedString, default: () => ({}) },
    link: { type: String, default: '' },
  },
  { _id: false }
);

const socialLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

/**
 * Singleton website settings (key 'main').
 * Seeded with the club's verified official information only.
 */
const websiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },
    clubName: {
      type: localizedString,
      default: () => ({ bn: 'গোস্বামীপাড়া মনসামাতা ক্লাব', en: 'Goswamipara Mansa Mata Club' }),
    },
    establishedYear: { type: Number, default: 2010, min: 1800, max: 2200 },
    registrationNumber: { type: String, default: 'S0020444 of 2021–2022', trim: true },
    address: {
      type: localizedText,
      default: () => ({
        bn: 'গ্রাম + পোষ্ট - রামনগর\nথানা - তারকেশ্বর\nজেলা - হুগলী, পশ্চিমবঙ্গ\nপিন - ৭১২৪১০',
        en: 'Village + Post - Ramnagar\nPolice Station - Tarakeswar\nDistrict - Hooghly, West Bengal\nPIN - 712410',
      }),
    },
    mapUrl: { type: String, default: 'https://maps.app.goo.gl/fZ1LDYNZYCGmUwzn7?g_st=aw' },
    contactEmail: { type: String, default: '', trim: true },
    contactPhone: { type: String, default: '', trim: true },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    defaultLanguage: { type: String, enum: ['bn', 'en'], default: 'bn' },
    seo: {
      siteSuffix: { type: localizedString, default: () => ({ bn: 'গোস্বামীপাড়া মনসামাতা ক্লাব', en: 'Goswamipara Mansa Mata Club' }) },
      metaDescription: {
        type: localizedString,
        default: () => ({
          bn: 'গোস্বামীপাড়া মনসামাতা ক্লাব — রামনগর, তারকেশ্বর, হুগলী। দুর্গাপূজা, সংস্কৃতি ও সম্প্রদায়ের ঐতিহ্য।',
          en: 'Goswamipara Mansa Mata Club — Ramnagar, Tarakeswar, Hooghly. Durga Puja, culture and community heritage.',
        }),
      },
      ogImage: { type: String, default: '' },
    },
    socialLinks: { type: [socialLinkSchema], default: [] },
    footerText: { type: localizedText, default: () => ({}) },
    aboutIntro: { type: localizedText, default: () => ({}) },
    hero: {
      title: { type: localizedString, default: () => ({ bn: 'গোস্বামীপাড়া মনসামাতা ক্লাব', en: 'Goswamipara Mansa Mata Club' }) },
      subtitle: {
        type: localizedString,
        default: () => ({ bn: 'শিকড়ে ঐতিহ্য, হৃদয়ে উৎসব।', en: 'Tradition in our roots, celebration in our hearts.' }),
      },
      image: { type: String, default: '' },
      badge: { type: localizedString, default: () => ({ bn: 'স্থাপিত — ২০১০', en: 'Established — 2010' }) },
      cta1: { type: ctaSchema, default: () => ({ label: { bn: 'দুর্গাপূজা', en: 'Durga Puja' }, link: '/durga-puja' }) },
      cta2: { type: ctaSchema, default: () => ({ label: { bn: 'যোগাযোগ', en: 'Contact' }, link: '/contact' }) },
      showEstablished: { type: Boolean, default: true },
    },
    homeSections: {
      showCountdown: { type: Boolean, default: true },
      showToday: { type: Boolean, default: true },
      showNotices: { type: Boolean, default: true },
      showEvents: { type: Boolean, default: true },
      showGallery: { type: Boolean, default: true },
      showMandir: { type: Boolean, default: true },
      showCommittee: { type: Boolean, default: true },
      showMembers: { type: Boolean, default: true },
      showSocial: { type: Boolean, default: true },
      showMemories: { type: Boolean, default: true },
      showSouvenir: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

websiteSettingsSchema.statics.getMain = async function getMain() {
  let doc = await this.findOne({ key: 'main' });
  if (!doc) doc = await this.create({ key: 'main' });
  return doc;
};

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);
