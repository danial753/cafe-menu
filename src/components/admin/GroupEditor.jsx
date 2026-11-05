import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ItemEditor from './ItemEditor.jsx';
import { useMenu } from '../../lib/store.jsx';
import { formatToman } from '../../lib/format.js';

/** کارت ویرایش یک گروه + فهرست آیتم‌های آن */
export default function GroupEditor({ group, index, total }) {
  const { actions } = useMenu();
  const [editing, setEditing] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: group.title,
    subtitle: group.subtitle,
    icon: group.icon,
    accent: group.accent,
  });

  const itemBeingEdited = group.items.find((i) => i.id === editItemId);

  const saveGroup = () => {
    actions.updateGroup(group.id, {
      title: form.title.trim() || group.title,
      subtitle: form.subtitle.trim(),
      icon: form.icon.trim() || '🍽️',
      accent: form.accent,
    });
    setEditing(false);
  };

  const confirmDeleteGroup = () => {
    const ok = window.confirm(
      `گروه «${group.title}» با ${group.items.length} آیتم حذف شود؟ این کار برگشت‌پذیر نیست.`,
    );
    if (ok) actions.deleteGroup(group.id);
  };

  const confirmDeleteItem = (item) => {
    if (window.confirm(`آیتم «${item.name}» حذف شود؟`)) actions.deleteItem(group.id, item.id);
  };

  return (
    <section
      className="group-card"
      style={{ borderInlineStart: `4px solid ${group.accent || '#8B4B2A'}` }}
    >
      <div className="group-card__head">
        <div className="item-row__thumb" aria-hidden="true">
          {group.icon || '🍽️'}
        </div>
        <div>
          <div className="group-card__title">{group.title}</div>
          <div className="item-row__meta">{group.items.length} آیتم</div>
        </div>

        <div className="group-card__tools">
          <button
            className="mini"
            title="انتقال به بالا"
            disabled={index === 0}
            onClick={() => actions.moveGroup(group.id, 'up')}
          >
            ▲
          </button>
          <button
            className="mini"
            title="انتقال به پایین"
            disabled={index === total - 1}
            onClick={() => actions.moveGroup(group.id, 'down')}
          >
            ▼
          </button>
          <button className="mini" title="ویرایش گروه" onClick={() => setEditing((v) => !v)}>
            ✏️
          </button>
          <button className="mini" title="حذف گروه" onClick={confirmDeleteGroup}>
            🗑️
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {editing && (
          <motion.div
            key="gedit"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 14 }}>
              <div className="row">
                <label className="field">
                  <span>عنوان گروه</span>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>ایموجی</span>
                  <input
                    value={form.icon}
                    maxLength={4}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span>توضیح زیر عنوان</span>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                />
              </label>
              <label className="field" style={{ maxWidth: 160 }}>
                <span>رنگ تأکیدی</span>
                <input
                  type="color"
                  value={group.accent || '#8B4B2A'}
                  onChange={(e) => {
                    setForm({ ...form, accent: e.target.value });
                    actions.updateGroup(group.id, { accent: e.target.value });
                  }}
                  style={{ height: 42, padding: 4 }}
                />
              </label>
              <button className="btn btn--primary btn--sm" onClick={saveGroup}>
                ذخیره‌ی گروه
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 10 }}>
        {group.items.map((item, i) => (
          <div key={item.id} className="item-row">
            <div className="item-row__thumb" aria-hidden="true">
              {item.image ? <img src={item.image} alt="" /> : item.emoji || '🍽️'}
            </div>
            <div className="item-row__info">
              <div className="item-row__name">{item.name || '(بدون نام)'}</div>
              <div className="item-row__meta">
                {formatToman(item.price)} تومان ·{' '}
                <span className={item.available ? 'pill pill--ok' : 'pill pill--out'}>
                  {item.available ? 'موجود' : 'ناموجود'}
                </span>
              </div>
            </div>
            <div className="item-row__tools">
              <button
                className="mini"
                title="بالا"
                disabled={i === 0}
                onClick={() => actions.moveItem(group.id, item.id, 'up')}
              >
                ▲
              </button>
              <button
                className="mini"
                title="پایین"
                disabled={i === group.items.length - 1}
                onClick={() => actions.moveItem(group.id, item.id, 'down')}
              >
                ▼
              </button>
              <button
                className="mini"
                title={item.available ? 'ناموجود کردن' : 'موجود کردن'}
                onClick={() =>
                  actions.updateItem(group.id, item.id, { available: !item.available })
                }
              >
                {item.available ? '✅' : '⛔'}
              </button>
              <button
                className="mini"
                title="ویرایش"
                onClick={() => {
                  setEditItemId(editItemId === item.id ? null : item.id);
                  setAdding(false);
                }}
              >
                ✏️
              </button>
              <button className="mini" title="حذف" onClick={() => confirmDeleteItem(item)}>
                🗑️
              </button>
            </div>

            {editItemId === item.id && itemBeingEdited ? (
              <div className="item-row__editor">
                <ItemEditor
                  item={itemBeingEdited}
                  onSave={(patch) => {
                    actions.updateItem(group.id, item.id, patch);
                    setEditItemId(null);
                  }}
                  onCancel={() => setEditItemId(null)}
                />
              </div>
            ) : null}
          </div>
        ))}

        {group.items.length === 0 ? (
          <div className="muted" style={{ padding: '10px 0' }}>
            این گروه هنوز آیتمی ندارد.
          </div>
        ) : null}

        {adding ? (
          <ItemEditor
            item={{ available: true, emoji: '🍽️' }}
            isNew
            onSave={(patch) => {
              actions.addItem(group.id, patch);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        ) : null}

        <button
          className="btn btn--sm"
          style={{ marginTop: 10 }}
          onClick={() => {
            setAdding((v) => !v);
            setEditItemId(null);
          }}
        >
          ➕ افزودن آیتم به این گروه
        </button>
      </div>
    </section>
  );
}
