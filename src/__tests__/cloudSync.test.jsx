import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { cloneSeed as seedMenu } from '../lib/menuModel.js';

/**
 * رفتار همگام‌سازی ابری با یک آداپتر جعلی: رویدادهای realtime که از سمت سرور می‌رسند
 * نباید دوباره به سرور نوشته شوند، وگرنه هر ذخیره یک رویداد می‌سازد و حلقه‌ی بی‌پایان می‌شود.
 */
const handlers = {};
const api = vi.hoisted(() => ({
  initPersistence: vi.fn(),
  getSyncMode: vi.fn(),
  loadMenu: vi.fn(),
  saveMenu: vi.fn(),
  loadCafe: vi.fn(),
  saveCafe: vi.fn(),
  subscribeToChanges: vi.fn(),
  subscribeToCafeChanges: vi.fn(),
}));
vi.mock('../lib/persistence.js', () => ({ ...api, isCloudStorageEnabled: true, resetMenu: vi.fn() }));
vi.mock('../lib/remoteApi.js', () => ({ subscribeLiveStatus: () => () => {} }));

import { MenuProvider, useMenu } from '../lib/store.jsx';
import cafeDefaults from '../data/cafe.json';

let ctx;
function Probe() {
  ctx = useMenu();
  return null;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

beforeEach(() => {
  cleanup();
  api.initPersistence.mockResolvedValue('cloud');
  api.getSyncMode.mockReturnValue('cloud');
  api.loadMenu.mockResolvedValue(seedMenu());
  api.saveMenu.mockResolvedValue(true);
  api.loadCafe.mockResolvedValue({ ...cafeDefaults });
  api.saveCafe.mockResolvedValue(true);
  api.subscribeToChanges.mockImplementation((cb) => {
    handlers.menu = cb;
    return () => {};
  });
  api.subscribeToCafeChanges.mockImplementation((cb) => {
    handlers.cafe = cb;
    return () => {};
  });
});

afterEach(() => vi.clearAllMocks());

describe('همگام‌سازی ابری', () => {
  it('بارگذاری اولیه و رویداد realtime باعث ذخیره‌ی دوباره نمی‌شوند', async () => {
    render(<MenuProvider><Probe /></MenuProvider>);
    await waitFor(() => expect(ctx.ready).toBe(true));
    await wait(900);
    expect(api.saveMenu).not.toHaveBeenCalled();
    expect(api.saveCafe).not.toHaveBeenCalled();

    // رویداد از سرور (مثلاً ادمین دیگری ذخیره کرده)
    const remote = seedMenu();
    remote.groups[0].title = 'تغییر از دستگاه دیگر';
    act(() => handlers.menu(remote));
    act(() => handlers.cafe({ ...cafeDefaults, name: 'نام جدید' }));
    await wait(900);
    expect(ctx.menu.groups[0].title).toBe('تغییر از دستگاه دیگر');
    expect(api.saveMenu).not.toHaveBeenCalled();
    expect(api.saveCafe).not.toHaveBeenCalled();
  });

  it('ویرایش واقعی ادمین دقیقاً یک بار ذخیره می‌شود', async () => {
    render(<MenuProvider><Probe /></MenuProvider>);
    await waitFor(() => expect(ctx.ready).toBe(true));
    act(() => ctx.actions.addGroup());
    await waitFor(() => expect(api.saveMenu).toHaveBeenCalledTimes(1));
    await wait(900);
    expect(api.saveMenu).toHaveBeenCalledTimes(1);
  });
});
