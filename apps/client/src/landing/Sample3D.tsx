import { motion } from 'framer-motion';
import { useScrollRoot } from './scrollContext';

export default function Sample3D() {
  const scrollRef = useScrollRoot();
  return (
    <section className="section3d">
      <motion.h2
        className="section3d-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5, root: scrollRef ?? undefined }}
        transition={{ duration: 0.6 }}
      >
        What lands in your inbox
      </motion.h2>
      <motion.p
        className="section3d-sub"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5, root: scrollRef ?? undefined }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        Short. Focused. One topic per email. Reads in under five minutes.
      </motion.p>

      <motion.div
        className="email-stage"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3, root: scrollRef ?? undefined }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="email-card">
          <div className="email-head">
            <div className="email-dots">
              <span /><span /><span />
            </div>
            <div className="email-from">
              <strong>CodeSchedule</strong>
              <span>codeschedule@inbox</span>
            </div>
            <div className="email-day">Day 14 of JavaScript</div>
          </div>
          <div className="email-body">
            <div className="email-eyebrow">Topic 14 / 60</div>
            <h3 className="email-h">Closures, in one minute</h3>
            <p>
              A closure is a function bundled with the variables it captured
              from its surrounding scope. Once captured, those variables stay
              alive as long as the function does — even after the outer
              function has returned.
            </p>
            <pre className="email-code">
{`function counter() {
  let n = 0;
  return () => ++n;
}

const next = counter();
next(); // 1
next(); // 2`}
            </pre>
            <p className="email-tip">
              <strong>Why it matters:</strong> closures are how React hooks remember
              state across renders.
            </p>
          </div>
          <div className="email-foot">
            <span>Tomorrow: <strong>Closures, the pitfalls</strong></span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
