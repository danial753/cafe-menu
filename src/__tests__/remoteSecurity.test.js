import { describe, expect, it } from 'vitest';

/**
 * امنیت Worker (نیازمند Worker در حال اجرا با ADMIN_PASSWORD=cafe1404 در .dev.vars):
 *   npm run dev:api   و   CAFE_API_TARGET=http://127.0.0.1:8788 npx vitest run src/__tests__/remoteSecurity.test.js
 * قفل ۸ تلاش ناموفق عمداً اینجا تست نمی‌شود؛ آن IP را ۱۵ دقیقه می‌بندد و بقیه‌ی تست‌ها را خراب می‌کند.
 */
const TARGET = process.env.CAFE_API_TARGET;
const SALT = 'cafe-menu::v1::';
const hash = async (t) =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + t))))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
const put = (path, key, body) =>
  fetch(`${TARGET}/api${path}`, { method: 'PUT', headers: { 'x-cafe-key': key, 'content-type': 'application/json' }, body });

describe.skipIf(!TARGET)('امنیت API', () => {
  it('کلید غلط رد می‌شود و پاسخ عمومی رمز یا هش نشت نمی‌دهد', async () => {
    const res = await put('/cafe', await hash('not-the-password'), JSON.stringify({ name: 'x' }));
    expect(res.status).toBe(401);
    const state = await (await fetch(`${TARGET}/api/state`)).text();
    expect(state).not.toMatch(/defaultPassword|passwordHash|"hash"/i);
  });

  it('کلید بدون قالب درست (۶۴ نویسه‌ی هگز) برای تغییر رمز پذیرفته نمی‌شود', async () => {
    const res = await put('/auth', await hash('cafe1404'), JSON.stringify({ key: 'short' }));
    expect([400, 429]).toContain(res.status);
  });

  it('بدنه‌ی بزرگ‌تر از ۱ مگابایت رد می‌شود', async () => {
    const res = await put('/menu', await hash('cafe1404'), 'a'.repeat(1_100_000));
    expect([413, 429]).toContain(res.status);
  });

  it('اتصال WebSocket بدون Upgrade رد می‌شود', async () => {
    expect((await fetch(`${TARGET}/api/live`)).status).toBe(426);
  });
});

describe('رمز اولیه‌ی Worker', () => {
  it('اگر Secret باشد همان؛ وگرنه پیش‌فرض (برای شروع ساده)، و محافظ‌ها برقرارند', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const src = readFileSync(resolve(__dirname, '../../worker/index.js'), 'utf8');
    expect(src).toMatch(/env\.ADMIN_PASSWORD/);
    expect(src).toMatch(/safeEqual/);
    expect(src).toMatch(/MAX_FAILS/);
  });
});
