import { AnimatePresence, motion } from 'framer-motion';
import MenuItemCard from './MenuItemCard.jsx';

/**
 * یک دسته از منو.
 * سربرگ دسته مثل یک کارت دوبعدی با چرخش سه‌بعدی (rotateX) ورق می‌خورد
 * و فهرست آیتم‌ها با یک «باز شدن» سه‌بعدی از بالا ظاهر می‌شود.
 */
export default function CategorySection({ group, open, onToggle, sectionRef }) {
  const items = group.items || [];

  return (
    <section
      className={`group${open ? ' is-open' : ''}`}
      id={`sec-${group.id}`}
      ref={sectionRef}
      aria-label={`دسته‌ی ${group.title}`}
    >
      <div className="group__head">
        <div
          className="group__flip"
          role="button"
          tabIndex={0}
          id={`head-${group.id}`}
          aria-label={`باز یا بستن دسته‌ی ${group.title}`}
          aria-expanded={open}
          aria-controls={`body-${group.id}`}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle();
            }
          }}
        >
          <div className="group__face">
            <div className="group__icon" aria-hidden="true">
              {group.icon || '🍽️'}
            </div>
            <div>
              <div className="group__title">{group.title}</div>
              {group.subtitle ? <div className="group__sub">{group.subtitle}</div> : null}
            </div>
            <span className="group__count">{items.length} آیتم</span>
            <span className="group__chev" aria-hidden="true">
              ▲
            </span>
          </div>

          <div className="group__face group__face--back" aria-hidden="true">
            <div className="group__icon">{group.icon || '🍽️'}</div>
            <div>
              <div className="group__title">{group.title}</div>
              <div className="group__sub">برای بستن لمس کنید</div>
            </div>
            <span className="group__count">{items.length} آیتم</span>
            <span className="group__chev">▼</span>
          </div>
        </div>
      </div>

      <div className="group__viewport">
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="body"
              id={`body-${group.id}`}
              className="group__body"
              initial={{ rotateX: -4, opacity: 1, height: 0 }}
              animate={{ rotateX: 0, opacity: 1, height: 'auto' }}
              exit={{ rotateX: -2, opacity: 1, height: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 0.85, 0.2, 1] }}
            >
              {items.length ? (
                <div className="items stage">
                  {items.map((item) => <MenuItemCard key={item.id} item={item} />)}
                </div>
              ) : (
                <div className="empty">هنوز آیتمی در این دسته اضافه نشده است.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
