import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const getRoleDisplay = () => {
    if (user?.role === 'Donor') return user?.name || user?.email;
    if (user?.role === 'Hospital') return user?.hospitalName || user?.email;
    if (user?.role === 'Admin') return user?.name || user?.email;
    return user?.email || 'Guest';
  };

  const getRoleBadgeClass = () => {
    if (user?.role === 'Admin') return 'badge-primary';
    if (user?.role === 'Hospital') return 'badge-info';
    if (user?.role === 'Donor') return 'badge-success';
    return 'badge';
  };

  return (
    <nav className="lc-navbar">
      <div className="lc-navbar-container">
        {/* Logo */}
        <div className="lc-navbar-logo">
          <div className="lc-navbar-logo-icon animate-blood-drip">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C12 2 4 10.5 4 15.5C4 19.6 7.6 23 12 23C16.4 23 20 19.6 20 15.5C20 10.5 12 2 12 2Z" />
            </svg>
          </div>
          <div>
            <div className="lc-navbar-logo-text">LifeChain</div>
            {user?.role && (
              <div className="lc-navbar-logo-sub">
                {user.role === 'Donor' && 'Donor Portal'}
                {user.role === 'Hospital' && 'Hospital Management'}
                {user.role === 'Admin' && 'Admin Control Panel'}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="lc-navbar-right">
          {user?.role === 'Hospital' && !user?.isVerified && (
            <span className="badge-warning">
              ⏳ Pending Verification
            </span>
          )}

          {user && (
            <>
              <div className="lc-navbar-user">
                <div className="lc-navbar-user-name">{getRoleDisplay()}</div>
                <span className={`badge ${getRoleBadgeClass()}`}>
                  {user.role}
                </span>
              </div>
              <div className="lc-navbar-divider" />
            </>
          )}

          <button onClick={handleLogout} className="lc-navbar-logout">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
