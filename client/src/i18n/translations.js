/**
 * Central bilingual dictionary (বাংলা default, English).
 * Every user-facing string in the app resolves through t().
 */
const translations = {
  // ----- Common / chrome -----
  "nav.home": { bn: "হোম", en: "Home" },
  "nav.about": { bn: "পরিচিতি", en: "About" },
  "nav.durgaPuja": { bn: "দুর্গাপূজা", en: "Durga Puja" },
  "nav.events": { bn: "অনুষ্ঠান", en: "Events" },
  "nav.notices": { bn: "নোটিশ", en: "Notices" },
  "nav.gallery": { bn: "গ্যালারি", en: "Gallery" },
  "nav.videos": { bn: "ভিডিও", en: "Videos" },
  "nav.committee": { bn: "কমিটি", en: "Committee" },
  "nav.members": { bn: "সদস্যবৃন্দ", en: "Members" },
  "nav.socialActivities": { bn: "সামাজিক কার্যক্রম", en: "Social Activities" },
  "nav.mansaMandir": { bn: "মনসা মন্দির", en: "Mansa Mandir" },
  "nav.memories": { bn: "স্মৃতিচারণ", en: "Memories" },
  "nav.souvenir": { bn: "সুভেনির", en: "Souvenir" },
  "nav.contact": { bn: "যোগাযোগ", en: "Contact" },
  "nav.more": { bn: "আরও", en: "More" },
  "nav.menu": { bn: "মেনু", en: "Menu" },
  "nav.close": { bn: "বন্ধ করুন", en: "Close" },

  "common.loading": { bn: "লোড হচ্ছে…", en: "Loading…" },
  "common.retry": { bn: "আবার চেষ্টা করুন", en: "Try again" },
  "common.error": {
    bn: "কিছু একটা সমস্যা হয়েছে।",
    en: "Something went wrong.",
  },
  "common.viewAll": { bn: "সব দেখুন", en: "View all" },
  "common.readMore": { bn: "আরও পড়ুন", en: "Read more" },
  "common.details": { bn: "বিস্তারিত", en: "Details" },
  "common.back": { bn: "ফিরে যান", en: "Back" },
  "common.save": { bn: "সংরক্ষণ করুন", en: "Save" },
  "common.cancel": { bn: "বাতিল", en: "Cancel" },
  "common.delete": { bn: "মুছে ফেলুন", en: "Delete" },
  "common.edit": { bn: "সম্পাদনা", en: "Edit" },
  "common.add": { bn: "যোগ করুন", en: "Add" },
  "common.search": { bn: "খুঁজুন", en: "Search" },
  "common.close": { bn: "বন্ধ করুন", en: "Close" },
  "common.confirm": { bn: "নিশ্চিত করুন", en: "Confirm" },
  "common.previous": { bn: "পূর্ববর্তী", en: "Previous" },
  "common.next": { bn: "পরবর্তী", en: "Next" },
  "common.yes": { bn: "হ্যাঁ", en: "Yes" },
  "common.no": { bn: "না", en: "No" },
  "common.all": { bn: "সব", en: "All" },
  "common.published": { bn: "প্রকাশিত", en: "Published" },
  "common.unpublished": { bn: "অপ্রকাশিত", en: "Unpublished" },
  "common.featured": { bn: "বিশেষ", en: "Featured" },
  "common.active": { bn: "সক্রিয়", en: "Active" },
  "common.inactive": { bn: "নিষ্ক্রিয়", en: "Inactive" },
  "common.pinned": { bn: "পিন করা", en: "Pinned" },
  "common.date": { bn: "তারিখ", en: "Date" },
  "common.time": { bn: "সময়", en: "Time" },
  "common.location": { bn: "স্থান", en: "Location" },
  "common.category": { bn: "বিভাগ", en: "Category" },
  "common.title": { bn: "শিরোনাম", en: "Title" },
  "common.description": { bn: "বিবরণ", en: "Description" },
  "common.actions": { bn: "অ্যাকশন", en: "Actions" },
  "common.status": { bn: "অবস্থা", en: "Status" },
  "common.order": { bn: "ক্রম", en: "Order" },
  "common.image": { bn: "ছবি", en: "Image" },
  "common.images": { bn: "ছবিসমূহ", en: "Images" },
  "common.year": { bn: "বছর", en: "Year" },
  "common.noImage": { bn: "ছবি নেই", en: "No image" },
  "common.saved": { bn: "সংরক্ষণ সম্পন্ন হয়েছে।", en: "Saved successfully." },
  "common.deleted": { bn: "মুছে ফেলা হয়েছে।", en: "Deleted successfully." },
  "common.created": { bn: "তৈরি হয়েছে।", en: "Created successfully." },
  "common.updated": { bn: "হালনাগাদ হয়েছে।", en: "Updated successfully." },
  "common.deleteConfirm": {
    bn: "আপনি কি নিশ্চিত এটি মুছে ফেলতে চান? এই কাজটি ফেরানো যাবে না।",
    en: "Are you sure you want to delete this? This cannot be undone.",
  },
  "common.call": { bn: "কল করুন", en: "Call" },
  "common.download": { bn: "ডাউনলোড", en: "Download" },
  "common.view": { bn: "দেখুন", en: "View" },
  "common.of": { bn: "এর", en: "of" },
  "common.page": { bn: "পৃষ্ঠা", en: "Page" },
  "common.established": { bn: "স্থাপিত", en: "Established" },
  "common.registrationNo": { bn: "নিবন্ধন নং", en: "Registration No" },
  "common.address": { bn: "ঠিকানা", en: "Address" },
  "common.phone": { bn: "ফোন", en: "Phone" },
  "common.email": { bn: "ইমেইল", en: "Email" },
  "common.watchVideo": { bn: "ভিডিও দেখুন", en: "Watch video" },
  "common.required": { bn: "এই ঘরটি আবশ্যক।", en: "This field is required." },
  "common.invalidEmail": {
    bn: "সঠিক ইমেইল ঠিকানা দিন।",
    en: "Please enter a valid email address.",
  },
  "common.viewOnGoogleMaps": {
    bn: "Google Maps-এ দেখুন",
    en: "View on Google Maps",
  },
  "common.upcoming": { bn: "আসন্ন", en: "Upcoming" },
  "common.past": { bn: "বিগত", en: "Past" },
  "common.allCategories": { bn: "সব বিভাগ", en: "All categories" },
  "common.selectOption": { bn: "নির্বাচন করুন", en: "Select" },
  "common.empty.generic": {
    bn: "এখনও কোনো তথ্য যুক্ত হয়নি।",
    en: "No information has been added yet.",
  },
  "common.empty.admin": {
    bn: "শীঘ্রই এখানে তথ্য যুক্ত করা হবে।",
    en: "Information will be added here soon.",
  },

  // ----- Home -----
  "home.countdown.title": { bn: "দুর্গাপূজা আসছে", en: "Durga Puja is coming" },
  "home.countdown.subtitle": {
    bn: "মহালয়ার অপেক্ষায় — প্রভাতের আলোয় প্রতিদিন নতুন প্রস্তুতি।",
    en: "The countdown to the festivities has begun.",
  },
  "home.countdown.days": { bn: "দিন", en: "Days" },
  "home.countdown.hours": { bn: "ঘণ্টা", en: "Hours" },
  "home.countdown.minutes": { bn: "মিনিট", en: "Minutes" },
  "home.countdown.seconds": { bn: "সেকেন্ড", en: "Seconds" },
  "home.countdown.started": {
    bn: "পূজা চলছে — শারদীয়ার শুভেচ্ছা!",
    en: "The Puja is underway — warm festive greetings!",
  },
  "home.today.title": { bn: "আজকের অনুষ্ঠান", en: "Today's Programme" },
  "home.today.empty": {
    bn: "আজ কোনো নির্ধারিত অনুষ্ঠান নেই।",
    en: "No programme is scheduled for today.",
  },
  "home.identity.eyebrow": { bn: "আমাদের পরিচয়", en: "Our Identity" },
  "home.identity.title": {
    bn: "ঐতিহ্য ও সম্প্রদায়ের আঙিনা",
    en: "A courtyard of heritage and community",
  },
  "home.identity.text": {
    bn: "রামনগরের বুকে গোস্বামীপাড়া মনসামাতা ক্লাব — সংস্কৃতি, উৎসব ও প্রতিবেশী বন্ধনের একটি প্রাণকেন্দ্র। দুর্গাপূজা আমাদের প্রধান সাংস্কৃতিক পরিচয়, আর মনসামাতার মন্দির আমাদের আদি অহংকার।",
    en: "In the heart of Ramnagar, Goswamipara Mansa Mata Club is a living centre of culture, celebration and neighbourly bonds. Durga Puja is our foremost cultural identity, and the Mansa Mata Mandir our ancestral pride.",
  },
  "home.puja.eyebrow": {
    bn: "আমাদের প্রাণের উৎসব",
    en: "The festival of our hearts",
  },
  "home.puja.title": {
    bn: "শারদীয় দুর্গোৎসব",
    en: "The Autumn Durga Festival",
  },
  "home.notices.title": { bn: "গুরুত্বপূর্ণ নোটিশ", en: "Important Notices" },
  "home.events.title": { bn: "আসন্ন অনুষ্ঠান", en: "Upcoming Events" },
  "home.gallery.title": { bn: "গ্যালারি থেকে", en: "From the Gallery" },
  "home.mandir.eyebrow": { bn: "আমাদের ঐতিহ্য", en: "Our Heritage" },
  "home.mandir.title": { bn: "মনসামাতা মন্দির", en: "Mansa Mata Mandir" },
  "home.committee.title": {
    bn: "কার্যনির্বাহী কমিটি",
    en: "Executive Committee",
  },
  "home.members.title": { bn: "আমাদের সদস্যবৃন্দ", en: "Our Members" },
  "home.social.title": { bn: "সামাজিক কার্যক্রম", en: "Social Activities" },
  "home.memories.title": { bn: "স্মৃতির পাতায়", en: "Pages of Memory" },
  "home.souvenir.title": { bn: "সুভেনির", en: "Souvenir" },
  "home.contact.title": { bn: "যোগাযোগ ও অবস্থান", en: "Contact & Location" },

  // ----- About -----
  "about.title": { bn: "ক্লাব পরিচিতি", en: "About the Club" },
  "about.intro.eyebrow": { bn: "পরিচিতি", en: "Introduction" },
  "about.facts": { bn: "এক নজরে", en: "At a Glance" },
  "about.identity": { bn: "সাংস্কৃতিক পরিচয়", en: "Cultural Identity" },
  "about.identity.text": {
    bn: "দুর্গাপূজা এই ক্লাবের প্রধান সাংস্কৃতিক উৎসব। পাশাপাশি মনসামাতা মন্দির স্থানীয় ঐতিহ্যের সাক্ষ্য বহন করে চলেছে।",
    en: "Durga Puja is the club’s foremost cultural celebration. Alongside it, the Mansa Mata Mandir carries forward local heritage.",
  },
  "about.history": { bn: "ক্লাবের ইতিহাস", en: "Club History" },
  "about.history.empty": {
    bn: "ক্লাবের বিস্তারিত ইতিহাস শীঘ্রই প্রকাশিত হবে।",
    en: "The detailed history of the club will be published soon.",
  },
  "about.establishedIn": { bn: "স্থাপিত", en: "Established" },
  "about.registered": { bn: "নিবন্ধিত", en: "Registered" },

  // ----- Durga Puja page -----
  "puja.title": { bn: "দুর্গাপূজা", en: "Durga Puja" },
  "puja.subtitle": {
    bn: "শারদীয়ার আগমনী বার্তায় মেতে ওঠে গোটা পাড়া",
    en: "The whole neighbourhood comes alive with autumn festivities",
  },
  "puja.current": { bn: "বর্তমান পূজা", en: "Current Puja" },
  "puja.schedule": { bn: "অনুষ্ঠানসূচি", en: "Programme Schedule" },
  "puja.theme": { bn: "ভাবনা", en: "Theme" },
  "puja.empty": {
    bn: "দুর্গাপূজার তথ্য শীঘ্রই প্রকাশিত হবে।",
    en: "Durga Puja details will be published soon.",
  },
  "puja.schedule.empty": {
    bn: "অনুষ্ঠানসূচি শীঘ্রই প্রকাশিত হবে।",
    en: "The programme schedule will be published soon.",
  },
  "puja.archive": { bn: "বিগত বর্ষের পূজা", en: "Previous Years" },
  "puja.aboutThisYear": { bn: "এ বছরের পূজা", en: "This Year’s Puja" },
  "puja.dates": { bn: "তারিখ", en: "Dates" },

  // ----- Events -----
  "events.title": { bn: "অনুষ্ঠান", en: "Events" },
  "events.subtitle": {
    bn: "ক্লাবের নিয়মিত ও বিশেষ অনুষ্ঠানসমূহ",
    en: "Regular and special programmes of the club",
  },
  "events.empty": {
    bn: "কোনো অনুষ্ঠান এখনও যুক্ত হয়নি।",
    en: "No events have been added yet.",
  },
  "events.upcoming": { bn: "আসন্ন অনুষ্ঠান", en: "Upcoming Events" },
  "events.past": { bn: "বিগত অনুষ্ঠান", en: "Past Events" },

  // ----- Notices -----
  "notices.title": { bn: "নোটিশ বোর্ড", en: "Notice Board" },
  "notices.subtitle": {
    bn: "ক্লাবের সরকারি ঘোষণাসমূহ",
    en: "Official announcements of the club",
  },
  "notices.empty": {
    bn: "এই মুহূর্তে কোনো নোটিশ নেই।",
    en: "There are no notices at the moment.",
  },
  "notices.attachment": { bn: "সংযুক্তি (PDF)", en: "Attachment (PDF)" },
  "notices.searchPlaceholder": { bn: "নোটিশ খুঁজুন…", en: "Search notices…" },

  // ----- Gallery -----
  "gallery.title": { bn: "ফটো গ্যালারি", en: "Photo Gallery" },
  "gallery.subtitle": {
    bn: "উৎসব ও অনুষ্ঠানের মুহূর্ত",
    en: "Moments from our festivals and events",
  },
  "gallery.empty": {
    bn: "কোনো অ্যালবাম এখনও তৈরি হয়নি।",
    en: "No albums have been created yet.",
  },
  "gallery.photos": { bn: "টি ছবি", en: "photos" },
  "gallery.albumEmpty": {
    bn: "এই অ্যালবামে এখনও ছবি নেই।",
    en: "This album has no photos yet.",
  },

  // ----- Videos -----
  "videos.title": { bn: "ভিডিও", en: "Videos" },
  "videos.subtitle": {
    bn: "উৎসবের ভিডিও সংগ্রহ",
    en: "A collection of festival videos",
  },
  "videos.empty": {
    bn: "কোনো ভিডিও এখনও যুক্ত হয়নি।",
    en: "No videos have been added yet.",
  },

  // ----- Committee -----
  "committee.title": { bn: "কার্যনির্বাহী কমিটি", en: "Executive Committee" },
  "committee.subtitle": {
    bn: "ক্লাব পরিচালনায় নিয়োজিত",
    en: "The office bearers of the club",
  },
  "committee.empty": {
    bn: "কমিটির তথ্য শীঘ্রই প্রকাশিত হবে।",
    en: "Committee details will be published soon.",
  },

  // ----- Members -----
  "members.title": { bn: "সদস্য তালিকা", en: "Members Directory" },
  "members.subtitle": {
    bn: "ক্লাবের সদস্যবৃন্দ",
    en: "The members of our club",
  },
  "members.empty": {
    bn: "সদস্যদের তথ্য শীঘ্রই প্রকাশিত হবে।",
    en: "Member details will be published soon.",
  },
  "members.searchPlaceholder": {
    bn: "নাম বা পদবি খুঁজুন…",
    en: "Search by name or designation…",
  },

  // ----- Social activities -----
  "social.title": { bn: "সামাজিক কার্যক্রম", en: "Social Activities" },
  "social.subtitle": {
    bn: "সমাজসেবামূলক উদ্যোগসমূহ",
    en: "Community welfare initiatives",
  },
  "social.empty": {
    bn: "কোনো কার্যক্রমের তথ্য এখনও যুক্ত হয়নি।",
    en: "No activities have been added yet.",
  },

  // ----- Mansa Mandir -----
  "mandir.title": { bn: "মনসামাতা মন্দির", en: "Mansa Mata Mandir" },
  "mandir.subtitle": {
    bn: "আমাদের আদি ঐতিহ্য ও শ্রদ্ধার কেন্দ্র",
    en: "Our ancestral heritage and centre of devotion",
  },
  "mandir.intro": { bn: "পরিচিতি", en: "Introduction" },
  "mandir.history": { bn: "ইতিহাস", en: "History" },
  "mandir.pujaInfo": { bn: "পূজা-অর্চনা", en: "Worship" },
  "mandir.visitInfo": { bn: "দর্শন তথ্য", en: "Visiting Information" },
  "mandir.special": { bn: "বিশেষ অনুষ্ঠান", en: "Special Occasions" },
  "mandir.gallery": { bn: "মন্দিরের ছবি", en: "Temple Gallery" },
  "mandir.videos": { bn: "ভিডিও", en: "Videos" },
  "mandir.empty": {
    bn: "মন্দির সম্পর্কিত বিস্তারিত তথ্য শীঘ্রই প্রকাশিত হবে।",
    en: "Detailed information about the temple will be published soon.",
  },

  // ----- Memories -----
  "memories.title": { bn: "স্মৃতিচারণ", en: "Memories" },
  "memories.subtitle": {
    bn: "বিগত বছরগুলোর স্মৃতি সংগ্রহ",
    en: "A collection of memories from years gone by",
  },
  "memories.empty": {
    bn: "কোনো স্মৃতি এখনও সংরক্ষিত হয়নি।",
    en: "No memories have been archived yet.",
  },

  // ----- Souvenir -----
  "souvenir.title": { bn: "সুভেনির", en: "Souvenir" },
  "souvenir.subtitle": {
    bn: "ক্লাবের স্মারকগ্রন্থ",
    en: "The club’s commemorative publications",
  },
  "souvenir.empty": {
    bn: "কোনো সুভেনির সংস্করণ এখনও যুক্ত হয়নি।",
    en: "No souvenir editions have been added yet.",
  },
  "souvenir.edition": { bn: "সংস্করণ", en: "Edition" },
  "souvenir.viewPdf": { bn: "PDF দেখুন", en: "View PDF" },

  // ----- Contact -----
  "contact.title": { bn: "যোগাযোগ", en: "Contact Us" },
  "contact.subtitle": {
    bn: "আপনার বার্তা আমাদের কাছে পাঠান",
    en: "Send us your message",
  },
  "contact.info": { bn: "ঠিকানা ও অবস্থান", en: "Address & Location" },
  "contact.formTitle": { bn: "বার্তা পাঠান", en: "Send a Message" },
  "contact.name": { bn: "নাম", en: "Name" },
  "contact.phoneOptional": { bn: "ফোন (ঐচ্ছিক)", en: "Phone (optional)" },
  "contact.subject": { bn: "বিষয়", en: "Subject" },
  "contact.message": { bn: "বার্তা", en: "Message" },
  "contact.send": { bn: "পাঠিয়ে দিন", en: "Send Message" },
  "contact.sending": { bn: "পাঠানো হচ্ছে…", en: "Sending…" },
  "contact.success": {
    bn: "আপনার বার্তা পৌঁছেছে। ধন্যবাদ!",
    en: "Your message has been delivered. Thank you!",
  },

  // ----- Footer -----
  "footer.quickLinks": { bn: "দ্রুত লিংক", en: "Quick Links" },
  "footer.explore": { bn: "আরও জানুন", en: "Explore" },
  "footer.contact": { bn: "যোগাযোগ", en: "Contact" },
  "footer.copyright": {
    bn: "সর্বস্বত্ব সংরক্ষিত।",
    en: "All rights reserved.",
  },

  // ----- 404 -----
  "notfound.title": {
    bn: "পৃষ্ঠাটি খুঁজে পাওয়া যায়নি",
    en: "Page Not Found",
  },
  "notfound.text": {
    bn: "আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি সরানো হয়েছে বা বিদ্যমান নেই।",
    en: "The page you are looking for has been moved or does not exist.",
  },
  "notfound.home": { bn: "হোমপেজে ফিরে যান", en: "Back to Home" },

  // ----- Admin: auth -----
  "admin.login.title": { bn: "অ্যাডমিন লগইন", en: "Admin Login" },
  "admin.login.subtitle": {
    bn: "কন্টেন্ট ম্যানেজমেন্ট সিস্টেম",
    en: "Content Management System",
  },
  "admin.login.password": { bn: "পাসওয়ার্ড", en: "Password" },
  "admin.login.submit": { bn: "প্রবেশ করুন", en: "Sign In" },
  "admin.login.submitting": { bn: "প্রবেশ করা হচ্ছে…", en: "Signing in…" },
  "admin.login.failed": {
    bn: "ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।",
    en: "Invalid email or password.",
  },
  "admin.logout": { bn: "লগআউট", en: "Logout" },

  // ----- Admin: nav -----
  "admin.nav.overview": { bn: "সামগ্রিক", en: "Overview" },
  "admin.nav.dashboard": { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  "admin.nav.content": { bn: "কন্টেন্ট", en: "Content" },
  "admin.nav.homepage": { bn: "হোমপেজ", en: "Homepage" },
  "admin.nav.puja": { bn: "দুর্গাপূজা", en: "Durga Puja" },
  "admin.nav.schedule": { bn: "পূজা সূচি", en: "Puja Schedule" },
  "admin.nav.events": { bn: "অনুষ্ঠান", en: "Events" },
  "admin.nav.notices": { bn: "নোটিশ", en: "Notices" },
  "admin.nav.media": { bn: "মিডিয়া", en: "Media" },
  "admin.nav.gallery": { bn: "গ্যালারি", en: "Gallery" },
  "admin.nav.videos": { bn: "ভিডিও", en: "Videos" },
  "admin.nav.mediaLibrary": { bn: "মিডিয়া লাইব্রেরি", en: "Media Library" },
  "admin.nav.community": { bn: "কমিউনিটি", en: "Community" },
  "admin.nav.committee": { bn: "কমিটি", en: "Committee" },
  "admin.nav.members": { bn: "সদস্যবৃন্দ", en: "Members" },
  "admin.nav.social": { bn: "সামাজিক কার্যক্রম", en: "Social Activities" },
  "admin.nav.mandir": { bn: "মনসা মন্দির", en: "Mansa Mandir" },
  "admin.nav.archive": { bn: "আর্কাইভ", en: "Archive" },
  "admin.nav.history": { bn: "ক্লাবের ইতিহাস", en: "Club History" },
  "admin.nav.memories": { bn: "স্মৃতিচারণ", en: "Memories" },
  "admin.nav.souvenir": { bn: "সুভেনির", en: "Souvenir" },
  "admin.nav.communication": { bn: "যোগাযোগ", en: "Communication" },
  "admin.nav.inbox": { bn: "ইনবক্স", en: "Inbox" },
  "admin.nav.system": { bn: "সিস্টেম", en: "System" },
  "admin.nav.settings": { bn: "ওয়েবসাইট সেটিংস", en: "Website Settings" },
  "admin.nav.profile": { bn: "প্রোফাইল", en: "Admin Profile" },
  "admin.nav.viewSite": { bn: "ওয়েবসাইট দেখুন", en: "View Website" },

  // ----- Admin: dashboard -----
  "admin.dashboard.welcome": { bn: "স্বাগতম", en: "Welcome" },
  "admin.dashboard.subtitle": {
    bn: "ওয়েবসাইটের সাম্প্রতিক চিত্র",
    en: "Your website at a glance",
  },
  "admin.stats.events": { bn: "মোট অনুষ্ঠান", en: "Total Events" },
  "admin.stats.upcomingEvents": { bn: "আসন্ন অনুষ্ঠান", en: "Upcoming Events" },
  "admin.stats.notices": { bn: "প্রকাশিত নোটিশ", en: "Published Notices" },
  "admin.stats.albums": { bn: "গ্যালারি অ্যালবাম", en: "Gallery Albums" },
  "admin.stats.media": { bn: "মিডিয়া ফাইল", en: "Media Files" },
  "admin.stats.videos": { bn: "ভিডিও", en: "Videos" },
  "admin.stats.committee": { bn: "কমিটি সদস্য", en: "Committee Members" },
  "admin.stats.members": { bn: "সক্রিয় সদস্য", en: "Active Members" },
  "admin.stats.unread": { bn: "অপঠিত বার্তা", en: "Unread Messages" },
  "admin.stats.schedule": { bn: "আসন্ন পূজা সূচি", en: "Upcoming Schedule" },
  "admin.stats.currentPuja": { bn: "বর্তমান পূজা", en: "Current Puja" },
  "admin.stats.none": { bn: "কোনোটিই নয়", en: "None" },
  "admin.quick.title": { bn: "দ্রুত কাজ", en: "Quick Actions" },
  "admin.quick.event": { bn: "নতুন অনুষ্ঠান", en: "Add Event" },
  "admin.quick.notice": { bn: "নতুন নোটিশ", en: "Add Notice" },
  "admin.quick.member": { bn: "নতুন সদস্য", en: "Add Member" },
  "admin.quick.committee": { bn: "কমিটি সদস্য", en: "Add Committee Member" },
  "admin.quick.media": { bn: "মিডিয়া আপলোড", en: "Upload Media" },
  "admin.quick.schedule": { bn: "পূজা সূচি যোগ", en: "Add Puja Schedule" },

  // ----- Admin: generic CRUD -----
  "admin.list.addNew": { bn: "নতুন যোগ করুন", en: "Add New" },
  "admin.list.total": { bn: "মোট", en: "Total" },
  "admin.list.empty": {
    bn: "এখনও কোনো এন্ট্রি নেই। “নতুন যোগ করুন” থেকে শুরু করুন।",
    en: "No entries yet. Start with “Add New”.",
  },
  "admin.form.create": { bn: "তৈরি করুন", en: "Create" },
  "admin.form.update": { bn: "হালনাগাদ করুন", en: "Update" },
  "admin.form.bengali": { bn: "বাংলা", en: "Bengali" },
  "admin.form.english": { bn: "English", en: "English" },
  "admin.form.pickImage": {
    bn: "ছবি নির্বাচন / আপলোড",
    en: "Choose / Upload image",
  },
  "admin.form.changeImage": { bn: "ছবি বদলান", en: "Change image" },
  "admin.form.removeImage": { bn: "ছবি সরান", en: "Remove image" },
  "admin.form.uploading": { bn: "আপলোড হচ্ছে…", en: "Uploading…" },
  "admin.form.addImages": { bn: "ছবি যোগ করুন", en: "Add images" },
  "admin.form.displayOrder": { bn: "প্রদর্শন ক্রম", en: "Display order" },
  "admin.form.publishState": { bn: "প্রকাশ অবস্থা", en: "Publication state" },
  "admin.form.coverImage": { bn: "কভার ছবি", en: "Cover image" },
  "admin.form.optional": { bn: "ঐচ্ছিক", en: "optional" },
  "admin.form.hintOrder": {
    bn: "ছোট সংখ্যা আগে দেখাবে",
    en: "Lower numbers appear first",
  },

  // ----- Admin: members -----
  "admin.members.showPhone": {
    bn: "ফোন নম্বর প্রকাশ করুন",
    en: "Show phone publicly",
  },
  "admin.members.showAddress": {
    bn: "ঠিকানা প্রকাশ করুন",
    en: "Show address publicly",
  },
  "admin.members.photo": { bn: "ছবি", en: "Photo" },
  "admin.members.bio": { bn: "পরিচিতি", en: "Bio" },
  "admin.members.designation": { bn: "পদবি", en: "Designation" },

  // ----- Admin: media -----
  "admin.media.title": { bn: "মিডিয়া লাইব্রেরি", en: "Media Library" },
  "admin.media.upload": { bn: "ছবি আপলোড", en: "Upload Images" },
  "admin.media.uploadPdf": { bn: "PDF আপলোড", en: "Upload PDF" },
  "admin.media.uploadVideo": { bn: "ভিডিও আপলোড", en: "Upload Video" },
  "admin.media.usedIn": { bn: "টি জায়গায় ব্যবহৃত", en: "places" },
  "admin.media.unused": {
    bn: "কোথাও ব্যবহৃত হচ্ছে না",
    en: "Not used anywhere",
  },
  "admin.media.inUseTitle": {
    bn: "ফাইলটি ব্যবহৃত হচ্ছে",
    en: "File is in use",
  },
  "admin.media.inUseText": {
    bn: "এই ফাইলটি নিচের জায়গায় ব্যবহৃত হচ্ছে। মুছে ফেললে সেখানে ছবি দেখা যাবে না।",
    en: "This file is referenced below. Deleting it will break those images.",
  },
  "admin.media.forceDelete": { bn: "তবুও মুছুন", en: "Delete anyway" },
  "admin.media.invalid": {
    bn: "শুধুমাত্র JPEG, PNG, WebP বা GIF ছবি আপলোড করা যাবে।",
    en: "Only JPEG, PNG, WebP or GIF images are allowed.",
  },
  "admin.media.invalidVideo": {
    bn: "শুধুমাত্র MP4, WebM, MOV, MKV বা MPEG ভিডিও আপলোড করা যাবে।",
    en: "Only MP4, WebM, MOV, MKV or MPEG video files are allowed.",
  },
  "admin.media.tooLarge": {
    bn: "ফাইলটি বড় — সর্বোচ্চ সীমা অতিক্রম করেছে।",
    en: "File too large — exceeds the maximum size limit.",
  },
  "admin.form.pickVideo": {
    bn: "ভিডিও নির্বাচন / আপলোড",
    en: "Choose / upload video",
  },
  "common.video": { bn: "ভিডিও", en: "Video" },
  "admin.media.replace": { bn: "ফাইল বদলান", en: "Replace file" },
  "admin.media.altText": { bn: "বিকল্প টেক্সট (Alt)", en: "Alt text" },
  "admin.media.caption": { bn: "ক্যাপশন", en: "Caption" },

  // ----- Admin: inbox -----
  "admin.inbox.title": { bn: "বার্তা ইনবক্স", en: "Message Inbox" },
  "admin.inbox.empty": { bn: "কোনো বার্তা নেই।", en: "No messages." },
  "admin.inbox.markRead": { bn: "পঠিত চিহ্নিত", en: "Mark read" },
  "admin.inbox.markUnread": { bn: "অপঠিত চিহ্নিত", en: "Mark unread" },
  "admin.inbox.archive": { bn: "আর্কাইভ", en: "Archive" },
  "admin.inbox.unarchive": { bn: "আনআর্কাইভ", en: "Unarchive" },
  "admin.inbox.archived": { bn: "আর্কাইভ করা", en: "Archived" },
  "admin.inbox.all": { bn: "ইনবক্স", en: "Inbox" },
  "admin.inbox.unread": { bn: "অপঠিত", en: "Unread" },

  // ----- Admin: settings -----
  "admin.settings.saved": {
    bn: "সেটিংস সংরক্ষিত হয়েছে।",
    en: "Settings saved.",
  },
  "admin.settings.clubInfo": { bn: "ক্লাবের তথ্য", en: "Club Information" },
  "admin.settings.identity": { bn: "লোগো ও পরিচয়", en: "Logo & Identity" },
  "admin.settings.seo": { bn: "SEO", en: "SEO" },
  "admin.settings.social": { bn: "সোশ্যাল লিংক", en: "Social Links" },
  "admin.settings.heroTitle": { bn: "হিরো শিরোনাম", en: "Hero title" },
  "admin.settings.heroSubtitle": { bn: "হিরো উপশিরোনাম", en: "Hero subtitle" },
  "admin.settings.heroImage": { bn: "হিরো ছবি", en: "Hero image" },
  "admin.settings.badge": { bn: "ব্যাজ লেখা", en: "Badge text" },
  "admin.settings.cta1": { bn: "বোতাম ১", en: "Button 1" },
  "admin.settings.cta2": { bn: "বোতাম ২", en: "Button 2" },
  "admin.settings.linkUrl": { bn: "লিংক ঠিকানা", en: "Link URL" },
  "admin.settings.homeSections": {
    bn: "হোমপেজ সেকশন",
    en: "Homepage Sections",
  },
  "admin.settings.addLink": { bn: "লিংক যোগ করুন", en: "Add link" },

  // ----- Admin: profile / security -----
  "admin.profile.title": {
    bn: "প্রোফাইল ও নিরাপত্তা",
    en: "Profile & Security",
  },
  "admin.profile.changePassword": {
    bn: "পাসওয়ার্ড পরিবর্তন",
    en: "Change Password",
  },
  "admin.profile.currentPassword": {
    bn: "বর্তমান পাসওয়ার্ড",
    en: "Current password",
  },
  "admin.profile.newPassword": { bn: "নতুন পাসওয়ার্ড", en: "New password" },
  "admin.profile.passwordChanged": {
    bn: "পাসওয়ার্ড পরিবর্তিত হয়েছে।",
    en: "Password changed successfully.",
  },
  "admin.profile.loggedInAs": { bn: "লগইন করা আছে", en: "Signed in as" },
  "admin.profile.lastLogin": { bn: "সর্বশেষ লগইন", en: "Last login" },
  "admin.profile.users": {
    bn: "ব্যবহারকারী ব্যবস্থাপনা",
    en: "User Management",
  },
  "admin.profile.addUser": { bn: "নতুন ব্যবহারকারী", en: "Add User" },
  "admin.profile.role": { bn: "ভূমিকা", en: "Role" },
  "admin.profile.roleAdmin": { bn: "প্রশাসক", en: "Admin" },
  "admin.profile.roleEditor": { bn: "সম্পাদক", en: "Editor" },

  // ----- Admin: puja -----
  "admin.puja.year": { bn: "পূজা বর্ষ", en: "Puja year" },
  "admin.puja.startDate": {
    bn: "শুরুর তারিখ (ষষ্ঠী)",
    en: "Start date (Shashthi)",
  },
  "admin.puja.endDate": {
    bn: "শেষ তারিখ (বিসর্জন)",
    en: "End date (immersion)",
  },
  "admin.puja.banner": { bn: "ব্যানার ছবি", en: "Banner image" },
  "admin.puja.themeField": { bn: "ভাবনা / থিম", en: "Theme" },
  "admin.puja.manageSchedule": { bn: "সূচি পরিচালনা", en: "Manage schedule" },
  "admin.schedule.dayLabel": {
    bn: "দিন (যেমন মহাষ্টমী)",
    en: "Day (e.g. Maha Ashtami)",
  },
  "admin.schedule.addItem": { bn: "সূচি যোগ করুন", en: "Add schedule item" },
  "admin.schedule.selectPuja": {
    bn: "পূজা নির্বাচন করুন",
    en: "Select a puja",
  },

  // ----- Admin: banners/labels of fields -----
  "field.published": { bn: "প্রকাশিত", en: "Published" },
  "field.featured": { bn: "বিশেষভাবে দেখান", en: "Featured" },
  "field.pinned": { bn: "উপরে পিন করুন", en: "Pin to top" },
  "field.date": { bn: "তারিখ", en: "Date" },
  "field.time": { bn: "সময়", en: "Time" },
  "field.locationField": { bn: "স্থান", en: "Location" },
  "field.category": { bn: "বিভাগ", en: "Category" },
  "field.cover": { bn: "কভার ছবি", en: "Cover image" },
  "field.gallery": { bn: "আরও ছবি", en: "More images" },
  "field.attachment": { bn: "সংযুক্তি (PDF)", en: "Attachment (PDF)" },
  "field.provider": { bn: "ভিডিও মাধ্যম", en: "Video provider" },
  "field.videoUrl": {
    bn: "ভিডিও URL (YouTube / Vimeo)",
    en: "Video URL (YouTube / Vimeo)",
  },
  "field.thumbnail": { bn: "থাম্বনেইল", en: "Thumbnail" },
  "field.editionYear": { bn: "সংস্করণ বর্ষ", en: "Edition year" },
  "field.pdf": { bn: "PDF ফাইল", en: "PDF file" },
  "field.photos": { bn: "ছবিসমূহ", en: "Photos" },
  "field.yearOrDate": { bn: "বছর", en: "Year" },
  "field.albumDescription": { bn: "অ্যালবাম বিবরণ", en: "Album description" },

  "seo.siteTitle": {
    bn: "গোস্বামীপাড়া মনসামাতা ক্লাব",
    en: "Goswamipara Mansa Mata Club",
  },
};

export default translations;
