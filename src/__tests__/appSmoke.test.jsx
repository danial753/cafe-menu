import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * اسموک‌تست کل برنامه: اگر ماژول‌ها در زمان بارگذاری خطا بدهند یا مسیر حالت
 * «سروری» کرش کند، صفحه سفید می‌شود. این تست همان حالت را بازتولید می‌کند.
 */

const META = { menuUpdated: 1, cafeUpdated: 1, passwordChanged: false };
const STATE = {
  menu: {
    version: 1,
    updatedAt: '2026-01-01T08:00:00.000Z',
    groups: [{ id: 'g-hot', title: 'قهوه گرم', items: [{ id: 'i1', name: 'اسپرسو', price: 90000 }] }],
  },
  cafe: {
    name: 'کافه علی',
    tagline: 'قهوه‌ی تازه',
    openingTime: '08:00',
    closingTime: '00:00',
    festivalTheme: 'yalda',
  },
  meta: META,
};

describe('اسموک‌تست برنامه (بدون خطای بارگذاری)', () => {
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(async (url) => {
      const path = String(url);
      const body = path.includes('/api/meta') ? META : STATE;
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(body),
        json: async () => body,
      };
    });
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    cleanup();
    vi.restoreAllMocks();
  });

  it('App با داده‌ی سروری رندر می‌شود و منو دیده می‌شود', async () => {
    const { default: App } = await import('../App.jsx');
    const { MenuProvider } = await import('../lib/store.jsx');

    render(
      <MemoryRouter initialEntries={['/']}>
        <MenuProvider>
          <App />
        </MenuProvider>
      </MemoryRouter>,
    );

    // اگر ماژولی در زمان ایمپورت کرش کند، اینجا هیچ‌وقت به text نمی‌رسیم
    await waitFor(() => expect(screen.getByRole('heading', { level: 2 })).toBeTruthy());
  });
});
