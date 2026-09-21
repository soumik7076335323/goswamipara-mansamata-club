/**
 * API smoke test suite — exercises auth, security, and every CMS module,
 * including server-side member privacy. Cleans up all test data on exit.
 *
 * Usage:  node tests/api.smoke.js [baseUrl]
 * Env:    ADMIN_EMAIL / ADMIN_PASSWORD (defaults match .env.example seed)
 */
const BASE = process.argv[2] || process.env.BASE_URL || 'http://127.0.0.1:5000';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

let csrf = '';
let cookies = '';
let passed = 0;
let failed = 0;
const created = []; // {method, url} for cleanup in reverse

function ok(name, cond, extra) {
  if (cond) { passed += 1; console.log(`  ✔ ${name}`); }
  else { failed += 1; console.error(`  ✘ ${name}${extra ? ' — ' + JSON.stringify(extra) : ''}`); }
}

function mergeCookies(res) {
  const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  const jar = new Map(cookies.split('; ').filter(Boolean).map((c) => c.split('=')));
  for (const sc of setCookies) {
    const [pair] = sc.split(';');
    const [k, v] = pair.split('=');
    jar.set(k, v);
    if (k === 'gmmc_csrf') csrf = v;
  }
  cookies = Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function req(method, path, body, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (!(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (opts.auth !== false) {
    headers.Cookie = cookies;
    if (!['GET', 'HEAD'].includes(method)) headers['X-CSRF-Token'] = csrf;
  }
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });
  mergeCookies(res);
  let data = null;
  const text = await res.text();
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

// A tiny 1x1 PNG
const PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk +M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function main() {
  console.log(`\nGMMC API smoke tests → ${BASE}\n`);

  // ---------- Health & settings ----------
  console.log('Health & settings');
  let r = await req('GET', '/api/health', null, { auth: false });
  ok('GET /api/health', r.status === 200 && r.data.ok);
  r = await req('GET', '/api/settings', null, { auth: false });
  ok('GET /api/settings returns official defaults',
    r.status === 200 && r.data.clubName.bn === 'গোস্বামীপাড়া মনসামাতা ক্লাব' && r.data.registrationNumber === 'S0020444 of 2021–2022',
    r.data && r.data.registrationNumber);

  // ---------- Auth ----------
  console.log('\nAuthentication & security');
  r = await req('POST', '/api/auth/login', { email: EMAIL, password: 'wrong-password-1' }, { auth: false });
  ok('Bad login rejected', r.status === 401);
  r = await req('GET', '/api/admin/stats', null, { auth: false });
  ok('Unauthenticated admin API blocked', r.status === 401);
  r = await req('POST', '/api/events', { title: { bn: 'x' } }, { auth: false });
  ok('Unauthenticated create blocked', r.status === 401 || r.status === 403);
  r = await req('POST', '/api/auth/login', { email: EMAIL, password: PASSWORD }, { auth: false });
  ok('Admin login works', r.status === 200 && r.data.user.role === 'admin', r.status);
  const preCsrf = csrf;
  // Authenticated session but deliberately NO X-CSRF-Token header → must be 403.
  const noCsrfRes = await fetch(BASE + '/api/events', {
    method: 'POST',
    headers: { Cookie: cookies, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: { bn: 'x' }, date: new Date().toISOString() }),
  });
  ok('Missing CSRF token rejected', noCsrfRes.status === 403, { status: noCsrfRes.status });
  ok('CSRF token issued on login', Boolean(preCsrf));

  // ---------- Events CRUD ----------
  console.log('\nEvents CRUD');
  const eventBody = {
    title: { bn: 'টেস্ট অনুষ্ঠান', en: 'Test Event' },
    description: { bn: 'বিবরণ', en: 'Description' },
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    time: 'সন্ধ্যা ৬টা', category: 'cultural', published: true,
  };
  r = await req('POST', '/api/events', eventBody);
  ok('Create event', r.status === 201 && r.data._id, r.status);
  const eventId = r.data._id;
  created.push(['DELETE', `/api/events/${eventId}`]);
  r = await req('PUT', `/api/events/${eventId}`, { time: 'সন্ধ্যা ৭টা' });
  ok('Update event', r.status === 200 && r.data.time === 'সন্ধ্যা ৭টা');
  r = await req('GET', '/api/events?when=upcoming');
  ok('Public events list', r.status === 200 && r.data.items.some((i) => i._id === eventId));
  r = await req('PUT', `/api/events/${eventId}`, { published: false });
  r = await req('GET', '/api/events');
  ok('Unpublished event hidden from public', !r.data.items.some((i) => i._id === eventId));

  // ---------- Notices ----------
  console.log('\nNotices CRUD');
  r = await req('POST', '/api/notices', { title: { bn: 'টেস্ট নোটিশ', en: 'Test Notice' }, pinned: true, published: true });
  ok('Create notice', r.status === 201);
  const noticeId = r.data._id;
  created.push(['DELETE', `/api/notices/${noticeId}`]);
  r = await req('GET', '/api/notices?pinned=true');
  ok('Pinned notice listed first', r.status === 200 && r.data.items[0] && r.data.items[0]._id === noticeId);

  // ---------- Members + privacy ----------
  console.log('\nMembers privacy (server-side enforcement)');
  r = await req('POST', '/api/members', {
    name: { bn: 'টেস্ট সদস্য', en: 'Test Member' },
    designation: { bn: 'সদস্য', en: 'Member' },
    phone: '+919999999999',
    address: { bn: 'গোপন ঠিকানা', en: 'Secret Address' },
    showPhone: false, showAddress: false, active: true,
  });
  ok('Create member', r.status === 201);
  const memberId = r.data._id;
  created.push(['DELETE', `/api/members/${memberId}`]);
  r = await req('GET', `/api/members/${memberId}`);
  ok('showPhone=false → phone absent from public API', !('phone' in r.data), r.data);
  ok('showAddress=false → address absent from public API', !('address' in r.data));
  r = await req('PUT', `/api/members/${memberId}`, { showPhone: true, showAddress: true });
  r = await req('GET', `/api/members/${memberId}`);
  ok('showPhone=true → phone exposed', r.data.phone === '+919999999999');
  ok('showAddress=true → address exposed', r.data.address && r.data.address.en === 'Secret Address');
  r = await req('PUT', `/api/members/${memberId}`, { active: false });
  r = await req('GET', '/api/members');
  ok('Inactive member hidden publicly', !r.data.items.some((i) => i._id === memberId));
  r = await req('PUT', `/api/members/${memberId}`, { active: true });

  // ---------- Media upload ----------
  console.log('\nMedia library');
  const fd = new FormData();
  fd.append('files', new Blob([Buffer.from(PNG_B64, 'base64')], { type: 'image/png' }), 'smoke-test.png');
  r = await req('POST', '/api/media/upload', fd);
  ok('Upload PNG image', r.status === 201 && r.data.items[0].url.startsWith('/uploads/'), r.status);
  const mediaId = r.data.items && r.data.items[0]._id;
  const mediaUrl = r.data.items && r.data.items[0].url;
  r = await req('POST', '/api/media/upload', new FormData());
  ok('Empty upload rejected', r.status === 400);
  const badFd = new FormData();
  badFd.append('files', new Blob([Buffer.from('MZ fake exe')], { type: 'application/x-msdownload' }), 'virus.exe');
  r = await req('POST', '/api/media/upload', badFd);
  ok('Executable upload rejected', r.status === 400);
  const pdfFd = new FormData();
  pdfFd.append('file', new Blob([Buffer.from('%PDF-1.4 fake\n%%EOF')], { type: 'application/pdf' }), 'smoke.pdf');
  r = await req('POST', '/api/media/upload-pdf', pdfFd);
  ok('Upload PDF', r.status === 201);
  const pdfId = r.data._id;
  const imgFd2 = new FormData();
  imgFd2.append('file', new Blob([Buffer.from(PNG_B64, 'base64')], { type: 'image/png' }), 'replacement.png');
  r = await req('POST', `/api/media/${mediaId}/replace`, imgFd2);
  ok('Replace media file', r.status === 200);
  r = await req('DELETE', `/api/media/${mediaId}`);
  ok('Delete unused media', r.status === 200);
  r = await req('DELETE', `/api/media/${pdfId}`);
  ok('Delete pdf media', r.status === 200 || r.status === 409);

  // ---------- Gallery ----------
  console.log('\nGallery albums');
  r = await req('POST', '/api/gallery', {
    title: { bn: 'টেস্ট অ্যালবাম', en: 'Test Album' },
    images: [{ url: mediaUrl || '/uploads/x.png', displayOrder: 0 }],
    published: true,
  });
  ok('Create album', r.status === 201);
  const albumId = r.data._id;
  created.push(['DELETE', `/api/gallery/${albumId}`]);
  r = await req('GET', `/api/gallery/${albumId}`);
  ok('Public album detail', r.status === 200 && r.data.imageCount >= 0);

  // ---------- Videos ----------
  r = await req('POST', '/api/videos', { title: { bn: 'টেস্ট ভিডিও', en: 'Test Video' }, provider: 'youtube', videoId: 'dQw4w9WgXcQ', published: true });
  ok('Create video', r.status === 201);
  created.push(['DELETE', `/api/videos/${r.data._id}`]);

  // ---------- Committee ----------
  r = await req('POST', '/api/committee', { name: { bn: 'টেস্ট কমিটি', en: 'Test Committee' }, designation: { bn: 'সভাপতি', en: 'President' }, active: true });
  ok('Create committee member', r.status === 201);
  created.push(['DELETE', `/api/committee/${r.data._id}`]);

  // ---------- Puja + schedule + today + countdown ----------
  console.log('\nDurga Puja & schedule');
  const year = 2099;
  r = await req('POST', '/api/puja', {
    year, title: { bn: 'টেস্ট পূজা', en: 'Test Puja' },
    startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    published: true, featured: false,
  });
  ok('Create puja', r.status === 201, r.status);
  const pujaId = r.data._id;
  created.push(['DELETE', `/api/puja/${pujaId}`]);
  const todayIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  todayIST.setHours(10, 0, 0, 0);
  r = await req('POST', `/api/puja/${pujaId}/schedule`, {
    dayLabel: { bn: 'মহাষ্টমী', en: 'Maha Ashtami' },
    date: todayIST.toISOString(),
    time: 'সকাল ৯টা',
    title: { bn: 'টেস্ট অঞ্জলি', en: 'Test Anjali' },
    published: true,
  });
  ok('Create schedule item', r.status === 201, r.status);
  const schedId = r.data._id;
  r = await req('GET', '/api/puja/schedule/today');
  ok("Today's programme is IST-aware and includes item", r.status === 200 && r.data.items.some((i) => i._id === schedId),
    r.data.items && r.data.items.length);
  r = await req('GET', '/api/puja/countdown');
  ok('Countdown endpoint returns a puja date', r.status === 200 && r.data && r.data.startDate);
  r = await req('GET', `/api/puja/${pujaId}/schedule`);
  ok('Public puja schedule', r.status === 200 && r.data.items.length === 1);

  // ---------- Mansa mandir & history singletons ----------
  r = await req('PUT', '/api/mansa-mandir', { intro: { bn: 'ভূমিকা পরীক্ষা', en: 'Intro test' } });
  ok('Update Mansa Mandir content', r.status === 200 && r.data.intro.en === 'Intro test');
  r = await req('PUT', '/api/mansa-mandir', { intro: { bn: '', en: '' } });
  ok('Mansa Mandir content reset (cleanup)', r.status === 200);
  r = await req('PUT', '/api/history', { content: { bn: 'টেস্ট', en: 'Test' } });
  ok('Update history content', r.status === 200 && r.data.content.en === 'Test');
  r = await req('PUT', '/api/history', { content: { bn: '', en: '' } });
  ok('History content reset (cleanup)', r.status === 200);

  // ---------- Social activities / memories / souvenir ----------
  r = await req('POST', '/api/social-activities', { title: { bn: 'টেস্ট কার্যক্রম', en: 'Test Activity' }, published: true });
  ok('Create social activity', r.status === 201);
  created.push(['DELETE', `/api/social-activities/${r.data._id}`]);
  r = await req('POST', '/api/memories', { title: { bn: 'টেস্ট স্মৃতি', en: 'Test Memory' }, year: 2020, published: true });
  ok('Create memory', r.status === 201);
  created.push(['DELETE', `/api/memories/${r.data._id}`]);
  r = await req('POST', '/api/souvenir', { editionYear: 2024, title: { bn: 'টেস্ট সুভেনির', en: 'Test Souvenir' }, published: true });
  ok('Create souvenir', r.status === 201);
  created.push(['DELETE', `/api/souvenir/${r.data._id}`]);

  // ---------- Contact inbox ----------
  console.log('\nContact & inbox');
  r = await req('POST', '/api/contact', { name: 'Smoke Tester', email: 'tester@example.com', subject: 'Test', message: 'Hello' }, { auth: false });
  ok('Public contact submit', r.status === 201);
  r = await req('POST', '/api/contact', { name: '', email: 'bad', subject: '', message: '' }, { auth: false });
  ok('Invalid contact rejected', r.status === 400);
  r = await req('GET', '/api/contact/messages');
  ok('Admin inbox lists message', r.status === 200 && r.data.items.length > 0);
  const msgId = r.data.items[0]._id;
  r = await req('PATCH', `/api/contact/messages/${msgId}`, { read: true });
  ok('Mark message read', r.status === 200 && r.data.read === true);
  r = await req('DELETE', `/api/contact/messages/${msgId}`);
  ok('Delete message', r.status === 200);

  // ---------- Settings update & revert ----------
  r = await req('PUT', '/api/settings', { footerText: { bn: 'টেস্ট', en: 'Test' } });
  ok('Update settings', r.status === 200);
  r = await req('PUT', '/api/settings', { footerText: { bn: '', en: '' } });
  ok('Settings reverted (cleanup)', r.status === 200);

  // ---------- Stats ----------
  r = await req('GET', '/api/admin/stats');
  ok('Dashboard stats reflect real data', r.status === 200 && typeof r.data.members === 'number');

  // ---------- Sitemap ----------
  r = await req('GET', '/sitemap.xml', null, { auth: false });
  ok('Sitemap XML generated', r.status === 200 && String(r.data).includes('durga-puja'));

  // ---------- Cleanup ----------
  console.log('\nCleanup of test data');
  let cleaned = true;
  for (const [method, url] of created.reverse()) {
    const rr = await req(method, url);
    if (rr.status !== 200) cleaned = false;
  }
  ok('All test records removed', cleaned);
  r = await req('GET', '/api/events?q=Test Event');
  ok('No leftover test events publicly', !r.data.items.some((i) => i.title && i.title.en === 'Test Event'));

  console.log(`\nResult: ${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
