import { Stars, rng } from './common.jsx';

export const BAT_HALF =
  'M50 15 L53.5 4 L57 14 C65 12 80 8 99 21 Q91 22 87 34 Q81 27 75 38 Q69 30 63 40 Q58 33 52 37 L50 46';

function Bat({ className, style }) {
  return (
    <svg className={`hw-bat ${className || ''}`} style={style} viewBox="0 0 100 50" aria-hidden="true">
      <g className="hw-bat__wings">
        <path d={BAT_HALF} />
        <path d={BAT_HALF} transform="translate(100 0) scale(-1 1)" />
        <ellipse cx="50" cy="26" rx="6" ry="12" />
      </g>
      <circle cx="47.3" cy="19" r="1.6" className="hw-eye" />
      <circle cx="52.7" cy="19" r="1.6" className="hw-eye" />
    </svg>
  );
}

export function HalloweenScene() {
  const r = rng(11);
  const eyes = [[140, 330], [1060, 318], [330, 352], [980, 352]];
  return (
    <>
      <Stars count={34} seed={3} minR={0.4} maxR={1.2} height={420} />
      <div className="hw-moon" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <Bat className="hw-bat--a" />
      <Bat className="hw-bat--b" />
      <Bat className="hw-bat--c" />

      <svg className="scene__ground" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <filter id="hw-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <radialGradient id="hw-pumpkin" cx="40%" cy="35%" r="75%">
            <stop offset="0" stopColor="#ffa43a" />
            <stop offset="0.6" stopColor="#e5560d" />
            <stop offset="1" stopColor="#8a2406" />
          </radialGradient>
          <linearGradient id="hw-hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1538" />
            <stop offset="1" stopColor="#12081b" />
          </linearGradient>
        </defs>

        <path d="M0 292 C140 236 270 272 410 246 S660 206 800 246 S1060 226 1200 268 V400 H0Z" fill="url(#hw-hill)" />

        {/* خانه‌ی ارواح */}
        <g fill="#080410">
          <rect x="530" y="214" width="160" height="140" />
          <path d="M514 218 L610 146 L706 218Z" />
          <rect x="652" y="128" width="40" height="96" />
          <path d="M644 132 L672 76 L700 132Z" />
          <rect x="552" y="168" width="20" height="54" />
          <path d="M488 354 L488 262 L530 240 V354Z" />
          <path d="M470 264 L509 224 L548 264Z" />
        </g>
        <g className="hw-windows">
          <g filter="url(#hw-blur)" fill="#ff7a1a" opacity="0.8">
            <rect x="556" y="246" width="22" height="30" />
            <rect x="604" y="246" width="22" height="30" />
            <rect x="660" y="160" width="18" height="26" />
            <rect x="498" y="282" width="16" height="22" />
          </g>
          <g fill="#ffc15a">
            <rect x="556" y="246" width="22" height="30" />
            <rect x="604" y="246" width="22" height="30" />
            <rect x="660" y="160" width="18" height="26" />
            <rect x="498" y="282" width="16" height="22" />
          </g>
          <g stroke="#080410" strokeWidth="3">
            <path d="M567 246V276M556 261H578M615 246V276M604 261H626M669 160V186" />
          </g>
        </g>
        <path d="M600 354 V318 a16 16 0 0 1 32 0 V354Z" fill="#05020a" />

        {/* درخت خشکیده */}
        <g stroke="#080410" strokeLinecap="round" fill="none">
          <path d="M920 372 C912 316 934 276 912 220" strokeWidth="18" />
          <path d="M916 262 C880 246 856 214 842 178" strokeWidth="9" />
          <path d="M866 222 C850 216 838 200 828 190" strokeWidth="5" />
          <path d="M926 246 C960 228 984 196 1000 160" strokeWidth="9" />
          <path d="M968 206 C990 206 1004 196 1016 186" strokeWidth="5" />
          <path d="M914 224 C906 196 912 170 900 142" strokeWidth="7" />
          <path d="M842 178 C834 170 832 160 836 150M1000 160 C1002 148 1010 140 1018 136" strokeWidth="3.5" />
        </g>

        {/* سنگ قبرها */}
        <g fill="#170c20" stroke="#3a2150" strokeWidth="2">
          <path d="M300 358 V316 a24 24 0 0 1 48 0 V358Z" />
          <path d="M370 360 V334 a18 18 0 0 1 36 0 V360Z" />
          <path d="M1040 360 V322 a22 22 0 0 1 44 0 V360Z" />
          <path d="M1108 358 V338 a16 16 0 0 1 32 0 V358Z" />
        </g>
        <g stroke="#4b2c66" strokeWidth="3" strokeLinecap="round">
          <path d="M324 300 V330 M312 312 H336" />
          <path d="M1062 306 V336 M1051 318 H1073" />
        </g>

        {/* کدو جادویی */}
        <g className="hw-pumpkin">
          <ellipse cx="780" cy="348" rx="52" ry="8" fill="#05020a" opacity="0.7" />
          <path d="M780 288 q-6-18 6-24" stroke="#4e6b1d" strokeWidth="7" strokeLinecap="round" fill="none" />
          <ellipse cx="750" cy="322" rx="34" ry="30" fill="url(#hw-pumpkin)" />
          <ellipse cx="810" cy="322" rx="34" ry="30" fill="url(#hw-pumpkin)" />
          <ellipse cx="780" cy="322" rx="30" ry="34" fill="url(#hw-pumpkin)" />
          <g filter="url(#hw-blur)" fill="#ffd45a" opacity="0.9">
            <path d="M758 312 l12 -14 l8 16z M796 312 l12 -14 l8 16z" />
            <path d="M752 334 l10 8 l8 -6 l10 10 l10 -10 l8 6 l10 -8 l-8 18 h-40z" />
          </g>
          <g fill="#ffe27a">
            <path d="M760 312 l10 -12 l7 14z M800 312 l10 -12 l7 14z" />
            <path d="M754 335 l9 7 l7 -5 l10 9 l10 -9 l7 5 l9 -7 l-7 15 h-38z" />
          </g>
        </g>

        {/* زمین جلو */}
        <path d="M0 346 C180 318 380 352 600 338 S1010 326 1200 350 V400 H0Z" fill="#06030a" />
        <g fill="#06030a">
          {Array.from({ length: 34 }, (_, i) => {
            const x = i * 36 + r() * 12;
            const h = 14 + r() * 22;
            return <path key={i} d={`M${x} 360 Q${x + 3} ${360 - h} ${x + 9} ${352 - h} Q${x + 8} 360 ${x + 14} 360Z`} />;
          })}
        </g>
        {eyes.map(([x, y]) => (
          <g key={x} className="hw-eyes" style={{ animationDelay: `${(x % 7) * 0.6}s` }}>
            <ellipse cx={x} cy={y} rx="5" ry="3.2" fill="#ff2a48" />
            <ellipse cx={x + 17} cy={y} rx="5" ry="3.2" fill="#ff2a48" />
          </g>
        ))}
      </svg>
      <div className="hw-fog hw-fog--1" />
      <div className="hw-fog hw-fog--2" />
    </>
  );
}

/** چکه‌های خون در لبه‌ی بالای صفحه + تار عنکبوت + عنکبوت آویزان */
export function HalloweenTop() {
  const drips = [[18, 30, 7], [54, 18, 6], [92, 40, 8], [136, 24, 7], [178, 60, 9], [228, 28, 7], [262, 42, 8], [304, 22, 6], [344, 34, 8], [382, 24, 7]];
  return (
    <>
      <svg className="hw-blood" viewBox="0 0 400 96" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="hw-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f0233f" />
            <stop offset="0.6" stopColor="#b00a26" />
            <stop offset="1" stopColor="#6e0016" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="13" fill="url(#hw-red)" />
        {drips.map(([x, len, w], i) => (
          <g key={x} className={i % 3 === 0 ? 'hw-drip hw-drip--live' : 'hw-drip'} style={{ animationDelay: `${i * 0.9}s` }}>
            <path
              d={`M${x - w} 8 V${len - w} A${w} ${w} 0 0 0 ${x + w} ${len - w} V8Z`}
              fill="url(#hw-red)"
            />
            <rect x={x - w * 0.45} y="10" width={w * 0.35} height={Math.max(len - w * 2.2, 4)} rx={w * 0.17} fill="#ff8c9c" opacity="0.5" />
          </g>
        ))}
      </svg>
      {[[92, 40, 0], [178, 60, 2.3], [262, 42, 4.1], [344, 34, 5.6]].map(([x, len, d]) => (
        <svg key={x} className="hw-droplet" viewBox="0 0 400 96" preserveAspectRatio="none" aria-hidden="true" style={{ animationDelay: `${d}s` }}>
          <path d={`M${x} ${len + 4} q-3 5 0 8 q3 -3 0 -8z`} fill="#c20f2d" />
        </svg>
      ))}
      <svg className="hw-web hw-web--l" viewBox="0 0 120 120" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round">
          <path d="M0 0 L120 6 M0 0 L104 52 M0 0 L70 92 M0 0 L28 116 M0 0 L6 120" />
          <path d="M22 1.5 Q20 22 2 22 M44 3 Q40 44 3 44 M68 4 Q60 68 4 68 M94 5 Q80 92 5 94" />
        </g>
      </svg>
      <svg className="hw-web hw-web--r" viewBox="0 0 120 120" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round">
          <path d="M0 0 L120 6 M0 0 L104 52 M0 0 L70 92 M0 0 L28 116 M0 0 L6 120" />
          <path d="M22 1.5 Q20 22 2 22 M44 3 Q40 44 3 44 M68 4 Q60 68 4 68 M94 5 Q80 92 5 94" />
        </g>
      </svg>
      <div className="hw-spider" aria-hidden="true">
        <svg viewBox="0 0 40 160">
          <line x1="20" y1="0" x2="20" y2="118" stroke="#cfc3d8" strokeWidth="1" />
          <g fill="#0a0510" stroke="#0a0510" strokeWidth="2" strokeLinecap="round">
            <ellipse cx="20" cy="132" rx="8" ry="10" />
            <circle cx="20" cy="119" r="5.5" />
            <path d="M13 126 Q3 120 2 130 M13 131 Q2 133 4 144 M27 126 Q37 120 38 130 M27 131 Q38 133 36 144" fill="none" />
          </g>
          <circle cx="18" cy="118" r="1.2" fill="#ff2a48" />
          <circle cx="22" cy="118" r="1.2" fill="#ff2a48" />
        </svg>
      </div>
    </>
  );
}
