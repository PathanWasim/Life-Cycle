import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaTint, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaSearch } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    const result = await login(formData.email, formData.password);
    if (result.success) {
      const role = result.user.role;
      if (role === 'Donor') navigate('/donor/dashboard');
      else if (role === 'Hospital') navigate('/hospital/dashboard');
      else if (role === 'Admin') navigate('/admin/panel');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-animated" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Animated Background */}
      <div className="particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
      <div className="gradient-mesh" />

      {/* Left Panel - Features */}
      <div style={{
        flex: '0 0 50%',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg) 100%)',
        borderRight: '1px solid var(--border)',
        overflow: 'hidden'
      }} className="lg:flex">

        <div className="animate-slide-up" style={{ zIndex: 1, maxWidth: '520px', margin: '0 auto' }}>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div className="blood-badge blood-badge-lg animate-float">
              <FaTint />
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)'
            }}>LifeChain</h1>
          </div>

          <h2 style={{
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)'
          }}>
            Transparent <br />
            <span style={{ color: 'var(--primary)' }}>Life-Saving</span> <br />
            Network
          </h2>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '3rem',
            maxWidth: '440px'
          }}>
            A blockchain-powered blood supply management system. Ensuring traceability, security, and real-time emergency responses.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="stat-card stat-card-red animate-slide-up delay-100" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                10K+
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Lives Saved
              </div>
            </div>

            <div className="stat-card stat-card-blue animate-slide-up delay-200" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>
                250+
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hospitals Linked
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="animate-scale-in" style={{
          width: '100%',
          maxWidth: '420px',
        }}>

          {/* Mobile Header */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="blood-badge blood-badge-lg animate-pulse" style={{ margin: '0 auto 1rem' }}>
              <FaTint />
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)'
            }}>
              LifeChain
            </h1>
          </div>

          <div className="card-3d" style={{ padding: '2.5rem' }}>

            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-display)'
              }}>
                Welcome back
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Sign in to your account to continue
              </p>
            </div>

            {error && (
              <div className="animate-slide-down" style={{
                padding: '1rem',
                background: 'var(--error-bg)',
                border: '1px solid var(--error)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--error)'
              }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <FaEnvelope size={16} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <FaLock size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary)',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color var(--transition-base)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div style={{
              margin: '1.5rem 0',
              height: '1px',
              background: 'var(--border)',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'var(--surface)',
                padding: '0 1rem',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                or
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: 'var(--primary)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'color var(--transition-base)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-dark)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--primary)'}
                >
                  Create account →
                </Link>
              </p>

              <button
                onClick={() => navigate('/blood-search')}
                className="btn btn-ghost"
                style={{ alignSelf: 'center', gap: '0.5rem' }}
              >
                <FaSearch />
                <span>Emergency blood search</span>
              </button>
            </div>

          </div>

          {/* Back to Home Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color var(--transition-base)'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
