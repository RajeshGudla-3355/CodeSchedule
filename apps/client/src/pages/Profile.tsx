import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { updateAvatar, updateProfile } from '../services/api';

async function fileToResizedDataUrl(file: File, max = 320): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ''));
    r.onerror = () => reject(new Error('Could not read file'));
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Invalid image'));
    i.src = dataUrl;
  });

  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(img, 0, 0, w, h);

  const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
  return canvas.toDataURL(isJpeg ? 'image/jpeg' : 'image/png', 0.88);
}

export default function Profile() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const profileDirty =
    !!user && (name.trim() !== user.name || email.toLowerCase().trim() !== user.email);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      const updated = await updateProfile(name, email);
      setUser(updated);
      setProfileMsg('Saved.');
      setTimeout(() => setProfileMsg(null), 2500);
    } catch (err: any) {
      setProfileError(err?.response?.data?.error || 'Could not update profile');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Pick an image file');
      return;
    }
    setAvatarError(null);
    setAvatarMsg(null);
    setAvatarSaving(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file, 320);
      if (dataUrl.length > 700 * 1024) {
        throw new Error('Image is too large even after resizing; pick a smaller one');
      }
      const updated = await updateAvatar(dataUrl);
      setUser(updated);
      setAvatarMsg('Avatar updated.');
      setTimeout(() => setAvatarMsg(null), 2500);
    } catch (err: any) {
      setAvatarError(err?.response?.data?.error || err?.message || 'Upload failed');
    } finally {
      setAvatarSaving(false);
    }
  }

  async function handleRemoveAvatar() {
    setAvatarError(null);
    setAvatarMsg(null);
    setAvatarSaving(true);
    try {
      const updated = await updateAvatar(null);
      setUser(updated);
      setAvatarMsg('Avatar removed.');
      setTimeout(() => setAvatarMsg(null), 2500);
    } catch (err: any) {
      setAvatarError(err?.response?.data?.error || 'Could not remove');
    } finally {
      setAvatarSaving(false);
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
              <h1>Your profile</h1>
              <p className="muted">Manage your picture, account information, and password.</p>
            </div>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">
              ← Back to dashboard
            </Link>
          </div>
        </header>

        <section className="card">
          <div className="card-head">
            <h2>Profile picture</h2>
          </div>
          <div className="avatar-row">
            <Avatar url={user?.avatar} name={user?.name || ''} size={96} />
            <div className="avatar-meta">
              <p className="muted">PNG, JPG, GIF, or WebP. We'll resize it to 320px.</p>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={avatarSaving}
                >
                  {avatarSaving ? 'Uploading...' : user?.avatar ? 'Change picture' : 'Upload picture'}
                </button>
                {user?.avatar && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleRemoveAvatar}
                    disabled={avatarSaving}
                  >
                    Remove
                  </button>
                )}
                {avatarMsg && <span className="muted">{avatarMsg}</span>}
              </div>
              {avatarError && <div className="error">{avatarError}</div>}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Account information</h2>
          </div>
          <p className="muted">
            Your email is also the inbox that receives daily topic emails.
          </p>

          <form onSubmit={handleProfileSubmit} className="form">
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

            {profileError && <div className="error">{profileError}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileSaving || !profileDirty}
              >
                {profileSaving ? 'Saving...' : 'Save changes'}
              </button>
              {profileMsg && <span className="muted">{profileMsg}</span>}
            </div>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Password</h2>
            <Link to="/profile/password" className="btn btn-primary btn-sm">
              Change password
            </Link>
          </div>
          <p className="muted">
            You'll be asked for your current password before we save a new one.
          </p>
        </section>
      </div>
      </main>
    </div>
  );
}
