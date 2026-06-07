import { motion } from 'framer-motion';
import { useScrollRoot } from './scrollContext';

const STEPS = [
  {
    n: '01',
    title: 'Pick a language',
    body: 'Choose from JavaScript, Python, TypeScript, React, or CSS. Add more any time.'
  },
  {
    n: '02',
    title: 'Set your schedule',
    body: 'Pick up to three times a day when you want your daily lesson to land.'
  },
  {
    n: '03',
    title: 'Receive daily emails',
    body: 'Every email has a topic, a teacher-style explanation, and a runnable code example.'
  }
];

export default function HowItWorks3D() {
  const scrollRef = useScrollRoot();
  return (
    <section className="section3d section3d-dark">
      <motion.h2
        className="section3d-title section3d-title-light"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5, root: scrollRef ?? undefined }}
        transition={{ duration: 0.6 }}
      >
        How it works
      </motion.h2>
      <div className="steps3d">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            className="step3d"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, root: scrollRef ?? undefined }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="step3d-line" aria-hidden="true" />
            <div className="step3d-num">{s.n}</div>
            <h3 className="step3d-h">{s.title}</h3>
            <p className="step3d-p">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
