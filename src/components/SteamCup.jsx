/** فنجان قهوه با بخار متحرک — SVG سبک و بدون تصویر خارجی.
 *  بخار: سه حلقه‌ی بخار که با جریانِ بالا، گسترش و محو شدن حرکت می‌کنند
 *  (برخلاف پُف‌های ثابت، واقع‌گرایانه‌تر است). */
export default function SteamCup({ size = 92 }) {
  return (
    <svg
      className="hero__cup"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ width: size, height: size }}
    >
      <g fill="none" stroke="#fff6ec" strokeWidth="3.2" strokeLinecap="round" opacity="0.92">
        <path className="steam s1" d="M36 30c-7-8 7-12 0-22" />
        <path className="steam s2" d="M50 27c-7-9 7-13 0-24" />
        <path className="steam s3" d="M64 30c-7-8 7-12 0-22" />
      </g>
      <path d="M24 42h48v16a24 24 0 0 1-48 0V42Z" fill="#fff6ec" opacity="0.92" />
      <path d="M72 48h8a9 9 0 0 1 0 18h-8" fill="none" stroke="#fff6ec" strokeWidth="4" />
      <rect x="20" y="36" width="56" height="7" rx="3.5" fill="#fff6ec" opacity="0.95" />
      <ellipse cx="48" cy="86" rx="30" ry="4" fill="#fff6ec" opacity="0.35" />

      <style>{`
        .hero__cup .steam {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: steamRise 4.2s cubic-bezier(0.4, 0.1, 0.3, 1) infinite;
        }
        .hero__cup .s2 { animation-delay: 1.35s; }
        .hero__cup .s3 { animation-delay: 2.7s; }
        @keyframes steamRise {
          0% {
            opacity: 0;
            transform: translateY(10px) scaleX(0.6) scaleY(0.8);
          }
          18% { opacity: 0.85; }
          55% {
            opacity: 0.45;
            transform: translateY(-10px) scaleX(1.15) scaleY(1.1);
          }
          100% {
            opacity: 0;
            transform: translateY(-26px) scaleX(1.6) scaleY(1.25);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero__cup .steam { animation: none; opacity: 0.45; transform: translateY(-6px) scaleX(1.1); }
        }
      `}</style>
    </svg>
  );
}
