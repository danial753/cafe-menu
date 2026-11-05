import { useEffect, useRef } from 'react';

/**
 * پس‌زمینه‌ی سه‌بعدی ملایم: دانه‌های قهوه‌ی شناور در عمق‌های مختلف.
 *
 * چرا Canvas دوبعدی به‌جای Three.js؟
 *  - هیچ کتابخانه‌ی سنگینی اضافه نمی‌شود (چند کیلوبایت به‌جای صدها کیلوبایت)
 *  - دانه‌ها یک‌بار روی «اسپرایت» پیش‌رندر می‌شوند، پس در هر فریم فقط drawImage داریم
 *  - روی گوشی‌های ضعیف هم روان است؛ تعداد دانه‌ها بر اساس قدرت دستگاه تنظیم می‌شود
 *  - با prefers-reduced-motion و مخفی‌شدن تب، متوقف می‌شود
 *
 * عمق (z) هم اندازه، هم شفافیت و هم میزان جابه‌جایی با پارالاکس را تعیین می‌کند،
 * برای همین حس سه‌بعدی بدون هیچ موتور سه‌بعدی ساخته می‌شود.
 */

const SPRITE_STEPS = 6;
const SPRITE_PX = 96;

function makeBeanSprite() {
  const S = SPRITE_PX;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  const rx = S * 0.3;
  const ry = S * 0.43;

  ctx.translate(S / 2, S / 2);

  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.closePath();
  const grad = ctx.createLinearGradient(-rx, -ry, rx, ry);
  grad.addColorStop(0, '#9a6738');
  grad.addColorStop(0.5, '#6b4023');
  grad.addColorStop(1, '#3d2213');
  ctx.fillStyle = grad;
  ctx.fill();

  // درخشش نرم گوشه‌ی بالا
  ctx.save();
  ctx.clip();
  const shine = ctx.createRadialGradient(-rx * 0.45, -ry * 0.55, 1, -rx * 0.2, -ry * 0.3, rx * 1.5);
  shine.addColorStop(0, 'rgba(255,226,190,0.55)');
  shine.addColorStop(1, 'rgba(255,226,190,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(-rx, -ry, rx * 2, ry * 2);

  // شیار وسط دانه
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -ry * 0.76);
  ctx.quadraticCurveTo(rx * 0.6, 0, 0, ry * 0.76);
  ctx.lineWidth = S * 0.055;
  ctx.strokeStyle = 'rgba(38,20,10,0.75)';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-S * 0.025, -ry * 0.72);
  ctx.quadraticCurveTo(rx * 0.55, 0, -S * 0.025, ry * 0.72);
  ctx.lineWidth = S * 0.022;
  ctx.strokeStyle = 'rgba(255,225,190,0.3)';
  ctx.stroke();
  ctx.restore();

  return canvas;
}

function beanCount() {
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;
  let n = w < 520 ? 13 : w < 900 ? 18 : 24;
  if (cores <= 4) n = Math.round(n * 0.75);
  if (navigator.deviceMemory && navigator.deviceMemory <= 3) n = Math.round(n * 0.7);
  return Math.max(8, n);
}

function makeBeans(count) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Array.from({ length: count }, () => {
    const z = 0.32 + Math.random() * 0.85;
    return {
      x: Math.random() * w,
      y: Math.random() * (h + 160) - 80,
      z,
      size: (24 + z * 46) * (w < 520 ? 0.85 : 1),
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.0022,
      vy: -(0.06 + z * 0.16),
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.0004 + Math.random() * 0.0007,
    };
  });
}

export default function BeanField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const sprite = makeBeanSprite();
    let beans = makeBeans(beanCount());
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = performance.now();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      beans = makeBeans(beanCount());
    };

    const draw = (time) => {
      const dt = Math.min(time - last, 60);
      last = time;
      ctx.clearRect(0, 0, width, height);

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      const scrollY = window.scrollY || 0;

      for (const b of beans) {
        if (!reduce) {
          b.y += b.vy * dt;
          b.rot += b.vr * dt;
          b.swayPhase += b.swaySpeed * dt;
          if (b.y < -100) {
            b.y = height + 80;
            b.x = Math.random() * width;
          }
        }
        const sway = reduce ? 0 : Math.sin(b.swayPhase) * 12;
        const par = b.z - 0.7;
        const px = b.x + sway + pointer.x * par * 26;
        const py = b.y + pointer.y * par * 18 - scrollY * par * 0.16;

        // سبک‌سازی: دانه‌های بیرون از صفحه کشیده نمی‌شوند
        if (py < -b.size || py > height + b.size || px < -b.size || px > width + b.size) continue;

        ctx.save();
        ctx.globalAlpha = 0.1 + b.z * 0.26;
        ctx.translate(px, py);
        ctx.rotate(b.rot);
        ctx.drawImage(sprite, -b.size / 2, -b.size / 2, b.size, b.size);
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    const onPointer = (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas id="bg-canvas" ref={canvasRef} aria-hidden="true" />;
}
