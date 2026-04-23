import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeMap = {
    success: {
      bg: 'var(--success-bg)',
      border: '#6EE7B7',
      color: '#065F46',
      icon: '✓'
    },
    error: {
      bg: 'var(--error-bg)',
      border: 'var(--error)',
      color: 'var(--error)',
      icon: '✕'
    },
    warning: {
      bg: 'var(--warning-bg)',
      border: '#FCD34D',
      color: '#92400E',
      icon: '⚠'
    },
    info: {
      bg: 'var(--info-bg)',
      border: '#93C5FD',
      color: '#1E40AF',
      icon: 'ℹ'
    }
  };

  const config = typeMap[type] || typeMap.info;

  return (
    <div
      className="animate-slide-down"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 300,
        minWidth: '280px',
        maxWidth: '420px',
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        color: config.color,
        boxShadow: 'var(--shadow-2xl)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%'
      }}>
        <span style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          flexShrink: 0
        }}>
          {config.icon}
        </span>
        <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
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
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
