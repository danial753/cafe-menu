import { rng } from './common.jsx';

function Rose({ cx, cy, s = 1, c1 = '#f06fa0', c2 = '#c93878' }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <circle r="30" fill={c1} />
      <path d="M0 -26 C20 -26 28 -6 14 8 C2 18 -18 12 -22 -4 C-24 -18 -10 -24 0 -22 C14 -22 20 -8 10 2 C2 8 -10 4 -10 -4 C-10 -12 -2 -14 2 -10" fill="none" stroke={c2} strokeWidth="3.2" strokeLinecap="round" />
      <circle r="30" fill="none" stroke={c2} strokeWidth="2" opacity=".5" />
    </g>
  );
}

function Bouquet({ x, flip }) {
  return (
    <g transform={`translate(${x} 400) scale(${flip ? -1 : 1} 1)`}>
      <g stroke="#2f8a3a" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M0 0 C-20 -70 -50 -120 -64 -190" /><path d="M0 0 C10 -80 20 -140 28 -210" /><path d="M0 0 C36 -70 80 -110 104 -166" />
      </g>
      <path d="M-14 -70 q-30 -14 -34 -40 q26 4 34 40Z" fill="#3aa347" />
      <path d="M16 -88 q30 -10 40 -34 q-30 0 -40 34Z" fill="#3aa347" />
      <Rose cx={-64} cy={-196} s={0.92} />
      <Rose cx={28} cy={-218} s={1.1} c1="#ff9ec2" c2="#d9437f" />
      <Rose cx={104} cy={-170} s={0.8} c1="#ffc2d6" c2="#e0608f" />
      <g transform="translate(-6 -150)">
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-12" rx="8" ry="13" fill="#fff" stroke="#f3a3c0" transform={`rotate(${a})`} />)}
        <circle r="5" fill="#f2b538" />
      </g>
      <path d="M-30 -20 L0 -4 L34 -20 L18 22 H-14Z" fill="#e58fb0" opacity=".92" />
      <path d="M-30 -20 L0 -4 L34 -20" stroke="#fff" strokeWidth="3" fill="none" opacity=".7" />
    </g>
  );
}

export function MotherScene() {
  const r = rng(41);
  const flies = [[14, 22, 0], [78, 12, 1], [48, 40, 2]];
  return (
    <>
      <div className="mt-halo" />
      {flies.map(([l, t, i]) => (
        <svg key={i} className={`mt-butterfly mt-butterfly--${i}`} style={{ left: `${l}%`, top: `${t}%` }} viewBox="0 0 40 30" aria-hidden="true">
          <g className="mt-wings">
            <path d="M20 14 C8 -6 -4 6 6 16 C-2 24 12 30 20 18Z" fill={['#f06fa0', '#a78bfa', '#fbbf24'][i]} />
            <path d="M20 14 C32 -6 44 6 34 16 C42 24 28 30 20 18Z" fill={['#ff9ec2', '#c4b5fd', '#fcd34d'][i]} />
          </g>
          <rect x="19" y="8" width="2" height="16" rx="1" fill="#3b2a3a" />
        </svg>
      ))}
      <svg className="scene__ground" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path d="M0 300 C220 250 420 296 640 276 S980 252 1200 292 V400 H0Z" fill="#f4c6d8" opacity=".75" />
        <path d="M0 346 C240 312 480 350 720 332 S1040 320 1200 344 V400 H0Z" fill="#eaa4c0" opacity=".85" />
        <Bouquet x={190} />
        <Bouquet x={1010} flip />
        <g fill="#f08fb2" opacity=".85">
          {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={300 + r() * 600} cy={376 + r() * 18} r={3 + r() * 4} />)}
        </g>
      </svg>
    </>
  );
}

export function MotherTop() {
  const items = Array.from({ length: 11 }, (_, i) => i);
  return (
    <svg className="mt-garland" viewBox="0 0 400 54" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-5 6 Q100 36 200 8 T405 6" fill="none" stroke="#8fbf8a" strokeWidth="2" />
      {items.map((i) => {
        const x = 10 + i * 38;
        const y = 10 + Math.sin((x / 400) * Math.PI * 2 + 0.3) * 8 + 4;
        return (
          <g key={i} className="mt-bloom" transform={`translate(${x} ${y + 6})`} style={{ animationDelay: `${i * 0.3}s` }}>
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-6" rx="4.4" ry="6.2" fill={['#ff9ec2', '#fff', '#f06fa0', '#ffd0e0'][i % 4]} transform={`rotate(${a})`} />)}
            <circle r="2.4" fill="#f2b538" />
          </g>
        );
      })}
    </svg>
  );
}
