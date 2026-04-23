import React from 'react';

const EnhancedCard = ({
  title,
  children,
  className = '',
  headerActions,
  animate = true
}) => {
  return (
    <div className={`card-3d ${animate ? 'animate-slide-up' : ''} ${className}`}>
      {title && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 0 }}>{title}</h3>
          {headerActions && <div style={{ display: 'flex', gap: '0.5rem' }}>{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default EnhancedCard;
