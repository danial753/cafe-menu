import { cloneSeed, normalizeMenu } from './menuModel.js';
import cafeDefaults from '../data/cafe.json';

/**
 * لایه‌ی ذخیره‌سازی.
 * پیش‌فرض: localStorage مرورگر (بدون نیاز به سرور) + فایل JSON نمونه.
 * برای اتصال به Supabase/Firebase فقط همین دو تابع را عوض کنید
 * (نمونه‌ی آماده در src/lib/supabaseAdapter.js).
 */

export const STORAGE_KEY = 'cafe-menu:data:v1';
export const CAFE_STORAGE_KEY = 'cafe-menu:cafe:v1';

export function normalizeCafe(raw) {
  const value = raw && typeof raw === 'object' ? raw : {};
  return {
    ...cafeDefaults,
    ...value,
    name: String(value.name ?? cafeDefaults.name).trim() || cafeDefaults.name,
    openingTime: String(value.openingTime ?? cafeDefaults.openingTime),
    closingTime: String(value.closingTime ?? cafeDefaults.closingTime),
    festivalTheme: String(value.festivalTheme ?? cafeDefaults.festivalTheme),
  };
}

export async function loadCafe() {
  try {
    const raw = localStorage.getItem(CAFE_STORAGE_KEY);
    return normalizeCafe(raw ? JSON.parse(raw) : cafeDefaults);
  } catch {
    return normalizeCafe(cafeDefaults);
  }
}

export async function saveCafe(profile) {
  try {
    localStorage.setItem(CAFE_STORAGE_KEY, JSON.stringify(normalizeCafe(profile)));
    return true;
  } catch (err) {
    console.error('ذخیره‌ی اطلاعات کافه ناموفق بود:', err);
    return false;
  }
}

export function subscribeToCafeChanges(callback) {
  const handler = (event) => {
    if (event.key !== CAFE_STORAGE_KEY) return;
    try {
      callback(normalizeCafe(event.newValue ? JSON.parse(event.newValue) : cafeDefaults));
    } catch {
      /* ignore malformed settings */
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export async function loadMenu() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    return normalizeMenu(JSON.parse(raw));
  } catch {
    return cloneSeed();
  }
}

export async function saveMenu(menu) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
    return true;
  } catch (err) {
    console.error('ذخیره‌سازی ناموفق بود:', err);
    return false;
  }
}

export async function resetMenu() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return cloneSeed();
}

/**
 * همگام‌سازی بین تب‌ها: اگر در تب دیگری (مثلاً پنل ادمین) تغییری داده شود،
 * تب منوی مشتری همان لحظه به‌روز می‌شود.
 */
export function subscribeToChanges(callback) {
  const handler = (event) => {
    if (event.key !== STORAGE_KEY) return;
    try {
      callback(event.newValue ? normalizeMenu(JSON.parse(event.newValue)) : cloneSeed());
    } catch {
      /* ignore */
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export function downloadJSON(data, filename = 'menu.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(normalizeMenu(JSON.parse(String(reader.result))));
      } catch (err) {
        reject(new Error('فایل JSON معتبر نیست'));
      }
    };
    reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود'));
    reader.readAsText(file);
  });
}

/**
 * تصویر آپلودشده را کوچک می‌کند تا حجم داده‌ی ذخیره‌شده زیاد نشود.
 * خروجی: data URL با حداکثر عرض 480 پیکسل.
 */
export function fileToResizedDataUrl(file, maxSize = 480) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('فقط فایل تصویری مجاز است'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('خواندن تصویر ناموفق بود'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود'));
    reader.readAsDataURL(file);
  });
}
