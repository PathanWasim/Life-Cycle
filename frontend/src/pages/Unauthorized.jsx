import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }} className="bg-animated">
      <div className="gradient-mesh" />

      <div className="animate-bounce-in" style={{ textAlign: 'center', maxWidth: 420, position: 'relative', zIndex: 10 }}>

        {/* Lock + Blood drop icon */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
          <div className="animate-float" style={{
            width: 96, height: 96,
            borderRadius: '50%',
            background: 'var(--error-bg)',
            border: '2px solid var(--error)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <svg width="44" height="44" fill="none" stroke="var(--error)" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          {/* Error badge */}
          <div className="animate-pulse" style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 28, height: 28,
            borderRadius: '50%',
            background: 'var(--error)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 800, color: 'white',
            boxShadow: 'var(--glow-primary)',
          }}>
            !
          </div>
        </div>

        <h1 className="animate-bounce-in delay-100" style={{
          fontSize: '5rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, var(--error), var(--primary-dark))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          marginBottom: '0.5rem',
          fontFamily: 'var(--font-display)',
        }}>
          403
        </h1>

        <h2 className="animate-slide-up delay-150" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Access Denied
        </h2>

        <p className="animate-fade-in delay-200" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          You don't have permission to access this page. Please sign in with the appropriate account.
        </p>

        <div className="animate-slide-up delay-250" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', maxWidth: 280, justifyContent: 'center' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Go to Login
          </Link>
          <Link to="/blood-search" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            🚨 Emergency blood search
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
