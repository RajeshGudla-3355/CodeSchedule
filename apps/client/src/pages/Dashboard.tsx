import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Navbar from '../components/Navbar';
import AddLanguageModal from '../components/AddLanguageModal';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useTilt } from '../landing/useTilt';
import { useCountUp } from '../landing/useCountUp';
import {
  getLanguages,
  getProgress,
  updateSchedule,
  updateSubscription,
  type AvailableLanguage,
  type ProgressEntry,
  type Schedule
} from '../services/api';

const Scene3D = lazy(() => import('../landing/Scene3D'));

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

function SubCard({
  p,
  expanded,
  onToggle,
  onRemove
}: {
  p: ProgressEntry;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const tilt = useTilt(6);
  const hasHistory = p.completedTopics.length > 0;
  return (
    <motion.div
      className="dash3d-sub-wrap"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="dash3d-sub"
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
      >
        <div className="dash3d-sub-glow" aria-hidden="true" />
        <div className="dash3d-sub-head">
          <div>
            <div className="dash3d-sub-name">{p.name}</div>
            <div className="dash3d-sub-meta">
              {p.completedCount} completed · {p.currentTopicIndex} / {p.totalTopics} topics
              {!p.isActive && p.completedAt ? ' · completed' : ''}
              {!p.isActive && !p.completedAt ? ' · paused' : ''}
            </div>
          </div>
          <button className="dash3d-btn-ghost" onClick={onRemove}>
            Remove
          </button>
        </div>
        <div className="dash3d-progress">
          <div
            className="dash3d-progress-bar"
            style={{ width: `${p.percentage}%` }}
          />
        </div>
        <button
          className="dash3d-history-toggle"
          onClick={onToggle}
          disabled={!hasHistory}
        >
          {hasHistory
            ? expanded
              ? `Hide history (${p.completedCount})`
              : `Show history (${p.completedCount})`
            : 'No emails delivered yet'}
        </button>
        {expanded && hasHistory && (
          <ol className="dash3d-history">
            {p.completedTopics.map((t) => (
              <li key={t.topicIndex} className="dash3d-history-item">
                <span className="dash3d-history-idx">#{t.topicIndex + 1}</span>
                <span className="dash3d-history-title">{t.topicTitle}</span>
                <span className="dash3d-history-when">{formatSentAt(t.sentAt)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const reduced = useReducedMotion();
  const [sceneMounted, setSceneMounted] = useState(false);

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

  const animatedTotal = useCountUp(totalCompleted, 1400, !loading);

  useEffect(() => {
    const id = setTimeout(() => setSceneMounted(true), 120);
    return () => clearTimeout(id);
  }, []);

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
    <div className="page dashboard3d-page">
      <Navbar />
      <main className="page-scroll dashboard3d-scroll">
        <section className="dash3d-hero">
          <div className="dash3d-scene" aria-hidden="true">
            {!reduced && sceneMounted && (
              <Suspense fallback={<div className="dash3d-scene-fallback" />}>
                <Scene3D />
              </Suspense>
            )}
            {(reduced || !sceneMounted) && <div className="dash3d-scene-fallback" />}
          </div>
          <motion.div
            className="dash3d-hero-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="dash3d-welcome">
              <div className="dash3d-avatar-glow">
                <Avatar url={user?.avatar} name={user?.name || ''} size={64} />
              </div>
              <div>
                <h1 className="dash3d-h1">Welcome back, {user?.name}</h1>
                <p className="dash3d-sub">
                  Here's your learning progress and schedule.
                </p>
              </div>
            </div>
            <div className="dash3d-stat-chip">
              <div className="dash3d-stat-chip-num">{animatedTotal}</div>
              <div className="dash3d-stat-chip-label">topics completed</div>
            </div>
          </motion.div>
        </section>

        <div className="dash3d-body">
          {loading ? (
            <div className="dash3d-loading">
              <div className="spinner" />
            </div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <>
              <motion.section
                className="dash3d-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="dash3d-section-head">
                  <h2 className="dash3d-h2">Your subscriptions</h2>
                  <button
                    className="dash3d-btn-primary"
                    onClick={() => setShowAdd(true)}
                  >
                    + Add language
                  </button>
                </div>

                {progress.length === 0 ? (
                  <div className="dash3d-empty">
                    No subscriptions yet. Add a language to start receiving daily
                    emails.
                  </div>
                ) : (
                  <div className="dash3d-subs-grid">
                    {progress.map((p) => (
                      <SubCard
                        key={p.language}
                        p={p}
                        expanded={!!expanded[p.language]}
                        onToggle={() => toggleHistory(p.language)}
                        onRemove={() => handleRemove(p.language)}
                      />
                    ))}
                  </div>
                )}
              </motion.section>

              <motion.section
                className="dash3d-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="dash3d-card">
                  <div className="dash3d-section-head">
                    <h2 className="dash3d-h2">Your schedule</h2>
                    <button
                      className="dash3d-btn-ghost"
                      onClick={addScheduleSlot}
                      disabled={schedules.length >= 3}
                    >
                      + Add time
                    </button>
                  </div>

                  <p className="dash3d-muted">
                    Up to 3 times per day, in IST (Asia/Kolkata). Emails are sent at
                    these times.
                  </p>

                  <div className="dash3d-schedule">
                    {schedules.length === 0 && (
                      <div className="dash3d-muted">
                        No times yet. Add one to receive daily emails.
                      </div>
                    )}
                    {schedules.map((s, idx) => (
                      <div key={idx} className="dash3d-schedule-row">
                        <input
                          className="dash3d-time"
                          type="time"
                          value={timeInputValue(s.time)}
                          onChange={(e) => updateScheduleSlot(idx, e.target.value)}
                        />
                        <span className="dash3d-muted">{s.timezone}</span>
                        <button
                          className="dash3d-btn-ghost"
                          onClick={() => removeScheduleSlot(idx)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="dash3d-save">
                    <button
                      className="dash3d-btn-primary"
                      onClick={saveSchedules}
                      disabled={scheduleSaving}
                    >
                      {scheduleSaving ? 'Saving...' : 'Save schedule'}
                    </button>
                    {scheduleMsg && (
                      <span className="dash3d-muted">{scheduleMsg}</span>
                    )}
                  </div>
                </div>
              </motion.section>
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
