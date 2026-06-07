import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LogoMark } from '../components/Logo';
import Scene3DBackdrop from '../landing/Scene3DBackdrop';
import { LandingScrollContext } from '../landing/scrollContext';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, user } = await loginApi(email, password);
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page landing3d-page">
      <Navbar />
      <LandingScrollContext.Provider value={scrollRef}>
        <main ref={scrollRef} className="page-scroll landing3d-scroll">
          <Scene3DBackdrop />
          <div className="landing3d-content auth-wrap">
            <div className="auth-card auth-card-dark">
              <div className="auth-logo">
                <LogoMark size={52} />
              </div>
              <h1>Welcome back</h1>
              <p className="muted">Log in to manage your subscriptions and schedule.</p>

              <form onSubmit={handleSubmit} className="form">
                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </label>

                <label className="field">
                  <span>Password</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>

                {error && <div className="error">{error}</div>}

                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? 'Signing in...' : 'Log in'}
                </button>
              </form>

              <div className="auth-foot">
                New here? <Link to="/register">Create an account</Link>
              </div>
            </div>
          </div>
        </main>
      </LandingScrollContext.Provider>
    </div>
  );
}
