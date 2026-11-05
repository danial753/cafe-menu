import { beforeAll, describe, expect, it } from 'vitest';

/**
 * تست یکپارچه‌ی همگام‌سازی بین دستگاه‌ها.
 *
 * این تست به یک Worker در حال اجرا نیاز دارد:
 *   npx wrangler dev --port 8787
 *   CAFE_API_TARGET=http://127.0.0.1:8787 npx vitest run src/__tests__/remoteSync.test.js
 *
 * اگر متغیر محیطی تنظیم نشده باشد، تست رد می‌شود (در CI عادی).
 * سناریو: دستگاه A (ادمین) رمز می‌زند و تم/نام کافه را عوض می‌کند؛
 * دستگاه B (مشتری، بدون هیچ حافظه‌ی مشترک) همان تغییر را می‌بیند.
 */

const TARGET = process.env.CAFE_API_TARGET;
const SALT = 'cafe-menu::v1::';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

describe.skipIf(!TARGET)('همگام‌سازی بین دستگاه‌ها (Worker واقعی)', () => {
  let remote;
  const realFetch = globalThis.fetch;

  beforeAll(async () => {
    // مسیرهای نسبی کلاینت را به Worker محلی وصل می‌کنیم
    globalThis.fetch = (url, options) =>
      realFetch(typeof url === 'string' && url.startsWith('/') ? `${TARGET}${url}` : url, options);
    remote = await import('../lib/remoteApi.js');
  });

  it('API در دسترس است و منوی نمونه را می‌دهد', async () => {
    expect(await remote.probe()).toBe(true);
    const state = await remote.fetchState();
    expect(Array.isArray(state.menu.groups)).toBe(true);
    expect(state.menu.groups.length).toBeGreaterThan(0);
  });

  it('نوشتن بدون رمز رد می‌شود', async () => {
    remote.setKey('');
    expect(await remote.saveCafe({ name: 'هکر' })).toBe(false);
  });

  it('دستگاه A رمز می‌زند، تم و نام کافه را عوض می‌کند', async () => {
    const key = await sha256(SALT + 'cafe1404');
    expect(await remote.login(key)).toBe(true);
    const state = await remote.fetchState();
    const ok = await remote.saveCafe({
      ...state.cafe,
      name: 'کافه علی',
      festivalTheme: 'yalda',
      tagline: 'تست همگام‌سازی بین گوشی‌ها',
    });
    expect(ok).toBe(true);
  });

  it('دستگاه B (بدون حافظه‌ی مشترک) همان تغییرات را می‌بیند', async () => {
    // دستگاه جدید هیچ کلیدی در sessionStorage ندارد
    remote.setKey('');
    const state = await remote.fetchState();
    expect(state.cafe.name).toBe('کافه علی');
    expect(state.cafe.festivalTheme).toBe('yalda');
    expect(state.cafe.defaultPassword).toBeUndefined(); // رمز پیش‌فرض لو نمی‌رود
  });

  it('منوی ذخیره‌شده در دستگاه A روی دستگاه B دیده می‌شود', async () => {
    const key = await sha256(SALT + 'cafe1404');
    remote.setKey(key);
    const marker = `همگام-${Date.now()}`;
    const menu = {
      version: 1,
      updatedAt: new Date().toISOString(),
      groups: [{ id: 'g-sync', title: marker, items: [] }],
    };
    expect(await remote.saveMenu(menu)).toBe(true);

    remote.setKey('');
    const seen = await remote.fetchState();
    expect(seen.menu.groups[0].title).toBe(marker);
  });

  it('تغییر رمز، کلید دستگاه دیگر را باطل می‌کند', async () => {
    const oldKey = await sha256(SALT + 'cafe1404');
    const newKey = await sha256(SALT + 'رمز-تازه-۱۲۳۴۵۶');
    remote.setKey(oldKey);
    expect(await remote.updateKey(newKey)).toBe(true);
    // دستگاه قدیمی با کلید قبلی نمی‌تواند بنویسد
    remote.setKey(oldKey);
    expect(await remote.saveCafe({ name: 'قدیمی' })).toBe(false);
    // دستگاه با رمز جدید می‌تواند
    remote.setKey(newKey);
    expect(await remote.saveCafe({ name: 'کافه علی' })).toBe(true);
    // بازگرداندن رمز پیش‌فرض برای تست‌های بعدی
    remote.setKey(newKey);
    await remote.updateKey(oldKey);
    remote.setKey(oldKey);
  });
});
