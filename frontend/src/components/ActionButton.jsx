import LoadingSpinner from './LoadingSpinner';

const ActionButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn',
    danger: 'btn',
    warning: 'btn',
    outline: 'btn-ghost'
  };

  const customStyles = {
    success: { background: 'var(--success-bg)', color: '#065F46', border: '1px solid #6EE7B7' },
    danger: { background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)' },
    warning: { background: 'var(--warning-bg)', color: '#92400E', border: '1px solid #FCD34D' },
  };

  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '0.875rem' },
    lg: { padding: '1rem 2rem', fontSize: '1rem' }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variantStyles[variant]} ${className}`}
      style={{ ...customStyles[variant], ...sizeStyles[size] }}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : icon ? (
        <span style={{ fontSize: '1.125rem' }}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default ActionButton;
