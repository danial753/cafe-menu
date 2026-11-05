import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (p) => readFileSync(p, 'utf8');

/**
 * محافظ رگرسیون: اگر index.html دوباره به یک باندلِ از پیش ساخته‌شده
 * (assets/index-*.js) وصل شود، هیچ تغییری در کد اعمال نمی‌شود و ظاهر/تنظیمات
 * در مرورگر قدیمی می‌ماند. این تست دقیقاً همان حالت را می‌گیرد.
 */
describe('ورودی برنامه', () => {
  const html = read('index.html');

  it('مستقیم به سورس src/main.jsx وصل است', () => {
    expect(html).toMatch(/<script[^>]+type="module"[^>]+src="\/src\/main\.jsx"/);
  });

  it('به باندل یا استایل از پیش ساخته‌شده لینک نمی‌دهد', () => {
    expect(html).not.toMatch(/src="\/assets\/index-[^"]+\.js"/);
    expect(html).not.toMatch(/href="\/assets\/style-[^"]+\.css"/);
  });
});

describe('همگام‌سازی تنظیمات و تم', () => {
  const store = read('src/lib/store.jsx');

  it('تغییر تم/اطلاعات کافه فوراً ذخیره می‌شود', () => {
    expect(store).toMatch(/updateCafe:[\s\S]{0,400}storage\.saveCafe\(next\)/);
  });

  it('با برگشت به تب، داده از منبع دوباره خوانده می‌شود', () => {
    expect(store).toMatch(/visibilitychange/);
    expect(store).toMatch(/const refresh = useCallback/);
  });
});

describe('پایداری بخش باز در منوی مشتری', () => {
  const page = read('src/pages/MenuPage.jsx');

  it('وقتی شناسه‌ی گروه‌ها با sync عوض می‌شود، بخش باز بسته نمی‌شود', () => {
    expect(page).toMatch(/openTitleRef/);
    expect(page).toMatch(/byTitle \|\| groups\[0\]/);
  });
});

/**
 * محافظ رگرسیون دیپلوی Cloudflare:
 * Workers Builds با `npx wrangler deploy` منتشر می‌کند و قاعده‌ی Pages
 * (`/* /index.html 200` در public/_redirects) خطای 100324 و توقف دیپلوی می‌دهد.
 */
describe('تنظیمات دیپلوی Cloudflare', () => {
  it('public/_redirects وجود ندارد', () => {
    expect(existsSync('public/_redirects')).toBe(false);
  });

  it('wrangler.jsonc فالبک SPA را تعریف کرده است', () => {
    const raw = read('wrangler.jsonc');
    expect(raw).toMatch(/"name"\s*:\s*"cafe-menu"/);
    expect(raw).toMatch(/"directory"\s*:\s*"\.\/dist"/);
    expect(raw).toMatch(/"not_found_handling"\s*:\s*"single-page-application"/);
  });
});

describe('پیام «منو بالا نیامد»', () => {
  const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');
  const main = readFileSync(resolve(__dirname, '../main.jsx'), 'utf8');

  it('خطای فایل خارجی (فونت گوگل/CDN) برنامه‌ی سالم را نمی‌پوشاند', () => {
    expect(html).toMatch(/window\.__cafeBooted\)\s*return/);
    expect(html).toMatch(/indexOf\(window\.location\.origin\)\s*!==\s*0\)\s*return/);
  });

  it('بعد از بالا آمدن برنامه، پیام مخفی می‌شود', () => {
    expect(main).toMatch(/boot-fallback'\)\?\.setAttribute\('hidden'/);
  });
});
