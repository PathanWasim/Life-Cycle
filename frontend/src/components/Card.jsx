const Card = ({ title, children, className = '', animate = true }) => {
  return (
    <div className={`card-3d ${animate ? 'animate-slide-up' : ''} ${className}`}>
      {title && (
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;
