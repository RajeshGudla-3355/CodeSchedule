import { Link, useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to={user ? '/dashboard' : '/'} className="brand" aria-label="CodeSchedule home">
        <Logo iconSize={44} />
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/admin" className="nav-link" title="Delivery log">
              Deliveries
            </Link>
            <Link to="/profile" className="nav-user" title="Your profile">
              <Avatar url={user.avatar} name={user.name} size={30} />
              <span>{user.name}</span>
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
