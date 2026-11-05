import { useState } from 'react';
import { fileToResizedDataUrl } from '../../lib/storage.js';
import { parsePriceInput } from '../../lib/format.js';

/** فرم افزودن/ویرایش یک آیتم */
export default function ItemEditor({ item, isNew, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: item.name || '',
    desc: item.desc || '',
    price: String(item.price || ''),
    emoji: item.emoji || '🍽️',
    image: item.image || '',
    available: item.available !== false,
    tags: (item.tags || []).join('، '),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const price = parsePriceInput(form.price);
    if (!name) {
      setError('نام آیتم نمی‌تواند خالی باشد');
      return;
    }
    if (price <= 0) {
      setError('قیمت را به‌درستی وارد کنید (مثلاً ۱۲۸۰۰۰)');
      return;
    }
    onSave({
      name,
      desc: form.desc.trim(),
      price,
      emoji: form.emoji.trim() || '🍽️',
      image: form.image.trim(),
      available: form.available,
      tags: form.tags
        .split(/[،,]/)
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setForm((f) => ({ ...f, image: dataUrl }));
    } catch (err) {
      setError(err.message || 'آپلود تصویر ناموفق بود');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="panel"
      style={{ marginTop: 10, background: 'var(--surface-2)' }}
      onSubmit={submit}
    >
      <div className="panel__title">{isNew ? '➕ آیتم جدید' : `✏️ ویرایش: ${item.name}`}</div>

      <div className="row">
        <label className="field">
          <span>نام آیتم *</span>
          <input value={form.name} onChange={set('name')} placeholder="مثلاً کاپوچینو" autoFocus />
        </label>
        <label className="field">
          <span>قیمت ({'\u200f'}تومان) *</span>
          <input
            value={form.price}
            onChange={set('price')}
            inputMode="numeric"
            placeholder="۱۲۸۰۰۰"
          />
        </label>
      </div>

      <label className="field">
        <span>توضیح کوتاه</span>
        <textarea
          value={form.desc}
          onChange={set('desc')}
          placeholder="یک خط کوتاه درباره‌ی طعم یا مواد"
        />
      </label>

      <div className="row">
        <label className="field">
          <span>ایموجی (اگر عکس ندارید)</span>
          <input value={form.emoji} onChange={set('emoji')} maxLength={4} />
        </label>
        <label className="field">
          <span>برچسب‌ها (با «،» جدا کنید)</span>
          <input value={form.tags} onChange={set('tags')} placeholder="پرطرفدار، تلخ" />
        </label>
      </div>

      <label className="field">
        <span>لینک تصویر (اختیاری)</span>
        <input
          value={form.image.startsWith('data:') ? '' : form.image}
          onChange={set('image')}
          placeholder="https://…"
          dir="ltr"
        />
      </label>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="btn btn--sm" style={{ cursor: 'pointer' }}>
          📷 آپلود عکس
          <input type="file" accept="image/*" onChange={onPickFile} hidden />
        </label>
        {form.image ? (
          <>
            <img
              src={form.image}
              alt=""
              style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }}
            />
            <button
              type="button"
              className="btn btn--sm btn--danger"
              onClick={() => setForm((f) => ({ ...f, image: '' }))}
            >
              حذف عکس
            </button>
          </>
        ) : null}
        {busy ? <span className="muted">در حال پردازش تصویر…</span> : null}
      </div>

      <hr className="hr" />

      <label className="switch">
        <input
          type="checkbox"
          checked={form.available}
          onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
        />
        <span className="switch__track" />
        <span>{form.available ? 'موجود است' : 'ناموجود (در منو خاکستری می‌شود)'}</span>
      </label>

      {error ? (
        <div className="notice" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button type="submit" className="btn btn--primary">
          ذخیره‌ی آیتم
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          انصراف
        </button>
      </div>
    </form>
  );
}
