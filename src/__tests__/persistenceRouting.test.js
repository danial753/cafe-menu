import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * محافظ رگرسیون برای باگ «تم ادمین به گوشی مشتری نمی‌رسد»:
 *
 * اشتراک‌ها (و در نتیجه WebSocket) قبل از مشخص شدن حالت ذخیره‌سازی ثبت می‌شدند
 * و به آداپتور محلی می‌چسبیدند؛ در نتیجه هیچ پیام لحظه‌ای نمی‌رسید.
 * این تست تضمین می‌کند که بعد از initPersistence، اشتراک‌ها روی آداپتور
 * درست (remote) ثبت می‌شوند و initPersistence هم idempotent است.
 */

vi.mock('../lib/remoteApi.js', () => {
  const spy = () => vi.fn(() => () => {});
  return {
    probe: vi.fn(async () => true),
    loadMenu: vi.fn(async () => ({ groups: [] })),
    loadCafe: vi.fn(async () => ({ name: 'x' })),
    saveMenu: vi.fn(async () => true),
    saveCafe: vi.fn(async () => true),
    resetMenu: vi.fn(async () => ({ groups: [] })),
    subscribeToChanges: spy(),
    subscribeToCafeChanges: spy(),
    isPasswordChanged: () => false,
  };
});

describe('مسیریابی لایه‌ی ذخیره‌سازی', () => {
  let storage;
  let remote;

  beforeEach(async () => {
    vi.resetModules();
    remote = await import('../lib/remoteApi.js');
    storage = await import('../lib/persistence.js');
  });

  it('قبل از init حالت محلی است و بعد از init به سرور تغییر می‌کند', async () => {
    expect(storage.getSyncMode()).toBe('local');
    const mode = await storage.initPersistence({ allowRemote: true });
    expect(mode).toBe('remote');
    expect(storage.getSyncMode()).toBe('remote');
  });

  it('اشتراک‌ها روی آداپتور سروری ثبت می‌شوند (نه محلی)', async () => {
    await storage.initPersistence({ allowRemote: true });
    const off = storage.subscribeToChanges(() => {});
    storage.subscribeToCafeChanges(() => {});
    expect(remote.subscribeToChanges).toHaveBeenCalledTimes(1);
    expect(remote.subscribeToCafeChanges).toHaveBeenCalledTimes(1);
    expect(typeof off).toBe('function');
  });

  it('فراخوانی هم‌زمان init همان نتیجه را می‌دهد (بدون حالت نصفه)', async () => {
    const [a, b] = await Promise.all([
      storage.initPersistence({ allowRemote: true }),
      storage.initPersistence({ allowRemote: true }),
    ]);
    expect(a).toBe('remote');
    expect(b).toBe('remote');
    expect(storage.getSyncMode()).toBe('remote');
  });

  it('بارگذاری منو از آداپتور درست انجام می‌شود', async () => {
    await storage.initPersistence({ allowRemote: true });
    await storage.loadMenu();
    expect(remote.loadMenu).toHaveBeenCalled();
  });
});
