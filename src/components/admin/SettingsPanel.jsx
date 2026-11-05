import { useRef, useState } from 'react';
import { downloadJSON, readJSONFile } from '../../lib/storage.js';
import { changePassword, isUsingDefaultPassword } from '../../lib/password.js';
import { useMenu } from '../../lib/store.jsx';

import CafeProfilePanel from './CafeProfilePanel.jsx';

export default function SettingsPanel({ onLogout }) {
  const { menu, cafe, actions, notify, syncMode } = useMenu();
  const isShared = syncMode === 'cloud' || syncMode === 'remote';
  const fileRef = useRef(null);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJSONFile(file);
      actions.replaceAll(data);
      notify('فایل JSON وارد شد');
    } catch (err) {
      notify(err.message || 'وارد کردن فایل ناموفق بود');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    if (pw.length < 6) {
      setPwMsg('رمز باید حداقل ۶ حرف باشد');
      return;
    }
    if (pw !== pw2) {
      setPwMsg('تکرار رمز مطابقت ندارد');
      return;
    }
    await changePassword(pw);
    setPw('');
    setPw2('');
    setPwMsg('رمز عبور عوض شد ✅');
  };

  return (
    <>
      <CafeProfilePanel />
      <section className="panel">
        <div className="panel__title">💾 پشتیبان‌گیری و بازیابی</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => downloadJSON(menu, 'cafe-menu.json')}>
            ⬇️ دانلود منو (JSON)
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            ⬆️ وارد کردن فایل JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={onImport} hidden />
          <button
            className="btn btn--danger"
            onClick={() => {
              if (window.confirm('همه‌ی تغییرات منو پاک شود و منوی نمونه برگردد؟')) actions.reset();
            }}
          >
            ↺ بازگردانی منوی نمونه
          </button>
        </div>
        <div className="muted" style={{ marginTop: 10 }}>
          {isShared
            ? `ذخیره‌سازی ${syncMode === 'cloud' ? 'ابری Supabase' : 'سروری (Cloudflare)'} فعال است؛ تغییرات برای همه‌ی دستگاه‌ها همگام می‌شود.`
            : 'ذخیره‌سازی محلی فعال است؛ برای همگام‌سازی بین دستگاه‌ها سایت را روی Cloudflare Workers منتشر کنید یا Supabase را وصل کنید.'}
        </div>
        {isShared ? (
          <div style={{ marginTop: 12 }}>
            <button className="btn btn--primary" onClick={() => actions.pushToServer()}>
              ⬆️ ارسال داده‌های این دستگاه به سرور
            </button>
            <div className="muted" style={{ marginTop: 8 }}>
              اگر منو یا نام کافه را قبلاً در حالت محلی ساخته‌اید، یک بار این دکمه را بزنید تا همان
              داده روی سرور نوشته شود و همه‌ی گوشی‌ها آن را ببینند.
            </div>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <div className="panel__title">🔒 رمز عبور پنل</div>
        {isUsingDefaultPassword() ? (
          <div className="notice" style={{ marginBottom: 12 }}>
            هنوز از رمز پیش‌فرض استفاده می‌کنید؛ برای امنیت بیشتر آن را عوض کنید.
          </div>
        ) : null}
        <form onSubmit={onChangePassword}>
          <div className="row">
            <label className="field">
              <span>رمز جدید</span>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </label>
            <label className="field">
              <span>تکرار رمز</span>
              <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </label>
          </div>
          <button className="btn btn--primary" type="submit">ذخیره‌ی رمز</button>
          {pwMsg ? <div className="muted" style={{ marginTop: 10 }}>{pwMsg}</div> : null}
        </form>
      </section>

      <section className="panel">
        <div className="panel__title">ℹ️ اطلاعات</div>
        <div className="muted">
          <div>نام کافه: {cafe.name}</div>
          <div>شعار: {cafe.tagline}</div>
          <div>ساعت کاری: {cafe.openingTime} تا {cafe.closingTime}</div>
          <div>آخرین به‌روزرسانی منو: {menu.updatedAt ? new Date(menu.updatedAt).toLocaleString('fa-IR') : '—'}</div>
        </div>
        <hr className="hr" />
        <button className="btn btn--danger" onClick={onLogout}>خروج از پنل مدیریت</button>
      </section>
    </>
  );
}
