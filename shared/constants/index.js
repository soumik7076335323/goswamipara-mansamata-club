/**
 * Shared constants used by both client and server documentation.
 * (Bundlers keep client/server code separate; these are the canonical values
 *  mirrored in the respective packages.)
 */

const CLUB = {
  nameBn: 'গোস্বামীপাড়া মনসামাতা ক্লাব',
  nameEn: 'Goswamipara Mansa Mata Club',
  establishedYear: 2010,
  registrationNumber: 'S0020444 of 2021–2022',
  addressBn: 'গ্রাম + পোষ্ট - রামনগর\nথানা - তারকেশ্বর\nজেলা - হুগলী, পশ্চিমবঙ্গ\nপিন - ৭১২৪১০',
  addressEn: 'Village + Post - Ramnagar\nPolice Station - Tarakeswar\nDistrict - Hooghly, West Bengal\nPIN - 712410',
  mapUrl: 'https://maps.app.goo.gl/fZ1LDYNZYCGmUwzn7?g_st=aw',
};

const TIMEZONE = 'Asia/Kolkata';

const LANGUAGES = ['bn', 'en'];
const DEFAULT_LANGUAGE = 'bn';

const PUJA_DAY_SUGGESTIONS = [
  { bn: 'মহালয়া', en: 'Mahalaya' },
  { bn: 'ষষ্ঠী', en: 'Shashthi' },
  { bn: 'সপ্তমী', en: 'Saptami' },
  { bn: 'মহাষ্টমী', en: 'Maha Ashtami' },
  { bn: 'সন্ধিপূজা', en: 'Sandhi Puja' },
  { bn: 'মহানবমী', en: 'Maha Navami' },
  { bn: 'বিজয়া দশমী', en: 'Bijoya Dashami' },
  { bn: 'বিসর্জন', en: 'Immersion (Bisorjon)' },
];

module.exports = { CLUB, TIMEZONE, LANGUAGES, DEFAULT_LANGUAGE, PUJA_DAY_SUGGESTIONS };
