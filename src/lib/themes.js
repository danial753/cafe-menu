/**
 * فهرست تم‌های مناسبتی.
 *
 * night: true  → تم «شبانه» است و همیشه با پالت تیره نمایش داده می‌شود
 *                (دکمه‌ی روشن/تاریک برایش مخفی می‌شود).
 * particles    → نوع ذرات متحرک پس‌زمینه (در ParticleField تعریف شده‌اند).
 * caption      → جمله‌ی کوتاهی که روی کارت خوش‌آمدگویی نمایش داده می‌شود.
 * preview      → گرادیانت کارت انتخاب تم در پنل ادمین.
 */
export const THEMES = [
  {
    id: 'classic',
    label: 'کلاسیک',
    icon: '☕',
    night: false,
    particles: 'bean',
    caption: '',
    colors: ['#8b4b2a', '#e08a3c'],
    preview: 'linear-gradient(150deg,#f4eadf,#e0b98f)',
  },
  {
    id: 'ruby',
    label: 'یاقوت · ویژه',
    icon: '💎',
    night: true,
    particles: 'gem',
    caption: 'درخشان‌تر از یاقوت ♦',
    colors: ['#9b111e', '#d4af37'],
    preview: 'linear-gradient(160deg,#12040a,#7a0b22 55%,#d4af37)',
  },
  {
    id: 'nowruz',
    label: 'نوروز · بهار',
    icon: '🌱',
    night: false,
    particles: 'blossom',
    caption: 'نوروزتان پیروز 🌸',
    colors: ['#286b48', '#78a85c'],
    preview: 'linear-gradient(160deg,#bfe6f5,#e9f6d8 55%,#7fc06a)',
  },
  {
    id: 'yalda',
    label: 'شب یلدا',
    icon: '🍉',
    night: true,
    particles: 'spark',
    caption: 'بلندترین شب سال، گرم‌ترین فنجان 🍉',
    colors: ['#852b3b', '#c94d5d'],
    preview: 'linear-gradient(160deg,#2a0a17,#6e1730 60%,#c2334d)',
  },
  {
    id: 'ramadan',
    label: 'ماه رمضان',
    icon: '🌙',
    night: true,
    particles: 'star',
    caption: 'ماه رمضان مبارک 🌙',
    colors: ['#494879', '#d2a742'],
    preview: 'linear-gradient(160deg,#070b24,#1a2260 60%,#d2a742)',
  },
  {
    id: 'love',
    label: 'روز عشق · پاریس',
    icon: '🗼',
    night: false,
    particles: 'heart',
    caption: 'Paris, mon amour ♥',
    colors: ['#a64278', '#ef8db5'],
    preview: 'linear-gradient(160deg,#c9b6f2,#f7b6cf 55%,#ffd9c0)',
  },
  {
    id: 'autumn',
    label: 'پاییز',
    icon: '🍂',
    night: false,
    particles: 'leaf',
    caption: 'پاییز و بوی قهوه 🍂',
    colors: ['#9b552e', '#d88b43'],
    preview: 'linear-gradient(160deg,#f6c98a,#e58d4a 60%,#9b4a22)',
  },
  {
    id: 'halloween',
    label: 'هالووین · خفاش و خون',
    icon: '🦇',
    night: true,
    particles: 'bat',
    caption: 'جرئت داری سفارش بدی؟ 🩸',
    colors: ['#21142e', '#a60022'],
    preview: 'linear-gradient(160deg,#0b0610,#2a1238 55%,#b3001f)',
  },
  {
    id: 'christmas',
    label: 'کریسمس',
    icon: '🎄',
    night: true,
    particles: 'snow',
    caption: 'کریسمس مبارک 🎄',
    colors: ['#1e6548', '#bd3842'],
    preview: 'linear-gradient(160deg,#0c1a3a,#1d4a56 60%,#bd3842)',
  },
  {
    id: 'mother',
    label: 'روز مادر',
    icon: '🌷',
    night: false,
    particles: 'petal',
    caption: 'برای مادرِ مهربانم 💐',
    colors: ['#91486b', '#da86a7'],
    preview: 'linear-gradient(160deg,#fde6ee,#f6bfd3 60%,#e58fb0)',
  },
];

export const DEFAULT_THEME_ID = 'classic';

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function isNightTheme(id) {
  return getTheme(id).night;
}
