import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useFetch } from '../../hooks/useFetch';
import Seo from '../../components/ui/Seo';
import { SectionHead, EmptyState, CardSkeletons, Img, MotifMark } from '../../components/ui';
import { EventCard, PersonCard, AlbumCard, NoticeLine, ActivityCard, SouvenirCard } from '../../components/cards';
import { formatDate, num } from '../../utils/format';
import { Modal } from '../../components/ui';

/* ---------------- Countdown ---------------- */
function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!target) return undefined;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [target]);
  return useMemo(() => {
    if (!target) return null;
    const diff = new Date(target).getTime() - now;
    if (diff <= 0) return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      done: false,
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }, [target, now]);
}

function CountdownSection() {
  const { t, L, lang } = useLanguage();
  const { data } = useFetch('/api/puja/countdown');
  const cd = useCountdown(data && data.startDate);
  if (data === null || !data || !data.startDate || !cd) return null;
  const cells = [
    [cd.days, t('home.countdown.days')],
    [cd.hours, t('home.countdown.hours')],
    [cd.minutes, t('home.countdown.minutes')],
    [cd.seconds, t('home.countdown.seconds')],
  ];
  return (
    <section className="section countdown-band" aria-label={t('home.countdown.title')}>
      <div className="container center">
        <SectionHead center title={cd.done ? t('home.countdown.started') : `${t('home.countdown.title')} — ${L(data.title)}`} text={!cd.done ? `${t('puja.dates')}: ${formatDate(data.startDate, lang)}` : ''} tone="light" />
        {!cd.done && (
          <div className="countdown-grid" role="timer" aria-live="off">
            {cells.map(([v, label]) => (
              <div className="count-cell" key={label}>
                <b>{String(v).padStart(2, '0')}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- Today's programme ---------------- */
function TodaySection() {
  const { t, L, lang } = useLanguage();
  const { data, loading } = useFetch('/api/puja/schedule/today');
  if (loading) return null;
  return (
    <section className="section" aria-label={t('home.today.title')}>
      <div className="container">
        <SectionHead eyebrow={formatDate(new Date(), lang, { weekday: 'long' })} title={t('home.today.title')} center />
        {!data || !data.items || data.items.length === 0 ? (
          <EmptyState icon="🪔" title={t('home.today.empty')} />
        ) : (
          <div className="schedule-list" style={{ maxWidth: 820, margin: '0 auto' }}>
            {data.items.map((item) => (
              <div className="schedule-item" key={item._id}>
                <div className="schedule-date">
                  <b>{formatDate(item.date, lang, { day: 'numeric' })}</b>
                  <span>{formatDate(item.date, lang, { month: 'long' })}</span>
                  {item.time && <span style={{ display: 'block' }}>{item.time}</span>}
                </div>
                <div>
                  {L(item.dayLabel) && <div className="schedule-day-label">{L(item.dayLabel)}</div>}
                  <h3>{L(item.title)}</h3>
                  <p>{L(item.description)}</p>
                  <div className="schedule-meta">{L(item.location) && <span>📍 {L(item.location)}</span>}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- Home page ---------------- */
export default function Home() {
  const { t, L } = useLanguage();
  const { settings } = useSettings();
  const [noticeOpen, setNoticeOpen] = useState(null);

  const { data: puja } = useFetch('/api/puja/current');
  const { data: notices, loading: noticesLoading } = useFetch('/api/notices', { params: { limit: 4 } });
  const { data: events, loading: eventsLoading } = useFetch('/api/events', { params: { when: 'upcoming', limit: 3 } });
  const { data: albums, loading: albumsLoading } = useFetch('/api/gallery', { params: { limit: 3, featured: 'true' } });
  const { data: committee } = useFetch('/api/committee', { params: { limit: 4 } });
  const { data: members } = useFetch('/api/members', { params: { limit: 4 } });
  const { data: socials } = useFetch('/api/social-activities', { params: { limit: 3 } });
  const { data: memories } = useFetch('/api/memories', { params: { limit: 3 } });
  const { data: souvenirs } = useFetch('/api/souvenir', { params: { limit: 3 } });
  const { data: mandir } = useFetch('/api/mansa-mandir');

  const hs = settings?.homeSections || {};
  const hero = settings?.hero;
  const show = (key) => hs[key] !== false;

  return (
    <>
      <Seo />
      {/* 1. Hero */}
      <section className="hero">
        {hero?.image && <Img src={hero.image} alt="" className="hero-bg" />}
        <div className="hero-scrim" aria-hidden="true" />
        <MotifMark width={340} height={340} opacity={0.13} />
        <div className="container">
          <div className="hero-inner">
            {(hero?.badge?.bn || hero?.badge?.en) && (
              <span className="hero-badge">🪔 {L(hero.badge)}</span>
            )}
            <h1>{hero ? L(hero.title, 'গোস্বামীপাড়া মনসামাতা ক্লাব') : 'গোস্বামীপাড়া মনসামাতা ক্লাব'}</h1>
            <p className="hero-sub">{hero ? L(hero.subtitle, '') : ''}</p>
            <div className="hero-ctas">
              {hero?.cta1?.link && (
                <Link to={hero.cta1.link} className="btn btn-primary">{L(hero.cta1.label, t('nav.durgaPuja'))}</Link>
              )}
              {hero?.cta2?.link && (
                <Link to={hero.cta2.link} className="btn btn-outline">{L(hero.cta2.label, t('nav.contact'))}</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Club identity */}
      <section className="section">
        <div className="container two-col">
          <div>
            <SectionHead eyebrow={t('home.identity.eyebrow')} title={t('home.identity.title')} />
            <p className="prose">{settings?.aboutIntro && (settings.aboutIntro.bn || settings.aboutIntro.en) ? L(settings.aboutIntro) : t('home.identity.text')}</p>
            <dl className="kv mt-2">
              <dt>{t('common.established')}</dt>
              <dd><strong>{settings?.establishedYear}</strong></dd>
              <dt>{t('common.registrationNo')}</dt>
              <dd>{settings?.registrationNumber}</dd>
              <dt>{t('common.address')}</dt>
              <dd style={{ whiteSpace: 'pre-line' }}>{settings ? L(settings.address) : ''}</dd>
            </dl>
          </div>
          <div>
            {puja?.featuredImage ? (
              <Img src={puja.featuredImage} alt={L(puja.title)} className="feature-img" />
            ) : (
              <div className="feature-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(140deg,#7c1414,#9e1b1b)' }}>
                <MotifMark width={120} height={120} opacity={0.5} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Countdown */}
      {show('showCountdown') && <CountdownSection />}

      {/* 4. Today's programme */}
      {show('showToday') && <TodaySection />}

      {/* 5. Durga Puja highlight */}
      <section className="section section-tint">
        <div className="container">
          <SectionHead center eyebrow={t('home.puja.eyebrow')} title={t('home.puja.title')} />
          {puja ? (
            <div className="two-col">
              <div>
                {puja.bannerImage && <Img src={puja.bannerImage} alt={L(puja.title)} className="feature-img" />}
              </div>
              <div>
                <span className="chip chip-vermilion">{num(puja.year, 'en')}</span>
                <h3 className="mt-2" style={{ fontSize: '1.6rem' }}>{L(puja.title)}</h3>
                {L(puja.theme) && <p style={{ color: 'var(--gold)', fontWeight: 700 }}>{L(puja.theme)}</p>}
                <p className="prose" style={{ color: 'var(--muted)' }}>{L(puja.description)}</p>
                <Link to="/durga-puja" className="btn btn-primary mt-2">{t('common.details')}</Link>
              </div>
            </div>
          ) : (
            <EmptyState icon="🪔" title={t('puja.empty')} />
          )}
        </div>
      </section>

      {/* 6. Notices */}
      {show('showNotices') && (
        <section className="section">
          <div className="container">
            <SectionHead title={t('home.notices.title')} />
            {noticesLoading ? (
              <CardSkeletons count={2} />
            ) : !notices || notices.items.length === 0 ? (
              <EmptyState icon="📋" title={t('notices.empty')} />
            ) : (
              <div className="admin-table-wrap">
                {notices.items.map((n) => <NoticeLine key={n._id} notice={n} onOpen={setNoticeOpen} />)}
              </div>
            )}
            <div className="mt-4 center"><Link to="/notices" className="btn btn-outline">{t('common.viewAll')}</Link></div>
          </div>
        </section>
      )}

      {/* 7. Upcoming events */}
      {show('showEvents') && (
        <section className="section section-tint">
          <div className="container">
            <SectionHead title={t('home.events.title')} />
            {eventsLoading ? <CardSkeletons /> : !events || events.items.length === 0 ? (
              <EmptyState icon="🎪" title={t('events.empty')} />
            ) : (
              <div className="grid grid-3">{events.items.map((e) => <EventCard key={e._id} event={e} />)}</div>
            )}
            <div className="mt-4 center"><Link to="/events" className="btn btn-outline">{t('common.viewAll')}</Link></div>
          </div>
        </section>
      )}

      {/* 8. Featured gallery */}
      {show('showGallery') && (
        <section className="section">
          <div className="container">
            <SectionHead title={t('home.gallery.title')} />
            {albumsLoading ? <CardSkeletons /> : !albums || albums.items.length === 0 ? (
              <EmptyState icon="🖼" title={t('gallery.empty')} />
            ) : (
              <div className="grid grid-3 album-grid">{albums.items.map((a) => <AlbumCard key={a._id} album={a} />)}</div>
            )}
            <div className="mt-4 center"><Link to="/gallery" className="btn btn-outline">{t('common.viewAll')}</Link></div>
          </div>
        </section>
      )}

      {/* 9. Mansa Mata Mandir highlight */}
      {show('showMandir') && (
        <section className="section section-dark">
          <div className="container two-col">
            <div>
              <SectionHead eyebrow={t('home.mandir.eyebrow')} title={t('home.mandir.title')} tone="light" />
              <p style={{ color: '#d9c8a5' }}>
                {mandir && (mandir.intro?.bn || mandir.intro?.en) ? L(mandir.intro) : t('mandir.subtitle')}
              </p>
              <Link to="/mansa-mandir" className="btn btn-outline mt-2" style={{ color: '#f2d9a0', borderColor: 'rgba(242,217,160,0.5)' }}>
                {t('common.details')}
              </Link>
            </div>
            <div>
              {mandir?.featuredImage ? (
                <Img src={mandir.featuredImage} alt={t('home.mandir.title')} className="feature-img" />
              ) : (
                <div className="feature-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,240,200,0.06)' }}>
                  <span style={{ fontSize: '4rem' }} aria-hidden="true">🛕</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 10. Committee preview */}
      {show('showCommittee') && committee && committee.items.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead title={t('home.committee.title')} />
            <div className="grid grid-4">{committee.items.map((p) => <PersonCard key={p._id} person={p} committee />)}</div>
            <div className="mt-4 center"><Link to="/committee" className="btn btn-outline">{t('common.viewAll')}</Link></div>
          </div>
        </section>
      )}

      {/* 11. Members preview */}
      {show('showMembers') && members && members.items.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <SectionHead title={t('home.members.title')} />
            <div className="grid grid-4">{members.items.map((p) => <PersonCard key={p._id} person={p} />)}</div>
            <div className="mt-4 center"><Link to="/members" className="btn btn-outline">{t('common.viewAll')}</Link></div>
          </div>
        </section>
      )}

      {/* 12. Social activities */}
      {show('showSocial') && socials && socials.items.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead title={t('home.social.title')} />
            <div className="grid grid-3">{socials.items.map((i) => <ActivityCard key={i._id} item={i} />)}</div>
            <div className="mt-4 center"><Link to="/social-activities" className="btn btn-outline">{t('common.viewAll')}</Link></div>
          </div>
        </section>
      )}

      {/* 13. Memories & 14. Souvenir */}
      {(show('showMemories') && memories && memories.items.length > 0) && (
        <section className="section section-tint">
          <div className="container">
            <SectionHead title={t('home.memories.title')} />
            <div className="grid grid-3">{memories.items.map((i) => <ActivityCard key={i._id} item={i} basePath="/memories" />)}</div>
            <div className="mt-4 center"><Link to="/memories" className="btn btn-outline">{t('common.viewAll')}</Link></div>
          </div>
        </section>
      )}
      {(show('showSouvenir') && souvenirs && souvenirs.items.length > 0) && (
        <section className="section">
          <div className="container">
            <SectionHead title={t('home.souvenir.title')} />
            <div className="grid grid-3">{souvenirs.items.map((i) => <SouvenirCard key={i._id} item={i} />)}</div>
            <div className="mt-4 center"><Link to="/souvenir" className="btn btn-outline">{t('common.viewAll')}</Link></div>
          </div>
        </section>
      )}

      {/* 15. Contact strip */}
      <section className="section countdown-band">
        <div className="container two-col">
          <div>
            <SectionHead title={t('home.contact.title')} tone="light" />
            <div className="footer-address" style={{ color: '#e7d9b8' }}>{settings ? L(settings.address) : ''}</div>
          </div>
          <div className="flex gap-2 wrap" style={{ alignContent: 'center' }}>
            {settings?.mapUrl && (
              <a className="btn btn-primary" href={settings.mapUrl} target="_blank" rel="noopener noreferrer">⌖ {t('common.viewOnGoogleMaps')}</a>
            )}
            <Link to="/contact" className="btn btn-outline" style={{ color: '#f2d9a0', borderColor: 'rgba(242,217,160,0.5)' }}>{t('nav.contact')}</Link>
          </div>
        </div>
      </section>

      {/* Notice modal */}
      <Modal open={Boolean(noticeOpen)} onClose={() => setNoticeOpen(null)} title={noticeOpen ? L(noticeOpen.title) : ''} wide>
        {noticeOpen && (
          <div>
            <div className="card-meta" style={{ padding: 0, marginBottom: 10 }}>{formatDate(noticeOpen.date, 'bn')}</div>
            <div className="prose">{L(noticeOpen.content)}</div>
            {noticeOpen.attachmentUrl && (
              <a className="btn btn-outline btn-sm mt-2" href={noticeOpen.attachmentUrl} target="_blank" rel="noopener noreferrer">
                ⤓ {t('notices.attachment')}
              </a>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
