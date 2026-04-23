import { useState } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PublicBloodSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchForm, setSearchForm] = useState({ city: '', pincode: '', bloodGroup: '' });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchForm.city && !searchForm.pincode) {
      setError('Please provide either city or pincode to search');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (searchForm.city) params.city = searchForm.city;
      if (searchForm.pincode) params.pincode = searchForm.pincode;
      if (searchForm.bloodGroup) params.bloodGroup = searchForm.bloodGroup;
      const response = await publicAPI.getBloodAvailability(params);
      setSearchResults(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search blood availability');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }} className="bg-animated">
      <div className="gradient-mesh" />

      {/* Header */}
      <header style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 36, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: '8px 8px 50% 50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-primary)', animation: 'float 3s ease-in-out infinite' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C12 2 4 10.5 4 15.5C4 19.6 7.6 23 12 23C16.4 23 20 19.6 20 15.5C20 10.5 12 2 12 2Z" /></svg>
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>LifeChain</h1>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Emergency Blood Search</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="badge-primary" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
              🚨 Emergency Service
            </span>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Sign In</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 10 }}>

        {/* Hero Banner */}
        <div className="animate-slide-up" style={{
          background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%)',
          border: '1px solid var(--primary-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Live indicator */}
          <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s ease-in-out infinite', boxShadow: 'var(--glow-primary)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--primary-dark)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>🚨</div>
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                Emergency Blood Search
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                Real-time blood availability from verified hospitals in the LifeChain network.
                In life-threatening emergencies, <strong style={{ color: 'var(--primary)' }}>call 108/102 first</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="animate-slide-up delay-100 card-3d" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" fill="none" stroke="var(--primary)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Blood Availability
          </h2>

          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  City <span style={{ color: 'var(--primary)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={searchForm.city}
                  onChange={e => setSearchForm({ ...searchForm, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pincode</label>
                <input
                  type="text"
                  className="form-input"
                  value={searchForm.pincode}
                  onChange={e => setSearchForm({ ...searchForm, pincode: e.target.value })}
                  placeholder="e.g. 400001"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Blood Group</label>
                <select className="form-input" value={searchForm.bloodGroup} onChange={e => setSearchForm({ ...searchForm, bloodGroup: e.target.value })}>
                  <option value="">All Groups</option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>

            {/* Blood group quick buttons */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', alignSelf: 'center', marginRight: 4 }}>Quick select:</span>
              {BLOOD_GROUPS.map((bg, idx) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSearchForm(f => ({ ...f, bloodGroup: f.bloodGroup === bg ? '' : bg }))}
                  className={`blood-badge animate-fade-in delay-${Math.min(idx * 25, 300)}`}
                  style={{
                    cursor: 'pointer',
                    border: `2px solid ${searchForm.bloodGroup === bg ? 'var(--primary)' : 'var(--primary-200)'}`,
                    background: searchForm.bloodGroup === bg ? 'var(--primary-100)' : 'var(--primary-50)',
                    transition: 'all 0.2s',
                    boxShadow: searchForm.bloodGroup === bg ? 'var(--glow-primary)' : 'none',
                    width: 'auto', padding: '0.25rem 0.625rem', height: 'auto', minWidth: 40,
                  }}
                >
                  {bg}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={loading || (!searchForm.city && !searchForm.pincode)}
                className="btn btn-primary"
              >
                {loading ? <><LoadingSpinner size="sm" />&nbsp;Searching...</> : <>🔍 Search Blood</>}
              </button>
              <button
                type="button"
                onClick={() => { setSearchForm({ city: '', pincode: '', bloodGroup: '' }); setSearchResults(null); setError(''); }}
                className="btn btn-ghost"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="animate-slide-down" style={{
            marginBottom: '1.5rem',
            background: 'var(--error-bg)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--error)',
          }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Results */}
        {searchResults && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-slide-up">

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Units Available', value: searchResults.summary.totalUnits, color: 'var(--primary)', bg: 'var(--primary-50)', border: 'var(--primary-200)' },
                { label: 'Hospitals with Stock', value: searchResults.summary.hospitalsWithStock, color: 'var(--success)', bg: 'var(--success-bg)', border: '#6EE7B7' },
                { label: 'Total Hospitals', value: searchResults.summary.hospitalsInRegion, color: 'var(--accent-blue)', bg: 'var(--info-bg)', border: '#93C5FD' },
              ].map((s, i) => (
                <div key={i} className={`animate-bounce-in delay-${i * 50}`} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
              <div className="animate-bounce-in delay-150" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Last Updated</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{new Date(searchResults.summary.lastUpdated).toLocaleString()}</div>
              </div>
            </div>

            {/* Recommendations */}
            {searchResults.recommendations?.length > 0 && (
              <div style={{
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                color: '#92400E',
              }}>
                <span style={{ fontWeight: 700 }}>💡 Tips:</span>
                <ul style={{ marginLeft: 8 }}>
                  {searchResults.recommendations.map((rec, i) => <li key={i} style={{ marginTop: 2 }}>• {rec}</li>)}
                </ul>
              </div>
            )}

            {/* Hospitals */}
            {searchResults.availability.length === 0 ? (
              <div className="card-3d" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Blood Units Found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Try a broader location or contact hospitals directly.</p>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  Available Blood Units by Hospital
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {searchResults.availability.map((hospital, index) => (
                    <div key={index} className={`card-3d animate-slide-up delay-${Math.min(index * 50, 300)}`} style={{ transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-200)'; e.currentTarget.style.boxShadow = 'var(--glow-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{hospital.hospitalName}</h4>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            📍 {hospital.hospitalCity}, {hospital.hospitalPincode}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{hospital.totalUnits}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Units Available</div>
                        </div>
                      </div>

                      {/* Blood group breakdown */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {Object.entries(hospital.bloodGroups).map(([bg, data]) => (
                          <div key={bg} style={{
                            padding: '0.375rem 0.75rem',
                            background: 'var(--primary-50)',
                            border: '1px solid var(--primary-200)',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center',
                          }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)' }}>{bg}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{data.availableUnits} units</div>
                          </div>
                        ))}
                      </div>

                      {/* Contact */}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => window.open(`tel:${hospital.hospitalPhone}`, '_self')}
                          className="btn"
                          style={{
                            background: 'var(--success-bg)',
                            color: '#065F46',
                            border: '1px solid #6EE7B7',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                          }}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call: {hospital.hospitalPhone}
                        </button>
                        <button
                          onClick={() => window.open(`mailto:${hospital.hospitalEmail}?subject=Emergency Blood Request&body=Hello, I need blood urgently. Please let me know about availability.`, '_self')}
                          className="btn"
                          style={{
                            background: 'var(--info-bg)',
                            color: '#1E40AF',
                            border: '1px solid #93C5FD',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                          }}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Hospital
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* How to use */}
        <div className="card-3d animate-slide-up delay-200" style={{ marginTop: '2rem', background: 'var(--info-bg)', borderColor: '#93C5FD' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E40AF', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Use This Service
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {[
              { step: '1', icon: '🔍', title: 'Search', text: 'Enter your city or pincode to find nearby hospitals' },
              { step: '2', icon: '🩸', title: 'Filter', text: 'Select a blood group to narrow results' },
              { step: '3', icon: '📞', title: 'Contact', text: 'Call or email hospitals directly for help' },
              { step: '4', icon: '🚑', title: 'Emergency', text: 'In critical situations, call 108/102 first' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', border: '1px solid #93C5FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#1E40AF', flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E40AF', marginBottom: 2 }}>{s.icon} {s.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicBloodSearch;
