import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaTint, FaUserPlus, FaEye, FaEyeSlash, FaHospital, FaUser } from 'react-icons/fa';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');

  const [role, setRole] = useState(roleFromUrl === 'donor' ? 'Donor' : roleFromUrl === 'hospital' ? 'Hospital' : 'Donor');
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', walletAddress: '',
    name: '', bloodGroup: '', dateOfBirth: '', weight: '', city: '', pincode: '', phone: '',
    hospitalName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.walletAddress || !formData.walletAddress.startsWith('0x'))
      return 'Please enter a valid wallet address (starts with 0x)';
    if (role === 'Donor') {
      if (!formData.name || !formData.bloodGroup || !formData.dateOfBirth || !formData.weight || !formData.city || !formData.pincode)
        return 'Please fill in all donor fields';
      if (formData.weight < 50) return 'Weight must be at least 50 kg';
    }
    if (role === 'Hospital') {
      if (!formData.hospitalName || !formData.city || !formData.pincode)
        return 'Please fill in all hospital fields';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const validationError = validateForm();
    if (validationError) { setError(validationError); setLoading(false); return; }

    const userData = { email: formData.email, password: formData.password, role, walletAddress: formData.walletAddress };
    if (role === 'Donor') {
      Object.assign(userData, {
        name: formData.name,
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
        weight: parseFloat(formData.weight),
        city: formData.city,
        pincode: formData.pincode,
        phone: formData.phone
      });
    } else if (role === 'Hospital') {
      Object.assign(userData, {
        hospitalName: formData.hospitalName,
        city: formData.city,
        pincode: formData.pincode,
        phone: formData.phone
      });
    }

    const result = await register(userData);
    if (result.success) {
      if (role === 'Donor') navigate('/donor/dashboard');
      else if (role === 'Hospital') navigate('/hospital/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-animated" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      {/* Animated Background */}
      <div className="particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
      <div className="gradient-mesh" />

      <div className="animate-scale-in" style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="blood-badge blood-badge-lg animate-float" style={{ margin: '0 auto 1rem' }}>
            <FaTint />
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-display)'
          }}>
            Join LifeChain
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--primary)',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'color var(--transition-base)'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-dark)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--primary)'}
            >
              Sign in →
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="card-3d" style={{ padding: '2rem' }}>

          {/* Error */}
          {error && (
            <div className="animate-slide-down" style={{
              padding: '1rem',
              background: 'var(--error-bg)',
              border: '1px solid var(--error)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--error)'
            }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

            {/* Role Selector */}
            <div className="form-group">
              <label className="form-label">I am a</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { value: 'Donor', icon: <FaUser />, desc: 'Blood donor' },
                  { value: 'Hospital', icon: <FaHospital />, desc: 'Medical facility' },
                ].map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => { setRole(r.value); setError(''); }}
                    className="animate-scale-in"
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                      background: role === r.value ? 'var(--primary-50)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all var(--transition-base)',
                      boxShadow: role === r.value ? '0 0 0 3px var(--primary-100)' : 'none',
                    }}
                  >
                    <div style={{
                      fontSize: '1.5rem',
                      color: role === r.value ? 'var(--primary)' : 'var(--text-tertiary)'
                    }}>
                      {r.icon}
                    </div>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: role === r.value ? 'var(--primary)' : 'var(--text-primary)'
                    }}>
                      {r.value}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Common fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                      placeholder="••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-tertiary)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                      placeholder="••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-tertiary)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="walletAddress">
                  Wallet Address <span style={{ fontSize: '0.7rem', textTransform: 'none', color: 'var(--text-tertiary)', fontWeight: 400 }}>(MetaMask 0x...)</span>
                </label>
                <input
                  id="walletAddress"
                  name="walletAddress"
                  type="text"
                  required
                  className="form-input"
                  placeholder="0x..."
                  value={formData.walletAddress}
                  onChange={handleChange}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600
              }}>
                {role} Details
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {/* Donor-specific */}
            {role === 'Donor' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="animate-slide-up">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="form-input"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {BLOOD_GROUPS.map(bg => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => { setFormData(f => ({ ...f, bloodGroup: bg })); setError(''); }}
                        style={{
                          padding: '0.625rem',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${formData.bloodGroup === bg ? 'var(--primary)' : 'var(--border)'}`,
                          background: formData.bloodGroup === bg ? 'var(--primary-50)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: formData.bloodGroup === bg ? 'var(--primary)' : 'var(--text-secondary)',
                          transition: 'all var(--transition-base)',
                          boxShadow: formData.bloodGroup === bg ? '0 0 0 3px var(--primary-100)' : 'none',
                        }}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      required
                      className="form-input"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="weight">Weight (kg)</label>
                    <input
                      id="weight"
                      name="weight"
                      type="number"
                      required
                      min="50"
                      className="form-input"
                      placeholder="≥ 50 kg"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Hospital-specific */}
            {role === 'Hospital' && (
              <div className="animate-slide-up">
                <div className="form-group">
                  <label className="form-label" htmlFor="hospitalName">Hospital Name</label>
                  <input
                    id="hospitalName"
                    name="hospitalName"
                    type="text"
                    required
                    className="form-input"
                    placeholder="City General Hospital"
                    value={formData.hospitalName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Common location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  className="form-input"
                  placeholder="400001"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <FaUserPlus />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
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
  );
};

export default Register;
