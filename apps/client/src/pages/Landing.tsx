import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LogoMark } from '../components/Logo';
import TechIcon, { type TechKey } from '../components/TechIcon';
import { useReveal } from '../hooks/useReveal';

const LANGUAGES: { key: TechKey; name: string; topicCount: number }[] = [
  { key: 'javascript', name: 'JavaScript', topicCount: 60 },
  { key: 'python', name: 'Python', topicCount: 60 },
  { key: 'typescript', name: 'TypeScript', topicCount: 60 },
  { key: 'react', name: 'React', topicCount: 60 },
  { key: 'css', name: 'CSS', topicCount: 60 }
];

export default function Landing() {
  useReveal('.page-scroll');

  return (
    <div className="page">
      <Navbar />
      <main className="page-scroll">

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-mark reveal reveal-pop">
            <LogoMark size={88} />
          </div>
          <div className="hero-tagline reveal reveal-up" style={{ transitionDelay: '80ms' }}>
            LEARN · DAILY · GROW
          </div>
          <h1 className="reveal reveal-up" style={{ transitionDelay: '160ms' }}>
            Learn any technology, one topic at a time
          </h1>
          <p className="hero-sub reveal reveal-up" style={{ transitionDelay: '260ms' }}>
            Daily bite-sized lessons delivered to your inbox on your schedule.
          </p>
          <div className="hero-cta reveal reveal-up" style={{ transitionDelay: '360ms' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title reveal reveal-up">Available languages</h2>
        <p className="section-sub reveal reveal-up" style={{ transitionDelay: '80ms' }}>
          Pick one or more. Each course is 60 carefully sequenced topics.
        </p>

        <div className="lang-grid">
          {LANGUAGES.map((lang, i) => (
            <div
              key={lang.key}
              className="lang-card reveal reveal-up"
              style={{ transitionDelay: `${120 + i * 80}ms` }}
            >
              <div className="lang-icon-wrap">
                <TechIcon tech={lang.key} size={80} />
              </div>
              <div className="lang-name">{lang.name}</div>
              <div className="lang-count">{lang.topicCount} topics</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <h2 className="section-title reveal reveal-up">How it works</h2>

        <div className="steps">
          <div className="step reveal reveal-up" style={{ transitionDelay: '0ms' }}>
            <div className="step-number">1</div>
            <h3>Pick a language</h3>
            <p>Choose from JavaScript, Python, TypeScript, React, or CSS. Add more any time.</p>
          </div>

          <div className="step reveal reveal-up" style={{ transitionDelay: '140ms' }}>
            <div className="step-number">2</div>
            <h3>Set your schedule</h3>
            <p>Pick up to three times a day when you want your daily lesson to land.</p>
          </div>

          <div className="step reveal reveal-up" style={{ transitionDelay: '280ms' }}>
            <div className="step-number">3</div>
            <h3>Receive daily emails</h3>
            <p>Every email has a topic, a teacher-style explanation, and a runnable code example.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="cta-box reveal reveal-up">
          <h2>Ready to build a learning habit?</h2>
          <p>Sign up, pick a topic, and tomorrow morning the first lesson is in your inbox.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started
          </Link>
        </div>
      </section>

      <footer className="footer">
        <span>CodeSchedule · learn by email</span>
      </footer>
      </main>
    </div>
  );
}
