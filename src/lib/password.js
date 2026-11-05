/**
 * ورود ادمین با رمز عبور.
 *
 * ⚠️ مهم: این یک برنامه‌ی تماماً کلاینت‌ساید است، پس رمز در مرورگر بررسی می‌شود
 * و امنیت آن در حد «قفل کردن درِ پنل روی همان دستگاه» است. برای امنیت واقعی
 * باید منو و احراز هویت سمت سرور (Supabase / Firebase) باشد — راهنما را ببینید.
 */

import cafe from '../data/cafe.json';
import {
  isSupabaseConfigured,
  signInAdmin,
  signOutAdmin,
  updateAdminPassword,
} from './supabaseAdapter.js';
import { getSyncMode } from './persistence.js';
import * as remote from './remoteApi.js';

const AUTH_KEY = 'cafe-menu:auth:v1';
const SESSION_KEY = 'cafe-menu:session:v1';
const SALT = 'cafe-menu::v1::';

async function sha256(text) {
  const data = new TextEncoder().encode(SALT + text);
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // اگر صفحه روی HTTP باز باشد، crypto.subtle در دسترس نیست؛
  // از یک هش ساده استفاده می‌کنیم تا برنامه کار کند (امنیت واقعی = بک‌اند).
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < data.length; i += 1) {
    h1 = Math.imul(h1 ^ data[i], 16777619) >>> 0;
    h2 = (Math.imul(h2 + data[i], 2654435761) ^ (h2 >>> 7)) >>> 0;
  }
  return `weak-${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`;
}

function readAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** در اولین اجرا، رمز پیش‌فرض را هش کرده و ذخیره می‌کند */
export async function ensurePassword() {
  if (isSupabaseConfigured || getSyncMode() === 'remote' || readAuth()?.hash) return;
  const hash = await sha256(cafe.defaultPassword);
  localStorage.setItem(AUTH_KEY, JSON.stringify({ hash, changed: false }));
}

export async function login(password) {
  if (isSupabaseConfigured) {
    try {
      const ok = await signInAdmin(String(password ?? ''));
      if (ok) sessionStorage.setItem(SESSION_KEY, '1');
      return ok;
    } catch (err) {
      console.error('ورود به Supabase ناموفق بود:', err);
      return false;
    }
  }
  const hash = await sha256(String(password ?? ''));

  // حالت سروری (Cloudflare Worker): رمز روی سرور بررسی می‌شود،
  // پس ورود از هر گوشی/مرورگری با همان رمز کار می‌کند.
  if (getSyncMode() === 'remote') {
    try {
      const ok = await remote.login(hash);
      if (ok) {
        sessionStorage.setItem(SESSION_KEY, '1');
        // فقط وضعیت «رمز عوض شده» را نگه می‌داریم؛ خودِ هش (کلید نوشتن) در sessionStorage است
        localStorage.setItem(AUTH_KEY, JSON.stringify({ changed: true }));
      }
      return ok;
    } catch (err) {
      console.error('ورود به سرور ناموفق بود:', err);
      return false;
    }
  }

  await ensurePassword();
  const auth = readAuth();
  if (auth && hash === auth.hash) {
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  }
  return false;
}

export function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  if (isSupabaseConfigured) void signOutAdmin();
}

export async function changePassword(next) {
  if (isSupabaseConfigured) return updateAdminPassword(String(next ?? ''));
  const hash = await sha256(String(next ?? ''));
  if (getSyncMode() === 'remote') {
    const ok = await remote.updateKey(hash);
    if (!ok) return false;
    localStorage.setItem(AUTH_KEY, JSON.stringify({ changed: true }));
    return true;
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify({ hash, changed: true }));
  return true;
}

export function isUsingDefaultPassword() {
  if (isSupabaseConfigured) return false;
  if (getSyncMode() === 'remote') return remote.isPasswordChanged() !== true;
  return readAuth()?.changed !== true;
}
