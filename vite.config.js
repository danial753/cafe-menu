import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Cloudflare Workers (Static Assets) قاعده‌ی Pages یعنی «/* /index.html 200» را
 * به‌عنوان «حلقه‌ی بی‌نهایت» رد می‌کند و کل دیپلوی را متوقف می‌کند (خطای 100324).
 * SPA fallback در Workers با wrangler.jsonc → assets.not_found_handling انجام می‌شود.
 *
 * این پلاگین تضمین می‌کند حتی اگر فایل قدیمی public/_redirects در مخزن جا مانده باشد،
 * از خروجی build حذف شود.
 */
function dropPagesRedirects() {
  let outDir = 'dist';
  return {
    name: 'cafe-menu:drop-pages-redirects',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir || 'dist';
    },
    closeBundle() {
      const target = resolve(process.cwd(), outDir, '_redirects');
      if (!existsSync(target)) return;
      const body = readFileSync(target, 'utf8');
      // قاعده‌های مخصوص Pages: /* /index.html 200 یا مشابهش
      if (/\*\s+\/(index)?\.?html?\s+200/.test(body) || /\/\*\s+\/index\.html/.test(body)) {
        rmSync(target, { force: true });
        this.warn(
          'فایل _redirects مخصوص Cloudflare Pages بود و از خروجی حذف شد ' +
            '(Workers آن را به‌عنوان حلقه‌ی بی‌نهایت رد می‌کند؛ از wrangler.jsonc استفاده می‌شود).',
        );
      }
    },
  };
}

/**
 * اگر index.html به‌اشتباه با نسخه‌ی «ساخته‌شده» (dist) جایگزین شود، dev/build بی‌صدا
 * کد قدیمی را اجرا می‌کند و تغییرات src دیده نمی‌شود. اینجا زودتر و واضح خطا می‌دهیم.
 */
function guardEntry() {
  return {
    name: 'cafe-menu:guard-entry',
    configResolved(config) {
      const file = resolve(config.root, 'index.html');
      if (!existsSync(file)) return;
      const html = readFileSync(file, 'utf8');
      if (!/src=["']\/src\/main\.jsx["']/.test(html)) {
        throw new Error(
          '\n[cafe-menu] index.html به /src/main.jsx اشاره نمی‌کند؛ احتمالاً فایلِ ساخته‌شده‌ی dist روی آن کپی شده.\n' +
            '  راه‌حل: index.html اصلی را برگردانید (git checkout index.html یا از زیپ پروژه) و پوشه‌ی assets/ کنار آن را پاک کنید.\n' +
            '  محتویات dist را فقط روی Cloudflare آپلود کنید، نه داخل پوشه‌ی پروژه.\n',
        );
      }
    },
  };
}

// allowedHosts: true  ->  اجازه‌ی دسترسی از دامنه‌ی پیش‌نمایش (preview) و دامنه‌ی شخصی شما
export default defineConfig({
  plugins: [react(), guardEntry(), dropPagesRedirects()],
  // فقط index.html اصلی اسکن شود (فایل‌های ساخته‌شده‌ی جا مانده، هشدار «dynamic import» نسازند)
  optimizeDeps: { entries: ['index.html'] },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    // در حالت توسعه، درخواست‌های /api به Worker محلی می‌رود:
    //   npx wrangler dev --port 8788
    proxy: {
      '/api': {
        target: process.env.CAFE_API_TARGET || 'http://127.0.0.1:8788',
        changeOrigin: true,
        ws: true, // کانال لحظه‌ای (WebSocket) هم پروکسی شود
        // اگر Worker محلی روشن نباشد، برنامه خودش به حالت محلی برمی‌گردد؛ پس خطای پروکسی را شلوغ نکن
        configure: (proxy) => {
          let told = false;
          proxy.on('error', (_err, _req, res) => {
            if (!told) {
              told = true;
              console.info('\n[cafe-menu] Worker محلی (۸۷۸۸) روشن نیست؛ برنامه در حالت محلی اجرا می‌شود. برای حالت سروری: npm run dev:api\n');
            }
            if (res && typeof res.writeHead === 'function' && !res.headersSent) {
              res.writeHead(503, { 'content-type': 'application/json' });
              res.end('{"ok":false,"error":"api-offline"}');
            }
          });
        },
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    target: 'es2019',
    cssCodeSplit: false,
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    globals: true,
  },
});
