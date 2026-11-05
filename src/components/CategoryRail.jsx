import { useEffect, useRef } from 'react';

/**
 * نوار دسته‌بندی افقی و چسبنده.
 * فقط لایه‌ی داخلی چیپ ورق می‌خورد تا متن دکمه پس از کلیک وارونه یا ناخوانا نشود.
 */
export default function CategoryRail({ groups, activeId, onSelect }) {
  const trackRef = useRef(null);

  // چیپ فعال همیشه در دید باشد
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !activeId) return;
    const chip = track.querySelector(`[data-id="${activeId}"]`);
    if (!chip) return;
    const trackRect = track.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const overflow =
      chipRect.right - trackRect.right > 0 || chipRect.left - trackRect.left < 0;
    if (overflow) {
      const delta = chipRect.left - trackRect.left - trackRect.width / 2 + chipRect.width / 2;
      track.scrollBy({ left: delta, behavior: 'smooth' });
    }
  }, [activeId]);

  if (!groups.length) return null;

  return (
    <nav className="rail" aria-label="دسته‌بندی منو">
      <div className="rail__track" ref={trackRef}>
        {groups.map((g) => {
          const active = g.id === activeId;
          return (
            <button
              key={g.id}
              type="button"
              className="chip"
              data-id={g.id}
              aria-current={active ? 'true' : 'false'}
              onClick={() => onSelect(g.id)}
            >
              <span className="chip__flip">
                <span className="chip__face chip__face--front">
                  <span aria-hidden="true">{g.icon}</span>
                  <span>{g.title}</span>
                </span>
                <span className="chip__face chip__face--back" aria-hidden="true">
                  <span>{g.icon}</span>
                  <span>{g.title}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
