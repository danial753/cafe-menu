import { describe, expect, it } from 'vitest';
import { formatToman, parsePriceInput, parseTableList, toFaDigits } from '../lib/format.js';

describe('formatToman', () => {
  it('جداکننده‌ی هزارگان و ارقام فارسی می‌گذارد', () => {
    expect(formatToman(128000)).toBe('۱۲۸٬۰۰۰');
    expect(formatToman(95000)).toBe('۹۵٬۰۰۰');
    expect(formatToman(1500000)).toBe('۱٬۵۰۰٬۰۰۰');
  });

  it('عدد اعشاری را گرد می‌کند و ورودی نامعتبر را با خط تیره نشان می‌دهد', () => {
    expect(formatToman(128000.6)).toBe('۱۲۸٬۰۰۱');
    expect(formatToman('abc')).toBe('—');
    expect(formatToman(undefined)).toBe('—');
  });
});

describe('toFaDigits', () => {
  it('ارقام لاتین را فارسی می‌کند', () => {
    expect(toFaDigits('table 12')).toBe('table ۱۲');
  });
});

describe('parsePriceInput', () => {
  it('ارقام فارسی و جداکننده را پاک می‌کند', () => {
    expect(parsePriceInput('۱۲۸٬۰۰۰')).toBe(128000);
    expect(parsePriceInput('128,000 تومان')).toBe(128000);
    expect(parsePriceInput('')).toBe(0);
    expect(parsePriceInput('هیچ')).toBe(0);
  });
});

describe('parseTableList', () => {
  it('بازه را باز می‌کند', () => {
    expect(parseTableList('1-4')).toEqual([1, 2, 3, 4]);
  });

  it('فهرست فارسی/لاتین ترکیبی و تکراری را درست می‌کند', () => {
    expect(parseTableList('۱،3، 3')).toEqual([1, 3]);
    expect(parseTableList('۲-۳،7')).toEqual([2, 3, 7]);
  });

  it('بازه‌ی معکوس را هم می‌پذیرد و ورودی نامعتبر را نادیده می‌گیرد', () => {
    expect(parseTableList('4-2')).toEqual([2, 3, 4]);
    expect(parseTableList('abc')).toEqual([]);
    expect(parseTableList('')).toEqual([]);
  });

  it('خروجی را به سقف محدود می‌کند', () => {
    expect(parseTableList('1-200', 5)).toHaveLength(5);
  });
});
