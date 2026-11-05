import { Link } from 'react-router-dom';

export default function CafeHeader({ cafe, isDark, onToggleTheme, table }) {
  return (
    <header className="header">
      <div className="header__inner stage">
        <div className="logo3d preserve" aria-hidden="true">
          <span>{cafe.logo}</span>
        </div>

        <div style={{ minWidth: 0 }}>
          <div className="header__title">{cafe.name}</div>
          <div className="header__sub">منوی دیجیتال</div>
        </div>

        <div className="header__spacer" />

        {table && (
          <div className="table-badge" title="از روی QR کد همین میز باز شده است">
            میز {table}
          </div>
        )}

        <button
          className="icon-btn icon-btn--mode"
          onClick={onToggleTheme}
          aria-label={isDark ? 'حالت روشن' : 'حالت تاریک'}
          title={isDark ? 'حالت روشن' : 'حالت تاریک'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <Link className="icon-btn" to="/admin" aria-label="پنل مدیریت" title="پنل مدیریت">
          ⚙️
        </Link>
      </div>
    </header>
  );
}
