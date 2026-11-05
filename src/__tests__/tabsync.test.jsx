/**
 * شبیه‌سازی دو تب: تب «ادمین» تغییر ایجاد می‌کند، تب «مشتری» باید همان لحظه آپدیت شود.
 * رویداد storage فقط در تب‌های دیگر می‌گیرد، پس با dispatch گزارش می‌دهیم.
 */
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../App.jsx';
import { CAFE_STORAGE_KEY, STORAGE_KEY } from '../lib/storage.js';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  cleanup();
  delete document.documentElement.dataset.festival;
  delete document.documentElement.dataset.night;
});

afterEach(cleanup);

/** صبر تا وقتی لایه‌ی ذخیره‌سازی آماده و اشتراک‌ها ثبت شوند (initPersistence async است) */
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

const renderApp = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

describe('همگام‌سازی بین تب‌ها', () => {
  it('تغییر نام کافه در تب مشتری دیده می‌شود (event storage)', async () => {
    renderApp();
    await waitFor(() => {
      expect(document.querySelector('.hero h2')?.textContent).toContain('کافه رُست');
    });

    await settle();

    // تب دیگری (ادمین) نوشته → ما رویداد storage را dispatch می‌کنیم
    const saved = { name: 'کافه امتحانی', festivalTheme: 'halloween' };
    localStorage.setItem(CAFE_STORAGE_KEY, JSON.stringify(saved));
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: CAFE_STORAGE_KEY, newValue: JSON.stringify(saved) }),
      );
    });

    await waitFor(() => {
      expect(document.querySelector('.hero h2')?.textContent).toContain('کافه امتحانی');
    });
    // تم مناسبتی هم باید روی المان root اعمال شود
    expect(document.documentElement.dataset.festival).toBe('halloween');
    expect(document.documentElement.dataset.night).toBe('true');
  });

  it('تغییر تم: پartikel‌ها و صحنه تغییر می‌کنند', async () => {
    renderApp();
    await waitFor(() => {
      expect(document.querySelector('#bg-canvas')?.getAttribute('data-kind')).toBe('bean');
    });

    await settle();
    const saved = { name: 'کافه رُست', festivalTheme: 'nowruz' };
    localStorage.setItem(CAFE_STORAGE_KEY, JSON.stringify(saved));
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: CAFE_STORAGE_KEY, newValue: JSON.stringify(saved) }),
      );
    });

    await waitFor(() => {
      expect(document.querySelector('#bg-canvas')?.getAttribute('data-kind')).toBe('blossom');
    });
    expect(document.documentElement.dataset.festival).toBe('nowruz');
  });

  it('تغییر منو از تب دیگر: آیتم جدید در منوی مشتری دیده می‌شود', async () => {
    renderApp();
    await waitFor(() => {
      expect(document.body.textContent).toContain('کاپوچینو');
    });

    const menu = {
      version: 1,
      groups: [
        { id: 'g-x', title: 'قهوه', items: [{ id: 'i-x', name: 'متن جدید از تب دیگر', price: 5000, available: true }] },
      ],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(menu) }),
      );
    });

    await waitFor(() => {
      expect(document.body.textContent).toContain('متن جدید از تب دیگر');
    });
  });
});
