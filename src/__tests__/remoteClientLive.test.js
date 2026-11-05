import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { WebSocket as WsClient } from 'ws';

/**
 * تست کدِ کلاینت برای همگام‌سازی لحظه‌ای:
 * remoteApi باید با WebSocket وصل شود و به‌محض تغییر در «دستگاه دیگر»،
 * شنونده‌ها را صدا بزند (همان کاری که store و در نتیجه UI انجام می‌دهد).
 *
 * اجرا:
 *   npx wrangler dev --port 8788
 *   CAFE_API_TARGET=http://127.0.0.1:8788 npx vitest run src/__tests__/remoteClientLive.test.js
 */

const TARGET = process.env.CAFE_API_TARGET;
const SALT = 'cafe-menu::v1::';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const waitFor = async (fn, timeout = 2500) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const value = fn();
    if (value) return value;
    await new Promise((r) => setTimeout(r, 25));
  }
  return null;
};

describe.skipIf(!TARGET)('کلاینت: دریافت لحظه‌ای تغییرات', () => {
  let remote;
  let key;
  const realFetch = globalThis.fetch;

  beforeAll(async () => {
    key = await sha256(SALT + 'cafe1404');
    globalThis.fetch = (url, options) =>
      realFetch(typeof url === 'string' && url.startsWith('/') ? `${TARGET}${url}` : url, options);
    // شبیه‌سازی مرورگر: WebSocket و window.location
    vi.stubGlobal('WebSocket', WsClient);
    vi.stubGlobal('window', {
      location: { protocol: 'http:', host: TARGET.replace(/^http:\/\//, '') },
      addEventListener() {},
      removeEventListener() {},
    });
    remote = await import('../lib/remoteApi.js');
    expect(await remote.probe()).toBe(true);
    remote.setKey(key);
  });

  afterAll(() => {
    globalThis.fetch = realFetch;
    vi.unstubAllGlobals();
  });

  it('با وصل شدن، وضعیت «لحظه‌ای» فعال می‌شود', async () => {
    const states = [];
    const stopLive = remote.subscribeLiveStatus((v) => states.push(v));
    // اتصال با اولین شنونده‌ی داده باز می‌شود (همان کاری که store می‌کند)
    const stopData = remote.subscribeToCafeChanges(() => {});
    expect(await waitFor(() => remote.isLive())).toBe(true);
    expect(states.includes(true)).toBe(true);
    stopData();
    stopLive();
  });

  it('تغییر نام/تم از دستگاه ادمین، بدون هیچ رفرشی به گوشی می‌رسد', async () => {
    const received = [];
    const unsubscribe = remote.subscribeToCafeChanges((cafe) => received.push(cafe));
    // صبر تا اتصال برقرار شود
    expect(await waitFor(() => remote.isLive())).toBe(true);
    received.length = 0;

    // دستگاه دیگر (ادمین) از طریق HTTP تغییر می‌دهد
    const state = await (await fetch(`${TARGET}/api/state`)).json();
    const res = await fetch(`${TARGET}/api/cafe`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-cafe-key': key },
      body: JSON.stringify({
        ...state.cafe,
        name: 'کافه علی',
        festivalTheme: 'halloween',
      }),
    });
    expect(res.ok).toBe(true);

    const hit = await waitFor(() => received.find((c) => c.festivalTheme === 'halloween'), 2000);
    expect(hit).toBeTruthy();
    expect(hit.name).toBe('کافه علی');
    unsubscribe();
  });

  it('تغییر قیمت/منو هم لحظه‌ای به گوشی می‌رسد', async () => {
    const received = [];
    const unsubscribe = remote.subscribeToChanges((menu) => received.push(menu));
    expect(await waitFor(() => remote.isLive())).toBe(true);
    received.length = 0;

    const state = await (await fetch(`${TARGET}/api/state`)).json();
    const menu = structuredClone(state.menu);
    if (!menu.groups?.length) menu.groups = [{ id: 'g1', title: 'قهوه', items: [] }];
    if (!menu.groups[0].items?.length) menu.groups[0].items = [{ id: 'i1', name: 'اسپرسو', price: 0 }];
    const uniquePrice = 200000 + (Date.now() % 90000);
    menu.groups[0].items[0].price = uniquePrice;
    const res = await fetch(`${TARGET}/api/menu`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-cafe-key': key },
      body: JSON.stringify(menu),
    });
    expect(res.ok).toBe(true);

    const hit = await waitFor(
      () => received.find((m) => m.groups?.[0]?.items?.[0]?.price === uniquePrice),
      2000,
    );
    expect(hit).toBeTruthy();
    unsubscribe();
  });
});
