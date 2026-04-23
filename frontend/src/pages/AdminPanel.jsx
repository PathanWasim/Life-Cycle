import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import Navbar from '../components/Navbar';
import TabNavigation from '../components/TabNavigation';
import DetailModal from '../components/DetailModal';
import HospitalInventoryCard from '../components/HospitalInventoryCard';
import BloodUnitCard from '../components/BloodUnitCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AdminPanel = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailType, setDetailType] = useState('');
  const [hospitalInventories, setHospitalInventories] = useState([]);
  const [allBloodUnits, setAllBloodUnits] = useState([]);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingHospitals();
    } else if (activeTab === 'overview') {
      fetchStatistics();
    } else if (activeTab === 'detailed') {
      fetchDetailedStatistics();
    } else if (activeTab === 'inventory') {
      fetchHospitalInventories();
    } else if (activeTab === 'bloodunits') {
      fetchAllBloodUnits();
    }
  }, [activeTab]);

  // Auto-refresh statistics every 30 seconds
  useEffect(() => {
    if (activeTab === 'overview') {
      const interval = setInterval(() => {
        fetchStatistics();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchPendingHospitals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getPendingHospitals();
      setPendingHospitals(response.data.data.hospitals);
    } catch (err) {
      console.error('Error fetching pending hospitals:', err);
      setError(err.response?.data?.message || 'Failed to load pending hospitals');
      setPendingHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getStatistics();
      setStatistics(response.data.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.response?.data?.message || 'Failed to load statistics');
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getDetailedStatistics();
      setDetailedStats(response.data.data);
    } catch (err) {
      console.error('Error fetching detailed statistics:', err);
      setError(err.response?.data?.message || 'Failed to load detailed statistics');
      setDetailedStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalInventories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getHospitalInventories();
      setHospitalInventories(response.data.data.hospitalStats || []);
    } catch (err) {
      console.error('Error fetching hospital inventories:', err);
      setError(err.response?.data?.message || 'Failed to load hospital inventories');
      setHospitalInventories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBloodUnits = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getAllBloodUnits();
      setAllBloodUnits(response.data.data.bloodUnits || []);
    } catch (err) {
      console.error('Error fetching blood units:', err);
      setError(err.response?.data?.message || 'Failed to load blood units');
      setAllBloodUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (type, data) => {
    setDetailType(type);
    setDetailData(data);
    setShowDetailModal(true);
  };

  const handleApprove = async (hospitalID, hospitalName) => {
    if (!confirm(`Approve ${hospitalName}?`)) return;
    try {
      setLoading(true);
      await adminAPI.verifyHospital(hospitalID);
      setSuccess(`${hospitalName} approved successfully!`);
      fetchPendingHospitals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve hospital');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (hospitalID, hospitalName) => {
    if (!confirm(`Reject and delete ${hospitalName}? This action cannot be undone.`)) return;
    try {
      setLoading(true);
      await adminAPI.rejectHospital(hospitalID);
      setSuccess(`${hospitalName} rejected and deleted.`);
      fetchPendingHospitals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-animated" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Animated Background */}
      <div className="particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
      <div className="gradient-mesh" />

      <Navbar />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 10 }}>
        <div className="animate-slide-up" style={{
          background: 'linear-gradient(135deg, var(--primary-50) 0%, rgba(59, 130, 246, 0.05) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-display)'
            }}>Admin Control Panel</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>System-wide analytics, hospital management, and blood unit oversight</p>
          </div>
          <span className="badge-info animate-bounce-in delay-200" data-tooltip="Administrator Access">Admin</span>
        </div>

        <TabNavigation
          tabs={[
            { id: 'overview', label: 'System Overview' },
            { id: 'detailed', label: 'Analytics' },
            { id: 'inventory', label: 'Hospital Inventories' },
            { id: 'bloodunits', label: 'All Blood Units' },
            { id: 'pending', label: 'Pending Hospitals' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Messages */}
        {error && (
          <div className="animate-slide-down" style={{
            padding: '1rem 1.25rem',
            background: 'var(--error-bg)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--error)'
          }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{error}</span>
          </div>
        )}
        {success && (
          <div className="animate-slide-down" style={{
            padding: '1rem 1.25rem',
            background: 'var(--success-bg)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#065F46'
          }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{success}</span>
          </div>
        )}

        {/* Tab Content */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <LoadingSpinner />
          </div>
        )}

        {!loading && (
          <>
            {/* SYSTEM OVERVIEW TAB */}
            {activeTab === 'overview' && statistics && (
              <div className="animate-fade-in">
                {/* Statistics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: '2rem' }}>
                  <div className="stat-card stat-card-red card-3d animate-bounce-in delay-50" data-tooltip="Total blood units in system">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--primary-100)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--primary)'
                      }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Total Blood Units</div>
                    <div className="stat-number" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{statistics.totalBloodUnits || 0}</div>
                  </div>

                  <div className="stat-card stat-card-green card-3d animate-bounce-in delay-100" data-tooltip="Units ready for use">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--success-bg)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--success)'
                      }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Available Units</div>
                    <div className="stat-number" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{statistics.availableUnits || 0}</div>
                  </div>

                  <div className="stat-card stat-card-blue card-3d animate-bounce-in delay-150" data-tooltip="Registered hospitals">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--info-bg)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--info)'
                      }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Total Hospitals</div>
                    <div className="stat-number" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{statistics.totalHospitals || 0}</div>
                  </div>

                  <div className="stat-card stat-card-purple card-3d animate-bounce-in delay-200" data-tooltip="Active donors in network">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#EDE9FE',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--accent-purple)'
                      }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Total Donors</div>
                    <div className="stat-number" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{statistics.totalDonors || 0}</div>
                  </div>
                </div>

                {/* Blood Group Distribution & Status Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-lg)', marginBottom: '2rem' }}>
                  {/* Blood Group Distribution */}
                  <div className="card-3d animate-slide-left delay-100 scroll-reveal">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Blood Group Distribution</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                      {(statistics.bloodGroupDistribution || statistics.bloodUnitsByBloodGroup) && Object.keys(statistics.bloodGroupDistribution || statistics.bloodUnitsByBloodGroup || {}).length > 0 ? (
                        Object.entries(statistics.bloodGroupDistribution || statistics.bloodUnitsByBloodGroup).map(([group, count], idx) => (
                          <div key={group} className="animate-slide-up" style={{
                            animationDelay: `${idx * 50}ms`,
                            padding: '0.75rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            transition: 'all var(--transition-base)',
                            cursor: 'pointer'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="blood-badge" data-tooltip={`${group} blood type`}>{group}</div>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{count} units</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                          <div style={{ fontSize: '3rem', marginBottom: '0.5rem', opacity: 0.5 }}>🩸</div>
                          <div style={{ fontSize: '0.875rem' }}>No blood group data available</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="card-3d animate-slide-right delay-200 scroll-reveal">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Status Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="animate-slide-up delay-50" data-tooltip="Units ready for transfusion" style={{
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all var(--transition-base)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--success)'
                          }}></span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Available</span>
                        </div>
                        <span className="stat-number" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--success)' }}>{statistics.statusBreakdown?.available || 0}</span>
                      </div>
                      <div className="animate-slide-up delay-100" data-tooltip="Units reserved for patients" style={{
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all var(--transition-base)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--warning)'
                          }}></span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Reserved</span>
                        </div>
                        <span className="stat-number" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--warning)' }}>{statistics.statusBreakdown?.reserved || 0}</span>
                      </div>
                      <div className="animate-slide-up delay-150" data-tooltip="Units already transfused" style={{
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all var(--transition-base)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--primary)'
                          }}></span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Used</span>
                        </div>
                        <span className="stat-number" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{statistics.statusBreakdown?.used || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pending Hospitals Alert & System Health */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-lg)' }}>
                  {/* Pending Hospitals Alert */}
                  <div className="card-3d animate-slide-left delay-300 scroll-reveal" style={{ background: 'linear-gradient(145deg, rgba(220,38,38,0.08), var(--bg-secondary))' }}>
                    <div className="animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: 56,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--primary-100)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--primary)'
                      }}>
                        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pending Approvals</div>
                        <div className="stat-number" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{statistics.pendingHospitals || 0}</div>
                      </div>
                    </div>
                    {statistics.pendingHospitals > 0 && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => setActiveTab('pending')}
                        data-tooltip="Review and approve hospitals"
                      >
                        Review Pending Hospitals →
                      </button>
                    )}
                  </div>

                  {/* System Health Indicators */}
                  <div className="card-3d animate-slide-right delay-400 scroll-reveal">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>System Health</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      <div className="animate-slide-up delay-50" data-tooltip="Available vs total units">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Inventory Level</span>
                          <span className="stat-number" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>
                            {statistics.totalBloodUnits > 0 ? Math.round((statistics.availableUnits / statistics.totalBloodUnits) * 100) : 0}%
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: 8,
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${statistics.totalBloodUnits > 0 ? (statistics.availableUnits / statistics.totalBloodUnits) * 100 : 0}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--success), #6EE7B7)',
                            transition: 'width var(--transition-slow)'
                          }}></div>
                        </div>
                      </div>
                      <div className="animate-slide-up delay-100" data-tooltip="Active hospital network">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hospital Coverage</span>
                          <span className="stat-number" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--info)' }}>
                            {statistics.totalHospitals || 0} Active
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: 8,
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: '85%',
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--info), #7DD3FC)',
                            transition: 'width var(--transition-slow)'
                          }}></div>
                        </div>
                      </div>
                      <div className="animate-slide-up delay-150" data-tooltip="Registered donor count">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Donor Network</span>
                          <span className="stat-number" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                            {statistics.totalDonors || 0} Registered
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: 8,
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: '92%',
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--accent-purple), #C4B5FD)',
                            transition: 'width var(--transition-slow)'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'detailed' && detailedStats && (
              <div className="animate-fade-in">
                {/* Hospital-wise Statistics */}
                <div className="card-3d" style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Hospital-wise Statistics</h3>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Hospital</th>
                          <th>Location</th>
                          <th>Total Units</th>
                          <th>Available</th>
                          <th>Reserved</th>
                          <th>Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedStats.hospitalStats && detailedStats.hospitalStats.length > 0 ? (
                          detailedStats.hospitalStats.map((hospital, idx) => (
                            <tr key={hospital.hospitalID || hospital._id?.hospitalID || idx} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                              <td style={{ fontWeight: 600 }}>{hospital.hospitalName || hospital._id?.hospitalName || 'Unknown Hospital'}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{hospital.city || hospital._id?.city || 'N/A'}, {hospital.state || hospital._id?.state || ''}</td>
                              <td style={{ fontWeight: 700 }}>{hospital.totalUnits || 0}</td>
                              <td><span className="badge-success">{hospital.available || 0}</span></td>
                              <td><span className="badge-warning">{hospital.reserved || 0}</span></td>
                              <td><span className="badge">{hospital.used || 0}</span></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                              No hospital data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Donor Distribution & Recent Activity */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-lg)' }}>
                  {/* Donor Distribution by City */}
                  <div className="card-3d animate-slide-up delay-100">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Donor Distribution by City</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {detailedStats.donorsByCity && detailedStats.donorsByCity.length > 0 ? (
                        detailedStats.donorsByCity.slice(0, 8).map((city, idx) => (
                          <div key={city._id || idx} style={{
                            animationDelay: `${idx * 50}ms`,
                            padding: '0.75rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all var(--transition-base)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg width="16" height="16" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                              </svg>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{city._id || 'Unknown'}</span>
                            </div>
                            <span className="badge-info">{city.count} donors</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-tertiary)' }}>
                          <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', opacity: 0.5 }}>📍</div>
                          <div>No donor distribution data</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity Metrics */}
                  <div className="card-3d animate-slide-up delay-200">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Recent Activity Metrics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="stat-card stat-card-green" style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Recent Donations</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                          {detailedStats.recentDonations || 0}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Last 30 days</div>
                      </div>
                      <div className="stat-card stat-card-yellow" style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Active Requests</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                          {detailedStats.activeRequests || 0}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Pending fulfillment</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HOSPITAL INVENTORIES TAB */}
            {activeTab === 'inventory' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Hospital Blood Inventories</h3>
                {hospitalInventories && hospitalInventories.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {hospitalInventories.map((hospital, idx) => (
                      <HospitalInventoryCard
                        key={hospital.hospitalID || idx}
                        hospital={hospital}
                        className="animate-slide-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card-3d">
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-tertiary)' }}>
                      <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', opacity: 0.5 }}>🏥</div>
                      <div>No hospital inventory data available</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ALL BLOOD UNITS TAB */}
            {activeTab === 'bloodunits' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 0 }}>All Blood Units</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                      </svg>
                      Filter
                    </button>
                    <span className="badge-info">{allBloodUnits.length} units</span>
                  </div>
                </div>
                {allBloodUnits && allBloodUnits.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {allBloodUnits.map((unit, idx) => (
                      <BloodUnitCard
                        key={unit.unitID || idx}
                        unit={unit}
                        onViewDetails={() => handleShowDetails('bloodunit', unit)}
                        className="animate-slide-up"
                        style={{ animationDelay: `${idx * 30}ms` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card-3d">
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-tertiary)' }}>
                      <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', opacity: 0.5 }}>💉</div>
                      <div>No blood units found</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PENDING HOSPITALS TAB */}
            {activeTab === 'pending' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 0 }}>Pending Hospital Approvals</h3>
                  <span className="badge-warning">{pendingHospitals.length} pending</span>
                </div>
                {pendingHospitals && pendingHospitals.length > 0 ? (
                  <div className="card-3d">
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Hospital Name</th>
                            <th>Location</th>
                            <th>Contact</th>
                            <th>License</th>
                            <th>Registered</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingHospitals.map((hospital, idx) => (
                            <tr key={hospital.hospitalID || idx} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                              <td style={{ fontWeight: 600 }}>{hospital.hospitalName}</td>
                              <td>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{hospital.city}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{hospital.state}</div>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{hospital.email}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{hospital.phone}</div>
                              </td>
                              <td>
                                <span className="badge-info" style={{ fontSize: '0.65rem' }}>
                                  {hospital.licenseNumber}
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {hospital.createdAt ? new Date(hospital.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleApprove(hospital.hospitalID, hospital.hospitalName)}
                                    disabled={loading}
                                  >
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleReject(hospital.hospitalID, hospital.hospitalName)}
                                    disabled={loading}
                                  >
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="card-3d">
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-tertiary)' }}>
                      <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', opacity: 0.5 }}>✅</div>
                      <div>No pending hospital approvals</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                        All hospitals have been reviewed
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Empty State for No Data */}
        {!loading && activeTab === 'overview' && !statistics && (
          <div className="card-3d">
            <ErrorMessage message={error || "Unable to load statistics"} />
          </div>
        )}

        {!loading && activeTab === 'detailed' && !detailedStats && (
          <div className="card-3d">
            <ErrorMessage message={error || "Unable to load detailed statistics"} />
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`${detailType.charAt(0).toUpperCase() + detailType.slice(1)} Details`}
        data={detailData}
        type={detailType}
      />
    </div>
  );
};

export default AdminPanel;
