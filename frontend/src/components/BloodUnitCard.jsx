const getStatusBadge = (status) => {
  const map = {
    'Collected': { bg: 'var(--info-bg)', color: '#1E40AF', border: '#93C5FD' },
    'Stored': { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
    'Transferred': { bg: 'var(--warning-bg)', color: '#92400E', border: '#FCD34D' },
    'Used': { bg: 'var(--success-bg)', color: '#065F46', border: '#6EE7B7' },
    'Expired': { bg: 'var(--error-bg)', color: 'var(--error)', border: 'var(--error)' },
  };
  return map[status] || { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'var(--border)' };
};

const BloodUnitCard = ({ unit, bloodUnit, onClick, onViewDetails, showHospital = false, className, style }) => {
  // Support both 'unit' and 'bloodUnit' props for flexibility
  const data = unit || bloodUnit;
  const handleClick = onClick || onViewDetails;

  const days = data.daysUntilExpiry;
  const expiryColor = days < 3 ? 'var(--error)' : days <= 7 ? 'var(--warning)' : 'var(--success)';

  const statusStyle = getStatusBadge(data.status);

  return (
    <div
      className={`card-3d ${className || ''}`}
      style={{ cursor: handleClick ? 'pointer' : 'default', ...style }}
      onClick={handleClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="blood-badge">{data.bloodGroup}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', wordBreak: 'break-all', lineHeight: 1.3 }}>
              {data.bloodUnitID || data.unitID}
            </div>
            {showHospital && data.hospitalName && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                📍 {data.hospitalName}
              </div>
            )}
          </div>
        </div>
        <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
          {data.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
        <div>
          <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Collection</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{new Date(data.collectionDate).toLocaleDateString()}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Expiry</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{new Date(data.expiryDate).toLocaleDateString()}</span>
        </div>
      </div>

      {days !== undefined && (
        <div style={{ marginTop: '0.625rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: expiryColor }}>
            {days > 0 ? `${days} days left` : `Expired ${Math.abs(days)} days ago`}
          </span>
        </div>
      )}

      {data.donorName && (
        <div style={{ marginTop: '0.625rem', paddingTop: '0.625rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Donor: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.donorName}</span>
        </div>
      )}
    </div>
  );
};

export default BloodUnitCard;
