import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LogoMark } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, user } = await register(name, email, password);
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <main className="page-scroll">
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-logo">
            <LogoMark size={52} />
          </div>
          <h1>Create your account</h1>
          <p className="muted">Start learning with daily emails on your schedule.</p>

          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create account'}
            </button>
          </form>

          <div className="auth-foot">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
