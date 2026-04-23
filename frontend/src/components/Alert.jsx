const Alert = ({ type = 'info', message, onClose, icon }) => {
  const typeMap = {
    success: {
      bg: 'var(--success-bg)',
      border: '#6EE7B7',
      color: '#065F46',
      defaultIcon: '✓'
    },
    error: {
      bg: 'var(--error-bg)',
      border: 'var(--error)',
      color: 'var(--error)',
      defaultIcon: '✕'
    },
    warning: {
      bg: 'var(--warning-bg)',
      border: '#FCD34D',
      color: '#92400E',
      defaultIcon: '⚠'
    },
    info: {
      bg: 'var(--info-bg)',
      border: '#93C5FD',
      color: '#1E40AF',
      defaultIcon: 'ℹ'
    }
  };

  const config = typeMap[type] || typeMap.info;
  const displayIcon = icon || config.defaultIcon;

  return (
    <div className="animate-slide-down" style={{
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: 'var(--radius-lg)',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: config.color,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <span
        className="animate-bounce-in"
        style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          flexShrink: 0,
          display: 'inline-block'
        }}
      >
        {displayIcon}
      </span>
      <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            padding: '0.25rem',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            opacity: 0.7,
            transition: 'all 0.2s',
            lineHeight: 1,
            flexShrink: 0
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'rotate(90deg)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.transform = 'rotate(0deg)'; }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
