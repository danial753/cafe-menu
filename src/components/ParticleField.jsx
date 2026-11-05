import { useEffect, useRef } from 'react';

/**
 * پس‌زمینه‌ی ذره‌ای با حس عمق سه‌بعدی (پارالاکس).
 *
 * هر تم نوع ذره‌ی خودش را دارد: دانه‌ی قهوه، خفاش، قلب، گلبرگ، برگ پاییزی، برف، ستاره…
 * ذره‌ها یک‌بار روی «اسپرایت» پیش‌رندر می‌شوند و در هر فریم فقط drawImage اجرا می‌شود،
 * پس روی گوشی‌های ضعیف هم سبک است. عمق (z) هم اندازه، هم شفافیت و هم میزان
 * جابه‌جایی با پارالاکس را تعیین می‌کند.
 */

const S = 96; // اندازه‌ی اسپرایت (پیکسل)

function newSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  return { canvas, ctx: canvas.getContext('2d') };
}

/* ---------------------------------------------------------------- اسپرایت‌ها */

function beanSprites() {
  const { canvas, ctx } = newSprite();
  const rx = S * 0.3;
  const ry = S * 0.43;
  ctx.translate(S / 2, S / 2);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(-rx, -ry, rx, ry);
  grad.addColorStop(0, '#9a6738');
  grad.addColorStop(0.5, '#6b4023');
  grad.addColorStop(1, '#3d2213');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.save();
  ctx.clip();
  const shine = ctx.createRadialGradient(-rx * 0.45, -ry * 0.55, 1, -rx * 0.2, -ry * 0.3, rx * 1.5);
  shine.addColorStop(0, 'rgba(255,226,190,0.55)');
  shine.addColorStop(1, 'rgba(255,226,190,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(-rx, -ry, rx * 2, ry * 2);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -ry * 0.76);
  ctx.quadraticCurveTo(rx * 0.6, 0, 0, ry * 0.76);
  ctx.lineWidth = S * 0.055;
  ctx.strokeStyle = 'rgba(38,20,10,0.75)';
  ctx.stroke();
  ctx.restore();
  return [canvas];
}

/** خفاش: بدنه‌ی تیره با لبه‌ی قرمزِ درخشان و چشم‌های سرخ */
function batSprites() {
  const { canvas, ctx } = newSprite();
  ctx.translate(S / 2, S / 2 + 2);
  ctx.scale(0.92, 0.92);
  ctx.translate(-50, -25);
  const half = new Path2D(
    'M50 15 L53.5 4 L57 14 C65 12 80 8 99 21 Q91 22 87 34 Q81 27 75 38 Q69 30 63 40 Q58 33 52 37 L50 46',
  );
  ctx.lineJoin = 'round';
  for (const flip of [1, -1]) {
    ctx.save();
    if (flip < 0) {
      ctx.translate(100, 0);
      ctx.scale(-1, 1);
    }
    ctx.fillStyle = '#0b0610';
    ctx.strokeStyle = 'rgba(255,72,96,0.85)';
    ctx.lineWidth = 2.4;
    ctx.fill(half);
    ctx.stroke(half);
    ctx.restore();
  }
  ctx.fillStyle = '#0b0610';
  ctx.beginPath();
  ctx.ellipse(50, 26, 6, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff3b57';
  ctx.shadowColor = '#ff2040';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(47.3, 19, 1.6, 0, Math.PI * 2);
  ctx.arc(52.7, 19, 1.6, 0, Math.PI * 2);
  ctx.fill();
  return [canvas];
}

const HEART =
  'M48 86 C12 58 4 30 24 18 C37 11 46 19 48 29 C50 19 59 11 72 18 C92 30 84 58 48 86 Z';

function heartSprites() {
  const palette = [
    ['#ffc2da', '#ec5d96'],
    ['#ff9ec2', '#d93a78'],
    ['#ff7a9c', '#c01e4f'],
    ['#ffe3ee', '#f29ab9'],
  ];
  return palette.map(([a, b]) => {
    const { canvas, ctx } = newSprite();
    const g = ctx.createLinearGradient(14, 10, 80, 90);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.fill(new Path2D(HEART));
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(31, 29, 9, 5, -0.7, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  });
}

function petalSprites() {
  const palette = [
    ['#ffe0ea', '#f08fb2'],
    ['#fff0f4', '#f7b5cb'],
    ['#ffd0de', '#e0668f'],
    ['#ffffff', '#f6c1d4'],
  ];
  return palette.map(([a, b]) => {
    const { canvas, ctx } = newSprite();
    const g = ctx.createRadialGradient(40, 36, 4, 48, 50, 44);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(48, 12);
    ctx.bezierCurveTo(78, 22, 82, 66, 48, 86);
    ctx.bezierCurveTo(14, 66, 18, 22, 48, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(190,80,120,0.28)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(48, 20);
    ctx.quadraticCurveTo(52, 52, 48, 80);
    ctx.stroke();
    return canvas;
  });
}

function blossomSprites() {
  const palette = [
    ['#fff4f8', '#f6a9c5'],
    ['#ffffff', '#f9cbdc'],
    ['#ffe3ec', '#ef8fb1'],
  ];
  return palette.map(([a, b]) => {
    const { canvas, ctx } = newSprite();
    ctx.translate(S / 2, S / 2);
    for (let i = 0; i < 5; i += 1) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 5);
      const g = ctx.createRadialGradient(0, -16, 2, 0, -22, 26);
      g.addColorStop(0, a);
      g.addColorStop(1, b);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.bezierCurveTo(-20, -14, -18, -38, -5, -40);
      ctx.lineTo(0, -35);
      ctx.lineTo(5, -40);
      ctx.bezierCurveTo(18, -38, 20, -14, 0, -4);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  });
}

const LEAF =
  'M48 8 L55 28 L74 18 L67 42 L90 40 L72 58 L80 72 L56 68 L52 90 L48 84 L44 90 L40 68 L16 72 L24 58 L6 40 L29 42 L22 18 L41 28 Z';

function leafSprites() {
  const palette = [
    ['#f3a23a', '#c4561a'],
    ['#e9602b', '#a8281a'],
    ['#f6c944', '#d9892b'],
    ['#c1561e', '#7a2f12'],
    ['#d94a2a', '#8c1d18'],
  ];
  return palette.map(([a, b]) => {
    const { canvas, ctx } = newSprite();
    const g = ctx.createLinearGradient(10, 10, 86, 90);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.fill(new Path2D(LEAF));
    ctx.strokeStyle = 'rgba(90,30,10,0.45)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(48, 20);
    ctx.lineTo(48, 90);
    ctx.moveTo(48, 50);
    ctx.lineTo(24, 40);
    ctx.moveTo(48, 50);
    ctx.lineTo(72, 40);
    ctx.stroke();
    return canvas;
  });
}

function snowSprites() {
  const dot = () => {
    const { canvas, ctx } = newSprite();
    const g = ctx.createRadialGradient(48, 48, 2, 48, 48, 30);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.75)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(48, 48, 30, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  };
  const flake = () => {
    const { canvas, ctx } = newSprite();
    ctx.translate(48, 48);
    ctx.strokeStyle = 'rgba(235,246,255,0.95)';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i += 1) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -34);
      ctx.moveTo(0, -20);
      ctx.lineTo(-9, -29);
      ctx.moveTo(0, -20);
      ctx.lineTo(9, -29);
      ctx.stroke();
      ctx.restore();
    }
    return canvas;
  };
  return [dot(), dot(), dot(), flake()];
}

function sparkSprites() {
  const palette = [
    ['#fff3c4', '#f2b53d'],
    ['#ffd9d0', '#ff7d6e'],
    ['#fff7de', '#ffd36b'],
  ];
  return palette.map(([a, b]) => {
    const { canvas, ctx } = newSprite();
    const glow = ctx.createRadialGradient(48, 48, 1, 48, 48, 40);
    glow.addColorStop(0, `${b}cc`);
    glow.addColorStop(1, `${b}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, S, S);
    const g = ctx.createLinearGradient(20, 20, 76, 76);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(48, 14);
    ctx.quadraticCurveTo(52, 44, 82, 48);
    ctx.quadraticCurveTo(52, 52, 48, 82);
    ctx.quadraticCurveTo(44, 52, 14, 48);
    ctx.quadraticCurveTo(44, 44, 48, 14);
    ctx.fill();
    return canvas;
  });
}

/** تکه‌های یاقوت تراش‌خورده و غبار طلایی */
function gemSprites() {
  const ruby = (hue, light) => {
    const { canvas, ctx } = newSprite();
    ctx.translate(S / 2, S / 2);
    const R = 38;
    const ring = (r, a0) => Array.from({ length: 8 }, (_, i) => {
      const a = a0 + (i * Math.PI) / 4 - Math.PI / 2;
      return [r * Math.cos(a), r * Math.sin(a)];
    });
    const girdle = ring(R, 0);
    const table = ring(R * 0.46, 0);
    for (let i = 0; i < 8; i += 1) {
      const j = (i + 1) % 8;
      const a = (i * Math.PI) / 4 + Math.PI / 8 - Math.PI / 2;
      const lit = 0.5 + 0.5 * Math.cos(a + Math.PI * 0.75);
      ctx.fillStyle = `hsl(${hue} 88% ${light + lit * 34}%)`;
      ctx.strokeStyle = 'rgba(255,210,215,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(...table[i]);
      ctx.lineTo(...girdle[i]);
      ctx.lineTo(...girdle[j]);
      ctx.lineTo(...table[j]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = `hsl(${hue} 90% ${light + 22}%)`;
    ctx.beginPath();
    table.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.ellipse(-12, -14, 7, 3, -0.7, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  };
  const dust = () => {
    const { canvas, ctx } = newSprite();
    const g = ctx.createRadialGradient(48, 48, 1, 48, 48, 22);
    g.addColorStop(0, 'rgba(255,244,200,1)');
    g.addColorStop(0.4, 'rgba(240,200,90,0.8)');
    g.addColorStop(1, 'rgba(212,175,55,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(48, 48, 22, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  };
  return [ruby(350, 14), ruby(346, 18), ruby(356, 12), dust(), dust(), dust()];
}

/* ---------------------------------------------------------------- رفتار هر نوع */

/**
 * motion:  rise (بالا می‌رود) | fall (می‌افتد) | fly (پرواز افقی) | float (شناور)
 * count:   ضریبی از تعداد پایه که با اندازه و قدرت دستگاه تنظیم می‌شود
 */
const KINDS = {
  bean: { make: beanSprites, motion: 'rise', count: 1, size: [24, 70], alpha: (z) => 0.1 + z * 0.26 },
  bat: { make: batSprites, motion: 'fly', count: 0.62, size: [34, 82], alpha: (z) => 0.5 + z * 0.4, flap: true },
  heart: { make: heartSprites, motion: 'float', count: 0.95, size: [18, 54], alpha: (z) => 0.32 + z * 0.5 },
  petal: { make: petalSprites, motion: 'fall', count: 1, size: [18, 46], alpha: (z) => 0.45 + z * 0.45, flutter: true },
  blossom: { make: blossomSprites, motion: 'fall', count: 0.95, size: [20, 50], alpha: (z) => 0.5 + z * 0.45 },
  leaf: { make: leafSprites, motion: 'fall', count: 0.9, size: [26, 66], alpha: (z) => 0.55 + z * 0.4, flutter: true },
  snow: { make: snowSprites, motion: 'fall', count: 2.1, size: [8, 34], alpha: (z) => 0.4 + z * 0.55, gentle: true },
  gem: { make: gemSprites, motion: 'float', count: 1.15, size: [12, 40], alpha: (z) => 0.45 + z * 0.5, twinkle: true },
  spark: { make: sparkSprites, motion: 'rise', count: 1.1, size: [14, 42], alpha: (z) => 0.35 + z * 0.5, twinkle: true },
  star: { make: sparkSprites, motion: 'float', count: 1.2, size: [12, 38], alpha: (z) => 0.3 + z * 0.55, twinkle: true },
};

function baseCount() {
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;
  let n = w < 520 ? 13 : w < 900 ? 18 : 24;
  if (cores <= 4) n = Math.round(n * 0.75);
  if (navigator.deviceMemory && navigator.deviceMemory <= 3) n = Math.round(n * 0.7);
  return Math.max(8, n);
}

function makeParticles(kind, cfg, spriteCount) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const count = Math.max(6, Math.round(baseCount() * cfg.count));
  const [minS, maxS] = cfg.size;
  return Array.from({ length: count }, () => {
    const z = 0.32 + Math.random() * 0.85;
    const dir = Math.random() < 0.5 ? -1 : 1;
    const p = {
      x: Math.random() * w,
      y: Math.random() * (h + 160) - 80,
      z,
      size: (minS + (z - 0.3) * ((maxS - minS) / 0.9)) * (w < 520 ? 0.85 : 1),
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.0022,
      vx: 0,
      vy: 0,
      dir,
      v: Math.floor(Math.random() * spriteCount),
      phase: Math.random() * Math.PI * 2,
      speed: 0.0004 + Math.random() * 0.0007,
      flap: Math.random() * Math.PI * 2,
    };
    if (cfg.motion === 'rise') p.vy = -(0.06 + z * 0.16);
    if (cfg.motion === 'float') p.vy = -(0.03 + z * 0.07);
    if (cfg.motion === 'fall') {
      p.vy = cfg.gentle ? 0.035 + z * 0.075 : 0.05 + z * 0.11;
      p.vx = (Math.random() - 0.5) * 0.02;
      if (cfg.flutter) p.vr = (Math.random() - 0.5) * 0.004;
    }
    if (cfg.motion === 'fly') {
      p.vx = dir * (0.05 + z * 0.12);
      p.vy = 0;
      p.rot = 0;
      p.vr = 0;
      p.flap = Math.random() * 6;
    }
    if (kind === 'bat') p.y = Math.random() * h * 0.7 + 30;
    return p;
  });
}

export default function ParticleField({ kind = 'bean' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const cfg = KINDS[kind] || KINDS.bean;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const sprites = cfg.make();
    let parts = makeParticles(kind, cfg, sprites.length);
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
      parts = makeParticles(kind, cfg, sprites.length);
    };

    const draw = (time) => {
      const dt = Math.min(time - last, 60);
      last = time;
      ctx.clearRect(0, 0, width, height);

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      const scrollY = window.scrollY || 0;

      // باد متغیر: ترکیب دو sin با فرکانس‌های متفاوت (هوا بی‌משלבان است، نه خطی)
      const wind =
        (Math.sin(time * 0.00021) * 0.55 + Math.sin(time * 0.000058) * 1.15) * 0.02;

      for (const p of parts) {
        if (!reduce) {
          p.x += (p.vx + wind * (0.35 + p.z)) * dt;
          p.y += (p.vy + wind * (0.12 + p.z * 0.3)) * dt;
          p.rot += p.vr * dt;
          p.phase += p.speed * dt;
          p.flap += dt * 0.014;
          if (cfg.motion === 'rise' || cfg.motion === 'float') {
            if (p.y < -100) {
              p.y = height + 80;
              p.x = Math.random() * width;
            }
          } else if (cfg.motion === 'fall') {
            if (p.y > height + 80) {
              p.y = -80;
              p.x = Math.random() * width;
            }
            if (p.x < -80) p.x = width + 60;
            if (p.x > width + 80) p.x = -60;
          } else if (cfg.motion === 'fly') {
            if (p.x > width + 120 || p.x < -120) {
              p.dir = p.x > 0 ? -1 : 1;
              p.vx = p.dir * (0.05 + p.z * 0.12);
              p.x = p.dir > 0 ? -100 : width + 100;
              p.y = Math.random() * height * 0.7 + 30;
            }
          }
        }

        const swayAmp = cfg.gentle ? 10 : cfg.flutter ? 26 : cfg.motion === 'fly' ? 0 : 12;
        const sway = reduce ? 0 : Math.sin(p.phase) * swayAmp;
        const bob = reduce || cfg.motion !== 'fly' ? 0 : Math.sin(p.phase * 2.3) * 22;
        const par = p.z - 0.7;
        const px = p.x + sway + pointer.x * par * 26;
        const py = p.y + bob + pointer.y * par * 18 - scrollY * par * 0.16;

        if (py < -p.size || py > height + p.size || px < -p.size || px > width + p.size) continue;

        let alpha = cfg.alpha(p.z);
        // مهِ عمق: ذراتِ دورتر (z پایین) کمرنگ‌تر می‌شوند
        alpha *= 0.55 + 0.45 * p.z;
        if (cfg.twinkle && !reduce) alpha *= 0.45 + 0.55 * Math.abs(Math.sin(p.phase * 3.2));

        let sx = 1;
        if (cfg.flap && !reduce) sx = 0.5 + 0.5 * Math.abs(Math.sin(p.flap));
        if (cfg.flutter && !reduce) sx = 0.55 + 0.45 * Math.abs(Math.cos(p.phase * 2));

        const sprite = sprites[p.v % sprites.length];
        ctx.save();
        ctx.globalAlpha = Math.min(alpha, 1);
        ctx.translate(px, py);
        if (cfg.motion === 'fly') {
          // خفاش: بال‌زدنِแท้ (بیشتر از نوسان) + تمایلِ تدریجی
          ctx.rotate(Math.sin(p.flap * 0.8) * 0.4 + Math.sin(p.phase * 2.3) * 0.12);
        } else {
          ctx.rotate(p.rot);
        }
        ctx.scale(sx, 1);
        ctx.drawImage(sprite, -p.size / 2, -p.size / 2, p.size, p.size);
        // گلو (bloom): برای ذراتِ درخشان یک لایه‌ی بزرگ‌تر با ترکیبدنِ additive می‌کشیم
        if (cfg.twinkle && !reduce) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = Math.min(alpha, 1) * 0.42;
          ctx.scale(1.9, 1.9);
          ctx.drawImage(sprite, -p.size / 2, -p.size / 2, p.size, p.size);
        }
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
  }, [kind]);

  return <canvas id="bg-canvas" data-kind={kind} ref={canvasRef} aria-hidden="true" />;
}
