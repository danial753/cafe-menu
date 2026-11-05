/**
 * جلوه‌های متحرک واقع‌گرایانه‌ی هر تم (همه با SVG/CSS، بدون تصویر خارجی):
 * رعد و برق و قطره‌های خون، نورافکن برج ایفل، شهاب، ارابه‌ی بابانوئل، پرنده‌های بهاری، شعاع نور پاییز.
 */

export function ShootingStars({ count = 3 }) {
  return (
    <div className="fx-shoots" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i key={i} style={{ '--i': i, top: `${6 + i * 11}%`, animationDelay: `${i * 4.3 + 1.2}s`, animationDuration: `${11 + i * 3}s` }} />
      ))}
    </div>
  );
}

export function Lightning() {
  return (
    <>
      <div className="fx-lightning" aria-hidden="true" />
      <svg className="fx-bolt" viewBox="0 0 100 200" preserveAspectRatio="none" aria-hidden="true">
        <path d="M58 0 L40 62 L58 66 L30 150 L50 154 L22 200 L72 122 L52 118 L78 52 L60 48 L82 0Z" />
      </svg>
    </>
  );
}

export function Searchlight() {
  return (
    <div className="fx-search" aria-hidden="true">
      <i className="fx-search__beam fx-search__beam--a" />
      <i className="fx-search__beam fx-search__beam--b" />
    </div>
  );
}

export function Sleigh() {
  return (
    <svg className="fx-sleigh" viewBox="0 0 220 70" aria-hidden="true">
      <g fill="#05101f" stroke="#ffe9a8" strokeWidth=".8">
        <path d="M150 38 h42 q12 0 14 -10 q-8 4 -20 4 h-30z" />
        <path d="M146 46 q30 6 58 -2" fill="none" stroke="#e8c15a" strokeWidth="2" strokeLinecap="round" />
        <circle cx="176" cy="26" r="6" />
        <path d="M170 22 q6 -10 14 -2z" fill="#c0392b" stroke="none" />
        <ellipse cx="108" cy="34" rx="16" ry="7" />
        <path d="M120 30 l10 -10 M123 28 l10 -4 M96 38 l-8 12 M112 40 l-4 12" fill="none" strokeWidth="2" />
        <ellipse cx="68" cy="34" rx="16" ry="7" />
        <path d="M80 30 l10 -10 M83 28 l10 -4 M56 38 l-8 12 M72 40 l-4 12" fill="none" strokeWidth="2" />
        <path d="M146 36 H124 M108 36 H84" fill="none" strokeWidth="1" />
      </g>
      <circle cx="132" cy="22" r="2.4" fill="#ff4d4d" className="xm-bulb" />
      <g className="fx-sleigh__trail" fill="#fff4c9">
        <circle cx="40" cy="38" r="2.4" /><circle cx="26" cy="42" r="1.8" /><circle cx="14" cy="44" r="1.3" /><circle cx="4" cy="46" r="1" />
      </g>
    </svg>
  );
}

export function Birds() {
  return (
    <div className="fx-birds" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <svg key={i} viewBox="0 0 40 20" style={{ '--i': i, top: `${10 + i * 6}%`, animationDelay: `${-i * 7}s`, animationDuration: `${34 + i * 5}s` }}>
          <path className="fx-bird" d="M2 14 Q10 2 20 12 Q30 2 38 14" fill="none" stroke="#35506b" strokeWidth="2.2" strokeLinecap="round" style={{ animationDelay: `${i * 0.15}s` }} />
        </svg>
      ))}
    </div>
  );
}

export function LightShafts() {
  return (
    <div className="fx-shafts" aria-hidden="true">
      <i /><i /><i />
    </div>
  );
}

export function Embers() {
  return (
    <div className="fx-embers" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37 + 8) % 100}%`, animationDelay: `${(i * 0.83) % 7}s`, animationDuration: `${6 + (i % 5)}s`, '--dx': `${(i % 2 ? 1 : -1) * (10 + (i % 4) * 8)}px` }} />
      ))}
    </div>
  );
}
