// ابزارهای کوچک: قالب‌بندی قیمت به تومان، اعداد فارسی، شناسه یکتا

const faNumber = new Intl.NumberFormat('fa-IR');
const enNumber = new Intl.NumberFormat('en-US');

/** قیمت را با جداکننده‌ی هزارگان و ارقام فارسی برمی‌گرداند. مثال: 128000 -> «۱۲۸٬۰۰۰» */
export function formatToman(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return faNumber.format(Math.round(n));
}

/** تبدیل ارقام لاتین به فارسی (برای متن‌های واردشده) */
export function toFaDigits(input) {
  return String(input ?? '').replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

// جداکردن ارقام از متن قیمت در یک نقطه‌ی واحد انجام می‌شود (جلوگیری از تکرار منطق)
export { toPriceNumber as parsePriceInput } from './menuModel.js';

/** شناسه یکتا و کوتاه */
export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** خواندن پارامتر شماره‌ی میز از آدرس: /?t=5 */
export function getTableParam() {
  if (typeof window === 'undefined') return '';
  const raw = new URLSearchParams(window.location.search).get('t');
  return raw ? toFaDigits(raw.trim()) : '';
}

export function countDigits(n) {
  return String(Math.abs(Math.round(Number(n) || 0))).length;
}

/**
 * تبدیل ورودی شماره‌ی میزها به فهرست عددی.
 * «۱-۶» -> [1,2,3,4,5,6]   و   «1،3،7» -> [1,3,7]
 */
export function parseTableList(input, limit = 60) {
  const out = [];
  String(input ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .split(/[،,]/)
    .forEach((part) => {
      const text = part.trim();
      const range = text.match(/^(\d+)\s*-\s*(\d+)$/);
      if (range) {
        const from = Number(range[1]);
        const to = Number(range[2]);
        const [a, b] = from <= to ? [from, to] : [to, from];
        for (let n = a; n <= b && out.length < limit; n += 1) out.push(n);
      } else if (/^\d+$/.test(text)) {
        out.push(Number(text));
      }
    });
  return Array.from(new Set(out)).slice(0, limit);
}

export const _internals = { faNumber, enNumber };
