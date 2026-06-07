import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Hero is now pure content. The animated 3D scene lives one layer up
 * in Scene3DBackdrop (page-fixed). Hero just gets a soft scrim behind
 * the text via .hero3d::before in CSS.
 */
export default function Hero3D() {
  return (
    <section className="hero3d">
      <div className="hero3d-overlay">
        <motion.div
          className="hero3d-pill"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="hero3d-dot" />
          Learn · Daily · Grow
        </motion.div>

        <motion.h1
          className="hero3d-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          Learn any technology,
          <br />
          <span className="hero3d-title-grad">one topic at a time.</span>
        </motion.h1>

        <motion.p
          className="hero3d-sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          Daily bite-sized lessons delivered to your inbox on your schedule —
          JavaScript, Python, TypeScript, React, CSS, and more.
        </motion.p>

        <motion.div
          className="hero3d-cta"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          <Link to="/register" className="btn-glow">
            <span>Start learning free</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link to="/login" className="btn-ghost-glass">
            I have an account
          </Link>
        </motion.div>

        <motion.div
          className="hero3d-meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <span>Open source</span>
          <span className="hero3d-meta-dot" />
          <span>No paywall</span>
          <span className="hero3d-meta-dot" />
          <span>Cancel any time</span>
        </motion.div>
      </div>
    </section>
  );
}
