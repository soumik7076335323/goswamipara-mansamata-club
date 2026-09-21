const express = require('express');
const { requireAuth, authorize } = require('../middleware/auth');
const { asyncHandler, todayRangeIST } = require('../utils/helpers');

const Event = require('../models/Event');
const Notice = require('../models/Notice');
const GalleryAlbum = require('../models/GalleryAlbum');
const Media = require('../models/Media');
const Video = require('../models/Video');
const CommitteeMember = require('../models/CommitteeMember');
const Member = require('../models/Member');
const Puja = require('../models/Puja');
const PujaSchedule = require('../models/PujaSchedule');
const SocialActivity = require('../models/SocialActivity');
const Memory = require('../models/Memory');
const Souvenir = require('../models/Souvenir');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();
router.use(requireAuth, authorize('admin', 'editor'));

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [todayStart] = todayRangeIST();
    const [
      events, upcomingEvents, notices, albums, media, videos,
      committee, members, unreadMessages, pujas, upcomingSchedule,
      socialActivities, memories, souvenirs,
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ published: true, date: { $gte: todayStart } }),
      Notice.countDocuments({ published: true }),
      GalleryAlbum.countDocuments(),
      Media.countDocuments(),
      Video.countDocuments({ published: true }),
      CommitteeMember.countDocuments({ active: true }),
      Member.countDocuments({ active: true }),
      ContactMessage.countDocuments({ read: false, archived: { $ne: true } }),
      Puja.countDocuments({ published: true }),
      PujaSchedule.countDocuments({ published: true, date: { $gte: todayStart } }),
      SocialActivity.countDocuments(),
      Memory.countDocuments(),
      Souvenir.countDocuments(),
    ]);
    const currentPuja = await Puja.findOne({ published: true })
      .sort({ featured: -1, year: -1 })
      .select('year title startDate featured')
      .lean();
    res.json({
      events, upcomingEvents, notices, albums, media, videos,
      committee, members, unreadMessages, pujas, upcomingSchedule,
      socialActivities, memories, souvenirs, currentPuja,
    });
  })
);

module.exports = router;
