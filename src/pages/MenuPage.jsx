import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMenu } from '../lib/store.jsx';
import { getTableParam } from '../lib/format.js';
import CafeHeader from '../components/CafeHeader.jsx';
import CategoryRail from '../components/CategoryRail.jsx';
import CategorySection from '../components/CategorySection.jsx';
import MenuItemCard from '../components/MenuItemCard.jsx';
import CafeFooter from '../components/CafeFooter.jsx';
import SteamCup from '../components/SteamCup.jsx';
import HeroArt from '../components/scenes/HeroArt.jsx';
import { getTheme } from '../lib/themes.js';

export default function MenuPage({ theme, onToggleTheme }) {
  const { menu, cafe, ready } = useMenu();
  const groups = menu.groups || [];
  const festival = getTheme(cafe.festivalTheme);
  const table = useMemo(() => getTableParam(), []);

  const [openId, setOpenId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const sectionRefs = useRef({});
  //ติดตาม دسته‌ی باز برای همگام‌سازی: وقتی منو از تب دیگری sync شد،
  //دسته‌ی باز اگر با id دیگری برگشت، با عنوانش پیدا می‌شود.
  const openIdRef = useRef(null);
  const openTitleRef = useRef(null);

  useEffect(() => {
    if (!groups.length) return;
    if (openIdRef.current === null) {
      // اولین بار: دسته‌ی اول پیش‌فرض باز است — تا کاربر بتواند ببنددش
      openIdRef.current = groups[0].id;
      openTitleRef.current = groups[0].title;
      setOpenId(groups[0].id);
      setActiveId((cur) => cur ?? groups[0].id);
      return;
    }
    const stillThere = groups.find((g) => g.id === openIdRef.current);
    if (stillThere) {
      openTitleRef.current = stillThere.title;
      return;
    }
    // دسته‌ی باز از بین رفته (sync، حذف یا بازگردانی): با عنوان تطبیق می‌دهیم،
    //و در صورت عدم تطبیق، دسته‌ی اول باز می‌شود.
    const byTitle = openTitleRef.current
      ? groups.find((g) => g.title === openTitleRef.current)
      : null;
    const pick = byTitle || groups[0];
    openIdRef.current = pick.id;
    openTitleRef.current = pick.title;
    setOpenId(pick.id);
    setActiveId(pick.id);
  }, [groups]);

  // تشخیص دسته‌ی فعال هنگام اسکرول
  useEffect(() => {
    if (!groups.length) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = 170;
      let current = groups[0].id;
      for (const g of groups) {
        const el = sectionRefs.current[g.id];
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = g.id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [groups]);

  const openGroup = useCallback((id) => {
    openIdRef.current = id;
    openTitleRef.current = groups.find((g) => g.id === id)?.title ?? null;
    setOpenId(id);
    setActiveId(id);
    // بعد از شروع انیمیشن باز شدن، به بخش اسکرول کن
    setTimeout(() => {
      const el = sectionRefs.current[id];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 70);
  }, [groups]);

  const toggleGroup = useCallback((id) => {
    const cur = openIdRef.current;
    if (cur === id) {
      openIdRef.current = null;
      openTitleRef.current = null;
      setOpenId(null);
    } else {
      openIdRef.current = id;
      openTitleRef.current = groups.find((g) => g.id === id)?.title ?? null;
      setOpenId(id);
    }
  }, [groups]);

  const q = query.trim();
  const results = useMemo(() => {
    if (!q) return null;
    const needle = q.replace(/\u200c/g, ' ').toLowerCase();
    const match = (text) =>
      String(text || '')
        .replace(/\u200c/g, ' ')
        .toLowerCase()
        .includes(needle);
    return groups
      .map((g) => ({
        ...g,
        items: (g.items || []).filter((it) => match(it.name) || match(it.desc)),
      }))
      .filter((g) => g.items.length);
  }, [q, groups]);

  const totalItems = groups.reduce((n, g) => n + (g.items?.length || 0), 0);

  return (
    <>
      <CafeHeader cafe={cafe} isDark={theme === 'dark'} onToggleTheme={onToggleTheme} table={table} />
      <CategoryRail groups={groups} activeId={activeId} onSelect={openGroup} />

      <main className="wrap stage">
        <section className="hero tilt preserve" aria-label="خوش‌آمدگویی">
          <HeroArt id={festival.id} />
          <SteamCup size={104} />
          <h2>
            {cafe.name}
            {table ? ` — میز ${table}` : ''}
          </h2>
          <p>{cafe.tagline}</p>
          {festival.caption ? <span className="hero__caption">{festival.caption}</span> : null}
        </section>

        <div className="search">
          <span className="search__icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجو در منو…"
            aria-label="جست‌وجو در منو"
          />
        </div>

        {!ready ? (
          <div className="empty">در حال بارگذاری منو…</div>
        ) : results ? (
          results.length ? (
            <div>
              {results.map((g) => (
                <div key={g.id} style={{ marginBottom: 18 }}>
                  <div className="muted" style={{ marginBottom: 8, fontWeight: 700 }}>
                    {g.icon} {g.title}
                  </div>
                  <div className="items stage">
                    <AnimatePresence initial={false}>
                      {g.items.map((item, i) => (
                        <MenuItemCard key={item.id} item={item} index={i} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">چیزی با «{q}» در منو پیدا نشد.</div>
          )
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                flexWrap: 'wrap',
              }}
            >
              <span className="muted" style={{ flex: 1 }}>
                {groups.length} دسته · {totalItems} آیتم
              </span>
              <button
                className="btn btn--sm"
                onClick={() => setOpenId(groups[0]?.id ?? null)}
                disabled={!groups.length}
              >
                فقط دسته‌ی اول
              </button>
              <button
                className="btn btn--sm"
                onClick={() => setOpenId('__all__')}
                disabled={!groups.length}
              >
                باز کردن همه
              </button>
            </div>

            {groups.length ? (
              groups.map((group) => (
                <CategorySection
                  key={group.id}
                  group={group}
                  open={openId === '__all__' || openId === group.id}
                  onToggle={() => toggleGroup(group.id)}
                  sectionRef={(el) => {
                    sectionRefs.current[group.id] = el;
                  }}
                />
              ))
            ) : (
              <div className="empty">
                منو هنوز خالی است. از پنل مدیریت (<a href="/admin">/admin</a>) آیتم اضافه کنید.
              </div>
            )}
          </>
        )}

        <CafeFooter cafe={cafe} />
      </main>
    </>
  );
}
