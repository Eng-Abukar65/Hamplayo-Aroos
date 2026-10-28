import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// ─────────────────────────────────────────────────────────────
// In-memory store (offline fallback — used when Supabase is not configured)
// ─────────────────────────────────────────────────────────────
const initialBlessings = [
  { id: 'blessing-1', event_slug: 'amina-and-farhan', guest_name: 'Hooyo Maryan & Aabo Xasan', relationship: 'Waalid', category_group: 'family', content: 'Aabo iyo Hooyo waxaan idiin rajeyneynaa nolol barakeysan oo ay ka buuxaan nabad, farxad, iyo jaceyl waara. Hambalyo Farhan & Amina!', custom_tag: 'Family Blessing', likes: 28, is_approved: true, created_at: new Date(Date.now() - 60_000).toISOString(), display_time: 'Just now' },
  { id: 'blessing-2', event_slug: 'amina-and-farhan', guest_name: 'Zahra & Tariq Al-Mansoor', relationship: 'Saaxib', category_group: 'friends', content: "Watching you two grow together over the years has been the greatest joy. May Allah bless your union with endless barakah and joy in every step!", custom_tag: 'Celebratory Keepsake', likes: 15, is_approved: true, created_at: new Date(Date.now() - 3 * 60_000).toISOString(), display_time: '3 mins ago' },
  { id: 'blessing-3', event_slug: 'amina-and-farhan', guest_name: 'Abdirahman & Sofia', relationship: 'Walal', category_group: 'family', content: 'Farhan bro, welcome to the married club! Amina, you look ethereal tonight. May your home be filled with laughter and peace.', custom_tag: 'Sibling Love', likes: 19, is_approved: true, created_at: new Date(Date.now() - 7 * 60_000).toISOString(), display_time: '7 mins ago' },
  { id: 'blessing-4', event_slug: 'amina-and-farhan', guest_name: 'Sheikh Mustafa & Family', relationship: 'Macallin', category_group: 'mentors', highlight_text: "Barakallahu lakuma wa baraka alaykuma wa jama'a baynakuma fee khayr.", content: 'May Allah shower your marriage with harmony, guidance, and righteous posterity.', custom_tag: 'Prayer of Grace', likes: 34, is_approved: true, created_at: new Date(Date.now() - 12 * 60_000).toISOString(), display_time: '12 mins ago' },
  { id: 'blessing-5', event_slug: 'amina-and-farhan', guest_name: 'Dr. Hodan & Cousins', relationship: 'Xiriir', category_group: 'family', content: 'Traveling all the way from London was so worth it for this magical night. Mashallah tabarakallah to the most beautiful couple!', custom_tag: 'Kinship Traveler', likes: 22, is_approved: true, created_at: new Date(Date.now() - 18 * 60_000).toISOString(), display_time: '18 mins ago' },
  { id: 'blessing-6', event_slug: 'amina-and-farhan', guest_name: 'Uncle Bashir & Aunt Fartun', relationship: 'Jaar', category_group: 'mentors', content: "We watched you grow up next door and couldn't be prouder of the man you've become Farhan.", custom_tag: 'Lifelong Neighbors', likes: 11, is_approved: true, created_at: new Date(Date.now() - 25 * 60_000).toISOString(), display_time: '25 mins ago' },
  { id: 'blessing-7', event_slug: 'amina-and-farhan', guest_name: "Samira Nur (Bride's Maid)", relationship: 'Walal', category_group: 'family', content: 'My sweetest Amina! You deserve all the stars and happiness in this universe. Farhan you found pure gold. Mubarak on your wedding day!', custom_tag: 'Bridal Party', likes: 41, is_approved: true, created_at: new Date(Date.now() - 32 * 60_000).toISOString(), display_time: '32 mins ago' },
  { id: 'blessing-8', event_slug: 'amina-and-farhan', guest_name: 'Cabdi & The Tech Crew', relationship: 'Saaxib', category_group: 'friends', content: 'Wishing you a lifetime of bug-free happiness and infinite love! Best wedding reception ever!', custom_tag: 'Close Comrades', likes: 14, is_approved: true, created_at: new Date(Date.now() - 45 * 60_000).toISOString(), display_time: '45 mins ago' },
  { id: 'blessing-9', event_slug: 'amina-and-farhan', guest_name: 'Ayeeyo Fadumo', relationship: 'Waalid', category_group: 'family', is_calligraphy: true, content: 'Ubad khayr qaba oo indhaha u qabowsiya Alle ha idin siiyo, aamiin yaa rabbi.', custom_tag: "Grandmother's Dua", likes: 56, is_approved: true, created_at: new Date(Date.now() - 60 * 60_000).toISOString(), display_time: '1 hr ago' },
];

let blessings = [...initialBlessings];
const sseClients = new Set();

function broadcastSSE(eventType, payload) {
  const data = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try { client.write(data); } catch { sseClients.delete(client); }
  }
}

// ─────────────────────────────────────────────────────────────
// HTTP Server
// ─────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS headers (for dev use)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── SSE Stream ────────────────────────────────────────────
  if (url.pathname === '/api/messages/stream') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    res.write(': connected\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // ── GET /api/messages ─────────────────────────────────────
  if (url.pathname === '/api/messages' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: blessings.length, data: blessings }));
    return;
  }

  // ── POST /api/messages ────────────────────────────────────
  if (url.pathname === '/api/messages' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const d = JSON.parse(body || '{}');
        if (!d.guest_name || !d.relationship || !d.content) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing fields' }));
          return;
        }
        let category_group = 'friends';
        if (['Waalid', 'Walal', 'Xiriir'].includes(d.relationship)) category_group = 'family';
        else if (['Macallin', 'Jaar'].includes(d.relationship)) category_group = 'mentors';

        const nb = {
          id: d.id || `blessing-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          event_slug: d.event_slug || 'amina-and-farhan',
          guest_name: String(d.guest_name).trim(),
          relationship: d.relationship, category_group,
          content: String(d.content).trim(),
          custom_tag: d.custom_tag || 'Heartfelt Blessing',
          likes: 0, photo_url: d.photo_url || null,
          is_approved: true, created_at: new Date().toISOString(), display_time: 'Just now',
        };
        // Prevent duplicate IDs
        if (!blessings.some(b => b.id === nb.id)) {
          blessings.unshift(nb);
          broadcastSSE('new-blessing', nb);
        }
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: nb }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // ── POST /api/messages/:id/like ───────────────────────────
  if (url.pathname.startsWith('/api/messages/') && url.pathname.endsWith('/like') && req.method === 'POST') {
    const id = url.pathname.split('/')[3];
    const b = blessings.find(x => x.id === id);
    if (b) {
      b.likes++;
      broadcastSSE('like-update', { id, likes: b.likes });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: { id, likes: b.likes } }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Not found' }));
    }
    return;
  }

  // ── PATCH /api/messages/:id ───────────────────────────────
  if (url.pathname.startsWith('/api/messages/') && req.method === 'PATCH') {
    const id = url.pathname.split('/')[3];
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const d = JSON.parse(body || '{}');
      const b = blessings.find(x => x.id === id);
      if (b) {
        if (typeof d.is_approved === 'boolean') b.is_approved = d.is_approved;
        broadcastSSE('moderation-update', { id, is_approved: b.is_approved });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: b }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Not found' }));
      }
    });
    return;
  }

  // ── DELETE /api/messages/:id ──────────────────────────────
  if (url.pathname.startsWith('/api/messages/') && req.method === 'DELETE') {
    const id = url.pathname.split('/')[3];
    const idx = blessings.findIndex(x => x.id === id);
    if (idx !== -1) {
      blessings.splice(idx, 1);
      broadcastSSE('delete-blessing', { id });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Not found' }));
    }
    return;
  }

  // ── Static files ──────────────────────────────────────────
  let filePath = path.join(DIST_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('Not Found'); }
    else { res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' }); res.end(content); }
  });
});

server.listen(PORT, () => {
  console.log(`\n🌹 Hambalyo Production Server`);
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → Supabase: ${process.env.VITE_SUPABASE_URL ? '✓ configured' : '✗ offline mode'}\n`);
});
