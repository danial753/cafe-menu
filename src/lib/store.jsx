import { getTheme, isNightTheme } from './themes.js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as storage from './persistence.js';
import { subscribeLiveStatus } from './remoteApi.js';
import { emptyMenu, menuOps, newGroup, newItem } from './menuModel.js';
import cafeDefaults from '../data/cafe.json';

/**
 * وضعیت منو در سراسر برنامه.
 * تغییرات ادمین به‌صورت خودکار ذخیره می‌شوند و همان لحظه در منوی مشتری دیده می‌شوند
 * (هم در همین تب و هم در تب‌های دیگر، از طریق رویداد storage).
 */

const MenuContext = createContext(null);
const AUTOSAVE_MS = 150; // کوتاه تا تغییر قیمت/آیتم تقریباً همان لحظه push شود

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState(() => emptyMenu());
  const [cafe, setCafe] = useState(() => ({ ...cafeDefaults }));
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [toast, setToast] = useState('');
  // 'cloud' (Supabase) | 'remote' (API روی Cloudflare) | 'local' (فقط همین مرورگر)
  const [syncMode, setSyncMode] = useState(storage.getSyncMode());
  // آیا کانال لحظه‌ای (WebSocket) وصل است؟
  const [live, setLive] = useState(false);
  // تا وقتی حالت ذخیره‌سازی (ابر/سرور/محلی) معلوم نشده، اشتراک ثبت نمی‌کنیم
  const [persistenceReady, setPersistenceReady] = useState(false);
  const saveTimer = useRef(null);
  const toastTimer = useRef(null);
  const loadedOnce = useRef(false);
  const cafeLoaded = useRef(false);
  // «کثیف» = تغییراتی داریم که هنوز ذخیره نشده‌اند؛ تا ذخیره، داده‌ی بیرونی نمی‌خوانیم
  const dirty = useRef(false);
  // آخرین نسخه‌ای که با سرور یکی است؛ فقط تغییر واقعی ذخیره می‌شود (نه بازتاب رویداد realtime)
  const syncedMenu = useRef('');
  const syncedCafe = useRef('');
  const lastPull = useRef(0);

  const notify = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  }, []);

  // بارگذاری اولیه
  useEffect(() => {
    let alive = true;
    // اول معلوم می‌کنیم داده از کجا می‌آید (ابر / سرور / حافظه‌ی محلی)
    storage.initPersistence().then((mode) => {
      if (alive) {
        setSyncMode(mode);
        setPersistenceReady(true); // از این لحظه اشتراک‌ها روی آداپتور درست ثبت می‌شوند
      }
      return storage.loadMenu();
    }).then((data) => {
      if (!alive || !data) return;
      syncedMenu.current = JSON.stringify(data);
      setMenu(data);
      setReady(true);
      loadedOnce.current = true;
    });
    return () => {
      alive = false;
    };
  }, []);

  // بارگذاری و ذخیره‌ی تنظیمات کافه
  useEffect(() => {
    let alive = true;
    storage.initPersistence()
      .then(() => storage.loadCafe())
      .then((profile) => {
        if (!alive || !profile) return;
        syncedCafe.current = JSON.stringify(profile);
        setCafe(profile);
        cafeLoaded.current = true;
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!cafeLoaded.current) return undefined;
    const json = JSON.stringify(cafe);
    if (json === syncedCafe.current) return undefined;
    const timer = setTimeout(async () => {
      const ok = await storage.saveCafe(cafe);
      if (ok) {
        syncedCafe.current = json;
        dirty.current = false;
      } else {
        setSaveState('error');
      }
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [cafe]);

  useEffect(() => {
    if (!persistenceReady) return undefined;
    return subscribeLiveStatus(setLive);
  }, [persistenceReady]);

  useEffect(() => {
    if (!persistenceReady) return undefined;
    return storage.subscribeToCafeChanges((profile) => {
      if (dirty.current) return; // تغییر ذخیره‌نشده‌ی خودمان را خراب نکن
      cafeLoaded.current = true;
      syncedCafe.current = JSON.stringify(profile);
      setCafe(profile);
    });
  }, [persistenceReady]);

  // تم مناسبتی در کل برنامه، از جمله تب منوی مشتری
  useEffect(() => {
    const id = getTheme(cafe.festivalTheme).id;
    document.documentElement.dataset.festival = id;
    document.documentElement.dataset.night = String(isNightTheme(id));
  }, [cafe.festivalTheme]);

  // ذخیره‌ی خودکار (debounce)
  useEffect(() => {
    if (!loadedOnce.current) return undefined;
    const json = JSON.stringify(menu);
    if (json === syncedMenu.current) return undefined;
    setSaveState('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const ok = await storage.saveMenu(menu);
      setSaveState(ok ? 'saved' : 'error');
      if (ok) {
        syncedMenu.current = json;
        dirty.current = false;
      }
    }, AUTOSAVE_MS);
    return () => clearTimeout(saveTimer.current);
  }, [menu]);

  // همگام‌سازی بین تب‌ها (ادمین در یک تب، مشتری در تب دیگر)
  useEffect(() => {
    if (!persistenceReady) return undefined;
    return storage.subscribeToChanges((next) => {
      if (dirty.current) return;
      loadedOnce.current = true;
      syncedMenu.current = JSON.stringify(next);
      setMenu(next);
    });
  }, [persistenceReady]);

  const commit = useCallback((fn) => {
    dirty.current = true;
    setMenu((prev) => fn(prev));
  }, []);

  /** خواندن دوباره‌ی داده از منبع (Supabase یا حافظه‌ی محلی).
   *  وقتی کاربر به تب/برنامه برمی‌گردد اجرا می‌شود تا صفحه‌ی باز‌مانده
   *  تغییراتِ ست‌شده در ادمین را ببیند. اگر ذخیره‌ی معلقی داریم، دست نمی‌زنیم. */
  const refresh = useCallback(async () => {
    if (dirty.current) return false;
    const [nextMenu, nextCafe] = await Promise.all([storage.loadMenu(), storage.loadCafe()]);
    let changed = false;
    setMenu((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(nextMenu)) return prev;
      changed = true;
      return nextMenu;
    });
    setCafe((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(nextCafe)) return prev;
      changed = true;
      return nextCafe;
    });
    return changed;
  }, []);

  // برگشت به تب/برنامه = فرصت تازه‌سازی (به‌ویژه وقتی ادمین از دستگاه دیگری تغییر داده)
  useEffect(() => {
    const pull = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastPull.current < 4000) return;
      lastPull.current = now;
      void refresh();
    };
    document.addEventListener('visibilitychange', pull);
    window.addEventListener('focus', pull);
    return () => {
      document.removeEventListener('visibilitychange', pull);
      window.removeEventListener('focus', pull);
    };
  }, [refresh]);

  const actions = useMemo(
    () => ({
      updateCafe: (patch) => {
        const next = { ...cafe, ...patch };
        dirty.current = true;
        const json = JSON.stringify(next);
        syncedCafe.current = json; // همین ذخیره‌ی فوری کافی است؛ افکت [cafe] دوباره ننویسد
        setCafe(next);
        // Settings and theme selection persist on the click, even if the user navigates immediately.
        void storage.saveCafe(next).then((ok) => {
          if (ok) {
            dirty.current = false;
          } else if (syncedCafe.current === json) {
            syncedCafe.current = ''; // شکست خورد؛ افکت دوباره تلاش کند
          }
        });
      },
      addGroup: () => {
        const group = newGroup();
        commit((m) => menuOps.addGroup(m, group));
        notify('گروه جدید اضافه شد — عنوانش را ویرایش کنید');
        return group.id;
      },
      updateGroup: (id, patch) => commit((m) => menuOps.updateGroup(m, id, patch)),
      deleteGroup: (id) => {
        commit((m) => menuOps.deleteGroup(m, id));
        notify('گروه حذف شد');
      },
      moveGroup: (id, dir) => commit((m) => menuOps.moveGroup(m, id, dir)),
      addItem: (groupId, patch) => {
        const item = { ...newItem(), ...(patch || {}) };
        commit((m) => menuOps.addItem(m, groupId, item));
        notify('آیتم جدید اضافه شد');
        return item.id;
      },
      updateItem: (groupId, itemId, patch) =>
        commit((m) => menuOps.updateItem(m, groupId, itemId, patch)),
      deleteItem: (groupId, itemId) => {
        commit((m) => menuOps.deleteItem(m, groupId, itemId));
        notify('آیتم حذف شد');
      },
      moveItem: (groupId, itemId, dir) =>
        commit((m) => menuOps.moveItem(m, groupId, itemId, dir)),
      replaceAll: (data) => {
        loadedOnce.current = true;
        dirty.current = true;
        setMenu(data);
        notify('منو به‌روزرسانی شد');
      },
      /** داده‌های همین دستگاه را روی سرور می‌نویسد تا همه‌ی گوشی‌ها همان را ببینند.
       *  برای انتقال اولین بارِ منوی موجود (که در localStorage بوده) لازم است. */
      pushToServer: async () => {
        const [menuOk, cafeOk] = await Promise.all([
          storage.saveMenu(menu),
          storage.saveCafe(cafe),
        ]);
        const ok = menuOk && cafeOk;
        notify(
          ok
            ? 'همه‌ی اطلاعات روی سرور ذخیره شد — از این به بعد روی همه‌ی گوشی‌ها دیده می‌شود'
            : 'ارسال به سرور ناموفق بود؛ مطمئن شوید وارد پنل شده‌اید و اینترنت وصل است',
        );
        return ok;
      },
      reset: async () => {
        const data = await storage.resetMenu();
        loadedOnce.current = true;
        setMenu(data);
        notify('منو به حالت نمونه برگشت');
      },
    }),
    [cafe, commit, notify, menu],
  );

  const value = useMemo(
    () => ({
      menu,
      cafe,
      ready,
      saveState,
      toast,
      notify,
      refresh,
      syncMode,
      live,
      actions,
    }),
    [menu, cafe, ready, saveState, toast, notify, refresh, syncMode, live, actions],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu باید داخل MenuProvider استفاده شود');
  return ctx;
}
