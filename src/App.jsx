import { Route, Routes, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { MenuProvider, useMenu } from './lib/store.jsx';
import { useTheme } from './lib/theme.js';
import ParticleField from './components/ParticleField.jsx';
import ThemeScene from './components/ThemeScene.jsx';
import { getTheme } from './lib/themes.js';
import Toast from './components/Toast.jsx';
import MenuPage from './pages/MenuPage.jsx';

// پنل ادمین (و کتابخانه‌ی QR) فقط وقتی لازم شود بارگیری می‌شود
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));

function Shell() {
  const { toast, cafe } = useMenu();
  const festival = getTheme(cafe.festivalTheme);
  const { theme, toggle } = useTheme(festival.night);
  const { pathname } = useLocation();

  // عنوان صفحه با نام ثبت‌شده‌ی کافه همگام می‌ماند
  useEffect(() => {
    document.title = `${cafe.name} | منوی دیجیتال`;
  }, [cafe.name]);

  // با جابه‌جایی بین صفحه‌ها، به بالای صفحه برگرد
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {/* key = تم: با تغییر تم، لایه‌ها ری‌مونت می‌شوند و animِ محو‌شدن
         پس‌زمینه را با جلوه‌ی crossfade عوض می‌کند */}
      <div id="bg-layers" key={`layers-${festival.id}`} aria-hidden="true" />
      <ThemeScene key={`scene-${festival.id}`} id={festival.id} />
      <ParticleField key={`pf-${festival.id}`} kind={festival.particles} />
      <Routes>
        <Route path="/" element={<MenuPage theme={theme} onToggleTheme={toggle} />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="wrap"><div className="empty">در حال بارگذاری پنل…</div></div>}>
              <AdminPage theme={theme} onToggleTheme={toggle} />
            </Suspense>
          }
        />
        <Route path="*" element={<MenuPage theme={theme} onToggleTheme={toggle} />} />
      </Routes>
      <Toast message={toast} />
    </>
  );
}

export default function App() {
  return (
    <MenuProvider>
      <Shell />
    </MenuProvider>
  );
}
