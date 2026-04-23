const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  icon,
  className = ''
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label} {required && <span style={{ color: 'var(--primary)' }}>*</span>}
        </label>
      )}
      {icon ? (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>{icon}</div>
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="form-input"
            style={{ paddingLeft: '2.5rem', ...(error ? { borderColor: 'var(--error)', boxShadow: '0 0 0 3px var(--error-bg)' } : {}) }}
          />
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="form-input"
          style={error ? { borderColor: 'var(--error)', boxShadow: '0 0 0 3px var(--error-bg)' } : {}}
        />
      )}
      {error && (
        <p className="animate-slide-down" style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--error)', fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
