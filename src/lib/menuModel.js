import seed from '../data/menu.seed.json';

/** ساختار خالی منو */
export function emptyMenu() {
  return { version: 1, updatedAt: new Date().toISOString(), groups: [] };
}

export function cloneSeed() {
  return JSON.parse(JSON.stringify(seed));
}

export function newItem() {
  return {
    id: `i-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: '',
    desc: '',
    price: 0,
    emoji: '🍽️',
    image: '',
    available: true,
    tags: [],
  };
}

export function newGroup() {
  return {
    id: `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title: 'گروه جدید',
    subtitle: '',
    icon: '🍽️',
    accent: '#8B4B2A',
    items: [],
  };
}

/** تبدیل «۱۲۸٬۰۰۰» یا «128,000» به عدد ۱۲۸۰۰۰ */
export function toPriceNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : 0;
  const cleaned = String(value ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٬,٫\s]/g, '')
    .replace(/[^0-9]/g, '');
  return cleaned ? Number(cleaned) : 0;
}

/** نرمال‌سازی داده‌ی ورودی تا شکل منو همیشه معتبر بماند */
export function normalizeMenu(raw) {
  if (!raw || !Array.isArray(raw.groups)) return emptyMenu();
  const groups = raw.groups
    .filter((g) => g && typeof g === 'object')
    .map((g) => ({
      id: String(g.id || `g-${Math.random().toString(36).slice(2, 8)}`),
      title: String(g.title ?? 'بدون نام'),
      subtitle: String(g.subtitle ?? ''),
      icon: String(g.icon ?? '🍽️'),
      accent: String(g.accent ?? '#8B4B2A'),
      items: (Array.isArray(g.items) ? g.items : [])
        .filter((it) => it && typeof it === 'object')
        .map((it) => ({
          id: String(it.id || `i-${Math.random().toString(36).slice(2, 8)}`),
          name: String(it.name ?? ''),
          desc: String(it.desc ?? ''),
          price: toPriceNumber(it.price),
          emoji: String(it.emoji ?? '🍽️'),
          image: String(it.image ?? ''),
          available: it.available !== false,
          tags: Array.isArray(it.tags) ? it.tags.map(String) : [],
        })),
    }));
  return { version: 1, updatedAt: raw.updatedAt || new Date().toISOString(), groups };
}

// ---------- تغییرات خالص (بدون React) تا بتوان تست نوشت ----------

function mapGroups(menu, fn) {
  return { ...menu, updatedAt: new Date().toISOString(), groups: fn(menu.groups) };
}

export function moveInList(list, id, dir) {
  const from = list.findIndex((x) => x.id === id);
  if (from < 0) return list;
  const to = from + (dir === 'up' ? -1 : 1);
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export const menuOps = {
  addGroup(menu, group) {
    return mapGroups(menu, (groups) => [...groups, group]);
  },
  updateGroup(menu, id, patch) {
    return mapGroups(menu, (groups) =>
      groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    );
  },
  deleteGroup(menu, id) {
    return mapGroups(menu, (groups) => groups.filter((g) => g.id !== id));
  },
  moveGroup(menu, id, dir) {
    return mapGroups(menu, (groups) => moveInList(groups, id, dir));
  },
  addItem(menu, groupId, item) {
    return mapGroups(menu, (groups) =>
      groups.map((g) => (g.id === groupId ? { ...g, items: [...g.items, item] } : g)),
    );
  },
  updateItem(menu, groupId, itemId, patch) {
    return mapGroups(menu, (groups) =>
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              items: g.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
            }
          : g,
      ),
    );
  },
  deleteItem(menu, groupId, itemId) {
    return mapGroups(menu, (groups) =>
      groups.map((g) =>
        g.id === groupId ? { ...g, items: g.items.filter((it) => it.id !== itemId) } : g,
      ),
    );
  },
  moveItem(menu, groupId, itemId, dir) {
    return mapGroups(menu, (groups) =>
      groups.map((g) =>
        g.id === groupId ? { ...g, items: moveInList(g.items, itemId, dir) } : g,
      ),
    );
  },
};

/** آمار کوچک برای نمایش در ادمین */
export function menuStats(menu) {
  const groups = menu?.groups ?? [];
  const items = groups.flatMap((g) => g.items ?? []);
  return {
    groups: groups.length,
    items: items.length,
    available: items.filter((i) => i.available).length,
    unavailable: items.filter((i) => !i.available).length,
  };
}
