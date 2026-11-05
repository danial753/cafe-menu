/**
 * لایه‌ی ارتباط با API منو (روی Cloudflare Worker).
 *
 * اگر سایت روی Cloudflare Workers منتشر شده باشد، این API در دسترس است و
 * منو/اطلاعات کافه بین همه‌ی گوشی‌ها و مرورگرها مشترک می‌شود.
 * اگر در دسترس نبود (مثلاً اجرای محلی بدون wrangler)، برنامه به حالت محلی
 * برمی‌گردد تا هیچ‌وقت خراب نشود.
 */

import { loadMenu as loadLocalMenu, loadCafe as loadLocalCafe, normalizeCafe, resetMenu as resetLocalMenu } from './storage.js';

const BASE = '/api';
const KEY_STORAGE = 'cafe-menu:key:v1';
const POLL_MS = 8000;
const PROBE_TIMEOUT_MS = 3500;

let available = null; // null = هنوز بررسی نشده
let cached = { menuJson: '', cafeJson: '', menu: null, cafe: null };
let passwordChanged = false;
let timers = [];

/* ------------------------------- کلید نوشتن ------------------------------- */

export function getKey() {
  try {
    return sessionStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setKey(key) {
  try {
    if (key) sessionStorage.setItem(KEY_STORAGE, key);
    else sessionStorage.removeItem(KEY_STORAGE);
  } catch {
    /* در حالت private mode نادیده بگیر */
  }
}

/* --------------------------------- کمکی‌ها -------------------------------- */

function timeoutSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) return AbortSignal.timeout(ms);
  return undefined;
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
    signal: options.signal || undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

/* ------------------------------- دسترسی‌پذیری ------------------------------ */

export async function probe() {
  if (available !== null) return available;
  if (typeof fetch !== 'function') {
    available = false;
    return false;
  }
  try {
    const { ok, data } = await request('/meta', { signal: timeoutSignal(PROBE_TIMEOUT_MS) });
    available = Boolean(ok && data && typeof data.menuUpdated === 'number');
    if (available) passwordChanged = data.passwordChanged === true;
  } catch {
    available = false;
  }
  return available;
}

export const isAvailable = () => available === true;
export const isPasswordChanged = () => passwordChanged;

/* --------------------------------- خواندن -------------------------------- */

export async function fetchState() {
  const { ok, data } = await request('/state', { signal: timeoutSignal(15000) });
  if (!ok || !data) throw new Error('دریافت داده از سرور ناموفق بود');
  cached.menuJson = JSON.stringify(data.menu ?? null);
  cached.cafeJson = JSON.stringify(data.cafe ?? null);
  cached.menu = data.menu;
  cached.cafe = data.cafe;
  passwordChanged = data.meta?.passwordChanged === true;
  return data;
}

export async function loadMenu() {
  const { menu } = await fetchState();
  if (menu && Array.isArray(menu.groups)) return menu;
  // اولین اجرا روی سرور: از منوی نمونه‌ی همین نسخه استفاده کن
  return loadLocalMenu();
}

export async function loadCafe() {
  const { cafe } = await fetchState();
  const fallback = await loadLocalCafe();
  return cafe ? { ...fallback, ...normalizeCafe(cafe) } : fallback;
}

/* --------------------------------- نوشتن --------------------------------- */

export async function saveMenu(menu) {
  const key = getKey();
  if (!key) return false;
  const { ok } = await request('/menu', {
    method: 'PUT',
    headers: { 'x-cafe-key': key },
    body: JSON.stringify(menu),
  });
  if (ok) {
    cached.menuJson = JSON.stringify(menu);
    cached.menu = menu;
  }
  return ok;
}

export async function saveCafe(profile) {
  const key = getKey();
  if (!key) return false;
  const { ok } = await request('/cafe', {
    method: 'PUT',
    headers: { 'x-cafe-key': key },
    body: JSON.stringify(profile),
  });
  if (ok) {
    cached.cafeJson = JSON.stringify(profile);
    cached.cafe = profile;
  }
  return ok;
}

export async function resetMenu() {
  const seed = await resetLocalMenu();
  await saveMenu(seed);
  return seed;
}

/* -------------------------------- ورود/رمز ------------------------------- */

export async function login(hashedKey) {
  const { ok, data } = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ key: hashedKey }),
  });
  if (ok && data?.ok) {
    setKey(hashedKey);
    passwordChanged = data.changed === true;
    return true;
  }
  return false;
}

export async function updateKey(newHashedKey) {
  const key = getKey();
  const { ok } = await request('/auth', {
    method: 'PUT',
    headers: { 'x-cafe-key': key },
    body: JSON.stringify({ key: newHashedKey }),
  });
  if (ok) {
    setKey(newHashedKey);
    passwordChanged = true;
  }
  return ok;
}

/* -------------------------------- همگام‌سازی ------------------------------ */

const menuListeners = new Set();
const cafeListeners = new Set();
const liveListeners = new Set();

let syncStarted = false;
let stopSync = null;
let lastMenuJson = '';
let lastCafeJson = '';
let lastStamp = null;
let pulling = false;
let pullPending = false;
let socket = null;
let reconnectTry = 0;
let reconnectTimer = null;
let pollTimer = null;
let live = false;

const emit = (menu, cafe) => {
  if (menu) menuListeners.forEach((cb) => cb(menu));
  if (cafe) cafeListeners.forEach((cb) => cb(cafe));
};

const setLive = (next) => {
  if (live === next) return;
  live = next;
  liveListeners.forEach((cb) => cb(next));
};

export const isLive = () => live;

/** داده‌ی تازه را می‌گیرد و فقط اگر عوض شده بود به شنونده‌ها می‌دهد */
async function pullNow() {
  // اگر همین حالا در حال گرفتن داده هستیم، فقط علامت می‌زنیم که دوباره اجرا شود
  // (وگرنه ممکن است یک رخداد مهم بین دو دریافت گم شود)
  if (pulling) {
    pullPending = true;
    return;
  }
  pulling = true;
  try {
    const { menu, cafe, meta } = await fetchState();
    lastStamp = `${meta?.menuUpdated ?? 0}:${meta?.cafeUpdated ?? 0}`;
    const menuJson = JSON.stringify(menu ?? null);
    const cafeJson = JSON.stringify(cafe ?? null);
    const menuOut = menuJson !== lastMenuJson && menu ? menu : null;
    const cafeOut = cafeJson !== lastCafeJson && cafe ? normalizeCafe(cafe) : null;
    lastMenuJson = menuJson;
    lastCafeJson = cafeJson;
    if (menuOut || cafeOut) emit(menuOut, cafeOut);
  } catch {
    /* شبکه قطع بود؛ دفعه‌ی بعد */
  } finally {
    pulling = false;
    if (pullPending) {
      pullPending = false;
      void pullNow();
    }
  }
}

/* ------------------------- کانال لحظه‌ای (WebSocket) ------------------------ */

function socketUrl() {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}${BASE}/live`;
}

function openSocket() {
  if (socket || typeof WebSocket === 'undefined') return;
  try {
    socket = new WebSocket(socketUrl());
  } catch {
    socket = null;
    scheduleReconnect();
    return;
  }

  socket.addEventListener('open', () => {
    reconnectTry = 0;
    setLive(true);
  });

  socket.addEventListener('message', (event) => {
    if (event.data === 'pong') return;
    let msg = null;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }
    if (!msg) return;
    if (msg.type === 'hello') {
      // مقدار اولیه؛ اگر در فاصله‌ی قطعی چیزی عوض شده بود جبران می‌شود
      const stamp = `${msg.menuUpdated ?? 0}:${msg.cafeUpdated ?? 0}`;
      if (lastStamp && stamp !== lastStamp) void pullNow();
      lastStamp = stamp;
      setLive(true);
      return;
    }
    if (msg.type === 'update') {
      // لحظه‌ای: بلافاصله داده‌ی تازه را می‌گیریم (چند میلی‌ثانیه)
      void pullNow();
    }
  });

  socket.addEventListener('close', () => {
    socket = null;
    setLive(false);
    scheduleReconnect();
  });

  socket.addEventListener('error', () => {
    try {
      socket?.close();
    } catch {
      /* نادیده بگیر */
    }
  });
}

function scheduleReconnect() {
  if (reconnectTimer || !syncStarted) return;
  const delay = Math.min(15000, 800 * 2 ** Math.min(reconnectTry, 4));
  reconnectTry += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    openSocket();
  }, delay);
}

/* --------------------------- فالبک: polling سبک --------------------------- */

async function pollOnce() {
  if (live) return; // اتصال لحظه‌ای برقرار است؛ polling لازم نیست
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
  try {
    const meta = await request('/meta', { signal: timeoutSignal(POLL_MS) });
    if (!meta.ok || !meta.data) return;
    const stamp = `${meta.data.menuUpdated}:${meta.data.cafeUpdated}`;
    if (lastStamp === null) {
      lastStamp = stamp;
      return;
    }
    if (stamp === lastStamp) return;
    await pullNow();
  } catch {
    /* نادیده بگیر */
  }
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  // هر ۸ ثانیه؛ ولی اگر WebSocket وصل باشد pollOnce خودش برمی‌گردد
  pollTimer = setInterval(pollOnce, POLL_MS);
}

function ensureSync() {
  if (syncStarted) return;
  syncStarted = true;
  lastMenuJson = cached.menuJson;
  lastCafeJson = cached.cafeJson;
  openSocket();
  startPolling();
  const onVisible = () => {
    if (document.visibilityState !== 'visible') return;
    if (!socket) openSocket();
    void pollOnce();
  };
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onVisible);
  window.addEventListener('online', onVisible);
  stopSync = () => {
    if (pollTimer) clearInterval(pollTimer);
    if (reconnectTimer) clearTimeout(reconnectTimer);
    pollTimer = null;
    reconnectTimer = null;
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', onVisible);
    window.removeEventListener('online', onVisible);
    try {
      socket?.close();
    } catch {
      /* نادیده بگیر */
    }
    socket = null;
    setLive(false);
    syncStarted = false;
  };
}

export function subscribeToChanges(cb) {
  if (available === false) return () => {};
  menuListeners.add(cb);
  ensureSync();
  return () => {
    menuListeners.delete(cb);
    if (!menuListeners.size && !cafeListeners.size) {
      stopSync?.();
      stopSync = null;
    }
  };
}

export function subscribeToCafeChanges(cb) {
  if (available === false) return () => {};
  cafeListeners.add(cb);
  ensureSync();
  return () => {
    cafeListeners.delete(cb);
    if (!menuListeners.size && !cafeListeners.size) {
      stopSync?.();
      stopSync = null;
    }
  };
}

/** وضعیت اتصال لحظه‌ای (برای نشان دادن در پنل ادمین) */
export function subscribeLiveStatus(cb) {
  liveListeners.add(cb);
  cb(live);
  return () => liveListeners.delete(cb);
}
