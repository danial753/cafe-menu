import { beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MenuProvider } from '../lib/store.jsx';
import MenuPage from '../pages/MenuPage.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import seed from '../data/menu.seed.json';

function renderPage(ui, route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <MenuProvider>{ui}</MenuProvider>
    </MemoryRouter>,
  );
}

const noop = () => {};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  cleanup();
});

describe('منوی مشتری', () => {
  it('داده‌ی نمونه را بارگذاری و نمایش می‌دهد', async () => {
    renderPage(<MenuPage theme="light" onToggleTheme={noop} />);

    await waitFor(() => {
      expect(screen.queryByText('در حال بارگذاری منو…')).toBeNull();
    });

    const firstGroup = seed.groups[0];
    // عنوان گروه هم در نوار دسته‌بندی هست و هم در سربرگ دسته
    expect(screen.getAllByText(firstGroup.title).length).toBeGreaterThan(0);
    // اولین دسته به‌صورت پیش‌فرض باز است، پس آیتم اولش دیده می‌شود
    await waitFor(() => {
      expect(screen.getByText(firstGroup.items[0].name)).toBeTruthy();
    });
    // قیمت با جداکننده‌ی هزارگان و ارقام فارسی
    expect(document.body.textContent).toContain('۹۵٬۰۰۰');
    // واحد پول
    expect(document.body.textContent).toContain('تومان');
  });

  it('متن چیپ دسته‌ی فعال بعد از کلیک خوانا می‌ماند', async () => {
    renderPage(<MenuPage theme="light" onToggleTheme={noop} />);
    await waitFor(() => expect(screen.queryByText('در حال بارگذاری منو…')).toBeNull());
    await waitFor(() => expect(document.querySelector('.chip[aria-current="true"]')).toBeTruthy());
    const active = document.querySelector('.chip[aria-current="true"]');
    expect(active.querySelector('.chip__flip')).toBeTruthy();
    expect(active.querySelector('.chip__face--front').textContent.trim()).not.toBe('');
    const target = document.querySelector(
      `.chip[data-id="${active.dataset.id === 'g-cold' ? 'g-hot' : 'g-cold'}"]`,
    );
    fireEvent.click(target);
    await waitFor(() => expect(target.getAttribute('aria-current')).toBe('true'));
    expect(target.querySelector('.chip__face--front').textContent).toContain(
      target.dataset.id === 'g-cold' ? 'قهوه سرد' : 'قهوه گرم',
    );
  });

  it('با کلیک روی سربرگ دسته، آیتم‌ها ورق می‌خورند (باز/بسته)', async () => {
    renderPage(<MenuPage theme="light" onToggleTheme={noop} />);
    await waitFor(() => expect(screen.queryByText('در حال بارگذاری منو…')).toBeNull());

    const head = screen.getByRole('button', {
      name: `باز یا بستن دسته‌ی ${seed.groups[0].title}`,
    });
    await waitFor(() => {
      expect(head.getAttribute('aria-expanded')).toBe('true');
    });

    fireEvent.click(head);
    expect(head.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(head);
    expect(head.getAttribute('aria-expanded')).toBe('true');
  });

  it('جست‌وجو فقط آیتم‌های مطابق را نشان می‌دهد', async () => {
    renderPage(<MenuPage theme="light" onToggleTheme={noop} />);
    await waitFor(() => expect(screen.queryByText('در حال بارگذاری منو…')).toBeNull());

    fireEvent.change(screen.getByLabelText('جست‌وجو در منو'), { target: { value: 'موکا' } });

    await waitFor(() => {
      expect(screen.getByText('موکا')).toBeTruthy();
    });
    // آیتم دسته‌ی بازِ پیش‌فرض باید از نتایج بیرون باشد
    expect(screen.queryByText('اسپرسو دوبل')).toBeNull();
  });

  it('آیتم ناموجود برچسب «ناموجود» می‌گیرد', async () => {
    renderPage(<MenuPage theme="light" onToggleTheme={noop} />);
    await waitFor(() => expect(screen.queryByText('در حال بارگذاری منو…')).toBeNull());

    fireEvent.change(screen.getByLabelText('جست‌وجو در منو'), { target: { value: 'موکا' } });
    await waitFor(() => expect(screen.getByText('ناموجود')).toBeTruthy());
  });
});

describe('پنل ادمین', () => {
  it('بدون رمز، فرم ورود نشان می‌دهد', async () => {
    await act(async () => {
      renderPage(<AdminPage theme="light" onToggleTheme={noop} />, '/admin');
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(screen.getByText(/پنل مدیریت/)).toBeTruthy();
    expect(screen.getByText('ورود')).toBeTruthy();
    expect(document.body.textContent).not.toContain('cafe1404');
  });

  it('با رمز اشتباه خطا می‌دهد و با رمز درست وارد می‌شود', async () => {
    renderPage(<AdminPage theme="light" onToggleTheme={noop} />, '/admin');

    const input = document.querySelector('input[type="password"]');
    fireEvent.change(input, { target: { value: 'اشتباه' } });
    await act(async () => {
      fireEvent.click(screen.getByText('ورود'));
    });
    await waitFor(() => {
      expect(screen.getByText('رمز عبور اشتباه است')).toBeTruthy();
    });

    fireEvent.change(input, { target: { value: 'cafe1404' } });
    await act(async () => {
      fireEvent.click(screen.getByText('ورود'));
    });

    await waitFor(() => {
      expect(screen.getByText('📋 گروه‌ها و اقلام')).toBeTruthy();
    });
    // آمار منو
    expect(screen.getByText(String(seed.groups.length))).toBeTruthy();
  });

  it('افزودن گروه جدید، همان لحظه در منوی مشتری دیده می‌شود', async () => {
    const { unmount } = renderPage(
      <AdminPage theme="light" onToggleTheme={noop} />,
      '/admin',
    );

    const input = document.querySelector('input[type="password"]');
    fireEvent.change(input, { target: { value: 'cafe1404' } });
    await act(async () => {
      fireEvent.click(screen.getByText('ورود'));
    });
    await waitFor(() => expect(screen.getByText('➕ افزودن گروه')).toBeTruthy());
    await act(async () => {
      fireEvent.click(screen.getByText('➕ افزودن گروه'));
    });
    await waitFor(() => {
      expect(screen.getByText('گروه جدید')).toBeTruthy();
    });

    // داده در localStorage هم نوشته شده باشد
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('cafe-menu:data:v1'));
      expect(saved.groups.some((g) => g.title === 'گروه جدید')).toBe(true);
    });

    unmount();

    // منوی مشتری همان داده را می‌بیند
    renderPage(<MenuPage theme="light" onToggleTheme={noop} />);
    await waitFor(() => {
      expect(screen.queryByText('در حال بارگذاری منو…')).toBeNull();
    });
    expect(document.body.textContent).toContain('گروه جدید');
  });

  it('آیتم جدید پس از ذخیره در ردیف مدیریتی با نام و قیمت قرار می‌گیرد', async () => {
    renderPage(<AdminPage theme="light" onToggleTheme={noop} />, '/admin');
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'cafe1404' } });
    await act(async () => { fireEvent.click(screen.getByText('ورود')); });
    await waitFor(() => expect(screen.getByText('➕ افزودن گروه')).toBeTruthy());
    fireEvent.click(screen.getAllByText('➕ افزودن آیتم به این گروه')[0]);
    fireEvent.change(screen.getByLabelText(/نام آیتم/), { target: { value: 'آیس موکا آزمایشی' } });
    fireEvent.change(screen.getByLabelText(/قیمت/), { target: { value: '85000' } });
    fireEvent.click(screen.getByText('ذخیره‌ی آیتم'));
    await waitFor(() => expect(screen.getByText('آیس موکا آزمایشی')).toBeTruthy());
    const row = screen.getByText('آیس موکا آزمایشی').closest('.item-row');
    expect(row.textContent).toContain('۸۵٬۰۰۰');
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('cafe-menu:data:v1'));
      expect(saved.groups[0].items.some((item) => item.name === 'آیس موکا آزمایشی')).toBe(true);
    });
  });

  it('شماره تلفن، آدرس، اینستاگرام و واحد پول از پنل ذخیره و در منوی مشتری دیده می‌شود', async () => {
    const { unmount } = renderPage(<AdminPage theme="light" onToggleTheme={noop} />, '/admin');
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'cafe1404' } });
    await act(async () => {
      fireEvent.click(screen.getByText('ورود'));
    });
    await waitFor(() => expect(screen.getByText('📋 گروه‌ها و اقلام')).toBeTruthy());
    fireEvent.click(screen.getByText('🏷️ اطلاعات کافه و تم'));

    fireEvent.change(screen.getByLabelText('شماره تلفن کافه'), { target: { value: '09121234567' } });
    fireEvent.change(screen.getByLabelText('آدرس (نمایش در پایین منو)'), {
      target: { value: 'خیابان نارنج، پلاک ۱۲' },
    });
    // آدرس کامل اینستاگرام هم پذیرفته و به شناسه تبدیل می‌شود
    fireEvent.change(screen.getByLabelText('اینستاگرام (بدون @)'), {
      target: { value: 'https://instagram.com/cafe.test/' },
    });
    fireEvent.change(screen.getByLabelText('واحد پول (کنار قیمت‌ها)'), { target: { value: 'ریال' } });
    fireEvent.click(screen.getByRole('button', { name: /ذخیره‌ی اطلاعات کافه/ }));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('cafe-menu:cafe:v1'));
      expect(stored.phone).toBe('09121234567');
      expect(stored.address).toBe('خیابان نارنج، پلاک ۱۲');
      expect(stored.instagram).toBe('cafe.test');
      expect(stored.currencyLabel).toBe('ریال');
    });
    unmount();

    renderPage(<MenuPage theme="light" onToggleTheme={noop} />);
    await waitFor(() => expect(document.body.textContent).toContain('09121234567'));
    expect(document.body.textContent).toContain('خیابان نارنج، پلاک ۱۲');
    expect(document.body.textContent).toContain('cafe.test');
  });

  it('تنظیم نام و ساعت کافه و انتخاب تم در منوی مشتری اعمال و ذخیره می‌شود', async () => {
    const { unmount } = renderPage(<AdminPage theme="light" onToggleTheme={noop} />, '/admin');
    fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: 'cafe1404' } });
    await act(async () => { fireEvent.click(screen.getByText('ورود')); });
    await waitFor(() => expect(screen.getByText('📋 گروه‌ها و اقلام')).toBeTruthy());
    expect(screen.getByText('قهوه گرم')).toBeTruthy();
    fireEvent.click(screen.getByText('🏷️ اطلاعات کافه و تم'));
    expect(screen.getByText('🏷️ اطلاعات کافه و ظاهر منو')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('نام کافه'), { target: { value: 'کافه‌ی بهار' } });
    fireEvent.change(screen.getByLabelText('شعار کافه (نمایش در سربرگ و پایین منو)'), { target: { value: 'طعم بهار در هر فنجان' } });
    fireEvent.change(screen.getByLabelText('ساعت شروع کار'), { target: { value: '09:30' } });
    fireEvent.change(screen.getByLabelText('ساعت پایان کار'), { target: { value: '23:00' } });
    fireEvent.click(screen.getByRole('button', { name: /نوروز/ }));
    expect(JSON.parse(localStorage.getItem('cafe-menu:cafe:v1')).festivalTheme).toBe('nowruz');
    fireEvent.click(
      screen.getByRole('button', { name: /ذخیره‌ی اطلاعات کافه/ }),
    );

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('cafe-menu:cafe:v1'));
      expect(stored.name).toBe('کافه‌ی بهار');
      expect(stored.tagline).toBe('طعم بهار در هر فنجان');
      expect(stored.openingTime).toBe('09:30');
      expect(stored.closingTime).toBe('23:00');
      expect(stored.festivalTheme).toBe('nowruz');
    });
    unmount();

    renderPage(<MenuPage theme="light" onToggleTheme={noop} />);
    await waitFor(() => expect(screen.getAllByText('کافه‌ی بهار').length).toBeGreaterThan(0));
    expect(document.body.textContent).toContain('طعم بهار در هر فنجان');
    expect(document.body.textContent).toContain('ساعت کاری: ۰۹:۳۰ تا ۲۳:۰۰');
    await waitFor(() => expect(document.documentElement.dataset.festival).toBe('nowruz'));
  });
});
