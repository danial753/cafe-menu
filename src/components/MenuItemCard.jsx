import { formatToman } from '../lib/format.js';
import cafe from '../data/cafe.json';

/**
 * کارت آیتم همیشه در حالت عادی قابل‌دیدن است؛ هیچ opacity یا نمایش وابسته به hover ندارد.
 * عمق سه‌بعدی از perspective گرید و لایه‌های translateZ داخلی می‌آید.
 */
export default function MenuItemCard({ item }) {
  return (
    <article
      className={`item${item.available ? '' : ' is-unavailable'}`}
      aria-disabled={item.available ? undefined : 'true'}
    >
      {!item.available && <span className="badge-out">ناموجود</span>}

      <div className="item__media">
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" decoding="async" />
        ) : (
          <span aria-hidden="true">{item.emoji || '🍽️'}</span>
        )}
      </div>

      <div className="item__body">
        <div className="item__name">{item.name}</div>
        {item.desc ? <div className="item__desc">{item.desc}</div> : null}
        <div className="item__foot">
          <span className="price">
            {formatToman(item.price)}
            <small>{cafe.currencyLabel}</small>
          </span>
          {(item.tags || []).map((t) => (
            <span className="tag" key={t}>{t}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
