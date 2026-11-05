import { describe, expect, it } from 'vitest';
import {
  cloneSeed,
  emptyMenu,
  menuOps,
  menuStats,
  newGroup,
  newItem,
  normalizeMenu,
} from '../lib/menuModel.js';

const seed = cloneSeed();

describe('داده‌ی نمونه', () => {
  it('حداقل ۳ گروه و ۱۲ آیتم دارد', () => {
    const stats = menuStats(seed);
    expect(stats.groups).toBeGreaterThanOrEqual(3);
    expect(stats.items).toBeGreaterThanOrEqual(12);
  });

  it('شناسه‌ها یکتا هستند و هر آیتم نام و قیمت دارد', () => {
    const ids = seed.groups.flatMap((g) => [g.id, ...g.items.map((i) => i.id)]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of seed.groups) {
      expect(g.title.length).toBeGreaterThan(0);
      for (const item of g.items) {
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.price).toBeGreaterThan(0);
      }
    }
  });

  it('دست‌کم یک آیتم ناموجود برای نمایش برچسب دارد', () => {
    expect(menuStats(seed).unavailable).toBeGreaterThan(0);
  });
});

describe('menuOps — گروه‌ها', () => {
  it('addGroup یک گروه به انتها اضافه می‌کند', () => {
    const g = { ...newGroup(), title: 'تست' };
    const next = menuOps.addGroup(emptyMenu(), g);
    expect(next.groups).toHaveLength(1);
    expect(next.groups[0].title).toBe('تست');
  });

  it('updateGroup فقط گروه هدف را عوض می‌کند', () => {
    const next = menuOps.updateGroup(seed, seed.groups[1].id, { title: 'عنوان نو' });
    expect(next.groups[1].title).toBe('عنوان نو');
    expect(next.groups[0].title).toBe(seed.groups[0].title);
    expect(next.groups).not.toBe(seed.groups); // کپی جدید است، جهش نکرده
  });

  it('deleteGroup گروه و آیتم‌هایش را برمی‌دارد', () => {
    const next = menuOps.deleteGroup(seed, seed.groups[0].id);
    expect(next.groups.some((g) => g.id === seed.groups[0].id)).toBe(false);
    expect(next.groups).toHaveLength(seed.groups.length - 1);
  });

  it('moveGroup جای گروه را عوض می‌کند و در لبه‌ها بی‌اثر است', () => {
    const first = seed.groups[0].id;
    const moved = menuOps.moveGroup(seed, first, 'down');
    expect(moved.groups[1].id).toBe(first);

    const back = menuOps.moveGroup(moved, first, 'up');
    expect(back.groups[0].id).toBe(first);

    const stuck = menuOps.moveGroup(seed, first, 'up');
    expect(stuck.groups[0].id).toBe(first);
  });
});

describe('menuOps — آیتم‌ها', () => {
  const gid = seed.groups[0].id;
  const baseLen = seed.groups[0].items.length;

  it('addItem آیتم را به گروه درست اضافه می‌کند', () => {
    const item = { ...newItem(), name: 'آیتم تست', price: 50000 };
    const next = menuOps.addItem(seed, gid, item);
    const group = next.groups.find((g) => g.id === gid);
    expect(group.items).toHaveLength(baseLen + 1);
    expect(group.items.at(-1).name).toBe('آیتم تست');
  });

  it('updateItem وضعیت موجود/ناموجود را عوض می‌کند', () => {
    const itemId = seed.groups[0].items[0].id;
    const next = menuOps.updateItem(seed, gid, itemId, { available: false });
    const item = next.groups.find((g) => g.id === gid).items.find((i) => i.id === itemId);
    expect(item.available).toBe(false);
  });

  it('deleteItem فقط همان آیتم را حذف می‌کند', () => {
    const itemId = seed.groups[0].items[0].id;
    const next = menuOps.deleteItem(seed, gid, itemId);
    const group = next.groups.find((g) => g.id === gid);
    expect(group.items).toHaveLength(baseLen - 1);
    expect(group.items.some((i) => i.id === itemId)).toBe(false);
  });

  it('moveItem ترتیب را جابه‌جا می‌کند', () => {
    const [a, b] = seed.groups[0].items;
    const next = menuOps.moveItem(seed, gid, a.id, 'down');
    const items = next.groups.find((g) => g.id === gid).items;
    expect(items[0].id).toBe(b.id);
    expect(items[1].id).toBe(a.id);
  });

  it('عملیات روی گروه ناموجود، منو را خراب نمی‌کند', () => {
    const next = menuOps.updateItem(seed, 'nope', 'nope', { price: 1 });
    expect(menuStats(next)).toEqual(menuStats(seed));
  });
});

describe('normalizeMenu', () => {
  it('داده‌ی ناقص را به شکل معتبر درمی‌آورد', () => {
    const fixed = normalizeMenu({
      groups: [
        { title: 'گ', items: [{ name: 'آ', price: '۱۲۰۰۰' }, { name: 'ب', price: '12,500 تومان' }] },
        null,
        { title: 'خالی' },
      ],
    });
    expect(fixed.groups).toHaveLength(2);
    expect(fixed.groups[0].items[0].price).toBe(12000); // ارقام فارسی هم خوانده می‌شود
    expect(fixed.groups[0].items[1].price).toBe(12500);
    expect(fixed.groups[0].items[0].available).toBe(true);
    expect(fixed.groups[1].items).toEqual([]);
  });

  it('ورودی نامعتبر، منوی خالی برمی‌گرداند', () => {
    expect(normalizeMenu(null).groups).toEqual([]);
    expect(normalizeMenu({}).groups).toEqual([]);
    expect(normalizeMenu('رشته').groups).toEqual([]);
  });

  it('available را فقط وقتی false می‌بیند که صریحاً false باشد', () => {
    const fixed = normalizeMenu({ groups: [{ id: 'g', items: [{ id: 'i', available: 0 }] }] });
    expect(fixed.groups[0].items[0].available).toBe(true);
    const fixed2 = normalizeMenu({ groups: [{ id: 'g', items: [{ id: 'i', available: false }] }] });
    expect(fixed2.groups[0].items[0].available).toBe(false);
  });
});
