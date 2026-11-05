import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';
import './styles/themes.css';

// برنامه بالا آمد → پیام «صفحه سفید» را غیرفعال کن
clearTimeout(window.__cafeBootTimer);
window.__cafeBooted = true;
document.getElementById('boot-fallback')?.setAttribute('hidden', ''); // اگر قبلاً نمایش داده شده بود، مخفی شود

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
