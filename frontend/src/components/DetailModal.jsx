import React from 'react';

const DetailModal = ({ isOpen, onClose, title, data, type }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (type) {
      case 'hospitalInventory':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="lc-card-3d" style={{ background: 'linear-gradient(145deg, rgba(220,38,38,0.08), var(--surface))' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
                {data._id?.hospitalName}
              </h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                📍 {data._id?.city}, {data._id?.pincode}
              </p>
              {data._id?.email && (
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>📧 {data._id.email}</p>
              )}
              <div style={{ marginTop: '0.75rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--red-light)' }}>
                  {data.totalUnits}
                </span>
                <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>Total Blood Units</span>
              </div>
            </div>

            <div>
              <h4 className="lc-section-title">Blood Group & Status Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.bloodUnits?.map((unit, index) => (
                  <div key={index} className="lc-card" style={{ padding: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 900, color: 'var(--red-light)', fontSize: '1rem' }}>
                        {unit.bloodGroup}
                      </span>
                      <span className={`lc-badge ${unit.status === 'Collected' ? 'lc-badge-blue' :
                          unit.status === 'Stored' ? 'lc-badge-purple' :
                            unit.status === 'Transferred' ? 'lc-badge-yellow' :
                              unit.status === 'Used' ? 'lc-badge-green' :
                                'lc-badge-red'
                        }`}>
                        {unit.status}: {unit.count} units
                      </span>
                    </div>

                    {unit.units && unit.units.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--faint)', marginBottom: '0.25rem' }}>
                          Recent Units:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem', fontSize: '0.75rem' }}>
                          {unit.units.slice(0, 4).map((bloodUnit, idx) => (
                            <div key={idx} style={{ background: 'var(--bg2)', padding: '0.25rem', borderRadius: 'var(--r-sm)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                              {bloodUnit.bloodUnitID}
                            </div>
                          ))}
                        </div>
                        {unit.units.length > 4 && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--faint)', marginTop: '0.25rem' }}>
                            +{unit.units.length - 4} more units
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'bloodUnit':
      case 'bloodunit':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="lc-card-3d" style={{ background: 'linear-gradient(145deg, rgba(220,38,38,0.08), var(--surface))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div className="blood-badge blood-badge-lg">{data.bloodGroup}</div>
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>
                    {data.bloodUnitID || data.unitID}
                  </h4>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Status: {data.status}</p>
                </div>
              </div>
            </div>

            <div className="lc-grid-2">
              <div>
                <h5 className="lc-section-title" style={{ fontSize: '0.875rem' }}>Collection Info</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <p>
                    <span style={{ color: 'var(--faint)' }}>Date:</span>{' '}
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                      {new Date(data.collectionDate).toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    <span style={{ color: 'var(--faint)' }}>Expiry:</span>{' '}
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                      {new Date(data.expiryDate).toLocaleDateString()}
                    </span>
                  </p>
                  {data.daysUntilExpiry !== undefined && (
                    <p>
                      <span style={{ color: 'var(--faint)' }}>Days Left:</span>{' '}
                      <span className={`lc-badge ${data.daysUntilExpiry < 3 ? 'lc-badge-red' :
                          data.daysUntilExpiry <= 7 ? 'lc-badge-yellow' :
                            'lc-badge-green'
                        }`}>
                        {data.daysUntilExpiry} days
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h5 className="lc-section-title" style={{ fontSize: '0.875rem' }}>Location</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <p>
                    <span style={{ color: 'var(--faint)' }}>Hospital:</span>{' '}
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{data.hospitalName}</span>
                  </p>
                  <p>
                    <span style={{ color: 'var(--faint)' }}>City:</span>{' '}
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{data.hospitalCity}</span>
                  </p>
                  {data.hospitalEmail && (
                    <p>
                      <span style={{ color: 'var(--faint)' }}>Email:</span>{' '}
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{data.hospitalEmail}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {data.donorName && (
              <div>
                <h5 className="lc-section-title" style={{ fontSize: '0.875rem' }}>Donor Information</h5>
                <div className="lc-card" style={{ padding: '0.875rem', fontSize: '0.875rem' }}>
                  <p>
                    <span style={{ color: 'var(--faint)' }}>Name:</span>{' '}
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{data.donorName}</span>
                  </p>
                  {data.donorEmail && (
                    <p>
                      <span style={{ color: 'var(--faint)' }}>Email:</span>{' '}
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{data.donorEmail}</span>
                    </p>
                  )}
                  {data.donorCity && (
                    <p>
                      <span style={{ color: 'var(--faint)' }}>City:</span>{' '}
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{data.donorCity}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {(data.donationTxHash || data.transferTxHashes?.length > 0 || data.usageTxHash) && (
              <div>
                <h5 className="lc-section-title" style={{ fontSize: '0.875rem' }}>Blockchain Records</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  {data.donationTxHash && (
                    <div className="lc-card" style={{ padding: '0.5rem', background: 'rgba(56,189,248,0.08)' }}>
                      <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Donation:</span>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--blue)', wordBreak: 'break-all', marginTop: '0.25rem' }}>
                        {data.donationTxHash}
                      </p>
                    </div>
                  )}
                  {data.transferTxHashes?.map((hash, idx) => (
                    <div key={idx} className="lc-card" style={{ padding: '0.5rem', background: 'rgba(245,158,11,0.08)' }}>
                      <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>Transfer {idx + 1}:</span>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--yellow)', wordBreak: 'break-all', marginTop: '0.25rem' }}>
                        {hash}
                      </p>
                    </div>
                  ))}
                  {data.usageTxHash && (
                    <div className="lc-card" style={{ padding: '0.5rem', background: 'rgba(16,185,129,0.08)' }}>
                      <span style={{ color: 'var(--green)', fontWeight: 600 }}>Usage:</span>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--green)', wordBreak: 'break-all', marginTop: '0.25rem' }}>
                        {data.usageTxHash}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.transferHistory?.length > 0 && (
              <div>
                <h5 className="lc-section-title" style={{ fontSize: '0.875rem' }}>Transfer History</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {data.transferHistory.map((transfer, idx) => (
                    <div key={idx} className="lc-card" style={{ padding: '0.875rem', fontSize: '0.875rem' }}>
                      <p>
                        <span style={{ color: 'var(--faint)' }}>Date:</span>{' '}
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                          {new Date(transfer.transferDate).toLocaleString()}
                        </span>
                      </p>
                      <p>
                        <span style={{ color: 'var(--faint)' }}>From → To:</span>{' '}
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                          Hospital Transfer #{idx + 1}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="lc-empty">
            <div className="lc-empty-icon">📋</div>
            <div>No data available</div>
          </div>
        );
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <div className="lc-card-3d animate-scale-in" style={{ maxWidth: '56rem', width: '100%', margin: '1rem', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="lc-btn lc-btn-ghost lc-btn-sm"
            style={{ padding: '0.5rem', width: '36px', height: '36px' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {renderContent()}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} className="lc-btn lc-btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
