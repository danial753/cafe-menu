import * as local from './storage.js';
import * as cloud from './supabaseAdapter.js';
import * as remote from './remoteApi.js';

/**
 * انتخاب محل ذخیره‌سازی، به‌ترتیب اولویت:
 *   1) cloud  → Supabase (اگر VITE_SUPABASE_URL و ANON_KEY تنظیم شده باشد) — بین همه دستگاه‌ها
 *   2) remote → API همان Worker روی Cloudflare — بین همه دستگاه‌ها (بدون سرویس خارجی)
 *   3) local  → localStorage — فقط روی همان مرورگر
 *
 * حالت در زمان اجرا تشخیص داده می‌شود تا هیچ‌وقت برنامه خراب نشود.
 */

let mode = cloud.isSupabaseConfigured ? 'cloud' : 'local';
let initPromise = null;

export const getSyncMode = () => mode;

function adapter() {
  if (mode === 'cloud') return cloud;
  if (mode === 'remote') return remote;
  return local;
}

/**
 * یک بار اجرا می‌شود و همه‌ی فراخوانی‌های هم‌زمان همان Promise را می‌گیرند
 * (وگرنه ممکن است یک فراخوانی، حالتِ هنوز-تشخیص-داده-نشده را ببیند).
 */
export function initPersistence(options = {}) {
  if (!initPromise) {
    initPromise = (async () => {
      if (cloud.isSupabaseConfigured) {
        mode = 'cloud';
        return mode;
      }
      // در تست‌ها به‌صورت پیش‌فرض سراغ شبکه نمی‌رویم (تست‌ها با حالت محلی اجرا می‌شوند)؛
      // تستِ مسیریابی می‌تواند با allowRemote صریحاً حالت سروری را بررسی کند.
      const isTest = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test';
      const allowNetwork = !isTest || options.allowRemote === true;
      mode = allowNetwork && (await remote.probe()) ? 'remote' : 'local';
      return mode;
    })();
  }
  return initPromise;
}

export async function loadMenu() {
  try {
    return await adapter().loadMenu();
  } catch (error) {
    console.error('بارگذاری منو ناموفق بود؛ نسخه‌ی محلی نمایش داده می‌شود:', error);
    return local.loadMenu();
  }
}

export async function saveMenu(menu) {
  try {
    return await adapter().saveMenu(menu);
  } catch (error) {
    console.error('ذخیره‌ی منو ناموفق بود:', error);
    return false;
  }
}

export async function resetMenu() {
  try {
    return await adapter().resetMenu();
  } catch (error) {
    console.error('بازگردانی منو ناموفق بود:', error);
    throw error;
  }
}

export async function loadCafe() {
  try {
    return await adapter().loadCafe();
  } catch (error) {
    console.error('بارگذاری اطلاعات کافه ناموفق بود؛ نسخه‌ی محلی نمایش داده می‌شود:', error);
    return local.loadCafe();
  }
}

export async function saveCafe(profile) {
  try {
    return await adapter().saveCafe(profile);
  } catch (error) {
    console.error('ذخیره‌ی اطلاعات کافه ناموفق بود:', error);
    return false;
  }
}

export const subscribeToChanges = (...args) => adapter().subscribeToChanges(...args);
export const subscribeToCafeChanges = (...args) => adapter().subscribeToCafeChanges(...args);

// سازگاری با کدهای قبلی
export const isCloudStorageEnabled = cloud.isSupabaseConfigured;
