/** ابزارهای مشترک صحنه‌های مناسبتی (SVG داخلی؛ بدون فایل یا شبکه‌ی خارجی) */

/** تولید عدد تصادفی قطعی تا صحنه‌ها در هر رندر یکسان بمانند */
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** میدان ستاره‌های چشمک‌زن */
export function Stars({ count = 60, seed = 7, minR = 0.5, maxR = 1.6, height = 560 }) {
  const r = rng(seed);
  const items = Array.from({ length: count }, () => ({
    cx: r() * 400,
    cy: r() * height,
    r: minR + r() * (maxR - minR),
    d: r() * 5,
    t: 2 + r() * 4,
  }));
  return (
    <svg className="sky-stars" viewBox="0 0 400 800" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      {items.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          className="tw"
          style={{ animationDelay: `${s.d}s`, animationDuration: `${s.t}s` }}
        />
      ))}
    </svg>
  );
}

/** چند پهنای تیغه‌ی چمن/سبزه در یک مسیر */
export function grassPath(seed, x0, x1, y, count, h = 38) {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < count; i += 1) {
    const x = x0 + ((x1 - x0) * i) / count + r() * 8;
    const hh = h * (0.5 + r() * 0.8);
    const lean = (r() - 0.5) * 22;
    d += `M${x.toFixed(1)} ${y} Q${(x + lean * 0.4).toFixed(1)} ${(y - hh * 0.6).toFixed(1)} ${(x + lean).toFixed(1)} ${(y - hh).toFixed(1)} `;
  }
  return d;
}
