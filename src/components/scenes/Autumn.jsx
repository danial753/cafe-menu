import { rng } from './common.jsx';

function Tree({ x, h, c1, c2, s = 1 }) {
  return (
    <g transform={`translate(${x} 0) scale(${s})`} style={{ transformOrigin: `${x}px 400px` }}>
      <path d={`M-7 400 L-4 ${400 - h} L4 ${400 - h} L7 400Z`} fill="#4a2b17" />
      <circle cx="0" cy={400 - h - 22} r="46" fill={c1} />
      <circle cx="-30" cy={400 - h - 4} r="32" fill={c2} />
      <circle cx="30" cy={400 - h - 6} r="34" fill={c1} />
      <circle cx="-6" cy={400 - h - 48} r="30" fill={c2} />
    </g>
  );
}

export function AutumnScene() {
  const r = rng(29);
  const pile = Array.from({ length: 44 }, () => ({ x: r() * 1200, y: 384 + r() * 24, c: ['#e9602b', '#f3a23a', '#c4561a', '#f6c944', '#a8281a'][Math.floor(r() * 5)], a: r() * 180 }));
  return (
    <>
      <div className="au-sun" />
      <svg className="scene__ground" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path d="M0 270 C200 220 360 260 560 236 S940 210 1200 250 V400 H0Z" fill="#c9733a" opacity=".6" />
        <path d="M0 316 C260 272 460 306 660 288 S1000 270 1200 306 V400 H0Z" fill="#a85a2c" />
        <Tree x={130} h={96} c1="#e0662a" c2="#f0a23a" s={0.9} />
        <Tree x={250} h={70} c1="#f3a23a" c2="#d94a2a" s={0.7} />
        <Tree x={600} h={150} c1="#e9602b" c2="#f6c944" s={1.25} />
        <Tree x={940} h={90} c1="#d94a2a" c2="#f0a23a" s={0.85} />
        <Tree x={1070} h={110} c1="#f3a23a" c2="#e9602b" s={1} />
        <path d="M0 350 C260 326 520 356 760 342 S1040 330 1200 352 V400 H0Z" fill="#7a3d1c" />
        {pile.map((p, i) => (
          <path key={i} d="M0 0 L6 -12 L12 0 L6 5Z" fill={p.c} transform={`translate(${p.x} ${p.y}) rotate(${p.a}) scale(1.9)`} />
        ))}
        {/* بنچ و فنجان */}
        <g>
          <rect x="396" y="344" width="120" height="8" rx="3" fill="#3b2314" />
          <rect x="404" y="352" width="6" height="30" fill="#3b2314" />
          <rect x="502" y="352" width="6" height="30" fill="#3b2314" />
          <rect x="396" y="324" width="120" height="6" rx="3" fill="#3b2314" />
          <path d="M440 322 h30 v-20 h-30z" fill="#fff4e4" />
          <path d="M470 308 h8 a6 6 0 0 1 0 12 h-8" stroke="#fff4e4" strokeWidth="3" fill="none" />
          <path className="au-steam" d="M448 296 q-6 -10 0 -18 M458 296 q-6 -10 0 -18" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </svg>
      <div className="au-mist" />
    </>
  );
}

export function AutumnTop() {
  const leaves = [[34, '#e9602b', 38], [96, '#f6c944', 26], [160, '#c4561a', 44], [236, '#f3a23a', 30], [302, '#d94a2a', 40], [366, '#f6c944', 28]];
  return (
    <svg className="au-bunting" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-5 4 Q100 24 200 6 T405 4" fill="none" stroke="#6b3a1c" strokeWidth="1.6" />
      {leaves.map(([x, c, len], i) => (
        <g key={x} className="au-leaf" style={{ animationDelay: `${i * 0.6}s`, transformOrigin: `${x}px 10px` }}>
          <line x1={x} y1={10 + (i % 2) * 3} x2={x} y2={18 + len * 0.3} stroke="#6b3a1c" strokeWidth="1.2" />
          <path d={`M${x} ${18 + len * 0.3} l-9 -4 l3 -8 l-8 -2 l12 -10 l12 10 l-8 2 l3 8z`} fill={c} transform={`rotate(180 ${x} ${18 + len * 0.3 - 12}) translate(0 ${len * 0.5})`} />
        </g>
      ))}
    </svg>
  );
}
