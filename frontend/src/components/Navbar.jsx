import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-title">
        <span className="navbar-emoji">📋</span>
        <div>
          <h1>Campus Grievance System</h1>
          {user && (
            <span className="navbar-subtitle">
              {user.name} · {user.role}
            </span>
          )}
        </div>
      </div>
      {user && (
        <button className="navbar-logout" onClick={logout}>
          Logout
        </button>
      )}
    </header>
  );
}
