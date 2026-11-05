import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { parseTableList, toFaDigits } from '../../lib/format.js';
import { useMenu } from '../../lib/store.jsx';

const QR_OPTIONS = {
  margin: 2,
  errorCorrectionLevel: 'M',
  color: { dark: '#2C1D13', light: '#FFFFFF' },
};

function defaultUrl() {
  const { origin, pathname } = window.location;
  const base = pathname.replace(/\/admin\/?$/, '').replace(/\/+$/, '');
  return `${origin}${base}/`;
}

export default function QRPanel() {
  const { cafe } = useMenu();
  const canvasRef = useRef(null);
  const [url, setUrl] = useState(() => defaultUrl());
  const [tableInput, setTableInput] = useState('1-6');
  const [tableQrs, setTableQrs] = useState([]);
  const [error, setError] = useState('');

  const tables = useMemo(() => parseTableList(tableInput), [tableInput]);

  // QR اصلی
  useEffect(() => {
    let alive = true;
    setError('');
    if (!canvasRef.current) return undefined;
    QRCode.toCanvas(canvasRef.current, url, { ...QR_OPTIONS, width: 240 })
      .then(() => {
        if (alive) setError('');
      })
      .catch((err) => {
        if (alive) setError(String(err?.message || 'ساخت QR ناموفق بود'));
      });
    return () => {
      alive = false;
    };
  }, [url]);

  // QR میزها
  useEffect(() => {
    let alive = true;
    if (!tables.length) {
      setTableQrs([]);
      return undefined;
    }
    Promise.all(
      tables.map(async (t) => ({
        table: t,
        dataUrl: await QRCode.toDataURL(`${url}?t=${t}`, { ...QR_OPTIONS, width: 420 }),
      })),
    )
      .then((list) => {
        if (alive) setTableQrs(list);
      })
      .catch(() => {
        if (alive) setTableQrs([]);
      });
    return () => {
      alive = false;
    };
  }, [url, tables]);

  const download = (dataUrl, filename) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  };

  const downloadMain = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    download(canvas.toDataURL('image/png'), 'cafe-menu-qr.png');
  };

  return (
    <>
      <section className="panel">
        <div className="panel__title">🔗 آدرس منو</div>
        <label className="field">
          <span>آدرسی که QR به آن اشاره می‌کند</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            dir="ltr"
            style={{ textAlign: 'left' }}
          />
        </label>
        <div className="muted">
          بعد از انتشار سایت، آدرس واقعی (مثلاً <span dir="ltr">https://cafe.example.com/</span>) را
          اینجا بگذارید و دوباره QR بگیرید. با افزودن <span dir="ltr">?t=5</span> شماره‌ی میز هم در
          بالای منو نمایش داده می‌شود.
        </div>
      </section>

      <section className="panel no-print">
        <div className="panel__title">🧾 QR کد اصلی</div>
        <div className="qr-stage stage">
          <div className="qr-card tilt preserve">
            <canvas ref={canvasRef} />
            <div className="qr-card__label">
              <b>{cafe.name}</b>
              <span>برای دیدن منو اسکن کنید</span>
            </div>
          </div>
        </div>
        {error ? <div className="notice">{error}</div> : null}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button className="btn btn--primary" onClick={downloadMain}>
            ⬇️ دانلود PNG
          </button>
          <button className="btn" onClick={() => window.print()}>
            🖨️ چاپ
          </button>
        </div>
      </section>

      <section className="panel no-print">
        <div className="panel__title">🪑 QR کد میزها</div>
        <label className="field">
          <span>شماره‌ی میزها (مثلاً ۱-۶ یا ۱،۳،۷)</span>
          <input value={tableInput} onChange={(e) => setTableInput(e.target.value)} />
        </label>
        {tableQrs.length ? (
          <div className="qr-tables">
            {tableQrs.map(({ table, dataUrl }) => (
              <div className="qr-card tilt" key={table} style={{ padding: 12 }}>
                <img src={dataUrl} alt={`QR کد میز ${table}`} width={130} height={130} />
                <div className="qr-card__label" style={{ marginTop: 8 }}>
                  <b>{cafe.name}</b>
                  <span>میز {toFaDigits(table)}</span>
                </div>
                <button
                  className="btn btn--sm btn--block"
                  style={{ marginTop: 8 }}
                  onClick={() => download(dataUrl, `cafe-menu-table-${table}.png`)}
                >
                  دانلود
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="muted">شماره‌ی میزها را وارد کنید تا QR هر میز ساخته شود.</div>
        )}
      </section>
    </>
  );
}
