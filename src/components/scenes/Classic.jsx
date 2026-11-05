import { rng } from './common.jsx';

/** صحنه‌ی تم «کلاسیک»: کافه‌ی گرم با لامپ‌های آویز، نور مخروطی و قفسه‌ی فنجان‌ها. */
export function ClassicScene() {
  const r = rng(7);
  const lamps = [
    { x: '14%', d: '0s', s: 1 },
    { x: '38%', d: '-2.4s', s: 0.8 },
    { x: '62%', d: '-4.1s', s: 1.15 },
    { x: '86%', d: '-1.2s', s: 0.9 },
  ];
  const dust = Array.from({ length: 26 }, () => ({
    x: r() * 100,
    y: r() * 100,
    s: 0.6 + r() * 1.6,
    d: -(r() * 14).toFixed(1),
  }));
  return (
    <>
      <div className="cl-wall" />
      <div className="cl-floor" />
      {lamps.map((l, i) => (
        <div className="cl-lamp" key={i} style={{ left: l.x, animationDelay: l.d, transform: `scale(${l.s})` }}>
          <span className="cl-lamp__cord" />
          <span className="cl-lamp__shade" />
          <span className="cl-lamp__glow" />
          <span className="cl-lamp__cone" />
        </div>
      ))}
      <div className="cl-shelf">
        <span className="cl-shelf__board" />
        <div className="cl-cups">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="cl-cup" style={{ animationDelay: `${-i * 1.1}s` }} />
          ))}
        </div>
      </div>
      <div className="cl-dust">
        {dust.map((d, i) => (
          <span
            key={i}
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: `${d.s}px`,
              height: `${d.s}px`,
              animationDelay: `${d.d}s`,
            }}
          />
        ))}
      </div>
      <div className="cl-vignette" />
    </>
  );
}

export function ClassicTop() {
  return (
    <div className="cl-string" aria-hidden="true">
      <span className="cl-string__wire" />
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="cl-string__bulb"
          style={{ insetInlineStart: `${6 + i * 11}%`, animationDelay: `${-i * 0.7}s` }}
        />
      ))}
    </div>
  );
}
