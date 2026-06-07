import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useCountUp } from './useCountUp';
import { useScrollRoot } from './scrollContext';

const STATS: { value: number; suffix?: string; label: string }[] = [
  { value: 5, label: 'Languages today' },
  { value: 60, label: 'Topics per track' },
  { value: 3, suffix: '×', label: 'Sends per day, max' },
  { value: 100, suffix: '%', label: 'Free, forever' }
];

function StatCard({ stat, run }: { stat: (typeof STATS)[number]; run: boolean }) {
  const v = useCountUp(stat.value, 1400, run);
  const scrollRef = useScrollRoot();
  return (
    <motion.div
      className="stat3d"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4, root: scrollRef ?? undefined }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="stat3d-glow" aria-hidden="true" />
      <div className="stat3d-value">
        {v}
        {stat.suffix ?? ''}
      </div>
      <div className="stat3d-label">{stat.label}</div>
    </motion.div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useScrollRoot();
  const inView = useInView(ref, { once: true, amount: 0.3, root: scrollRef ?? undefined });
  return (
    <section className="stats3d" ref={ref}>
      <div className="stats3d-grid">
        {STATS.map((s) => (
          <StatCard key={s.label} stat={s} run={inView} />
        ))}
      </div>
    </section>
  );
}
