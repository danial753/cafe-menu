import { useCallback, useEffect, useState } from 'react';

const KEY = 'cafe-menu:theme';

function initialTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * تم روشن/تاریک با ذخیره در مرورگر.
 * forceDark: تم‌های «شبانه» (هالووین، رمضان…) همیشه تیره‌اند؛ انتخاب کاربر
 * دست‌نخورده می‌ماند و با برگشت به یک تم روزانه دوباره اعمال می‌شود.
 */
export function useTheme(forceDark = false) {
  const [pref, setPref] = useState(initialTheme);
  const theme = forceDark ? 'dark' : pref;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#140F0C' : '#F4EADF');
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, pref);
    } catch {
      /* ignore */
    }
  }, [pref]);

  const toggle = useCallback(() => setPref((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle, isDark: theme === 'dark' };
}
