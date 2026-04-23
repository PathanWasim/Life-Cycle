const ErrorMessage = ({ message, onRetry, className = '' }) => {
  if (!message) return null;
  return (
    <div className={`animate-slide-down ${className}`} style={{
      background: 'var(--error-bg)',
      border: '1px solid var(--error)',
      borderRadius: 'var(--radius-lg)',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: 'var(--error)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, marginTop: 1 }}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'inherit', padding: '2px 6px', borderRadius: 4,
            fontSize: '0.75rem', fontWeight: 600, opacity: 0.8,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
