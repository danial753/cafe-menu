import { useEffect, useState } from 'react';
import { useMenu } from '../../lib/store.jsx';
import { THEMES as FESTIVAL_THEMES } from '../../lib/themes.js';
export default function CafeProfilePanel() {
  const { cafe, actions, notify, syncMode, live } = useMenu();
  const isShared = syncMode === 'cloud' || syncMode === 'remote';
  const activeTheme = FESTIVAL_THEMES.find((t) => t.id === (cafe.festivalTheme || 'classic'));
  const profileFields = (c) => ({
    name: c.name || '',
    tagline: c.tagline || '',
    openingTime: c.openingTime || '00:00',
    closingTime: c.closingTime || '00:00',
    phone: c.phone || '',
    address: c.address || '',
    instagram: c.instagram || '',
    currencyLabel: c.currencyLabel || 'تومان',
  });

  const [draft, setDraft] = useState(() => profileFields(cafe));

  useEffect(() => {
    setDraft(profileFields(cafe));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cafe.name,
    cafe.tagline,
    cafe.openingTime,
    cafe.closingTime,
    cafe.phone,
    cafe.address,
    cafe.instagram,
    cafe.currencyLabel,
  ]);

  const saveProfile = (e) => {
    e.preventDefault();
    const name = draft.name.trim();
    if (!name) {
      notify('نام کافه را وارد کنید');
      return;
    }
    actions.updateCafe({
      name,
      tagline: draft.tagline.trim(),
      openingTime: draft.openingTime,
      closingTime: draft.closingTime,
      phone: draft.phone.trim(),
      address: draft.address.trim(),
      // اینستاگرام را بدون @ و بدون آدرس کامل ذخیره می‌کنیم
      instagram: draft.instagram
        .trim()
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
        .replace(/^@/, '')
        .replace(/\/+$/, ''),
      currencyLabel: draft.currencyLabel.trim() || 'تومان',
    });
    notify('اطلاعات کافه ذخیره شد و همان لحظه روی همه‌ی گوشی‌ها اعمال می‌شود');
  };

  return (
    <section className="panel cafe-profile-panel" aria-labelledby="cafe-profile-title">
      <div className="panel__title" id="cafe-profile-title">🏷️ اطلاعات کافه و ظاهر منو</div>
      <form onSubmit={saveProfile}>
        <label className="field">
          <span>نام کافه</span>
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            maxLength={60}
            required
          />
        </label>
        <label className="field">
          <span>شعار کافه (نمایش در سربرگ و پایین منو)</span>
          <input
            value={draft.tagline}
            onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))}
            maxLength={120}
            placeholder="مثلاً: قهوه‌ی تازه، هر روز"
          />
        </label>
        <div className="row">
          <label className="field">
            <span>ساعت شروع کار</span>
            <input
              type="time"
              value={draft.openingTime}
              onChange={(e) => setDraft((d) => ({ ...d, openingTime: e.target.value }))}
            />
          </label>
          <label className="field">
            <span>ساعت پایان کار</span>
            <input
              type="time"
              value={draft.closingTime}
              onChange={(e) => setDraft((d) => ({ ...d, closingTime: e.target.value }))}
            />
          </label>
        </div>
        <div className="row">
          <label className="field">
            <span>شماره تلفن کافه</span>
            <input
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              inputMode="tel"
              dir="ltr"
              placeholder="۰۹۱۲۱۲۳۴۵۶۷"
              maxLength={24}
            />
          </label>
          <label className="field">
            <span>اینستاگرام (بدون @)</span>
            <input
              value={draft.instagram}
              onChange={(e) => setDraft((d) => ({ ...d, instagram: e.target.value }))}
              dir="ltr"
              placeholder="cafe.roast"
              maxLength={40}
            />
          </label>
        </div>
        <label className="field">
          <span>آدرس (نمایش در پایین منو)</span>
          <input
            value={draft.address}
            onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
            placeholder="خیابان، پلاک، طبقه"
            maxLength={90}
          />
        </label>
        <label className="field">
          <span>واحد پول (کنار قیمت‌ها)</span>
          <input
            value={draft.currencyLabel}
            onChange={(e) => setDraft((d) => ({ ...d, currencyLabel: e.target.value }))}
            placeholder="تومان"
            maxLength={12}
          />
        </label>
        <button className="btn btn--primary" type="submit">
          ذخیره‌ی اطلاعات کافه (نام، تلفن، ساعت، آدرس)
        </button>
        <p className="muted" style={{ marginTop: 8 }}>
          این اطلاعات و تم انتخابی، همان لحظه روی همه‌ی گوشی‌های باز اعمال می‌شود.
        </p>
      </form>

      <hr className="hr" />
      <div className="panel__title" style={{ marginBottom: 6 }}>🎨 انتخاب تم مناسبتی</div>
      <p className="muted" style={{ marginBottom: 12 }}>
        روی یکی از کارت‌ها بزنید؛ تم فوراً در منوی مشتری نمایش داده می‌شود.
      </p>
      <div className="theme-grid" role="group" aria-label="تم‌های مناسبتی منو">
        {FESTIVAL_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`theme-option${(cafe.festivalTheme || 'classic') === theme.id ? ' is-active' : ''}`}
            aria-pressed={(cafe.festivalTheme || 'classic') === theme.id}
            style={{ '--preview': theme.preview }}
            onClick={() => {
              actions.updateCafe({ festivalTheme: theme.id });
              notify(`تم «${theme.label}» در منوی مشتری اعمال شد`);
            }}
          >
            <span className="theme-option__icon" aria-hidden="true">{theme.icon}</span>
            <span className="theme-option__label">{theme.label}</span>
            <span className="theme-option__swatches" aria-hidden="true">
              {theme.colors.map((color) => <i key={color} style={{ background: color }} />)}
            </span>
            {(cafe.festivalTheme || 'classic') === theme.id
              ? <span className="theme-option__check">✓ انتخاب شده</span>
              : null}
          </button>
        ))}
      </div>

      <div className={`sync-card${isShared ? ' sync-card--cloud' : ''}`}>
        <div className="sync-card__head">
          <span aria-hidden="true">{isShared ? '☁️' : '📱'}</span>
          <strong>
            {isShared
              ? live
                ? 'همگام‌سازی لحظه‌ای فعال است — تغییرات همان لحظه روی همه‌ی دستگاه‌ها'
                : 'همگام‌سازی فعال است (در حال اتصال لحظه‌ای…)'
              : 'حالت محلی — تغییرات بین دستگاه‌ها جابه‌جا نمی‌شود'}
          </strong>
          {isShared ? (
            <span className={`live-dot${live ? ' is-live' : ''}`} title={live ? 'متصل' : 'در حال اتصال'} />
          ) : null}
        </div>
        <p className="muted" style={{ margin: '6px 0 10px' }}>
          {isShared ? (
            <>تم «{activeTheme?.label || 'کلاسیک'}»، نام کافه و قیمت‌ها روی سرور ({syncMode === 'cloud' ? 'Supabase' : 'Cloudflare'})
            ذخیره می‌شود و با WebSocket همان لحظه به همه‌ی گوشی‌های باز فرستاده می‌شود — بدون رفرش
            و بدون تأخیر.</>
          ) : (
            <>داده فقط در حافظه‌ی همین مرورگر ذخیره می‌شود، پس روی گوشی مشتری دیده نمی‌شود.
            برای همگام‌سازی واقعی، سایت را روی Cloudflare Workers منتشر کنید (فایل
            <span dir="ltr"> wrangler.jsonc </span> آماده است) یا Supabase را طبق README وصل کنید.</>
          )}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a className="btn" href="/" target="_blank" rel="noreferrer">
            🔍 دیدن منو در تب جدید
          </a>
          <button
            type="button"
            className="btn"
            onClick={() => {
              window.location.href = '/?fresh=1';
            }}
          >
            ↻ بازخوانی منو با تم فعلی
          </button>
        </div>
      </div>
    </section>
  );
}
