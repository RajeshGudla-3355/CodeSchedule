import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { updatePassword } from '../services/api';

export default function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setMsg('Password updated. Redirecting...');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not update password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <main className="page-scroll">
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="dashboard-title-row">
            <div>
              <h1>Change password</h1>
              <p className="muted">
                Pick a new password, at least 6 characters. You'll stay logged in.
              </p>
            </div>
            <Link to="/profile" className="btn btn-ghost btn-sm">
              ← Back to profile
            </Link>
          </div>
        </header>

        <section className="card">
          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span>Current password</span>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            <label className="field">
              <span>New password</span>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            <label className="field">
              <span>Confirm new password</span>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            {error && <div className="error">{error}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              >
                {saving ? 'Updating...' : 'Update password'}
              </button>
              <Link to="/profile" className="btn btn-ghost btn-sm">
                Cancel
              </Link>
              {msg && <span className="muted">{msg}</span>}
            </div>
          </form>
        </section>
      </div>
      </main>
    </div>
  );
}
