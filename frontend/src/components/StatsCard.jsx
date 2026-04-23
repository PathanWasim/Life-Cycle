import { useState, useEffect } from 'react';

const StatsCard = ({ title, value, icon, color = 'red', subtitle, trend, textValue, delay = 0 }) => {
  const isNumeric = typeof value === 'number';
  const numericValue = isNumeric ? value : 0;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!isNumeric || numericValue === 0) { setDisplayed(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(numericValue / 25));
    const timer = setInterval(() => {
      start = Math.min(start + step, numericValue);
      setDisplayed(start);
      if (start >= numericValue) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [numericValue, isNumeric]);

  const colorMap = {
    red: { bg: 'var(--primary-50)', border: 'var(--primary-200)', text: 'var(--primary)', icon: 'var(--primary)' },
    green: { bg: 'var(--success-bg)', border: '#6EE7B7', text: 'var(--success)', icon: 'var(--success)' },
    blue: { bg: 'var(--info-bg)', border: '#93C5FD', text: 'var(--accent-blue)', icon: 'var(--accent-blue)' },
    purple: { bg: '#EDE9FE', border: '#C4B5FD', text: 'var(--accent-purple)', icon: 'var(--accent-purple)' },
    yellow: { bg: 'var(--warning-bg)', border: '#FCD34D', text: 'var(--warning)', icon: 'var(--warning)' },
    teal: { bg: '#CCFBF1', border: '#5EEAD4', text: '#0F766E', icon: '#0F766E' },
    orange: { bg: 'var(--warning-bg)', border: '#FCD34D', text: 'var(--warning)', icon: 'var(--warning)' }
  };

  const colors = colorMap[color] || colorMap.red;
  const delayClass = delay > 0 ? `delay-${delay}` : '';

  return (
    <div className={`stat-card animate-slide-up ${delayClass}`} style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--spacing-xl)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all var(--transition-slow)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            {title}
          </p>

          {/* Main value */}
          {isNumeric ? (
            <p style={{ fontSize: '2.25rem', fontWeight: 800, color: colors.text, lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
              {displayed.toLocaleString()}
            </p>
          ) : (
            <p style={{ fontSize: '1rem', fontWeight: 700, color: colors.text, lineHeight: 1.3, marginBottom: 4, wordBreak: 'break-word' }}>
              {value || '—'}
            </p>
          )}

          {subtitle && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{subtitle}</p>
          )}
          {textValue && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>{textValue}</p>
          )}
          {trend !== undefined && (
            <p style={{ fontSize: '0.7rem', color: trend >= 0 ? 'var(--success)' : 'var(--error)', marginTop: 6, fontWeight: 600 }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>

        {icon && (
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,255,255,0.8)',
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.icon,
            fontSize: '1.5rem',
            flexShrink: 0,
            boxShadow: 'var(--shadow-sm)',
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
