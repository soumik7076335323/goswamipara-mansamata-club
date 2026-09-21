import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import DurgaPuja from './pages/public/DurgaPuja';
import { EventsList, EventDetail } from './pages/public/Events';
import Notices from './pages/public/Notices';
import { GalleryList, GalleryAlbumPage } from './pages/public/Gallery';
import Videos from './pages/public/Videos';
import { CommitteePage, MembersPage } from './pages/public/People';
import SocialActivities from './pages/public/SocialActivities';
import MansaMandir from './pages/public/MansaMandir';
import { MemoriesList, MemoryDetail } from './pages/public/Memories';
import Souvenir from './pages/public/Souvenir';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';

import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import CrudPage from './pages/admin/CrudPage';
import { crudConfigs } from './pages/admin/configs';
import PujaAdmin from './pages/admin/PujaAdmin';
import ScheduleAdmin from './pages/admin/ScheduleAdmin';
import MediaLibrary from './pages/admin/MediaLibrary';
import SingletonEditor from './pages/admin/SingletonEditor';
import { mansaMandirFields, historyField } from './pages/admin/singletonConfigs';
import SettingsAdmin from './pages/admin/SettingsAdmin';
import HomepageAdmin from './pages/admin/HomepageAdmin';
import Inbox from './pages/admin/Inbox';
import Profile from './pages/admin/Profile';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="durga-puja" element={<DurgaPuja />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="notices" element={<Notices />} />
        <Route path="gallery" element={<GalleryList />} />
        <Route path="gallery/:id" element={<GalleryAlbumPage />} />
        <Route path="videos" element={<Videos />} />
        <Route path="committee" element={<CommitteePage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="social-activities" element={<SocialActivities />} />
        <Route path="mansa-mandir" element={<MansaMandir />} />
        <Route path="memories" element={<MemoriesList />} />
        <Route path="memories/:id" element={<MemoryDetail />} />
        <Route path="souvenir" element={<Souvenir />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="homepage" element={<HomepageAdmin />} />
          <Route path="puja" element={<PujaAdmin />} />
          <Route path="puja-schedule" element={<ScheduleAdmin />} />
          <Route path="events" element={<CrudPage config={crudConfigs.events} />} />
          <Route path="notices" element={<CrudPage config={crudConfigs.notices} />} />
          <Route path="gallery" element={<CrudPage config={crudConfigs.gallery} />} />
          <Route path="videos" element={<CrudPage config={crudConfigs.videos} />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="committee" element={<CrudPage config={crudConfigs.committee} />} />
          <Route path="members" element={<CrudPage config={crudConfigs.members} />} />
          <Route path="social-activities" element={<CrudPage config={crudConfigs.socialActivities} />} />
          <Route path="mansa-mandir" element={<SingletonEditor endpoint="/api/mansa-mandir" fields={mansaMandirFields} titleKey="admin.nav.mandir" />} />
          <Route path="history" element={<SingletonEditor endpoint="/api/history" fields={historyField} titleKey="admin.nav.history" />} />
          <Route path="memories" element={<CrudPage config={crudConfigs.memories} />} />
          <Route path="souvenir" element={<CrudPage config={crudConfigs.souvenirs} />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
