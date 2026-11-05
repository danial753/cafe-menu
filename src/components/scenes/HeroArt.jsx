import { BAT_HALF } from './Halloween.jsx';
import { Tower } from './Love.jsx';
import { Gem } from './Ruby.jsx';

/**
 * تصویر کوچک مناسبتی داخل کارت خوش‌آمدگویی (سمت چپ کارت).
 * برخلاف صحنه‌ی پس‌زمینه، این تصویر زیر کارت‌ها پنهان نمی‌شود و روی موبایل هم دیده می‌شود.
 */
const ART = {
  ruby: () => (
    <>
      <div className="ru-hero-art">
        <Gem size={150} id="hero" />
        <i className="ru-sheen" />
      </div>
      <svg viewBox="0 0 240 160" preserveAspectRatio="xMinYMax slice">
        {[[30, 40, 1.1, 0], [196, 30, 0.8, 0.8], [168, 120, 1, 1.5], [60, 128, 0.7, 2.1], [112, 22, 0.6, 0.4]].map(([x, y, s, d], i) => (
          <path key={i} className="ru-spark" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }} transform={`translate(${x} ${y}) scale(${s})`} d="M0 -12 Q1.5 -1.5 12 0 Q1.5 1.5 0 12 Q-1.5 1.5 -12 0 Q-1.5 -1.5 0 -12Z" fill="#fff6d6" />
        ))}
        <path d="M0 150 C60 138 140 156 240 142 V160 H0Z" fill="#2a0610" /><path d="M0 150 C60 138 140 156 240 142" fill="none" stroke="#d4af37" strokeWidth="2" />
      </svg>
    </>
  ),
  halloween: () => (
    <svg viewBox="0 0 240 160" preserveAspectRatio="xMinYMax slice">
      <defs>
        <radialGradient id="ha-moon" cx="36%" cy="34%" r="80%">
          <stop offset="0" stopColor="#ffd089" /><stop offset=".45" stopColor="#ff8a2a" /><stop offset="1" stopColor="#c42d0c" />
        </radialGradient>
        <filter id="ha-blur"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <circle cx="120" cy="58" r="36" fill="#ff5a1e" opacity=".5" filter="url(#ha-blur)" />
      <circle cx="120" cy="58" r="32" fill="url(#ha-moon)" />
      <circle cx="132" cy="48" r="6" fill="#8d1409" opacity=".35" /><circle cx="108" cy="72" r="4" fill="#8d1409" opacity=".35" />
      {[[40, 30, 0.5], [188, 26, 0.42], [96, 18, 0.32]].map(([x, y, s], i) => (
        <g key={i} className="hero-bat" style={{ animationDelay: `${i * 0.3}s`, transformOrigin: `${x}px ${y}px` }} transform={`translate(${x - 50 * s} ${y - 25 * s}) scale(${s})`}>
          <g fill="#07030c" stroke="#ff3a5a" strokeWidth="2.2" strokeLinejoin="round">
            <path d={BAT_HALF} /><path d={BAT_HALF} transform="translate(100 0) scale(-1 1)" /><ellipse cx="50" cy="26" rx="6" ry="12" />
          </g>
        </g>
      ))}
      <g fill="#07030c">
        <rect x="104" y="108" width="78" height="52" /><path d="M96 110 L143 74 L190 110Z" /><rect x="160" y="62" width="20" height="50" /><path d="M156 64 L170 36 L184 64Z" />
        <path d="M18 160 C18 130 30 122 24 96 M24 112 C10 106 6 96 4 86 M26 104 C38 100 44 92 46 82" stroke="#07030c" strokeWidth="6" fill="none" strokeLinecap="round" />
        <rect x="0" y="146" width="240" height="14" />
      </g>
      <g fill="#ffc15a" className="hw-windows"><rect x="114" y="122" width="11" height="15" /><rect x="152" y="122" width="11" height="15" /><rect x="166" y="78" width="8" height="12" /></g>
      <g transform="translate(212 138)" className="hw-pumpkin">
        <ellipse rx="16" ry="14" fill="#e5560d" /><path d="M-6 -2 l4 -6 l4 6z M2 -2 l4 -6 l4 6z M-8 5 l4 4 l4 -3 l4 3 l4 -3 l4 4" fill="#ffd45a" />
      </g>
    </svg>
  ),
  love: () => (
    <>
      <Tower className="lv-tower lv-tower--hero" />
      <svg viewBox="0 0 240 160" preserveAspectRatio="xMinYMax slice">
        <circle cx="168" cy="108" r="46" fill="#fff3d6" opacity=".55" />
        {[[120, 40, 0.5], [196, 30, 0.7], [160, 74, 0.38], [214, 76, 0.45], [96, 82, 0.35]].map(([x, y, s], i) => (
          <path key={i} className="lv-heart" style={{ animationDelay: `${i * 0.4}s` }} transform={`translate(${x} ${y}) scale(${s})`} d="M0 40 C-26 18 -30 -4 -16 -12 C-7 -17 0 -11 0 -4 C0 -11 7 -17 16 -12 C30 -4 26 18 0 40Z" fill={['#ff9ec2', '#ffffff', '#ff7fa8', '#ffd0e0', '#ff7fa8'][i]} />
        ))}
        <g fill="#fff" opacity=".4">
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={76 + i * 18} y={134 - (i % 3) * 8} width="16" height={26 + (i % 3) * 8} />)}
        </g>
      </svg>
    </>
  ),
  ramadan: () => (
    <svg viewBox="0 0 240 160" preserveAspectRatio="xMinYMax slice">
      <defs><filter id="rh-blur"><feGaussianBlur stdDeviation="3" /></filter></defs>
      <path d="M150 20 a42 42 0 1 0 22 70 a34 34 0 1 1 -22 -70Z" fill="#ffe08a" />
      <path className="rm-star" d="M196 34 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4z" fill="#fff3c4" />
      <g fill="#070b26">
        <path d="M60 160 V96 a40 40 0 0 1 80 0 V160Z" /><rect x="98" y="46" width="4" height="14" /><path d="M20 160 V100 h14 V160Z" /><path d="M16 100 L27 66 L38 100Z" />
        <path d="M166 160 V104 h14 V160Z" /><path d="M162 104 L173 70 L184 104Z" /><path d="M186 160 V122 a22 22 0 0 1 44 0 V160Z" /><rect x="0" y="152" width="240" height="8" />
      </g>
      <g fill="#ffc94d" className="rm-windows"><path d="M76 150 V124 a8 8 0 0 1 16 0 V150Z" /><path d="M108 150 V124 a8 8 0 0 1 16 0 V150Z" /><rect x="24" y="112" width="5" height="12" rx="2.5" /><rect x="170" y="116" width="5" height="12" rx="2.5" /></g>
      <g className="rm-lantern-mini" style={{ transformOrigin: '30px 0' }}>
        <line x1="30" y1="0" x2="30" y2="20" stroke="#d9b24c" /><path d="M22 22 H38 L42 52 H18Z" fill="#ffc94d" filter="url(#rh-blur)" /><path d="M22 22 H38 L42 52 H18Z" fill="#ffd978" /><rect x="18" y="52" width="24" height="5" rx="2" fill="#c8932a" />
      </g>
    </svg>
  ),
  yalda: () => (
    <svg viewBox="0 0 240 160" preserveAspectRatio="xMinYMax slice">
      <defs>
        <radialGradient id="yh-flesh" cx="50%" cy="20%" r="90%"><stop offset="0" stopColor="#ff7a86" /><stop offset="1" stopColor="#e1203c" /></radialGradient>
        <radialGradient id="yh-pom" cx="38%" cy="32%" r="80%"><stop offset="0" stopColor="#ff5a5a" /><stop offset=".6" stopColor="#c4122c" /><stop offset="1" stopColor="#6d0618" /></radialGradient>
      </defs>
      <circle cx="170" cy="70" r="70" fill="#ffa24a" opacity=".16" />
      <path d="M26 118 A78 78 0 0 0 182 118Z" fill="#1c6b32" /><path d="M32 118 A72 72 0 0 0 176 118Z" fill="#e7f3d4" /><path d="M37 118 A67 67 0 0 0 171 118Z" fill="url(#yh-flesh)" />
      {[[70, 134, 14], [96, 146, -8], [124, 140, 10], [150, 132, -14], [108, 128, 4], [84, 122, 0]].map(([x, y, a], i) => <ellipse key={i} cx={x} cy={y} rx="2.8" ry="5.6" fill="#190509" transform={`rotate(${a} ${x} ${y})`} />)}
      <circle cx="206" cy="124" r="26" fill="url(#yh-pom)" /><path d="M194 100 l5 8 l7 -9 l7 9 l5 -8 l-3 13 h-18z" fill="#b30f27" />
      <rect x="196" y="40" width="14" height="52" rx="3" fill="#fff3dc" />
      <path className="yl-flame" d="M203 8 C211 20 210 30 203 32 C196 30 195 20 203 8Z" fill="#ffcf5a" /><path d="M203 18 C206 24 206 28 203 29 C200 28 200 24 203 18Z" fill="#fff6c9" />
      <rect x="0" y="148" width="240" height="12" fill="#3d0a18" /><rect x="0" y="147" width="240" height="2" fill="#e0a83a" />
    </svg>
  ),
  nowruz: () => (
    <svg viewBox="0 0 240 160" preserveAspectRatio="xMinYMax slice">
      <circle cx="190" cy="40" r="26" fill="#ffd54a" /><circle cx="190" cy="40" r="38" fill="#ffd54a" opacity=".3" />
      <path d="M0 110 C50 84 100 112 150 96 S210 90 240 104 V160 H0Z" fill="#b5e49a" /><path d="M0 134 C60 114 120 138 240 124 V160 H0Z" fill="#6cc45f" />
      {[[30, '#ef476f'], [62, '#ffd166'], [150, '#ff8fab'], [182, '#c77dff'], [214, '#f78c3a']].map(([x, c], i) => (
        <g key={x}><path d={`M${x} 160 q-3 -16 1 -30`} stroke="#2f8a3a" strokeWidth="2.6" fill="none" /><path d={`M${x + 1} 130 c-9 -2 -12 -12 -9 -20 c3 4 6 5 9 4 c3 1 6 0 9 -4 c3 8 0 18 -9 20Z`} fill={c} /></g>
      ))}
      {[[92, '#ef476f'], [116, '#06a77d']].map(([x, c]) => <g key={x}><ellipse cx={x} cy="140" rx="11" ry="15" fill={c} /><path d={`M${x - 10} 138 q5 -5 10 0 t10 0`} stroke="#fff" strokeWidth="1.6" fill="none" /></g>)}
      <g className="nw-fish"><ellipse cx="46" cy="40" rx="9" ry="5" fill="#ff7a2f" /><path d="M55 40 l7 -5 v10z" fill="#ff7a2f" /></g>
    </svg>
  ),
  autumn: () => (
    <svg viewBox="0 0 240 160" preserveAspectRatio="xMinYMax slice">
      <circle cx="120" cy="120" r="64" fill="#ffd27a" opacity=".35" />
      <path d="M0 126 C60 100 120 128 240 110 V160 H0Z" fill="#a85a2c" />
      {[[40, 70, '#e0662a', '#f0a23a'], [100, 86, '#f3a23a', '#d94a2a'], [176, 60, '#d94a2a', '#f6c944']].map(([x, h, c1, c2], i) => (
        <g key={i}><path d={`M${x - 4} 140 L${x - 2} ${140 - h * 0.5} H${x + 2} L${x + 4} 140Z`} fill="#4a2b17" /><circle cx={x} cy={118 - h * 0.5} r="26" fill={c1} /><circle cx={x - 16} cy={130 - h * 0.5} r="18" fill={c2} /><circle cx={x + 16} cy={129 - h * 0.5} r="19" fill={c1} /></g>
      ))}
      {[[70, 34, '#e9602b'], [140, 22, '#f6c944'], [208, 70, '#c4561a'], [20, 20, '#f3a23a']].map(([x, y, c], i) => <path key={i} className="au-leaf" style={{ animationDelay: `${i * 0.5}s`, transformOrigin: `${x}px ${y}px` }} d="M0 0 L6 -12 L12 0 L6 5Z" fill={c} transform={`translate(${x} ${y}) scale(1.8) rotate(${i * 40})`} />)}
      <path d="M0 148 C60 138 120 150 240 142 V160 H0Z" fill="#7a3d1c" />
    </svg>
  ),
  christmas: () => (
    <svg viewBox="0 0 240 160" preserveAspectRatio="xMinYMax slice">
      <circle cx="40" cy="36" r="18" fill="#f4f9ff" /><circle cx="40" cy="36" r="30" fill="#bcd2f0" opacity=".25" />
      <path d="M0 126 C60 104 120 128 240 112 V160 H0Z" fill="#dcecf8" />
      <g>
        <rect x="130" y="130" width="10" height="16" fill="#3b2314" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M135 ${112 - i * 22} L${135 + (60 - i * 11) / 2} ${132 - i * 22} H${135 - (60 - i * 11) / 2}Z`} fill={i % 2 ? '#1f6b43' : '#175a38'} stroke="#0f3b25" />)}
        <path d="M135 20 l4 9 l10 1 l-8 6 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -6 l10 -1z" fill="#ffd54f" className="xm-bulb" />
        {[[120, 110, '#ff5252'], [150, 100, '#ffd54f'], [128, 82, '#7dd3fc'], [143, 64, '#f9a8d4'], [135, 48, '#ff5252'], [160, 122, '#ffd54f']].map(([x, y, c], i) => <circle key={i} className="xm-bulb" cx={x} cy={y} r="3.2" fill={c} style={{ animationDelay: `${i * 0.4}s` }} />)}
      </g>
      <g><rect x="190" y="104" width="44" height="40" fill="#5a3418" /><path d="M184 108 L212 80 L240 108Z" fill="#f2f8fc" /><rect x="198" y="116" width="14" height="12" fill="#ffc861" className="xm-window" /></g>
      <path d="M0 142 C80 128 160 148 240 136 V160 H0Z" fill="#f6fbff" />
      <g><circle cx="60" cy="140" r="14" fill="#fff" /><circle cx="60" cy="118" r="10" fill="#fff" /><path d="M60 118 l10 2 l-10 2z" fill="#ff8a3d" /><circle cx="57" cy="115" r="1.3" fill="#222" /><circle cx="63" cy="115" r="1.3" fill="#222" /></g>
    </svg>
  ),
  mother: () => (
    <svg viewBox="0 0 240 160" preserveAspectRatio="xMinYMax slice">
      <g stroke="#2f8a3a" strokeWidth="3" fill="none" strokeLinecap="round"><path d="M70 160 C60 120 40 90 30 60" /><path d="M70 160 C74 110 78 80 80 40" /><path d="M70 160 C92 120 120 96 140 70" /></g>
      <path d="M62 120 q-20 -8 -22 -26 q18 4 22 26Z M76 100 q20 -6 26 -22 q-20 0 -26 22Z" fill="#3aa347" />
      {[[30, 54, '#f06fa0', '#c93878', 1], [80, 34, '#ff9ec2', '#d9437f', 1.15], [140, 64, '#ffc2d6', '#e0608f', 0.9]].map(([x, y, c1, c2, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s * 0.78})`}><circle r="26" fill={c1} /><path d="M0 -22 C16 -22 22 -4 10 6 C0 14 -16 8 -18 -4 C-20 -16 -8 -20 0 -18 C10 -18 16 -6 8 2" fill="none" stroke={c2} strokeWidth="3" strokeLinecap="round" /></g>
      ))}
      <path d="M44 128 L70 142 L98 128 L84 160 H56Z" fill="#e58fb0" /><path d="M44 128 L70 142 L98 128" stroke="#fff" strokeWidth="2.4" fill="none" opacity=".7" />
      <g className="mt-wings" style={{ transformOrigin: '190px 60px' }}><path d="M190 58 C178 38 166 50 176 60 C168 68 182 74 190 62Z" fill="#fff" opacity=".9" /><path d="M190 58 C202 38 214 50 204 60 C212 68 198 74 190 62Z" fill="#ffd0e0" /></g>
      {[[160, 122, 6], [200, 112, 5], [180, 140, 7], [214, 140, 5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity=".6" />)}
    </svg>
  ),
};

export default function HeroArt({ id }) {
  const Art = ART[id];
  if (!Art) return null;
  return (
    <div className="hero__art" data-art={id} aria-hidden="true">
      <Art />
    </div>
  );
}
