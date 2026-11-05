import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMenu } from '../lib/store.jsx';
import { ensurePassword, isLoggedIn, login, logout } from '../lib/password.js';
import { menuStats } from '../lib/menuModel.js';
import GroupEditor from '../components/admin/GroupEditor.jsx';
import QRPanel from '../components/admin/QRPanel.jsx';
import SettingsPanel from '../components/admin/SettingsPanel.jsx';

const TABS = [
  { id: 'menu', label: '📋 گروه‌ها و اقلام' },
  { id: 'qr', label: '🧾 QR کد' },
  { id: 'settings', label: '🏷️ اطلاعات کافه و تم' }
];

function LoginCard({ cafe, onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ensurePassword();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const ok = await login(password);
    setBusy(false);
    if (ok) onSuccess();
    else setError('رمز عبور اشتباه است');
  };

  return (
    <div className="wrap stage">
      <motion.form
        className="login-card tilt"
        onSubmit={submit}
        initial={{ opacity: 0, y: 26, rotateX: -14 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="logo3d preserve" aria-hidden="true">
          <span>{cafe.logo}</span>
        </div>
        <h2 style={{ fontSize: 17 }}>پنل مدیریت {cafe.name}</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          برای ویرایش منو رمز عبور را وارد کنید
        </p>

        <label className="field" style={{ marginTop: 18, textAlign: 'right' }}>
          <span>رمز عبور</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />
        </label>

        {error ? <div className="notice">{error}</div> : null}

        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
          {busy ? 'در حال بررسی…' : 'ورود'}
        </button>

        <div className="muted" style={{ marginTop: 14 }}>
          <Link to="/">بازگشت به منو</Link>
        </div>
      </motion.form>
    </div>
  );
}

export default function AdminPage({ theme, onToggleTheme }) {
  const [authed, setAuthed] = useState(() => isLoggedIn());
  const [tab, setTab] = useState('menu');
  const { menu, cafe, actions, saveState, notify } = useMenu();
  const stats = menuStats(menu);

  if (!authed) return <LoginCard cafe={cafe} onSuccess={() => setAuthed(true)} />;

  const saveLabel = { idle: '', saving: 'در حال ذخیره…', saved: 'ذخیره شد ✅', error: 'خطا در ذخیره' }[saveState];

  return (
    <>
      <div className="admin-topbar">
        <div className="logo3d preserve" aria-hidden="true" style={{ width: 38, height: 38, fontSize: 20 }}>
          <span>{cafe.logo}</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>پنل مدیریت</div>
          <div className="muted" style={{ fontSize: 11 }}>{saveLabel}</div>
        </div>
        <div style={{ flex: 1 }} />
        <button className="icon-btn icon-btn--mode" onClick={onToggleTheme} aria-label="تغییر حالت روشن/تاریک">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <Link className="icon-btn" to="/" aria-label="دیدن منو" title="دیدن منو">
          👁️
        </Link>
      </div>

      <div className="admin-wrap">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`btn btn--sm${tab === t.id ? ' btn--primary' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'menu' && (
          <>
            <section className="panel">
              <div className="stat-grid">
                <div className="stat">
                  <b>{stats.groups}</b>
                  <span>گروه</span>
                </div>
                <div className="stat">
                  <b>{stats.items}</b>
                  <span>آیتم</span>
                </div>
                <div className="stat">
                  <b>{stats.available}</b>
                  <span>موجود</span>
                </div>
                <div className="stat">
                  <b>{stats.unavailable}</b>
                  <span>ناموجود</span>
                </div>
              </div>
            </section>

            <div className="group-list">
              {menu.groups.map((group, i) => (
                <GroupEditor
                  key={group.id}
                  group={group}
                  index={i}
                  total={menu.groups.length}
                />
              ))}
            </div>

            {menu.groups.length === 0 ? (
              <div className="panel">
                <div className="muted">گروهی وجود ندارد. یک گروه جدید بسازید.</div>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn btn--primary" onClick={() => actions.addGroup()}>
                ➕ افزودن گروه
              </button>
              <span className="muted">
                تغییرات به‌صورت خودکار ذخیره می‌شوند و همان لحظه در منوی مشتری دیده می‌شوند.
              </span>
            </div>
          </>
        )}

        {tab === 'qr' && <QRPanel />}
        {tab === 'settings' && <SettingsPanel onLogout={() => { logout(); setAuthed(false); }} />}
      </div>
    </>
  );
}
