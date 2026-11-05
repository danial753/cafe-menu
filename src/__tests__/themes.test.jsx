import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, render, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MenuProvider } from '../lib/store.jsx';
import MenuPage from '../pages/MenuPage.jsx';
import ThemeScene from '../components/ThemeScene.jsx';
import HeroArt from '../components/scenes/HeroArt.jsx';
import ParticleField from '../components/ParticleField.jsx';
import { THEMES, getTheme, isNightTheme } from '../lib/themes.js';
import { useTheme } from '../lib/theme.js';

const root = resolve(__dirname, '../..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  cleanup();
  delete document.documentElement.dataset.festival;
  delete document.documentElement.dataset.night;
});

describe('فهرست تم‌ها', () => {
  it('ده تم یکتا با فیلدهای کامل دارد', () => {
    expect(THEMES).toHaveLength(10);
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(10);
    for (const t of THEMES) {
      expect(t.label).toBeTruthy();
      expect(t.icon).toBeTruthy();
      expect(t.colors.length).toBeGreaterThanOrEqual(2);
      expect(t.preview).toContain('gradient');
      expect(t.particles).toBeTruthy();
    }
  });

  it('تم‌های شبانه مشخص‌اند و شناسه‌ی ناشناخته به کلاسیک برمی‌گردد', () => {
    for (const id of ['halloween', 'ramadan', 'yalda', 'christmas', 'ruby']) expect(isNightTheme(id)).toBe(true);
    for (const id of ['classic', 'nowruz', 'love', 'autumn', 'mother']) expect(isNightTheme(id)).toBe(false);
    expect(getTheme('nope').id).toBe('classic');
    expect(getTheme(undefined).id).toBe('classic');
  });

  it('هالووین «خفاش» و روز عشق «قلب» دارد', () => {
    expect(getTheme('halloween').particles).toBe('bat');
    expect(getTheme('love').particles).toBe('heart');
    expect(getTheme('love').label).toContain('پاریس');
  });
});

describe('صحنه‌ی مناسبتی', () => {
  const festive = THEMES.filter((t) => t.id !== 'classic');

  it.each(festive.map((t) => t.id))('صحنه و دکور بالای «%s» رندر می‌شود', (id) => {
    const { container } = render(<ThemeScene id={id} />);
    const scene = container.querySelector('#theme-scene');
    expect(scene).not.toBeNull();
    expect(scene.getAttribute('aria-hidden')).toBe('true');
    expect(scene.querySelector('svg, .hw-moon, .nw-sun')).not.toBeNull();
    expect(container.querySelector('#theme-top svg, #theme-top .rm-lantern')).not.toBeNull();
  });

  it('تم کلاسیک صحنه‌ی کافه‌ی گرم دارد (لامپ آویز + قفسه‌ی فنجان)', () => {
    const { container } = render(<ThemeScene id="classic" />);
    const scene = container.querySelector('#theme-scene');
    expect(scene).not.toBeNull();
    expect(scene.getAttribute('aria-hidden')).toBe('true');
    expect(scene.querySelectorAll('.cl-lamp').length).toBeGreaterThan(0);
    expect(scene.querySelector('.cl-shelf')).not.toBeNull();
    expect(container.querySelectorAll('#theme-top .cl-string__bulb').length).toBeGreaterThan(0);
  });

  it.each(festive.map((t) => t.id))('تصویر کارت خوش‌آمدگویی «%s» ساخته می‌شود', (id) => {
    const { container } = render(<HeroArt id={id} />);
    expect(container.querySelector('.hero__art svg')).not.toBeNull();
  });

  it('هالووین چکه‌ی خون، تار عنکبوت و خفاش دارد', () => {
    const { container } = render(<ThemeScene id="halloween" />);
    expect(container.querySelectorAll('.hw-drip').length).toBeGreaterThanOrEqual(8);
    expect(container.querySelectorAll('.hw-web').length).toBe(2);
    expect(container.querySelectorAll('.hw-bat').length).toBeGreaterThanOrEqual(3);
    expect(container.querySelector('.hw-spider')).not.toBeNull();
  });

  it('پاریس برج ایفل دارد', () => {
    const { container } = render(<ThemeScene id="love" />);
    expect(container.querySelector('.lv-tower')).not.toBeNull();
  });

  it('بوم ذرات بدون canvas در jsdom خطا نمی‌دهد', () => {
    const { container } = render(<ParticleField kind="bat" />);
    expect(container.querySelector('#bg-canvas').getAttribute('data-kind')).toBe('bat');
  });
});

describe('اعمال تم در برنامه', () => {
  const renderMenu = () =>
    render(
      <MemoryRouter>
        <MenuProvider>
          <MenuPage theme="dark" onToggleTheme={() => {}} />
        </MenuProvider>
      </MemoryRouter>,
    );

  it('تم هالووین، حالت شبانه را فعال می‌کند و برچسب مناسبتی را نشان می‌دهد', async () => {
    localStorage.setItem('cafe-menu:cafe:v1', JSON.stringify({ festivalTheme: 'halloween' }));
    const { container } = renderMenu();
    await waitFor(() => expect(document.documentElement.dataset.festival).toBe('halloween'));
    expect(document.documentElement.dataset.night).toBe('true');
    await waitFor(() => expect(container.querySelector('.hero__caption')).not.toBeNull());
    expect(container.querySelector('.hero__art[data-art="halloween"]')).not.toBeNull();
  });

  it('تم نوروز شبانه نیست', async () => {
    localStorage.setItem('cafe-menu:cafe:v1', JSON.stringify({ festivalTheme: 'nowruz' }));
    renderMenu();
    await waitFor(() => expect(document.documentElement.dataset.festival).toBe('nowruz'));
    expect(document.documentElement.dataset.night).toBe('false');
  });

  it('useTheme در تم شبانه اجباری تیره است ولی انتخاب کاربر را نگه می‌دارد', () => {
    localStorage.setItem('cafe-menu:theme', 'light');
    const { result, rerender } = renderHook(({ force }) => useTheme(force), { initialProps: { force: true } });
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    rerender({ force: false });
    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem('cafe-menu:theme')).toBe('light');
    act(() => result.current.toggle());
    expect(result.current.theme).toBe('dark');
  });
});

describe('فایل‌های پروژه', () => {
  it('لایه‌های پس‌زمینه پشت محتوا هستند (باگ نمایش‌داده‌نشدن تب‌ها و آیتم‌ها)', () => {
    const css = read('src/styles/global.css');
    for (const id of ['#bg-layers', '#bg-canvas']) {
      const block = css.slice(css.indexOf(`${id} {`), css.indexOf('}', css.indexOf(`${id} {`)));
      expect(block).toMatch(/z-index:\s*-1/);
    }
    expect(css).toMatch(/#root\s*{[^}]*isolation:\s*isolate/);
    expect(read('src/styles/themes.css')).toMatch(/#theme-scene\s*{[^}]*z-index:\s*-1/);
  });

  it('برای هر تم، استایل اختصاصی در themes.css وجود دارد', () => {
    const css = read('src/styles/themes.css');
    for (const t of THEMES.filter((x) => x.id !== 'classic')) {
      expect(css, t.id).toContain(`[data-festival='${t.id}']`);
    }
  });

  it('BAT پورت را ذخیره/قابل‌انتخاب می‌کند و همان پورت را فقط برای LocalSubnet باز می‌کند', () => {
    const bat = read('start-cafe-menu.bat');
    expect(bat).toMatch(/PORT_FILE/);
    expect(bat).toMatch(/Reuse it\?/);
    expect(bat).toMatch(/localport=!PORT!/);
    expect(bat).toMatch(/remoteip=localsubnet/);
    expect(bat).toMatch(/profile=any/);
    expect(bat).not.toMatch(/program=/);
    expect(bat).toMatch(/--host 0\.0\.0\.0/);
    expect(bat).toMatch(/--strictPort/);
    expect(bat).toMatch(/npm ci/);
    expect(bat).toMatch(/Remove-NetFirewallRule/);
    expect(/[^\x00-\x7F]/.test(bat)).toBe(false);
    expect(bat.split('\n').every((line) => line === '' || line.endsWith('\r'))).toBe(true);
  });

  it('Cloudflare Workers و Supabase برای مسیر SPA و RLS تنظیم شده‌اند', () => {
    // Workers با قاعده‌ی Pages («/* /index.html 200») خطای 100324 می‌دهد؛ فالبک SPA
    // باید از not_found_handling بیاید و _redirects نباید در public باشد.
    expect(read('wrangler.jsonc')).toMatch(/"not_found_handling"\s*:\s*"single-page-application"/);
    expect(existsSync('public/_redirects')).toBe(false);
    // نسخه‌ی Pages برای آپلود مستقیم، بیرون از public نگه داشته شده است
    expect(read('deploy/cloudflare-pages/_redirects')).toMatch(/\/admin \/index\.html 200/);
    expect(read('prepare-cloudflare.bat')).toMatch(/npm run build/);
    const sql = read('supabase/setup.sql');
    expect(sql).toMatch(/for select to anon, authenticated/);
    expect(sql).toMatch(/for all to authenticated/);
    expect(sql).not.toMatch(/for all to anon/);
    expect(read('.env.example')).toContain('VITE_SUPABASE_ADMIN_EMAIL');
  });
});
