import { Stars, rng } from './common.jsx';

function Pine({ x, h, w, lights = 8, seed }) {
  const r = rng(seed);
  const tiers = 4;
  return (
    <g>
      <rect x={x - 7} y={400 - 18} width="14" height="22" fill="#3b2314" />
      {Array.from({ length: tiers }, (_, i) => {
        const y0 = 400 - 14 - (h / tiers) * i;
        const ww = w * (1 - i * 0.2);
        return <path key={i} d={`M${x} ${y0 - h / tiers - 14} L${x + ww / 2} ${y0} H${x - ww / 2}Z`} fill={i % 2 ? '#1f6b43' : '#175a38'} stroke="#0f3b25" strokeWidth="1.5" />;
      })}
      {Array.from({ length: lights }, (_, i) => {
        const ty = 400 - 24 - r() * (h - 20);
        const half = (w / 2) * (1 - (400 - 20 - ty) / (h + 8)) * 0.9;
        return <circle key={i} className="xm-bulb" cx={x + (r() * 2 - 1) * half} cy={ty} r="3.4" fill={['#ff5252', '#ffd54f', '#7dd3fc', '#f9a8d4'][i % 4]} style={{ animationDelay: `${(i * 0.43) % 2.6}s` }} />;
      })}
      <path d={`M${x} ${400 - h - 30} l4 9 l10 1 l-8 6 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -6 l10 -1z`} fill="#ffd54f" className="xm-bulb" />
    </g>
  );
}

export function ChristmasScene() {
  return (
    <>
      <Stars count={70} seed={18} minR={0.5} maxR={1.7} height={420} />
      <div className="xm-aurora" />
      <div className="xm-aurora xm-aurora--b" />
      <div className="xm-moon" />
      <svg className="scene__ground" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="xm-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4fbff" /><stop offset="1" stopColor="#bcd6ea" /></linearGradient>
        </defs>
        <path d="M0 262 C200 220 380 256 580 238 S980 218 1200 252 V400 H0Z" fill="#8fb1cd" />
        <Pine x={140} h={150} w={110} seed={2} lights={9} />
        <Pine x={1060} h={176} w={124} seed={5} lights={11} />
        <Pine x={290} h={96} w={76} seed={7} lights={6} />
        {/* کلبه */}
        <g>
          <rect x="500" y="266" width="170" height="104" fill="#5a3418" />
          <path d="M486 272 L585 200 L684 272Z" fill="#f2f8fc" />
          <path d="M486 272 L585 200 L684 272 H670 L585 214 L500 272Z" fill="#d6e6f2" />
          <rect x="628" y="212" width="22" height="42" fill="#7a4a28" />
          <rect x="624" y="206" width="30" height="10" fill="#f2f8fc" />
          <rect x="522" y="292" width="40" height="34" fill="#ffc861" className="xm-window" />
          <path d="M542 292 V326 M522 309 H562" stroke="#5a3418" strokeWidth="3" />
          <rect x="604" y="304" width="38" height="66" rx="3" fill="#3b2314" />
          <circle cx="634" cy="338" r="2.6" fill="#ffd54f" />
          <g className="xm-smoke" fill="#e6eef5">
            <circle cx="639" cy="190" r="9" /><circle cx="648" cy="168" r="12" /><circle cx="640" cy="140" r="15" />
          </g>
        </g>
        {/* آدم‌برفی */}
        <g>
          <circle cx="846" cy="348" r="30" fill="#f6fbff" />
          <circle cx="846" cy="308" r="22" fill="#f6fbff" />
          <circle cx="846" cy="274" r="16" fill="#f6fbff" />
          <path d="M846 274 l22 4 l-22 4z" fill="#ff8a3d" />
          <circle cx="840" cy="270" r="2" fill="#222" /><circle cx="852" cy="270" r="2" fill="#222" />
          <path d="M830 288 q16 12 32 0" stroke="#c0392b" strokeWidth="7" fill="none" strokeLinecap="round" />
          <rect x="834" y="250" width="24" height="5" fill="#222" /><rect x="838" y="232" width="16" height="20" fill="#222" />
          <path d="M824 306 L800 286 M868 306 L892 288" stroke="#5a3418" strokeWidth="3" strokeLinecap="round" />
        </g>
        <path d="M0 340 C240 312 460 346 700 330 S1040 316 1200 340 V400 H0Z" fill="url(#xm-snow)" />
      </svg>
    </>
  );
}

export function ChristmasTop() {
  const bulbs = Array.from({ length: 16 }, (_, i) => i);
  const colors = ['#ff4d4d', '#ffd54f', '#5ee6a0', '#6ec6ff', '#ff8fd0'];
  return (
    <svg className="xm-lights" viewBox="0 0 400 54" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-5 6 Q50 38 100 10 T200 10 T300 10 T405 8" fill="none" stroke="#1a3a28" strokeWidth="1.8" />
      {bulbs.map((i) => {
        const x = 8 + i * 25.4;
        const y = 10 + Math.abs(Math.sin((x / 100) * Math.PI)) * 18;
        return <circle key={i} className="xm-bulb" cx={x} cy={y + 5} r="4" fill={colors[i % 5]} style={{ animationDelay: `${(i * 0.37) % 2.4}s`, color: colors[i % 5] }} />;
      })}
    </svg>
  );
}
