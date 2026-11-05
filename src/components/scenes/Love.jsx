import { Stars, rng } from './common.jsx';

/** برج ایفل با ساختار خرپایی (SVG) */
export function Tower({ className = "lv-tower" }) {
  return (
    <svg className={className} viewBox="0 0 200 500" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <g className="lv-tower__body" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M100 8 L97 60 L92 110 L84 170 L70 250 L50 340 L24 440 L10 492" strokeWidth="5" />
        <path d="M100 8 L103 60 L108 110 L116 170 L130 250 L150 340 L176 440 L190 492" strokeWidth="5" />
        <path d="M97 60 H103 M92 110 H108 M86 150 H114 M80 190 H120 M72 236 H128" strokeWidth="4" />
        <path d="M84 170 L108 110 M116 170 L92 110 M92 110 L103 60 M108 110 L97 60" strokeWidth="1.6" />
        <path d="M80 190 L114 150 M120 190 L86 150 M72 236 L120 190 M128 236 L80 190" strokeWidth="1.6" />
        <path d="M70 250 H130" strokeWidth="7" />
        <path d="M66 262 H134 M56 318 H144" strokeWidth="4" />
        <path d="M70 250 L56 318 M130 250 L144 318 M100 250 V262" strokeWidth="2" />
        <path d="M66 262 L92 318 M134 262 L108 318 M80 262 L56 318 M120 262 L144 318" strokeWidth="1.5" />
        <path d="M44 360 H156" strokeWidth="6" />
        <path d="M40 372 C52 330 82 318 100 318 C118 318 148 330 160 372" strokeWidth="5" />
        <path d="M30 410 C44 372 80 350 100 350 C120 350 156 372 170 410" strokeWidth="4" />
        <path d="M26 430 H174 M16 470 H184" strokeWidth="5" />
        <path d="M44 360 L30 430 M156 360 L170 430 M60 360 L44 430 M140 360 L156 430" strokeWidth="1.6" />
        <path d="M30 430 L52 470 M170 430 L148 470 M100 350 V430" strokeWidth="1.6" />
        <path d="M100 8 V-4" strokeWidth="3" />
      </g>
      <g className="lv-sparkles" fill="#fff6c9">
        {[[100, 40], [92, 112], [108, 112], [74, 254], [126, 254], [60, 322], [140, 322], [100, 340], [32, 432], [168, 432], [22, 474], [178, 474]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.4" style={{ animationDelay: `${(i * 0.37) % 2.4}s` }} />
        ))}
      </g>
    </svg>
  );
}

export function LoveScene() {
  const r = rng(5);
  const roofs = [];
  let x = -20;
  let i = 0;
  while (x < 1220) {
    const w = 70 + r() * 70;
    const h = 70 + r() * 70;
    roofs.push({ x, w, h, i, tone: r() });
    x += w + 2;
    i += 1;
  }
  return (
    <>
      <Stars count={46} seed={21} minR={0.5} maxR={1.5} height={380} />
      <div className="lv-bokeh" aria-hidden="true">
        {Array.from({ length: 9 }, (_, k) => <i key={k} style={{ '--k': k }} />)}
      </div>
      <div className="lv-sun" />
      <div className="lv-cloud lv-cloud--a" />
      <div className="lv-cloud lv-cloud--b" />
      <div className="lv-cloud lv-cloud--c" />
      <Tower />
      <svg className="scene__ground" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="lv-roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6c5a82" />
            <stop offset="1" stopColor="#4a3d62" />
          </linearGradient>
        </defs>
        <g className="lv-skyline">
          {roofs.map(({ x: bx, w, h, i: k, tone }) => {
            const top = 400 - h;
            return (
              <g key={k}>
                <rect x={bx} y={top + 22} width={w} height={h - 22} className="lv-wall" opacity={0.86 + tone * 0.14} />
                <path d={`M${bx - 3} ${top + 24} L${bx + w * 0.12} ${top} H${bx + w * 0.88} L${bx + w + 3} ${top + 24}Z`} fill="url(#lv-roof)" />
                <rect x={bx + w * 0.7} y={top - 16} width="9" height="22" fill="#4a3d62" />
                {[0.22, 0.52, 0.8].map((fx, j) => (
                  <rect
                    key={j}
                    x={bx + w * fx - 5}
                    y={top + 38}
                    width="10"
                    height="16"
                    className={(k + j) % 3 === 0 ? 'lv-win lv-win--on' : 'lv-win'}
                    style={{ animationDelay: `${((k * 7 + j * 3) % 9) * 0.7}s` }}
                  />
                ))}
                <rect x={bx} y={top + 70} width={w} height="3" fill="rgba(80,60,100,.35)" />
              </g>
            );
          })}
        </g>
        <rect x="0" y="388" width="1200" height="12" fill="#3d3254" />
      </svg>
    </>
  );
}

export function LoveTop() {
  const flags = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg className="lv-garland" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-5 6 Q100 40 200 8 T405 6" fill="none" stroke="#c43a73" strokeWidth="1.6" />
      {flags.map((i) => {
        const x = 8 + i * 34;
        const y = 8 + Math.sin((x / 400) * Math.PI * 2 + 0.4) * 9 + (i % 2 ? 4 : 0);
        return (
          <path
            key={i}
            className="lv-heart"
            style={{ animationDelay: `${i * 0.25}s` }}
            transform={`translate(${x} ${y}) scale(.34)`}
            d="M0 40 C-26 18 -30 -4 -16 -12 C-7 -17 0 -11 0 -4 C0 -11 7 -17 16 -12 C30 -4 26 18 0 40Z"
            fill={['#ff7fa8', '#e63f7c', '#ffb3cb', '#d02a64'][i % 4]}
          />
        );
      })}
    </svg>
  );
}
