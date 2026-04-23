const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'md',
  className = ''
}) => {
  const variantMap = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn',
    danger: 'btn',
    ghost: 'btn-ghost',
    warning: 'btn'
  };

  const sizeMap = {
    sm: '',
    md: '',
    lg: ''
  };

  const variantStyles = {
    success: { background: 'var(--success-bg)', color: '#065F46', border: '1px solid #6EE7B7' },
    danger: { background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)' },
    warning: { background: 'var(--warning-bg)', color: '#92400E', border: '1px solid #FCD34D' },
  };

  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '0.875rem' },
    lg: { padding: '1rem 2rem', fontSize: '1rem' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variantMap[variant] || variantMap.primary} ${sizeMap[size] || ''} ${className}`}
      style={{ ...variantStyles[variant], ...sizeStyles[size] }}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span>
          Loading...
        </span>
      ) : children}
    </button>
  );
};

export default Button;
