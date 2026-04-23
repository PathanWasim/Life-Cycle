const LoadingSpinner = ({ size = 'md', text = '', fullScreen = false }) => {
  const s = { sm: { outer: 24, border: 2 }, md: { outer: 44, border: 3 }, lg: { outer: 60, border: 4 } }[size] || { outer: 44, border: 3 };

  const spinner = (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: s.outer, height: s.outer }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `${s.border}px solid var(--border)` }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `${s.border}px solid transparent`, borderTopColor: 'var(--primary)', borderRightColor: 'var(--primary-light)', animation: 'spin 0.75s linear infinite' }} />
        {size !== 'sm' && (
          <div className="animate-pulse" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            <svg width={s.outer * 0.38} height={s.outer * 0.42} viewBox="0 0 24 24" fill="var(--primary)" style={{ filter: 'drop-shadow(0 0 8px var(--primary))' }}>
              <path d="M12 2C12 2 4 10.5 4 15.5C4 19.6 7.6 23 12 23C16.4 23 20 19.6 20 15.5C20 10.5 12 2 12 2Z" />
            </svg>
          </div>
        )}
      </div>
      {text && <p className="animate-slide-up delay-100" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', fontWeight: 500 }}>{text}</p>}
    </div>
  );

  if (fullScreen) return (
    <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', zIndex: 200 }}>
      {spinner}
    </div>
  );
  return spinner;
};

export default LoadingSpinner;
