import { Stars, rng } from './common.jsx';

function Candle({ x, h, delay }) {
  return (
    <g>
      <circle cx={x} cy={300 - h - 18} r="30" fill="#ffa24a" opacity=".22" className="yl-flame" style={{ animationDelay: `${delay}s` }} />
      <rect x={x - 9} y={300 - h} width="18" height={h} rx="3" fill="#fff3dc" />
      <rect x={x - 9} y={300 - h} width="18" height="6" rx="3" fill="#f4dcb2" />
      <path d={`M${x} ${300 - h - 3} V${300 - h - 8}`} stroke="#3a2a1a" strokeWidth="1.6" />
      <path
        className="yl-flame"
        style={{ animationDelay: `${delay}s` }}
        d={`M${x} ${300 - h - 34} C${x + 9} ${300 - h - 20} ${x + 8} ${300 - h - 8} ${x} ${300 - h - 7} C${x - 8} ${300 - h - 8} ${x - 9} ${300 - h - 20} ${x} ${300 - h - 34}Z`}
        fill="#ffcf5a"
      />
      <path d={`M${x} ${300 - h - 22} C${x + 4} ${300 - h - 15} ${x + 4} ${300 - h - 10} ${x} ${300 - h - 9} C${x - 4} ${300 - h - 10} ${x - 4} ${300 - h - 15} ${x} ${300 - h - 22}Z`} fill="#fff6c9" />
    </g>
  );
}

function Seeds({ cx, cy, rad, seed }) {
  const r = rng(seed);
  return Array.from({ length: 26 }, (_, i) => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * (rad - 8);
    return <ellipse key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} rx="6" ry="7.5" fill="#d3122f" stroke="#7d0a1c" strokeWidth="1" />;
  });
}

export function YaldaScene() {
  const r = rng(33);
  const seeds = Array.from({ length: 16 }, () => ({ x: 548 + r() * 104, y: 258 + r() * 38, a: r() * 40 - 20 }));
  return (
    <>
      <Stars count={50} seed={8} minR={0.5} maxR={1.5} height={380} />
      <div className="yl-glow" />
      <svg className="scene__ground" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <radialGradient id="yl-pom" cx="38%" cy="32%" r="80%">
            <stop offset="0" stopColor="#ff5a5a" />
            <stop offset="0.55" stopColor="#c4122c" />
            <stop offset="1" stopColor="#6d0618" />
          </radialGradient>
          <radialGradient id="yl-flesh" cx="50%" cy="20%" r="90%">
            <stop offset="0" stopColor="#ff7a86" />
            <stop offset="1" stopColor="#e1203c" />
          </radialGradient>
        </defs>
        {/* سفره */}
        <path d="M0 330 H1200 V400 H0Z" fill="#3d0a18" />
        <path d="M0 330 H1200" stroke="#e0a83a" strokeWidth="3" />
        <g stroke="#e0a83a" strokeWidth="1.6" opacity=".55" fill="none">
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${i * 42 + 10} 352 q10 -12 20 0 q10 12 20 0`} />)}
        </g>
        {/* هندوانه */}
        <g>
          <path d="M440 300 A160 160 0 0 0 760 300Z" fill="#1c6b32" />
          <path d="M452 300 A148 148 0 0 0 748 300Z" fill="#e7f3d4" />
          <path d="M462 300 A138 138 0 0 0 738 300Z" fill="url(#yl-flesh)" />
          {seeds.map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx="4" ry="8" fill="#190509" transform={`rotate(${s.a} ${s.x} ${s.y})`} />)}
          <rect x="440" y="296" width="320" height="8" rx="3" fill="#1c6b32" />
        </g>
        {/* انار */}
        <g>
          <circle cx="330" cy="262" r="62" fill="url(#yl-pom)" />
          <path d="M310 206 l8 14 l12 -16 l12 16 l8 -14 l-6 22 h-28z" fill="#b30f27" />
          <ellipse cx="308" cy="244" rx="14" ry="9" fill="#fff" opacity=".18" transform="rotate(-30 308 244)" />
          <circle cx="206" cy="278" r="50" fill="#a50d24" />
          <circle cx="206" cy="278" r="42" fill="#f7d1c8" />
          <Seeds cx={206} cy={278} rad={42} seed={4} />
        </g>
        {/* شمع‌ها */}
        <Candle x={880} h={74} delay={0} />
        <Candle x={930} h={104} delay={-0.8} />
        <Candle x={982} h={58} delay={-1.5} />
        {/* حافظ و آجیل */}
        <g>
          <path d="M1040 300 q60 -24 120 0 v14 q-60 -22 -120 0z" fill="#1d3f2e" />
          <path d="M1040 300 q60 -24 120 0" stroke="#e0a83a" strokeWidth="3" fill="none" />
          <ellipse cx="640" cy="318" rx="320" ry="6" fill="#000" opacity=".25" />
        </g>
      </svg>
    </>
  );
}

export function YaldaTop() {
  const lights = Array.from({ length: 14 }, (_, i) => i);
  return (
    <svg className="yl-lights" viewBox="0 0 400 50" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-5 8 Q100 40 200 10 T405 8" fill="none" stroke="#5a3a20" strokeWidth="1.4" />
      {lights.map((i) => {
        const x = 12 + i * 29;
        const y = 12 + Math.sin((x / 400) * Math.PI * 2 + 0.3) * 9 + (i % 2 ? 5 : 0);
        return <circle key={i} className="yl-bulb" cx={x} cy={y + 6} r="3.6" style={{ animationDelay: `${(i * 0.31) % 2.2}s` }} />;
      })}
    </svg>
  );
}
