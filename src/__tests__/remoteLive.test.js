import { beforeAll, describe, expect, it } from 'vitest';
import { WebSocket as WS } from 'ws';

/**
 * تست لحظه‌ای بودن همگام‌سازی (WebSocket).
 *
 * نیازمند Worker در حال اجرا:
 *   npx wrangler dev --port 8788
 *   CAFE_API_TARGET=http://127.0.0.1:8788 npx vitest run src/__tests__/remoteLive.test.js
 *
 * سناریو: دو «گوشی» فقط با WebSocket وصل‌اند؛ دستگاه سوم (ادمین) تم و قیمت‌ها را
 * عوض می‌کند و باید هر دو گوشی پیام تغییر را تقریباً فوری بگیرند.
 */

const TARGET = process.env.CAFE_API_TARGET;
const SALT = 'cafe-menu::v1::';
const LIVE_BUDGET_MS = 1500;

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** یک گوشی متصل به کانال لحظه‌ای */
function connectDevice() {
  const url = `${TARGET.replace('http', 'ws')}/api/live`;
  const socket = new WS(url);
  const messages = [];
  const started = Date.now();
  socket.on('message', (raw) => {
    try {
      messages.push({ at: Date.now() - started, data: JSON.parse(raw.toString()) });
    } catch {
      /* pong */
    }
  });
  const opened = new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });
  return { socket, messages, opened };
}

const waitFor = async (fn, timeout = LIVE_BUDGET_MS) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const value = fn();
    if (value) return value;
    await new Promise((r) => setTimeout(r, 20));
  }
  return null;
};

describe.skipIf(!TARGET)('همگام‌سازی لحظه‌ای (WebSocket)', () => {
  let key;
  beforeAll(async () => {
    key = await sha256(SALT + 'cafe1404');
  });

  it('هر دستگاه بعد از اتصال پیام hello می‌گیرد', async () => {
    const device = connectDevice();
    await device.opened;
    const hello = await waitFor(() => device.messages.find((m) => m.data.type === 'hello'));
    expect(hello).not.toBeNull();
    expect(typeof hello.data.menuUpdated).toBe('number');
    device.socket.close();
  });

  it('تغییر تم/اطلاعات کافه همان لحظه به همه‌ی گوشی‌ها می‌رسد', async () => {
    const a = connectDevice();
    const b = connectDevice();
    await Promise.all([a.opened, b.opened]);

    // ادمین (دستگاه سوم) — فقط HTTP، بدون WebSocket
    const res = await fetch(`${TARGET}/api/cafe`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-cafe-key': key },
      body: JSON.stringify({
        name: 'کافه علی',
        tagline: 'لحظه‌ای شد',
        openingTime: '08:00',
        closingTime: '00:00',
        festivalTheme: 'christmas',
      }),
    });
    expect(res.ok).toBe(true);

    const gotA = await waitFor(() => a.messages.find((m) => m.data.type === 'update' && m.data.what === 'cafe'));
    const gotB = await waitFor(() => b.messages.find((m) => m.data.type === 'update' && m.data.what === 'cafe'));
    expect(gotA).not.toBeNull();
    expect(gotB).not.toBeNull();
    // سرعت: باید خیلی زیر بودجه‌ی ۱.۵ ثانیه باشد (در عمل چند میلی‌ثانیه)
    expect(gotA.at).toBeLessThan(LIVE_BUDGET_MS);
    expect(gotB.at).toBeLessThan(LIVE_BUDGET_MS);

    a.socket.close();
    b.socket.close();
  });

  it('تغییر قیمت یک آیتم همان لحظه push می‌شود', async () => {
    const phone = connectDevice();
    await phone.opened;

    const state = await (await fetch(`${TARGET}/api/state`)).json();
    const menu = structuredClone(state.menu);
    // مستقل از داده‌ی قبلی: اولین آیتمِ موجود را عوض می‌کنیم و اگر منو خالی بود می‌سازیم
    if (!menu.groups?.length) menu.groups = [{ id: 'g1', title: 'قهوه', items: [] }];
    if (!menu.groups[0].items?.length) {
      menu.groups[0].items = [{ id: 'i1', name: 'اسپرسو', price: 0, desc: '' }];
    }
    menu.groups[0].items[0].price = 185000;
    menu.updatedAt = new Date().toISOString();

    const res = await fetch(`${TARGET}/api/menu`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-cafe-key': key },
      body: JSON.stringify(menu),
    });
    expect(res.ok).toBe(true);

    const got = await waitFor(() => phone.messages.find((m) => m.data.type === 'update' && m.data.what === 'menu'));
    expect(got).not.toBeNull();
    expect(got.at).toBeLessThan(LIVE_BUDGET_MS);

    // و داده‌ی تازه واقعاً همان قیمت است
    const after = await (await fetch(`${TARGET}/api/state`)).json();
    expect(after.menu.groups[0].items[0].price).toBe(185000);

    phone.socket.close();
  });

  it('اتصال بدون WebSocket Upgrade رد می‌شود', async () => {
    const res = await fetch(`${TARGET}/api/live`);
    expect(res.status).toBe(426);
  });
});
