import React from 'react';

const HospitalInventoryCard = ({ hospital, onClick, className, style }) => {
  const getTotalUnits = () => {
    return hospital.bloodUnits?.reduce((total, unit) => total + unit.count, 0) || 0;
  };

  const getStatusBreakdown = () => {
    const breakdown = {};
    hospital.bloodUnits?.forEach(unit => {
      if (!breakdown[unit.status]) breakdown[unit.status] = 0;
      breakdown[unit.status] += unit.count;
    });
    return breakdown;
  };

  const getBloodGroupBreakdown = () => {
    const breakdown = {};
    hospital.bloodUnits?.forEach(unit => {
      if (!breakdown[unit.bloodGroup]) breakdown[unit.bloodGroup] = 0;
      breakdown[unit.bloodGroup] += unit.count;
    });
    return breakdown;
  };

  const getStatusBadge = (status) => {
    const map = {
      'Collected': 'lc-badge-blue',
      'Stored': 'lc-badge-purple',
      'Transferred': 'lc-badge-yellow',
      'Used': 'lc-badge-green',
      'Expired': 'lc-badge-red'
    };
    return map[status] || 'lc-badge-gray';
  };

  return (
    <div
      className={`lc-card-3d ${className || ''}`}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
      onClick={onClick}
    >
      {/* Hospital Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="lc-icon-box lc-icon-box-red">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '2px' }}>
              {hospital._id?.hospitalName || hospital.hospitalName || 'Unknown Hospital'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              📍 {hospital._id?.city || hospital.city}, {hospital._id?.pincode || hospital.pincode}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--red-light)', lineHeight: 1 }}>
            {getTotalUnits()}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--faint)', marginTop: '2px' }}>Total Units</div>
        </div>
      </div>

      {/* Blood Group Distribution */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Blood Groups
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {Object.entries(getBloodGroupBreakdown()).map(([bloodGroup, count]) => (
            <div key={bloodGroup} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontWeight: 900, color: 'var(--red-light)', fontSize: '0.875rem' }}>{bloodGroup}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Breakdown */}
      <div>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Status Distribution
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {Object.entries(getStatusBreakdown()).map(([status, count]) => (
            <span key={status} className={`lc-badge ${getStatusBadge(status)}`}>
              {status}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      {(hospital._id?.email || hospital.email) && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {hospital._id?.email || hospital.email}
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalInventoryCard;