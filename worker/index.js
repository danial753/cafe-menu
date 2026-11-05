/**
 * API + کانال لحظه‌ای منوی کافه روی Cloudflare Workers.
 *
 * چرا: داده‌ی منو و اطلاعات کافه اگر در localStorage باشد، فقط در همان مرورگر
 * می‌ماند و روی گوشی مشتری دیده نمی‌شود. این Worker داده را در Durable Object
 * (SQLite داخلی کلادفلر) نگه می‌دارد و هر تغییری را با WebSocket همان لحظه به
 * همه‌ی دستگاه‌های متصل push می‌کند.
 *
 * endpoints (همه زیر /api):
 *   GET  /api/health        → { ok }
 *   GET  /api/state         → { menu, cafe, meta }   (عمومی، بدون هش رمز)
 *   GET  /api/meta          → { menuUpdated, cafeUpdated } نسخه‌ی سبک
 *   GET  /api/live          → WebSocket (Upgrade) — دریافت لحظه‌ای تغییرات
 *   POST /api/login         → { ok, changed }        بدنه: { key }
 *   PUT  /api/menu          → { ok }                 هدر x-cafe-key لازم است
 *   PUT  /api/cafe          → { ok }                 هدر x-cafe-key لازم است
 *   PUT  /api/auth          → { ok }                 بدنه: { key } (کلید جدید)
 *
 * امنیت:
 *  - رمز اولیه‌ی ادمین: اگر Secret به نام ADMIN_PASSWORD تنظیم شده باشد همان؛ وگرنه رمز پیش‌فرض
 *    «cafe1404» (برای سادگیِ شروع). بعد از اولین ورود از پنل رمز را عوض کنید؛ تا آن موقع هر کسی
 *    که این پیش‌فرض را بداند می‌تواند منو را تغییر دهد.
 *  - بعد از «تغییر رمز» از پنل، هش رمز جدید جای آن را می‌گیرد.
 *  - ورودِ اشتباه برای هر IP محدود می‌شود (۸ بار در ۱۵ دقیقه ← ۴۲۹).
 *  - مقایسه‌ی کلید زمان‌ثابت است؛ اندازه‌ی بدنه و تعداد WebSocket سقف دارد.
 */

import cafeDefaults from '../src/data/cafe.json';
import pkg from '../package.json';
import menuSeed from '../src/data/menu.seed.json';

const SALT = 'cafe-menu::v1::';
const DOC_KEYS = { menu: 'menu', cafe: 'cafe', auth: 'auth' };
const MAX_BODY_CHARS = 1_000_000; // حدود ۱ مگابایت
const MAX_SOCKETS = 300;
const MAX_FAILS = 8;
const FAIL_WINDOW_MS = 15 * 60 * 1000;
const KEY_RE = /^[0-9a-f]{64}$/;

/** مقایسه‌ی زمان‌ثابت دو رشته (جلوگیری از timing attack) */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

/** رمز پیش‌فرض هرگز به کلاینت برنگردد */
function stripSecret(cafe) {
  if (!cafe || typeof cafe !== 'object') return cafe;
  const { defaultPassword, passwordHash, ...rest } = cafe;
  return rest;
}

/** مخزنِ سندها؛ یک نمونه (singleton) برای کل کافه */
export class CafeStore {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env || {};
    this.sql = ctx.storage.sql;
    this.sql.exec('CREATE TABLE IF NOT EXISTS fails (ip TEXT PRIMARY KEY, n INTEGER NOT NULL, first INTEGER NOT NULL)');
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS doc (
         name TEXT PRIMARY KEY,
         json TEXT NOT NULL,
         updated INTEGER NOT NULL
       )`,
    );
  }

  read(name) {
    const rows = [...this.sql.exec('SELECT json, updated FROM doc WHERE name = ?', name)];
    if (!rows.length) return null;
    try {
      return { value: JSON.parse(rows[0].json), updated: rows[0].updated };
    } catch {
      return null;
    }
  }

  write(name, value) {
    const updated = Date.now();
    this.sql.exec(
      `INSERT INTO doc (name, json, updated) VALUES (?, ?, ?)
       ON CONFLICT(name) DO UPDATE SET json = excluded.json, updated = excluded.updated`,
      name,
      JSON.stringify(value),
      updated,
    );
    return updated;
  }

  /** مقدار پیش‌فرض: منو و اطلاعات کافه‌ی نمونه، و رمز پیش‌فرضِ هش‌شده */
  async ensureSeeded() {
    if (!this.read(DOC_KEYS.menu)) this.write(DOC_KEYS.menu, menuSeed);
    if (!this.read(DOC_KEYS.cafe)) this.write(DOC_KEYS.cafe, stripSecret(cafeDefaults));
  }

  /** هشِ معتبر رمز: رمزِ تغییریافته‌ی ذخیره‌شده، وگرنه Secret محیطی؛ وگرنه null (بسته) */
  async expectedHash() {
    const auth = this.read(DOC_KEYS.auth)?.value;
    if (auth?.changed && auth.hash) return auth.hash;
    const initial = String(this.env.ADMIN_PASSWORD || cafeDefaults.defaultPassword || 'cafe1404').trim();
    return sha256(SALT + initial);
  }

  passwordChanged() {
    return this.read(DOC_KEYS.auth)?.value?.changed === true;
  }

  /* ----------------------- محدودیت تلاش ناموفق (هر IP) ----------------------- */

  isBlocked(ip) {
    const row = [...this.sql.exec('SELECT n, first FROM fails WHERE ip = ?', ip)][0];
    if (!row) return false;
    if (Date.now() - row.first > FAIL_WINDOW_MS) {
      this.sql.exec('DELETE FROM fails WHERE ip = ?', ip);
      return false;
    }
    return row.n >= MAX_FAILS;
  }

  recordFail(ip) {
    const now = Date.now();
    const row = [...this.sql.exec('SELECT n, first FROM fails WHERE ip = ?', ip)][0];
    if (!row || now - row.first > FAIL_WINDOW_MS) {
      this.sql.exec('INSERT OR REPLACE INTO fails (ip, n, first) VALUES (?, 1, ?)', ip, now);
    } else {
      this.sql.exec('UPDATE fails SET n = n + 1 WHERE ip = ?', ip);
    }
  }

  clearFails(ip) {
    this.sql.exec('DELETE FROM fails WHERE ip = ?', ip);
  }

  /** نتیجه: 'ok' | 'denied' | 'blocked' | 'unconfigured' */
  async check(req, key) {
    const ip = req.headers.get('cf-connecting-ip') || 'local';
    if (this.isBlocked(ip)) return 'blocked';
    const expected = await this.expectedHash();
    if (!expected) return 'unconfigured';
    if (key && safeEqual(String(key), expected)) {
      this.clearFails(ip);
      return 'ok';
    }
    this.recordFail(ip);
    return 'denied';
  }

  async authorized(req) {
    await this.ensureSeeded();
    return this.check(req, req.headers.get('x-cafe-key') || '');
  }

  stamps() {
    return {
      menuUpdated: this.read(DOC_KEYS.menu)?.updated ?? 0,
      cafeUpdated: this.read(DOC_KEYS.cafe)?.updated ?? 0,
    };
  }

  /** ارسال پیام به همه‌ی دستگاه‌های متصل (لحظه‌ای) */
  broadcast(payload) {
    const message = JSON.stringify(payload);
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(message);
      } catch {
        /* اتصال مرده؛ خودش بسته می‌شود */
      }
    }
  }

  /* ------------------------- رخدادهای WebSocket ------------------------- */

  webSocketMessage(ws, message) {
    if (message === 'ping') {
      try {
        ws.send('pong');
      } catch {
        /* نادیده بگیر */
      }
    }
  }

  webSocketClose(ws) {
    try {
      ws.close();
    } catch {
      /* نادیده بگیر */
    }
  }

  webSocketError(ws) {
    try {
      ws.close();
    } catch {
      /* نادیده بگیر */
    }
  }

  async fetch(req) {
    const url = new URL(req.url);
    // مسیر درخواست ممکن است /api/... باشد؛ پیشوند را برمی‌داریم
    const path = url.pathname.replace(/^\/api/, '') || '/';

    /* ------------------------------ WebSocket ----------------------------- */
    if (path === '/live') {
      if (req.headers.get('Upgrade') !== 'websocket') {
        return json({ ok: false, error: 'expected-websocket' }, 426);
      }
      if (this.ctx.getWebSockets().length >= MAX_SOCKETS) {
        return json({ ok: false, error: 'too-many-connections' }, 503);
      }
      await this.ensureSeeded();
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      // API خواب‌زدایی (hibernation): اتصال‌ها بدون مصرف CPU زنده می‌مانند
      this.ctx.acceptWebSocket(server);
      try {
        server.send(JSON.stringify({ type: 'hello', ...this.stamps() }));
      } catch {
        /* نادیده بگیر */
      }
      return new Response(null, { status: 101, webSocket: client });
    }

    // بدنه را یک بار همین‌جا می‌خوانیم؛ اگر بدون خواندن بدنه پاسخ ۴۰۱/۴۰۰ بدهیم،
    // Workers خطای «Can't read from request stream after response has been sent» می‌دهد.
    let raw = '';
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      raw = await req.text().catch(() => '');
      if (raw.length > MAX_BODY_CHARS) return json({ ok: false, error: 'too-large' }, 413);
    }
    const deny = (status) =>
      status === 'blocked'
        ? json({ ok: false, error: 'too-many-attempts' }, 429)
        : status === 'unconfigured'
          ? json({ ok: false, error: 'admin-not-configured' }, 503)
          : json({ ok: false, error: 'unauthorized' }, 401);
    const parseBody = () => {
      try {
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };

    if (path === '/health') return json({ ok: true });

    if (path === '/state' && req.method === 'GET') {
      await this.ensureSeeded();
      const menu = this.read(DOC_KEYS.menu);
      const cafe = this.read(DOC_KEYS.cafe);
      return json({
        menu: menu?.value ?? null,
        cafe: cafe?.value ?? null,
        meta: {
          menuUpdated: menu?.updated ?? 0,
          cafeUpdated: cafe?.updated ?? 0,
          passwordChanged: this.passwordChanged(),
        },
      });
    }

    // نسخه‌ی سبک: فقط زمان آخرین تغییر (برای فالبک polling)
    if (path === '/meta' && req.method === 'GET') {
      await this.ensureSeeded();
      return json({ ...this.stamps(), passwordChanged: this.passwordChanged() });
    }

    if (path === '/login' && req.method === 'POST') {
      await this.ensureSeeded();
      const body = parseBody() || {};
      const status = await this.check(req, body?.key);
      if (status !== 'ok') return deny(status);
      return json({ ok: true, changed: this.passwordChanged() });
    }

    if (path === '/menu' && req.method === 'PUT') {
      {
        const status = await this.authorized(req);
        if (status !== 'ok') return deny(status);
      }
      const body = parseBody();
      if (!body || !Array.isArray(body.groups)) return json({ ok: false, error: 'bad-body' }, 400);
      const updated = this.write(DOC_KEYS.menu, body);
      this.broadcast({ type: 'update', what: 'menu', menuUpdated: updated });
      return json({ ok: true, updated });
    }

    if (path === '/cafe' && req.method === 'PUT') {
      {
        const status = await this.authorized(req);
        if (status !== 'ok') return deny(status);
      }
      const body = parseBody();
      if (!body || typeof body !== 'object') return json({ ok: false, error: 'bad-body' }, 400);
      const updated = this.write(DOC_KEYS.cafe, stripSecret(body));
      this.broadcast({ type: 'update', what: 'cafe', cafeUpdated: updated });
      return json({ ok: true, updated });
    }

    if (path === '/auth' && req.method === 'PUT') {
      {
        const status = await this.authorized(req);
        if (status !== 'ok') return deny(status);
      }
      const body = parseBody() || {};
      if (!body?.key || !KEY_RE.test(String(body.key))) return json({ ok: false, error: 'bad-key' }, 400);
      this.write(DOC_KEYS.auth, { hash: String(body.key), changed: true });
      return json({ ok: true });
    }

    return json({ ok: false, error: 'not-found' }, 404);
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    // بقیه‌ی مسیرها = فایل‌های استاتیک (index.html و assets)
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);

    // بررسی سلامتِ انتشار: بدون دخالت Durable Object، سریع و سبک.
    // اگر این آدرس HTML برگرداند (نه JSON)، یعنی Worker روی این دامنه اجرا نمی‌شود.
    if (url.pathname === '/api/health') {
      let indexStatus = 0;
      try {
        const res = await env.ASSETS.fetch(new Request(new URL('/index.html', url), { method: 'GET' }));
        indexStatus = res.status;
      } catch {
        indexStatus = -1;
      }
      return new Response(
        JSON.stringify({
          ok: true,
          app: 'cafe-menu',
          version: pkg.version,
          indexStatus,
          runtime: 'cloudflare-worker',
          time: new Date().toISOString(),
        }),
        { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } },
      );
    }

    // درخواست را دست‌نخورده به Durable Object می‌دهیم تا هدر Upgrade (WebSocket) حفظ شود
    const id = env.CAFE.idFromName('cafe-menu');
    return env.CAFE.get(id).fetch(req);
  },
};
