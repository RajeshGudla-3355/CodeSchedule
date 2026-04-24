import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getDeliveries,
  getLanguages,
  type AvailableLanguage,
  type DeliveryContext,
  type DeliveryLog,
  type DeliveryStatus
} from '../services/api';

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function truncate(s: string | null, n: number): string {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export default function Admin() {
  const [items, setItems] = useState<DeliveryLog[]>([]);
  const [byStatus, setByStatus] = useState({ sent: 0, skipped: 0, error: 0 });
  const [total, setTotal] = useState(0);
  const [languages, setLanguages] = useState<AvailableLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<DeliveryStatus | ''>('');
  const [language, setLanguage] = useState<string>('');
  const [context, setContext] = useState<DeliveryContext | ''>('');
  const [toFilter, setToFilter] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getDeliveries({
        status: status || undefined,
        language: language || undefined,
        context: context || undefined,
        to: toFilter.trim() || undefined,
        limit: 200
      });
      setItems(data.items);
      setTotal(data.total);
      setByStatus(data.byStatus);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getLanguages().then(setLanguages).catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, language, context]);

  function onToKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') load();
  }

  return (
    <div className="page">
      <Navbar />
      <main className="page-scroll">
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="dashboard-title-row">
            <div>
              <h1>Delivery log</h1>
              <p className="muted">
                Every email this app has attempted to send — success, skip, or failure.
              </p>
            </div>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">
              ← Back to dashboard
            </Link>
          </div>
        </header>

        <section className="card">
          <div className="stats-row">
            <div className="stat-pill stat-pill-total">
              <span className="stat-pill-label">Total (filtered)</span>
              <span className="stat-pill-value">{total}</span>
            </div>
            <div className="stat-pill stat-pill-sent">
              <span className="stat-pill-label">Sent</span>
              <span className="stat-pill-value">{byStatus.sent}</span>
            </div>
            <div className="stat-pill stat-pill-skip">
              <span className="stat-pill-label">Skipped</span>
              <span className="stat-pill-value">{byStatus.skipped}</span>
            </div>
            <div className="stat-pill stat-pill-error">
              <span className="stat-pill-label">Error</span>
              <span className="stat-pill-value">{byStatus.error}</span>
            </div>
          </div>

          <div className="filter-row">
            <label className="filter-field">
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as DeliveryStatus | '')}>
                <option value="">All</option>
                <option value="sent">Sent</option>
                <option value="skipped">Skipped</option>
                <option value="error">Error</option>
              </select>
            </label>
            <label className="filter-field">
              <span>Language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="">All</option>
                {languages.map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              <span>Source</span>
              <select value={context} onChange={(e) => setContext(e.target.value as DeliveryContext | '')}>
                <option value="">All</option>
                <option value="scheduler">Scheduler</option>
                <option value="completion">Completion</option>
                <option value="cli">CLI test</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
            <label className="filter-field filter-field-grow">
              <span>Recipient contains</span>
              <input
                type="text"
                placeholder="e.g. user@example.com"
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                onKeyDown={onToKeyDown}
              />
            </label>
            <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="center-block">
              <div className="spinner" />
            </div>
          ) : items.length === 0 ? (
            <p className="muted">
              No deliveries recorded{status || language || context || toFilter ? ' for this filter' : ' yet'}.
            </p>
          ) : (
            <div className="table-scroll">
              <table className="delivery-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Status</th>
                    <th>To</th>
                    <th>Subject</th>
                    <th>Language / Topic</th>
                    <th>Source</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((d) => (
                    <tr key={d._id} className={`row-${d.status}`}>
                      <td className="mono">{formatTime(d.sentAt)}</td>
                      <td>
                        <span className={`badge badge-${d.status}`}>{d.status}</span>
                      </td>
                      <td className="mono">{d.to}</td>
                      <td>{truncate(d.subject, 60)}</td>
                      <td>
                        {d.language ? (
                          <>
                            <strong>{d.language}</strong>
                            {d.topicIndex !== null && <> · #{d.topicIndex + 1}</>}
                            {d.topicTitle && <div className="muted small">{truncate(d.topicTitle, 40)}</div>}
                          </>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className="muted small">{d.context}</span>
                      </td>
                      <td>
                        {d.status === 'error' ? (
                          <span className="mono small error-text" title={d.errorMessage ?? ''}>
                            {truncate(d.errorMessage, 60)}
                          </span>
                        ) : d.status === 'sent' ? (
                          <span className="muted small">{truncate(d.smtpResponse, 40)}</span>
                        ) : (
                          <span className="muted small">{truncate(d.errorMessage, 40)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      </main>
    </div>
  );
}
