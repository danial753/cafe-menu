import { Stars, rng } from './common.jsx';

/** یاقوت تراش‌خورده (Round Brilliant، نمای بالا) با وجه‌های رنگی بر اساس زاویه‌ی نور */
export function Gem({ size = 300, id = 'g', className = '', tone = 1 }) {
  const R = 100;
  const pts = (r, a0 = 0) => Array.from({ length: 8 }, (_, i) => {
    const a = a0 + (i * Math.PI) / 4 - Math.PI / 2;
    return [R + r * Math.cos(a), R + r * Math.sin(a)];
  });
  const table = pts(46);
  const girdle = pts(98);
  const star = pts(74, Math.PI / 8);
  const shade = (angle, k) => {
    // نور از بالا-چپ می‌تابد: وجه‌های رو به نور روشن‌تر
    const light = 0.5 + 0.5 * Math.cos(angle + Math.PI * 0.75);
    const l = 22 + light * 36 * k;
    const s = 88 - light * 20;
    return `hsl(${350 + light * 8} ${s}% ${l}%)`;
  };
  const poly = (arr) => arr.map((p) => p.join(',')).join(' ');
  const facets = [];
  for (let i = 0; i < 8; i += 1) {
    const j = (i + 1) % 8;
    const mid = (i * Math.PI) / 4 + Math.PI / 8 - Math.PI / 2;
    // وجه‌ی ستاره‌ای (مثلث بین دو رأس میز و یک رأس ستاره)
    facets.push({ pts: [table[i], table[j], star[i]], fill: shade(mid, 1.15) });
    // وجه‌ی بادبادکی (از میز تا کمربند)
    facets.push({ pts: [table[i], star[i], girdle[i], star[(i + 7) % 8]], fill: shade(mid - 0.4, 1) });
    facets.push({ pts: [table[j], star[i], girdle[j], star[j]], fill: shade(mid + 0.5, 0.85) });
    // مثلث کمربند
    facets.push({ pts: [star[i], girdle[i], girdle[j]], fill: shade(mid + 0.2, 0.7) });
  }
  return (
    <svg className={`ru-gem ${className}`} width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id={`ru-core-${id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#ff9aa8" stopOpacity={0.55 * tone} />
          <stop offset="0.55" stopColor="#e0115f" stopOpacity="0.1" />
          <stop offset="1" stopColor="#30030c" stopOpacity="0.45" />
        </radialGradient>
        <clipPath id={`ru-clip-${id}`}><circle cx="100" cy="100" r="98" /></clipPath>
      </defs>
      <circle cx="100" cy="100" r="99" fill="#4a0612" />
      <g clipPath={`url(#ru-clip-${id})`}>
        {facets.map((f, i) => (
          <polygon key={i} points={poly(f.pts)} fill={f.fill} stroke="rgba(255,205,210,.28)" strokeWidth=".7" strokeLinejoin="round" />
        ))}
        <polygon points={poly(table)} fill="none" />
        <polygon points={poly(table)} fill={`url(#ru-core-${id})`} stroke="rgba(255,225,228,.55)" strokeWidth=".9" />
        <rect width="200" height="200" fill={`url(#ru-core-${id})`} />
        {/* درخشش‌های سفید */}
        <g className="ru-glints" fill="#fff">
          <polygon points="62,38 78,50 66,60" opacity=".85" />
          <polygon points="118,30 128,40 114,44" opacity=".6" />
          <polygon points="150,92 160,104 148,108" opacity=".5" />
          <polygon points="84,70 96,74 88,84" opacity=".9" />
        </g>
      </g>
      <circle cx="100" cy="100" r="98.5" fill="none" stroke="#f1d98a" strokeWidth="1.6" opacity=".85" />
    </svg>
  );
}

function Sparkle({ x, y, s = 1, d = 0 }) {
  return (
    <path
      className="ru-spark"
      style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }}
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -12 Q1.5 -1.5 12 0 Q1.5 1.5 0 12 Q-1.5 1.5 -12 0 Q-1.5 -1.5 0 -12Z"
      fill="#fff6d6"
    />
  );
}

export function RubyScene() {
  const r = rng(77);
  const folds = Array.from({ length: 7 }, (_, i) => i);
  return (
    <>
      <Stars count={26} seed={6} minR={0.4} maxR={1.1} height={380} />
      <div className="ru-rays" />
      <div className="ru-hero-gem"><Gem size={340} id="main" /><i className="ru-sheen" /></div>
      <div className="ru-side-gem ru-side-gem--a"><Gem size={120} id="a" tone={0.9} /><i className="ru-sheen" /></div>
      <div className="ru-side-gem ru-side-gem--b"><Gem size={84} id="b" tone={1.1} /><i className="ru-sheen" /></div>
      <svg className="scene__ground" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="ru-velvet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a0a1c" />
            <stop offset="1" stopColor="#1a0309" />
          </linearGradient>
          <linearGradient id="ru-fold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity=".45" />
            <stop offset=".5" stopColor="#ff4f6e" stopOpacity=".18" />
            <stop offset="1" stopColor="#000" stopOpacity=".45" />
          </linearGradient>
        </defs>
        <path d="M0 292 C220 262 420 304 640 282 S1000 262 1200 298 V400 H0Z" fill="url(#ru-velvet)" />
        {folds.map((i) => (
          <path key={i} d={`M${i * 190 - 20} 300 C${i * 190 + 30} 340 ${i * 190 + 60} 372 ${i * 190 + 40} 400 H${i * 190 + 150} C${i * 190 + 130} 372 ${i * 190 + 120} 330 ${i * 190 + 170} 296Z`} fill="url(#ru-fold)" />
        ))}
        <path d="M0 296 C220 266 420 308 640 286 S1000 266 1200 302" fill="none" stroke="#d4af37" strokeWidth="3" opacity=".9" />
        <path d="M0 304 C220 274 420 316 640 294 S1000 274 1200 310" fill="none" stroke="#f1d98a" strokeWidth="1" opacity=".6" />
        {/* گوهرهای ریز روی مخمل */}
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`translate(${60 + r() * 1080} ${330 + r() * 50}) rotate(${r() * 60})`}>
            <polygon points="0,-7 6,-2 4,6 -4,6 -6,-2" fill={['#e0115f', '#b3122e', '#ff4d6d'][i % 3]} stroke="#f1d98a" strokeWidth=".8" />
            <polygon points="0,-7 6,-2 0,0" fill="#fff" opacity=".35" />
          </g>
        ))}
      </svg>
    </>
  );
}

/** زنجیر طلا با آویزهای یاقوتی که تاب می‌خورند */
export function RubyTop() {
  const pendants = [[112, 0], [156, 1.1], [200, 0.5]];
  return (
    <svg className="ru-chain" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ru-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" /><stop offset=".5" stopColor="#d4af37" /><stop offset="1" stopColor="#8a6a14" />
        </linearGradient>
        <radialGradient id="ru-drop" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ff8da2" /><stop offset=".5" stopColor="#d3103e" /><stop offset="1" stopColor="#5a0516" />
        </radialGradient>
      </defs>
      <path d="M-5 5 Q100 24 200 7 T405 5" fill="none" stroke="url(#ru-gold)" strokeWidth="3" strokeDasharray="5 2.2" strokeLinecap="round" />
      {pendants.map(([x, d]) => {
        const y = 10 + Math.sin((x / 400) * Math.PI * 2 + 0.2) * 5 + 7;
        return (
          <g key={x} className="ru-pendant" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }}>
            <g transform={`translate(${x} ${y}) scale(.62) translate(${-x} ${-y})`}>
              <line x1={x} y1={y} x2={x} y2={y + 16} stroke="url(#ru-gold)" strokeWidth="1.8" />
              <circle cx={x} cy={y + 17} r="3.4" fill="url(#ru-gold)" />
              <path d={`M${x} ${y + 20} C${x + 12} ${y + 32} ${x + 11} ${y + 46} ${x} ${y + 54} C${x - 11} ${y + 46} ${x - 12} ${y + 32} ${x} ${y + 20}Z`} fill="url(#ru-drop)" stroke="#f1d98a" strokeWidth="1.3" />
              <path d={`M${x - 3} ${y + 26} C${x - 6} ${y + 32} ${x - 6} ${y + 38} ${x - 3} ${y + 42}`} stroke="#fff" strokeWidth="1.8" fill="none" opacity=".7" strokeLinecap="round" />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
