import { Link } from 'react-router-dom';
import { LogoMark } from '../components/Logo';

const PRODUCT = [
  { label: 'Pick a language', to: '/register' },
  { label: 'How it works', to: '/' },
  { label: 'Sample lesson', to: '/' }
];

const RESOURCES = [
  { label: 'GitHub', href: 'https://github.com/' },
  { label: 'Open source', href: 'https://github.com/' },
  { label: 'Contribute a track', href: 'https://github.com/' }
];

const LEGAL = [
  { label: 'Privacy', to: '/' },
  { label: 'Terms', to: '/' },
  { label: 'Unsubscribe', to: '/' }
];

export default function Footer3D() {
  return (
    <footer className="footer3d">
      <div className="footer3d-rail" aria-hidden="true" />
      <div className="footer3d-inner">
        <div className="footer3d-brand">
          <div className="footer3d-mark">
            <LogoMark size={44} />
          </div>
          <div className="footer3d-brand-text">
            <div className="footer3d-name">CodeSchedule</div>
            <p className="footer3d-tagline">
              One programming topic in your inbox, every day, on your schedule.
            </p>
          </div>
        </div>

        <div className="footer3d-cols">
          <div className="footer3d-col">
            <div className="footer3d-col-h">Product</div>
            <ul>
              {PRODUCT.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer3d-col">
            <div className="footer3d-col-h">Resources</div>
            <ul>
              {RESOURCES.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer3d-col">
            <div className="footer3d-col-h">Legal</div>
            <ul>
              {LEGAL.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="footer3d-bottom">
        <span>© {new Date().getFullYear()} CodeSchedule. Free and open source.</span>
        <span className="footer3d-bottom-meta">
          <span>Made for developers who keep learning.</span>
        </span>
      </div>
    </footer>
  );
}
