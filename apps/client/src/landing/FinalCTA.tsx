import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useScrollRoot } from './scrollContext';

export default function FinalCTA() {
  const scrollRef = useScrollRoot();
  return (
    <section className="cta3d">
      <div className="cta3d-aurora" aria-hidden="true" />
      <motion.div
        className="cta3d-inner"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4, root: scrollRef ?? undefined }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="cta3d-h">
          Tomorrow morning, your first lesson lands.
        </h2>
        <p className="cta3d-p">No payment. No spam. Pause or stop any time.</p>
        <Link to="/register" className="btn-glow btn-glow-lg">
          <span>Start learning free</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}
