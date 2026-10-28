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

// Initial default blessings matching the high-end stationery reference
const initialBlessings = [
  {
    id: "blessing-1",
    event_slug: "amina-and-farhan",
    guest_name: "Hooyo Maryan & Aabo Xasan",
    relationship: "Waalid",
    category_group: "family",
    content: "Aabo iyo Hooyo waxaan idiin rajeyneynaa nolol barakeysan oo ay ka buuxaan nabad, farxad, iyo jaceyl waara. Hambalyo Farhan & Amina!",
    custom_tag: "Family Blessing",
    likes: 28,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    display_time: "Just now"
  },
  {
    id: "blessing-2",
    event_slug: "amina-and-farhan",
    guest_name: "Zahra & Tariq Al-Mansoor",
    relationship: "Saaxib",
    category_group: "friends",
    content: "Watching you two grow together over the years has been the greatest joy. May Allah bless your union with endless barakah and joy in every step! Can't wait to celebrate on the dance floor tonight.",
    custom_tag: "Celebratory Keepsake",
    likes: 15,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    display_time: "3 mins ago"
  },
  {
    id: "blessing-3",
    event_slug: "amina-and-farhan",
    guest_name: "Abdirahman & Sofia",
    relationship: "Walal",
    category_group: "family",
    content: "Farhan bro, welcome to the married club! Amina, you look ethereal tonight. May your home be filled with laughter and peace.",
    custom_tag: "Sibling Love",
    likes: 19,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    display_time: "7 mins ago"
  },
  {
    id: "blessing-4",
    event_slug: "amina-and-farhan",
    guest_name: "Sheikh Mustafa & Family",
    relationship: "Macallin",
    category_group: "mentors",
    highlight_text: "Barakallahu lakuma wa baraka alaykuma wa jama'a baynakuma fee khayr.",
    content: "May Allah shower your marriage with harmony, guidance, and righteous posterity.",
    custom_tag: "Prayer of Grace",
    likes: 34,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    display_time: "12 mins ago"
  },
  {
    id: "blessing-5",
    event_slug: "amina-and-farhan",
    guest_name: "Dr. Hodan & Cousins",
    relationship: "Xiriir",
    category_group: "family",
    content: "Traveling all the way from London was so worth it for this magical night. Mashallah tabarakallah to the most beautiful couple!",
    custom_tag: "Kinship Traveler",
    likes: 22,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    display_time: "18 mins ago"
  },
  {
    id: "blessing-6",
    event_slug: "amina-and-farhan",
    guest_name: "Uncle Bashir & Aunt Fartun",
    relationship: "Jaar",
    category_group: "mentors",
    content: "We watched you grow up next door and couldn't be prouder of the man you've become Farhan. Blessings to you and your lovely bride Amina.",
    custom_tag: "Lifelong Neighbors",
    likes: 11,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    display_time: "25 mins ago"
  },
  {
    id: "blessing-7",
    event_slug: "amina-and-farhan",
    guest_name: "Samira Nur (Bride's Maid)",
    relationship: "Walal",
    category_group: "family",
    content: "My sweetest Amina! You deserve all the stars and happiness in this universe. Farhan you found pure gold. Mubarak on your wedding day!",
    custom_tag: "Bridal Party",
    likes: 41,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    display_time: "32 mins ago"
  },
  {
    id: "blessing-8",
    event_slug: "amina-and-farhan",
    guest_name: "Cabdi & The Tech Crew",
    relationship: "Saaxib",
    category_group: "friends",
    content: "Wishing you a lifetime of bug-free happiness and infinite love! Best wedding reception ever!",
    custom_tag: "Close Comrades",
    likes: 14,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    display_time: "45 mins ago"
  },
  {
    id: "blessing-9",
    event_slug: "amina-and-farhan",
    guest_name: "Ayeeyo Fadumo",
    relationship: "Waalid",
    category_group: "family",
    is_calligraphy: true,
    content: "Ubad khayr qaba oo indhaha u qabowsiya Alle ha idin siiyo, aamiin yaa rabbi.",
    custom_tag: "Grandmother's Dua",
    likes: 56,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    display_time: "1 hr ago"
  }
];

let blessings = [...initialBlessings];
const sseClients = new Set();

function broadcastEvent(eventType, payload) {
  const data = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // SSE Stream
  if (url.pathname === '/api/messages/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(': heartbeat\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // GET /api/messages
  if (url.pathname === '/api/messages' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      total_count: 142 + (blessings.length - initialBlessings.length),
      count: blessings.length,
      data: blessings
    }));
    return;
  }

  // POST /api/messages
  if (url.pathname === '/api/messages' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const { guest_name, relationship, content, custom_tag, photo_url } = data;
        if (!guest_name || !relationship || !content) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing fields' }));
          return;
        }

        let category_group = 'friends';
        if (['Waalid', 'Walal', 'Xiriir'].includes(relationship)) {
          category_group = 'family';
        } else if (['Macallin', 'Jaar'].includes(relationship)) {
          category_group = 'mentors';
        }

        const newBlessing = {
          id: `blessing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          event_slug: data.event_slug || "amina-and-farhan",
          guest_name: String(guest_name).trim(),
          relationship,
          category_group,
          content: String(content).trim(),
          custom_tag: custom_tag || (relationship === 'Waalid' ? 'Family Blessing' : relationship === 'Walal' ? 'Sibling Love' : 'Heartfelt Blessing'),
          likes: 1,
          photo_url: photo_url || null,
          is_approved: true,
          created_at: new Date().toISOString(),
          display_time: "Just now"
        };

        blessings.unshift(newBlessing);
        broadcastEvent('new-blessing', newBlessing);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: newBlessing }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // POST /api/messages/:id/like
  if (url.pathname.startsWith('/api/messages/') && url.pathname.endsWith('/like') && req.method === 'POST') {
    const id = url.pathname.split('/')[3];
    const blessing = blessings.find(b => b.id === id);
    if (blessing) {
      blessing.likes = (blessing.likes || 0) + 1;
      broadcastEvent('like-update', { id, likes: blessing.likes });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: { id, likes: blessing.likes } }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Not found' }));
    }
    return;
  }

  // PATCH /api/messages/:id
  if (url.pathname.startsWith('/api/messages/') && req.method === 'PATCH') {
    const id = url.pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      const blessing = blessings.find(b => b.id === id);
      if (blessing) {
        if (typeof data.is_approved === 'boolean') blessing.is_approved = data.is_approved;
        broadcastEvent('moderation-update', { id, is_approved: blessing.is_approved });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: blessing }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Not found' }));
      }
    });
    return;
  }

  // DELETE /api/messages/:id
  if (url.pathname.startsWith('/api/messages/') && req.method === 'DELETE') {
    const id = url.pathname.split('/')[3];
    const index = blessings.findIndex(b => b.id === id);
    if (index !== -1) {
      blessings.splice(index, 1);
      broadcastEvent('delete-blessing', { id });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Deleted' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Not found' }));
    }
    return;
  }

  // Static File Serving for Production
  let filePath = path.join(DIST_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Hambalyo Production Server listening on http://localhost:${PORT}`);
});
