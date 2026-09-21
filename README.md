# গোস্বামীপাড়া মনসামাতা ক্লাব — Goswamipara Mansa Mata Club

Official website & content management system for **গোস্বামীপাড়া মনসামাতা ক্লাব (Goswamipara Mansa Mata Club)** — a Bengali community & cultural club in Ramnagar, Tarakeswar, Hooghly (West Bengal).

**Durga Puja is the primary cultural identity** of the site; **Mansa Mata Mandir** is presented as a dedicated secondary heritage section. The platform is fully bilingual (বাংলা default / English), fully CMS-driven, and ships with **no invented content** — history, members, events and everything else are added by the club through the admin panel.

---

## Features

### Public website
- Premium, original design (deep vermilion, warm cream, muted antique gold; Noto Serif/Sans Bengali + Fraunces/Inter typography)
- Homepage: hero (CMS-editable), club identity, **DB-driven Puja countdown (IST)**, **আজকের অনুষ্ঠান / Today's programme (Asia/Kolkata)**, notices, upcoming events, featured gallery, Mansa Mandir highlight, committee & members previews, social activities, memories, souvenir and contact strip
- Pages: About · **Durga Puja** (year-wise, schedules for ষষ্ঠী→দশমী style entries) · Events (+details) · Notices (search, pinned, PDF attachments) · Gallery (albums + lightbox, lazy loading) · Videos (YouTube/Vimeo, click-to-play) · Committee · **Members directory** (privacy-respecting) · Social Activities · Mansa Mandir · Memories · Souvenir (PDF) · Contact (map link + working form) · custom 404
- বাংলা | English switcher — entire UI + dynamic content, persisted in `localStorage`, graceful fallback when one translation is missing
- SEO: per-page titles/descriptions, Open Graph, canonical, `sitemap.xml`, `robots.txt`, semantic HTML
- Loading skeletons, elegant empty states, error states with retry — no fake buttons anywhere

### Admin CMS (`/admin`)
- Dashboard with **real database statistics** and quick actions
- Grouped, collapsible sidebar: Overview · Content · Media · Community · Archive · Communication · System
- **Real CRUD** for: Homepage (hero/CTAs/section visibility), Durga Puja years, Puja Schedule, Events, Notices, Gallery albums, Videos, Committee, Members, Social Activities, Mansa Mandir, Club History, Memories, Souvenir
- **Media Library**: upload (multi), preview, search, type filter, replace, delete with **"Used in X places" detection** and in-use delete protection, alt/caption editing
- **Inbox**: contact form messages with read/unread/archive/delete
- **Website Settings**: names, established year, registration number, address, map URL, contacts, logo/favicon, SEO defaults, social links, footer
- Profile & Security: change password, user management (admin role), role-based access

### Security
- JWT in **HttpOnly** cookies + **double-submit CSRF cookies** for cookie sessions
- bcrypt password hashing (timing-safe login), login rate limiting
- Role-based authorization (`admin` / `editor`) enforced **server-side on every admin API**
- Helmet (strict CSP in production), CORS allowlist, `express-mongo-sanitize` (NoSQL injection), `express-validator` input validation, central error handler (no stack leaks in production)
- Secure uploads: MIME + extension allowlist, image-dimension validation, PDF magic-byte check, size limits, randomized safe filenames
- **Member privacy enforced at the API level**: when `showPhone` / `showAddress` are off, the public API does not return those fields at all
- No secrets in the frontend; `.env` is git-ignored; only `.env.example` is committed

## Technology

| Layer | Stack |
|---|---|
| Frontend | React 18 (Create React App), React Router 6, Axios, Context API, hand-built CSS design system |
| Backend | Node.js 20, Express 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT + bcryptjs + HttpOnly/CSRF cookies |
| Media | Multer (memory) → local `/uploads` (dev) or Cloudinary (`MEDIA_DRIVER=cloudinary`) |

## Folder structure

```
project-root/
├── client/                 # Create React App frontend
│   ├── public/             # index.html, favicon.svg, manifest
│   └── src/
│       ├── components/     # layout, ui primitives, content cards
│       ├── contexts/       # Language, Settings, Auth, Toast
│       ├── hooks/          # useFetch
│       ├── i18n/           # complete bn/en dictionary
│       ├── pages/          # public/ and admin/ pages
│       ├── routes/         # ProtectedRoute
│       ├── services/       # axios API layer (CSRF-aware)
│       ├── styles/         # global design system
│       └── utils/          # date/video/localization helpers
├── server/
│   ├── config/             # env, db
│   ├── middleware/         # auth, csrf, errors, rate limits, uploads
│   ├── models/             # 18 Mongoose models
│   ├── routes/             # auth, events, notices, gallery, videos, committee,
│   │                       # members, puja(+schedule), mansa-mandir, history,
│   │                       # social-activities, memories, souvenir, contact,
│   │                       # settings, media, admin, sitemap
│   ├── scripts/seedAdmin.js
│   ├── services/           # mediaService, usageService
│   ├── uploads/            # local media (git-ignored)
│   ├── utils/              # helpers, generic CRUD factory
│   └── app.js / index.js
├── shared/constants/       # canonical club facts & timezone
├── tests/api.smoke.js      # 54-assertion API test suite
├── .env.example
└── package.json            # root scripts
```

## Getting started

### Requirements
- Node.js **≥ 18** (developed on Node 20)
- MongoDB **≥ 5** running locally (or an Atlas URI)

### 1. Install
```bash
npm run install:all        # root, server and client dependencies
```

### 2. Configure environment
```bash
cp .env.example .env       # then edit values
```

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret (required in production) |
| `JWT_EXPIRES_IN` | Session lifetime (default 12h) |
| `COOKIE_SECURE` | `true` behind HTTPS in production |
| `ALLOWED_ORIGINS` | Comma-separated origins for credentialed CORS |
| `PUBLIC_URL` | Public base URL (sitemap/canonical) |
| `MEDIA_DRIVER` | `local` or `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials (when driver = cloudinary) |
| `UPLOAD_MAX_IMAGE_MB` / `UPLOAD_MAX_PDF_MB` | Upload limits |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin seed credentials |
| `REACT_APP_API_URL` | Optional explicit API base URL for the CRA frontend (usually unnecessary — the dev proxy or same-origin production server is used) |

**Never commit `.env`.** Rotate any credentials that have ever been committed.

### 3. Seed the admin
```bash
npm run seed:admin
```
Creates the admin user from `ADMIN_*` env vars and initializes website settings with the club's verified official information:
*গোস্বামীপাড়া মনসামাতা ক্লাব · Established 2010 · Reg. S0020444 of 2021–2022 · Vill+Post Ramnagar, PS Tarakeswar, Hooghly 712410*.

### 4. Run in development
```bash
npm run dev        # API on :5000 + CRA dev server on :3000 (proxied)
```
Open `http://localhost:3000` (public) and `http://localhost:3000/admin` (CMS).

### 5. Production build & serve
```bash
npm run build      # CRA production build (verified: passes cleanly)
npm start          # NODE_ENV=production node server/index.js
```
The Express server serves the optimized build, the API, uploads, `sitemap.xml` and `robots.txt` from one origin.

## Media & Cloudinary
- Development defaults to `MEDIA_DRIVER=local`: files land in `server/uploads/` and are served from `/uploads/<file>` with strong caching headers.
- For production with ephemeral filesystems set `MEDIA_DRIVER=cloudinary` and provide the three Cloudinary credentials — the same admin UI stores/files everything transparently.

## Bilingual system
- All UI strings resolve through the central dictionary (`client/src/i18n/translations.js`) keyed via `t(key)`.
- Dynamic content uses `{ bn, en }` objects; the `L()` helper falls back bn → en → empty, and never renders `undefined`/`null`/`[object Object]`.
- Preference persists in `localStorage` (`gmmc_lang`), and `<html lang>` follows it.
- Dates/numbers render with `bn-IN` / `en-IN` Intl formats (বাংলা digits on the Bengali side).
- "Today" for schedules is computed server-side in **Asia/Kolkata**.

## Members & committee
- Committee and Members are separate directories with independent CRUD, photos, bilingual designations, ordering and featured flags.
- **Privacy**: `showPhone`/`showAddress` are enforced in the public serializer — when off, the API omits the fields entirely (verified by the smoke suite). When a phone is public, mobile users get a `tel:` call button.

## API overview
```
POST /api/auth/login · POST /api/auth/logout · GET /api/auth/me
     POST /api/auth/change-password · (admin) GET/POST/PATCH /api/auth/users
GET/POST        /api/events /notices /gallery /videos /committee /members
                /social-activities /memories /souvenir
GET/PUT/DELETE  /api/<resource>/:id · PATCH /api/<resource>/reorder
GET             /api/<resource>/admin/list · /api/<resource>/admin/:id
GET             /api/puja · /api/puja/current · /api/puja/countdown
GET             /api/puja/schedule/today            (Asia/Kolkata)
GET             /api/puja/:id/schedule              (public)
POST/PUT/DELETE /api/puja(+ /:id/schedule …)         (admin)
GET/PUT         /api/mansa-mandir · /api/history     (singletons)
GET/PUT         /api/settings
POST            /api/contact                        (public, rate-limited)
GET/PATCH/DELETE /api/contact/messages               (inbox)
GET/POST/PATCH/DELETE /api/media (…/upload, …/upload-pdf, …/:id/replace)
GET             /api/admin/stats
GET             /sitemap.xml · /robots.txt · /api/health
```

## Testing
The repository ships an executable API smoke suite (54 assertions) covering auth, CSRF, authorization, CRUD for every module, **member privacy serialization**, uploads (valid/invalid/replace/delete), IST "today" logic, inbox, settings and sitemap — and it **cleans up every test record** it creates:

```bash
npm run test:api
```

Manual/QA verification performed during development:
- Public pages + admin login/dashboard smoke-tested in headless Chrome at 320–1440px widths (no console errors, no horizontal overflow)
- UI-level admin round-trip: login → create committee member → visible publicly → deleted with confirmation
- Language switch + persistence across reload
- Production build compiled and served; CSP/Helmet headers inspected

## Dependency audit
`npm audit` was run for both packages. The server is at **0 vulnerabilities** (multer was moved to the 2.x line and `image-size` upgraded past the DoS advisories). The client’s remaining findings are development-time transitive dependencies of `react-scripts` (webpack dev-server ecosystem) which do not ship in the production bundle; forcing upgrades risks breaking CRA, so they are documented here rather than force-patched.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Login immediately logs out | Set `COOKIE_SECURE=false` when testing over plain HTTP; use HTTPS in production |
| `MongoServerSelectionError` | Start MongoDB / check `MONGO_URI` |
| Images 404 after moving hosts | Re-upload or switch to `MEDIA_DRIVER=cloudinary` |
| Port busy | Change `PORT`; CRA dev proxy expects the API on 5000 by default |
| CSRF errors from curl/scripts | Send the `gmmc_csrf` cookie value back in the `X-CSRF-Token` header, or use `Authorization: Bearer` |
| Bengali fonts look wrong | Ensure network access to Google Fonts, or self-host Noto Sans/Serif Bengali |

---

© গোস্বামীপাড়া মনসামাতা ক্লাব — Established 2010 · Reg. S0020444 of 2021–2022
