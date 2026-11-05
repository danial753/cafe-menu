import { normalizeMenu, cloneSeed } from './menuModel.js';
import { normalizeCafe } from './storage.js';
import cafeDefaults from '../data/cafe.json';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseAdminEmail = import.meta.env.VITE_SUPABASE_ADMIN_EMAIL?.trim() || '';

// کتابخانه‌ی Supabase فقط وقتی واقعاً تنظیم شده باشد (و آن هم هنگام نیاز) دانلود می‌شود؛
// کاربرانی که از Worker یا حالت محلی استفاده می‌کنند حدود ۲۵۰ کیلوبایت کمتر دانلود می‌کنند.
let clientPromise = null;
function getClient() {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => createClient(supabaseUrl, supabaseAnonKey));
  }
  return clientPromise;
}
export const supabase = null; // سازگاری با importهای قدیمی؛ از getClient استفاده کنید

const DOC_ID = 'main';

async function requireClient() {
  const client = await getClient();
  if (!client) throw new Error('تنظیمات Supabase کامل نیست؛ فایل .env.local را بررسی کنید.');
  return client;
}

export async function loadMenu() {
  const client = await requireClient();
  const { data, error } = await client.from('menu_doc').select('data').eq('id', DOC_ID).maybeSingle();
  if (error) throw error;
  return data?.data ? normalizeMenu(data.data) : cloneSeed();
}

export async function saveMenu(menu) {
  const client = await requireClient();
  const { error } = await client
    .from('menu_doc')
    .upsert({ id: DOC_ID, data: menu, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) throw error;
  return true;
}

export async function resetMenu() {
  const seed = cloneSeed();
  await saveMenu(seed);
  return seed;
}

export async function loadCafe() {
  const client = await requireClient();
  const { data, error } = await client.from('cafe_doc').select('data').eq('id', DOC_ID).maybeSingle();
  if (error) throw error;
  return normalizeCafe(data?.data ?? cafeDefaults);
}

export async function saveCafe(profile) {
  const client = await requireClient();
  const { error } = await client
    .from('cafe_doc')
    .upsert({ id: DOC_ID, data: normalizeCafe(profile), updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) throw error;
  return true;
}

function subscribeTable(name, table, handler) {
  let off = () => {};
  let cancelled = false;
  getClient().then((client) => {
    if (!client || cancelled) return;
    const channel = client
      .channel(name)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter: `id=eq.${DOC_ID}` }, handler)
      .subscribe();
    off = () => { void client.removeChannel(channel); };
  });
  return () => {
    cancelled = true;
    off();
  };
}

export function subscribeToChanges(callback) {
  return subscribeTable('menu_doc_changes', 'menu_doc', (payload) => {
    const doc = payload.new ?? payload.old;
    if (doc?.data) callback(normalizeMenu(doc.data));
  });
}

export function subscribeToCafeChanges(callback) {
  return subscribeTable('cafe_doc_changes', 'cafe_doc', (payload) => {
    const doc = payload.new ?? payload.old;
    if (doc?.data) callback(normalizeCafe(doc.data));
  });
}

export async function signInAdmin(password) {
  const client = await requireClient();
  if (!supabaseAdminEmail) throw new Error('ایمیل مدیر در VITE_SUPABASE_ADMIN_EMAIL تنظیم نشده است.');
  const { data, error } = await client.auth.signInWithPassword({ email: supabaseAdminEmail, password });
  if (error || !data.session) return false;
  return true;
}

export async function signOutAdmin() {
  const client = await getClient();
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) console.error('خروج از Supabase ناموفق بود:', error);
}

export async function updateAdminPassword(password) {
  const client = await requireClient();
  const { error } = await client.auth.updateUser({ password });
  if (error) throw error;
  return true;
}
