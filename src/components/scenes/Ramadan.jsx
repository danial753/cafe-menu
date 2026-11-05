import { Stars, rng } from './common.jsx';

function Lantern({ left, rope, size = 1, delay = 0 }) {
  return (
    <div className="rm-lantern" style={{ left, '--rope': `${rope}px`, '--s': size, animationDelay: `${delay}s` }}>
      <svg viewBox="0 0 60 150" aria-hidden="true">
        <defs>
          <linearGradient id={`rm-glass-${left.replace(/\W/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe9a0" />
            <stop offset="1" stopColor="#f0a020" />
          </linearGradient>
        </defs>
        <line x1="30" y1="0" x2="30" y2="30" stroke="#d9b24c" strokeWidth="1.5" />
        <path d="M30 26 C22 30 20 34 20 40 H40 C40 34 38 30 30 26Z" fill="#d9a830" />
        <circle cx="30" cy="24" r="3" fill="#f4cf6a" />
        <path d="M20 40 H40 L46 94 H14Z" fill={`url(#rm-glass-${left.replace(/\W/g, '')})`} className="rm-glow" />
        <path d="M20 40 L26 94 M30 40 V94 M40 40 L34 94" stroke="#8d5d12" strokeWidth="1.2" opacity=".55" />
        <rect x="12" y="92" width="36" height="6" rx="2" fill="#c8932a" />
        <path d="M14 98 H46 L40 118 H20Z" fill="#b57f1e" />
        <path d="M30 118 V132 M26 132 H34" stroke="#d9a830" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="30" cy="140" r="3.5" fill="#f4cf6a" />
        <path d="M14 40 H46" stroke="#d9a830" strokeWidth="3" />
      </svg>
    </div>
  );
}

export function RamadanScene() {
  const r = rng(9);
  const houses = Array.from({ length: 22 }, (_, i) => ({ x: i * 56 - 10, h: 36 + r() * 52, w: 40 + r() * 14, d: r() > 0.55 }));
  return (
    <>
      <Stars count={90} seed={14} minR={0.5} maxR={1.9} height={560} />
      <svg className="rm-moon" viewBox="0 0 160 160" aria-hidden="true">
        <defs>
          <radialGradient id="rm-moon-g" cx="35%" cy="30%" r="80%">
            <stop offset="0" stopColor="#fff6cf" />
            <stop offset="1" stopColor="#f0c04a" />
          </radialGradient>
          <mask id="rm-cut">
            <rect width="160" height="160" fill="#fff" />
            <circle cx="104" cy="66" r="52" fill="#000" />
          </mask>
        </defs>
        <circle cx="76" cy="84" r="62" fill="url(#rm-moon-g)" mask="url(#rm-cut)" />
        <path className="rm-star" d="M120 40 l5 -13 l5 13 l13 5 l-13 5 l-5 13 l-5 -13 l-13 -5z" fill="#ffe9a0" />
      </svg>
      <div className="rm-nebula" />
      <div className="rm-pattern" />
      <svg className="scene__ground" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="rm-sil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141c52" />
            <stop offset="1" stopColor="#080c26" />
          </linearGradient>
          <filter id="rm-blur"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        {houses.map((h, i) => (
          <g key={i} fill="#0d1442">
            <rect x={h.x} y={400 - h.h} width={h.w} height={h.h} />
            {h.d && <path d={`M${h.x + 4} ${400 - h.h} a${h.w / 2 - 4} ${h.w / 2 - 4} 0 0 1 ${h.w - 8} 0Z`} />}
          </g>
        ))}
        {/* مسجد */}
        <g fill="url(#rm-sil)">
          <rect x="470" y="238" width="260" height="162" />
          <path d="M490 238 a110 110 0 0 1 220 0Z" />
          <rect x="598" y="108" width="4" height="22" />
          <path d="M600 90 a9 9 0 1 0 6 14 a7 7 0 1 1 -6 -14Z" fill="#f0c04a" />
          <path d="M440 400 V246 a24 24 0 0 1 48 0 V400Z" />
          <path d="M712 400 V246 a24 24 0 0 1 48 0 V400Z" />
          <rect x="452" y="150" width="24" height="106" />
          <rect x="446" y="146" width="36" height="9" />
          <path d="M452 146 L464 96 L476 146Z" />
          <rect x="724" y="150" width="24" height="106" />
          <rect x="718" y="146" width="36" height="9" />
          <path d="M724 146 L736 96 L748 146Z" />
          <path d="M520 238 a40 40 0 0 1 80 0Z" transform="translate(-22 -16) scale(.9 .9)" />
        </g>
        <g fill="#f0c04a">
          <circle cx="464" cy="92" r="4" />
          <circle cx="736" cy="92" r="4" />
        </g>
        <g className="rm-windows">
          <g fill="#ffbe3b" filter="url(#rm-blur)" opacity=".85">
            {[520, 566, 612, 658].map((x) => <path key={x} d={`M${x} 330 V300 a14 14 0 0 1 28 0 V330Z`} />)}
          </g>
          <g fill="#ffd36b">
            {[520, 566, 612, 658].map((x) => <path key={x} d={`M${x} 330 V300 a14 14 0 0 1 28 0 V330Z`} />)}
            <rect x="458" y="190" width="8" height="18" rx="4" />
            <rect x="730" y="190" width="8" height="18" rx="4" />
          </g>
        </g>
        <rect x="0" y="392" width="1200" height="8" fill="#05081b" />
      </svg>
    </>
  );
}

export function RamadanTop() {
  return (
    <>
      <Lantern left="34%" rope={16} size={0.62} />
      <Lantern left="45%" rope={34} size={0.7} delay={-1.4} />
      <Lantern left="56%" rope={10} size={0.58} delay={-2.2} />
    </>
  );
}
