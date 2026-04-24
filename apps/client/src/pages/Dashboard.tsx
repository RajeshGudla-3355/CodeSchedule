import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AddLanguageModal from '../components/AddLanguageModal';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import {
  getLanguages,
  getProgress,
  updateSchedule,
  updateSubscription,
  type AvailableLanguage,
  type ProgressEntry,
  type Schedule
} from '../services/api';

function timeInputValue(t: string) {
  return /^\d{2}:\d{2}$/.test(t) ? t : '08:00';
}

function formatSentAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} hr ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD} day${diffD === 1 ? '' : 's'} ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Dashboard() {
  const { user, setUser } = useAuth();

  const [languages, setLanguages] = useState<AvailableLanguage[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [schedules, setSchedules] = useState<Schedule[]>(user?.schedules ?? []);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [langs, prog] = await Promise.all([getLanguages(), getProgress()]);
        if (cancelled) return;
        setLanguages(langs);
        setProgress(prog.progress);
        setTotalCompleted(prog.totalCompleted);
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.error || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshProgress() {
    const prog = await getProgress();
    setProgress(prog.progress);
    setTotalCompleted(prog.totalCompleted);
  }

  async function handleAddLanguage(language: string) {
    const updated = await updateSubscription(language, 'add');
    setUser(updated);
    await refreshProgress();
  }

  async function handleRemove(language: string) {
    const updated = await updateSubscription(language, 'remove');
    setUser(updated);
    await refreshProgress();
  }

  function toggleHistory(lang: string) {
    setExpanded((prev) => ({ ...prev, [lang]: !prev[lang] }));
  }

  function addScheduleSlot() {
    if (schedules.length >= 3) return;
    setSchedules([...schedules, { time: '08:00', timezone: 'Asia/Kolkata' }]);
  }

  function removeScheduleSlot(idx: number) {
    setSchedules(schedules.filter((_, i) => i !== idx));
  }

  function updateScheduleSlot(idx: number, time: string) {
    setSchedules(schedules.map((s, i) => (i === idx ? { ...s, time } : s)));
  }

  async function saveSchedules() {
    setScheduleMsg(null);
    setScheduleSaving(true);
    try {
      const updated = await updateSchedule(schedules);
      setUser(updated);
      setScheduleMsg('Saved.');
      setTimeout(() => setScheduleMsg(null), 2500);
    } catch (err: any) {
      setScheduleMsg(err?.response?.data?.error || 'Could not save');
    } finally {
      setScheduleSaving(false);
    }
  }

  const subscribed = progress.map((p) => p.language);

  return (
    <div className="page">
      <Navbar />
      <main className="page-scroll">
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="dashboard-title-row">
            <div className="welcome-block">
              <Avatar url={user?.avatar} name={user?.name || ''} size={64} />
              <div>
                <h1>Welcome back, {user?.name}</h1>
                <p className="muted">Here's your learning progress and schedule.</p>
              </div>
            </div>
            <div className="stat-chip" title="Total topics delivered across all languages">
              <div className="stat-chip-num">{totalCompleted}</div>
              <div className="stat-chip-label">topics completed</div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="center-block">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <section className="card">
              <div className="card-head">
                <h2>Your subscriptions</h2>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                  + Add language
                </button>
              </div>

              {progress.length === 0 ? (
                <p className="muted">
                  No subscriptions yet. Add a language to start receiving daily emails.
                </p>
              ) : (
                <div className="subs-list">
                  {progress.map((p) => {
                    const isExpanded = !!expanded[p.language];
                    const hasHistory = p.completedTopics.length > 0;
                    return (
                      <div key={p.language} className="sub-row">
                        <div className="sub-top">
                          <div>
                            <div className="sub-name">{p.name}</div>
                            <div className="sub-count muted">
                              {p.completedCount} completed · {p.currentTopicIndex} / {p.totalTopics} topics
                              {!p.isActive && p.completedAt ? ' · completed' : ''}
                              {!p.isActive && !p.completedAt ? ' · paused' : ''}
                            </div>
                          </div>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleRemove(p.language)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="progress">
                          <div className="progress-bar" style={{ width: `${p.percentage}%` }} />
                        </div>

                        <button
                          className="history-toggle"
                          onClick={() => toggleHistory(p.language)}
                          disabled={!hasHistory}
                        >
                          {hasHistory
                            ? isExpanded
                              ? `Hide history (${p.completedCount})`
                              : `Show history (${p.completedCount})`
                            : 'No emails delivered yet'}
                        </button>

                        {isExpanded && hasHistory && (
                          <ol className="history-list">
                            {p.completedTopics.map((t) => (
                              <li key={t.topicIndex} className="history-item">
                                <span className="history-idx">#{t.topicIndex + 1}</span>
                                <span className="history-title">{t.topicTitle}</span>
                                <span className="history-when muted">{formatSentAt(t.sentAt)}</span>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="card">
              <div className="card-head">
                <h2>Your schedule</h2>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={addScheduleSlot}
                  disabled={schedules.length >= 3}
                >
                  + Add time
                </button>
              </div>

              <p className="muted">
                Up to 3 times per day, in IST (Asia/Kolkata). Emails are sent at these times.
              </p>

              <div className="schedule-list">
                {schedules.length === 0 && (
                  <div className="muted">No times yet. Add one to receive daily emails.</div>
                )}
                {schedules.map((s, idx) => (
                  <div key={idx} className="schedule-row">
                    <input
                      type="time"
                      value={timeInputValue(s.time)}
                      onChange={(e) => updateScheduleSlot(idx, e.target.value)}
                    />
                    <span className="muted">{s.timezone}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeScheduleSlot(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="schedule-save">
                <button
                  className="btn btn-primary"
                  onClick={saveSchedules}
                  disabled={scheduleSaving}
                >
                  {scheduleSaving ? 'Saving...' : 'Save schedule'}
                </button>
                {scheduleMsg && <span className="muted">{scheduleMsg}</span>}
              </div>
            </section>
          </>
        )}
      </div>
      </main>

      {showAdd && (
        <AddLanguageModal
          languages={languages}
          currentSubscriptions={subscribed}
          onClose={() => setShowAdd(false)}
          onAdd={handleAddLanguage}
        />
      )}
    </div>
  );
}
