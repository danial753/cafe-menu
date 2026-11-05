import { grassPath, rng } from './common.jsx';

function Tulip({ x, y, h, c1, c2 }) {
  return (
    <g>
      <path d={`M${x} ${y} q-4 ${-h / 2} 2 ${-h}`} stroke="#2f8a3a" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d={`M${x} ${y - h * 0.4} q-16 -6 -22 -20 q14 2 22 14Z`} fill="#3aa347" />
      <path d={`M${x + 2} ${y - h} c-12 -2 -16 -16 -12 -28 c4 6 8 8 12 6 c4 2 8 0 12 -6 c4 12 0 26 -12 28Z`} fill={c1} />
      <path d={`M${x + 2} ${y - h - 22} c-3 8 -2 16 0 22`} stroke={c2} strokeWidth="2" fill="none" />
    </g>
  );
}

export function NowruzScene() {
  const r = rng(17);
  const tulips = Array.from({ length: 16 }, (_, i) => ({
    x: 30 + i * 74 + r() * 30,
    y: 396,
    h: 46 + r() * 36,
    c1: ['#ef476f', '#ffd166', '#ff8fab', '#f78c3a', '#c77dff'][i % 5],
    c2: '#fff7',
  }));
  return (
    <>
      <div className="nw-sun" aria-hidden="true"><i /></div>
      <div className="nw-cloud nw-cloud--a" />
      <div className="nw-cloud nw-cloud--b" />
      <div className="nw-cloud nw-cloud--c" />
      <svg className="scene__ground" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="nw-h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c4ecaa" /><stop offset="1" stopColor="#9ad57a" /></linearGradient>
          <linearGradient id="nw-h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8dd36c" /><stop offset="1" stopColor="#5db85a" /></linearGradient>
          <radialGradient id="nw-egg" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#fff" stopOpacity=".7" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        </defs>
        <path d="M0 250 C160 190 320 230 480 210 S800 170 960 215 S1130 220 1200 200 V400 H0Z" fill="url(#nw-h1)" />
        <path d="M0 300 C200 250 380 290 560 270 S900 250 1200 290 V400 H0Z" fill="url(#nw-h2)" />
        {/* سبزه */}
        <g stroke="#2f9e44" strokeWidth="3.4" fill="none" strokeLinecap="round">
          <path d={grassPath(3, 0, 1200, 400, 150, 46)} />
        </g>
        <g stroke="#51b85a" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity=".8">
          <path d={grassPath(8, 0, 1200, 400, 120, 30)} />
        </g>
        {tulips.map((t, i) => <Tulip key={i} {...t} />)}
        {/* تخم‌مرغ رنگی */}
        <g>
          {[[540, '#ef476f'], [586, '#06a77d'], [632, '#f6a21e']].map(([x, c], i) => (
            <g key={x}>
              <ellipse cx={x} cy={366} rx="19" ry="25" fill={c} />
              <path d={`M${x - 18} 362 q9 -8 18 0 t18 0`} stroke="#fff" strokeWidth="2.4" fill="none" opacity=".85" />
              <path d={`M${x - 15} 376 q8 -7 15 0 t15 0`} stroke="#ffe08a" strokeWidth="2.2" fill="none" />
              <ellipse cx={x} cy={366} rx="19" ry="25" fill="url(#nw-egg)" />
            </g>
          ))}
        </g>
        {/* ماهی قرمز */}
        <g>
          <ellipse cx="760" cy="364" rx="30" ry="28" fill="#bfe9ff" opacity=".6" stroke="#6bb4d8" strokeWidth="2.4" />
          <path d="M738 362 q16 -10 32 0 q-16 10 -32 0Z" fill="#ff7a2f" className="nw-fish" />
          <path d="M770 362 l10 -8 v16z" fill="#ff7a2f" className="nw-fish" />
          <circle cx="744" cy="360" r="1.8" fill="#222" />
        </g>
      </svg>
    </>
  );
}

export function NowruzTop() {
  const flowers = [[300, 24], [350, 52], [262, 62], [330, 96], [220, 98], [372, 10], [176, 34]];
  return (
    <svg className="nw-branch" viewBox="0 0 400 150" aria-hidden="true">
      <path d="M410 4 C350 22 300 40 250 70 S170 100 120 118" stroke="#6b4423" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M330 30 C320 60 322 78 330 100 M262 56 C250 70 244 86 246 104" stroke="#6b4423" strokeWidth="3.4" fill="none" />
      {flowers.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} className="nw-bloom" style={{ animationDelay: `${i * 0.5}s` }}>
          {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-9" rx="6.4" ry="9" fill={i % 2 ? '#ffd0e0' : '#fff'} stroke="#f29cba" strokeWidth=".8" transform={`rotate(${a})`} />)}
          <circle r="3.2" fill="#f2b538" />
        </g>
      ))}
    </svg>
  );
}
