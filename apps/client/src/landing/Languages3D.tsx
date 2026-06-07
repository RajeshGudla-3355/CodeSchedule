import { motion } from 'framer-motion';
import TechIcon, { type TechKey } from '../components/TechIcon';
import { useTilt } from './useTilt';
import { useScrollRoot } from './scrollContext';

const LANGUAGES: { key: TechKey; name: string; topicCount: number; tint: string }[] = [
  { key: 'javascript', name: 'JavaScript', topicCount: 60, tint: '#f7df1e' },
  { key: 'python', name: 'Python', topicCount: 60, tint: '#3776ab' },
  { key: 'typescript', name: 'TypeScript', topicCount: 60, tint: '#3178c6' },
  { key: 'react', name: 'React', topicCount: 60, tint: '#61dafb' },
  { key: 'css', name: 'CSS', topicCount: 60, tint: '#264de4' }
];

function LangCard({ lang, index }: { lang: (typeof LANGUAGES)[number]; index: number }) {
  const tilt = useTilt(10);
  const scrollRef = useScrollRoot();
  return (
    <motion.div
      className="lang3d-wrap"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3, root: scrollRef ?? undefined }}
      transition={{ duration: 0.6, delay: index * 0.07 }}
    >
      <div
        className="lang3d"
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        style={{ ['--tint' as never]: lang.tint }}
      >
        <div className="lang3d-glow" aria-hidden="true" />
        <div className="lang3d-icon">
          <TechIcon tech={lang.key} size={72} />
        </div>
        <div className="lang3d-name">{lang.name}</div>
        <div className="lang3d-count">{lang.topicCount} topics</div>
      </div>
    </motion.div>
  );
}

export default function Languages3D() {
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
        Pick your stack
      </motion.h2>
      <motion.p
        className="section3d-sub"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5, root: scrollRef ?? undefined }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        Five tracks today, more on the way. Each is 60 sequenced topics
        from beginner to advanced.
      </motion.p>
      <div className="lang3d-grid">
        {LANGUAGES.map((l, i) => (
          <LangCard key={l.key} lang={l} index={i} />
        ))}
      </div>
    </section>
  );
}
