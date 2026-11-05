import { useEffect, useRef } from 'react';

/**
 * کارت کج‌شونده (tilt) با حس عمق سه‌بعدی.
 * - با حرکت ماوس یا کشیدن انگشت روی کارت، کارت در فضای سه‌بعدی می‌چرخد
 * - یک لایه‌ی «بازتاب نور» همراه نشانگر حرکت می‌کند
 * - به‌جای setState در هر فریم، مستقیم روی استایل DOM می‌نویسیم (بدون ری‌رندر)
 *
 * نکته: والد باید perspective داشته باشد (کلاس .stage در CSS).
 */
export default function TiltCard({
  className = '',
  children,
  max = 9,
  lift = 8,
  glare = true,
  disabled = false,
  ...rest
}) {
  const ref = useRef(null);
  const st = useRef({
    tx: 0,
    ty: 0,
    cx: 0,
    cy: 0,
    go: 0,
    hover: false,
    mx: 50,
    my: 50,
    raf: 0,
    reduce: false,
  });

  useEffect(() => {
    st.current.reduce = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const s = st.current;

    const apply = () => {
      const scale = s.hover ? 1.016 : 1;
      const z = s.hover ? lift : 0;
      el.style.transform = `rotateX(${s.cx.toFixed(2)}deg) rotateY(${s.cy.toFixed(2)}deg) translate3d(0,0,${z.toFixed(1)}px) scale(${scale})`;
      el.style.setProperty('--go', s.go.toFixed(3));
      el.style.setProperty('--mx', `${s.mx.toFixed(1)}%`);
      el.style.setProperty('--my', `${s.my.toFixed(1)}%`);
      // سایه‌ی دینامیک: مثل نور واقعی از سمت مخالفِ اشاره‌گر می‌افتد
      if (lift > 0) {
        const ox = (s.mx - 50) * 0.22 * s.go;
        const oy = (s.my - 50) * 0.22 * s.go;
        const blur = 18 + 16 * s.go;
        const spread = -6 - 8 * s.go;
        const dark = (0.28 + 0.2 * s.go).toFixed(3);
        el.style.boxShadow = `${(-ox).toFixed(1)}px ${(-oy + 10).toFixed(1)}px ${blur.toFixed(0)}px ${spread.toFixed(0)}px rgba(0,0,0,${dark})`;
      }
    };

    const tick = () => {
      s.cx += (s.tx - s.cx) * 0.16;
      s.cy += (s.ty - s.cy) * 0.16;
      s.go += ((s.hover ? 1 : 0) - s.go) * 0.12;
      apply();
      const settled =
        Math.abs(s.tx - s.cx) < 0.04 && Math.abs(s.ty - s.cy) < 0.04 && Math.abs((s.hover ? 1 : 0) - s.go) < 0.01;
      if (settled) {
        s.raf = 0;
      } else {
        s.raf = requestAnimationFrame(tick);
      }
    };

    const kick = () => {
      if (!s.raf) s.raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      if (s.reduce || disabled) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      // در RTL جهت چرخش عمودی برعکس می‌شود تا با حرکت دست هم‌خوان بماند
      s.ty = (px - 0.5) * 2 * max;
      s.tx = -(py - 0.5) * 2 * max;
      s.mx = px * 100;
      s.my = py * 100;
      s.hover = true;
      kick();
    };

    const onEnter = () => {
      if (disabled) return;
      s.hover = true;
      kick();
    };

    const onLeave = () => {
      s.hover = false;
      s.tx = 0;
      s.ty = 0;
      kick();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointercancel', onLeave);
    apply();

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointercancel', onLeave);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [max, lift, disabled]);

  return (
    <div ref={ref} className={`tilt ${className}`} style={{ touchAction: 'pan-y' }} {...rest}>
      {children}
      {glare && <span className="tilt__glare" aria-hidden="true" />}
    </div>
  );
}
