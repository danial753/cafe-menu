import { toFaDigits } from '../lib/format.js';

/** ارقام فارسی/عربی را برای استفاده در لینک tel: به لاتین تبدیل می‌کند */
function toLatinDigits(text = '') {
  return String(text)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export default function CafeFooter({ cafe }) {
  const phoneRaw = String(cafe.phone || '').trim();
  const phoneHref = `tel:${toLatinDigits(phoneRaw).replace(/[^\d+]/g, '')}`;
  const insta = String(cafe.instagram || '').trim().replace(/^@/, '');

  return (
    <footer className="footer">
      <div>
        <b>{cafe.name}</b> — {cafe.tagline}
      </div>
      <div>ساعت کاری: {toFaDigits(cafe.openingTime)} تا {toFaDigits(cafe.closingTime)}</div>
      {cafe.address ? <div>{cafe.address}</div> : null}
      {phoneRaw || insta ? (
        <div>
          {phoneRaw ? (
            <>
              تلفن:{' '}
              <a className="footer__link" dir="ltr" href={phoneHref}>
                {phoneRaw}
              </a>
            </>
          ) : null}
          {phoneRaw && insta ? ' — ' : null}
          {insta ? (
            <>
              اینستاگرام:{' '}
              <a
                className="footer__link"
                dir="ltr"
                href={`https://instagram.com/${insta}`}
                target="_blank"
                rel="noreferrer"
              >
                @{insta}
              </a>
            </>
          ) : null}
        </div>
      ) : null}
      <div style={{ opacity: 0.75, marginTop: 6 }}>
        قیمت‌ها به {cafe.currencyLabel} است و ممکن است تغییر کند.
      </div>
    </footer>
  );
}
