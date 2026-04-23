import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { donorAPI, campaignAPI } from '../services/api';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TabNavigation from '../components/TabNavigation';

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloadingCert, setDownloadingCert] = useState(null);

  // Campaign state
  const [availableCampaigns, setAvailableCampaigns] = useState([]);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [campaignFilters, setCampaignFilters] = useState({
    city: user?.city || '',
    pincode: user?.pincode || '',
    bloodGroup: ''
  });

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchDonorData();
    } else if (activeTab === 'find-campaigns') {
      fetchAvailableCampaigns();
    } else if (activeTab === 'my-campaigns') {
      fetchMyCampaigns();
    }
  }, [activeTab]);

  const fetchDonorData = async () => {
    try {
      setLoading(true);

      // Fetch profile and donations in parallel
      const [profileRes, donationsRes] = await Promise.all([
        donorAPI.getProfile(),
        donorAPI.getDonations()
      ]);

      setProfile(profileRes.data.data);
      setDonations(donationsRes.data.data.donations);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load donor data');
    } finally {
      setLoading(false);
    }
  };

  // Logout handled by shared Navbar

  const downloadCertificate = async (bloodUnitID) => {
    try {
      setDownloadingCert(bloodUnitID);

      const response = await donorAPI.getCertificate(bloodUnitID);

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${bloodUnitID}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download certificate');
      setTimeout(() => setError(''), 5000);
    } finally {
      setDownloadingCert(null);
    }
  };

  // Campaign functions
  const fetchAvailableCampaigns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (campaignFilters.city) params.city = campaignFilters.city;
      if (campaignFilters.pincode) params.pincode = campaignFilters.pincode;
      if (campaignFilters.bloodGroup) params.bloodGroup = campaignFilters.bloodGroup;

      const response = await campaignAPI.getActiveCampaigns(params);
      setAvailableCampaigns(response.data.data.campaigns);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCampaigns = async () => {
    try {
      setLoading(true);
      const response = await donorAPI.getCampaigns();
      setMyCampaigns(response.data.data.campaigns);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignRegistration = async (campaignID) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await campaignAPI.registerForCampaign(campaignID);
      setSuccess('✅ Successfully registered for campaign! Check your email for confirmation.');

      // Refresh campaigns
      fetchAvailableCampaigns();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register for campaign');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignCancellation = async (campaignID) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await campaignAPI.cancelCampaignRegistration(campaignID);
      setSuccess('✅ Campaign registration cancelled successfully.');

      // Refresh campaigns
      fetchAvailableCampaigns();
      fetchMyCampaigns();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCampaignDone = async (campaignID) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await campaignAPI.markCampaignDone(campaignID);
      setSuccess('✅ Donation marked as completed! Please wait for hospital verification.');

      // Refresh my campaigns
      fetchMyCampaigns();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark donation as done');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getEligibilityColor = (status) => {
    if (status === 'Eligible') return 'badge-success';
    return 'badge-primary';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Collected': 'badge-info',
      'Stored': 'badge-info',
      'Transferred': 'badge-warning',
      'Used': 'badge-success'
    };
    return colors[status] || 'badge';
  };

  if (loading && !profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <LoadingSpinner size="lg" text="Loading your profile..." />
      </div>
    );
  }

  const TABS = [
    { id: 'profile', label: 'My Profile' },
    { id: 'find-campaigns', label: 'Find Campaigns' },
    { id: 'my-campaigns', label: 'My Campaigns' },
    { id: 'history', label: 'Donation History' },
  ];

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
            }}>Donor Portal</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Manage your profile, join campaigns, and track your donation history</p>
          </div>
          {profile && <div className="blood-badge blood-badge-lg animate-bounce-in delay-100">{profile.bloodGroup}</div>}
        </div>
        <TabNavigation tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

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
        <div className="card-3d animate-slide-up delay-100" style={{ padding: '2rem' }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Profile Header */}
              {profile && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>My Profile</h2>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>Your donor information and eligibility status</p>
                    </div>
                    <div className="blood-badge blood-badge-lg blood-badge-interactive animate-bounce-in">{profile.bloodGroup}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {[
                      { label: 'Full Name', value: profile.name },
                      { label: 'Email Address', value: profile.email },
                      { label: 'Age', value: `${profile.age} years` },
                      { label: 'Weight', value: `${profile.weight} kg` },
                      { label: 'Location', value: `${profile.city}, ${profile.pincode}` },
                      { label: 'Total Donations', value: donations.length },
                      { label: 'Gender', value: profile.gender || '—' },
                      { label: 'Phone', value: profile.phone || '—' },
                    ].map((item, idx) => (
                      <div key={item.label} className={`animate-slide-up delay-${idx * 50}`} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{item.label}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Status Section */}
              {profile && (
                <div className="animate-fade-in delay-200">
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Eligibility Status</h2>
                  <div className={`card-3d ${profile.eligibilityStatus === 'Eligible' ? 'stat-card-green' : 'stat-card-red'} animate-slide-up`}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                          {profile.eligibilityStatus === 'Eligible' ? (
                            <svg className="animate-bounce-in" style={{ width: 24, height: 24, color: 'var(--success)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="animate-bounce-in" style={{ width: 24, height: 24, color: 'var(--primary)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{profile.eligibilityStatus}</p>
                        </div>

                        {profile.daysSinceLastDonation !== null && (
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                            <span style={{ fontWeight: 600 }}>Days since last donation:</span> {profile.daysSinceLastDonation}
                          </p>
                        )}

                        {profile.eligibilityStatus !== 'Eligible' && profile.daysSinceLastDonation !== null && (
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                            <span style={{ fontWeight: 600 }}>Next eligible date:</span> {new Date(
                              new Date(profile.lastDonationDate).getTime() + 56 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}
                          </p>
                        )}

                        {profile.eligibilityStatus === 'Eligible' && (
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            🎉 You are eligible to donate blood! Check out available campaigns or contact a hospital directly.
                          </p>
                        )}
                      </div>

                      {profile.eligibilityStatus === 'Eligible' && (
                        <button
                          onClick={() => setActiveTab('find-campaigns')}
                          className="btn btn-primary btn-sm animate-bounce-in delay-100"
                        >
                          Find Campaigns
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Find Campaigns Tab */}
          {activeTab === 'find-campaigns' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Available Campaigns</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>Find blood donation campaigns in your area</p>
                </div>
                <button onClick={fetchAvailableCampaigns} className="btn btn-ghost btn-sm">↺ Refresh</button>
              </div>

              {/* Campaign Filters */}
              <div className="card-3d animate-slide-up" style={{ background: 'var(--bg-secondary)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>🔍 Search Filters</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">📍 City</label>
                    <input type="text" className="form-input" value={campaignFilters.city} onChange={(e) => setCampaignFilters({ ...campaignFilters, city: e.target.value })} placeholder="Enter city" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">📮 Pincode</label>
                    <input type="text" className="form-input" value={campaignFilters.pincode} onChange={(e) => setCampaignFilters({ ...campaignFilters, pincode: e.target.value })} placeholder="Enter pincode" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">🩸 Blood Group</label>
                    <select className="form-input" value={campaignFilters.bloodGroup} onChange={(e) => setCampaignFilters({ ...campaignFilters, bloodGroup: e.target.value })}>
                      <option value="">All Blood Groups</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (<option key={bg} value={bg}>{bg}</option>))}
                    </select>
                  </div>
                </div>
                <button onClick={fetchAvailableCampaigns} className="btn btn-primary">🔍 Search Campaigns</button>
              </div>

              {/* Campaigns List */}
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner size="md" text="Loading campaigns..." /></div>
              ) : availableCampaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-tertiary)' }} className="animate-fade-in">
                  <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', opacity: 0.5 }} className="animate-bounce-in">📋</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No campaigns found</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Try adjusting your search filters or check back later.</p>
                  <button onClick={() => setCampaignFilters({ city: user?.city || '', pincode: user?.pincode || '', bloodGroup: '' })} className="btn btn-primary">Reset Filters</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {availableCampaigns.map((campaign, idx) => (
                    <div key={campaign.campaignID} className={`card-3d animate-slide-up delay-${Math.min(idx * 50, 300)}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{campaign.title}</h3>
                            {campaign.isToday && (
                              <span className="badge-primary animate-pulse-glow">🔥 TODAY!</span>
                            )}
                          </div>
                          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{campaign.description}</p>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg style={{ width: 16, height: 16, color: 'var(--text-tertiary)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0a4 4 0 00-4 4v2a4 4 0 004 4h8a4 4 0 004-4v-2a4 4 0 00-4-4" />
                              </svg>
                              <span style={{ color: 'var(--text-primary)' }}>📅 {new Date(campaign.campaignDate).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg style={{ width: 16, height: 16, color: 'var(--text-tertiary)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span style={{ color: 'var(--text-primary)' }}>🕐 {campaign.startTime} - {campaign.endTime}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg style={{ width: 16, height: 16, color: 'var(--text-tertiary)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span style={{ color: 'var(--text-primary)' }}>📍 {campaign.venue.name}, {campaign.venue.city}</span>
                            </div>
                          </div>

                          <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginTop: '0.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                              <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Hospital:</span>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{campaign.hospital.name}</div>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{campaign.hospital.phone}</div>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Target:</span>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{campaign.targetQuantity} units</div>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Registered:</span>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{campaign.registeredCount} donors</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          {campaign.daysUntilCampaign > 0 && (
                            <div className="badge-info" style={{ marginBottom: '0.5rem' }}>
                              {campaign.daysUntilCampaign} days away
                            </div>
                          )}
                        </div>
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Blood Groups Needed:</span>
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                              {campaign.bloodGroupsNeeded.map(bg => (
                                <span key={bg} className={bg === profile?.bloodGroup ? 'badge-success' : 'badge'}>
                                  {bg}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Your Blood Group:</span>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem', color: campaign.bloodGroupsNeeded.includes(profile?.bloodGroup) ? 'var(--success)' : 'var(--primary)' }}>
                              {campaign.bloodGroupsNeeded.includes(profile?.bloodGroup) ? '✅ Needed' : '❌ Not needed'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {campaign.isRegistered ? (
                            <span className="badge-success" style={{ padding: '0.5rem 1rem' }}>
                              ✓ Already Registered
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCampaignRegistration(campaign.campaignID)}
                              disabled={loading || !campaign.bloodGroupsNeeded.includes(profile?.bloodGroup) || profile?.eligibilityStatus !== 'Eligible'}
                              className="btn btn-primary btn-sm"
                            >
                              {loading ? 'Registering...' : '📝 Register'}
                            </button>
                          )}

                          {!campaign.bloodGroupsNeeded.includes(profile?.bloodGroup) && (
                            <span className="badge-primary" style={{ padding: '0.5rem 1rem' }}>
                              Blood group not needed
                            </span>
                          )}

                          {profile?.eligibilityStatus !== 'Eligible' && (
                            <span className="badge-warning" style={{ padding: '0.5rem 1rem' }}>
                              Not eligible to donate
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Campaigns Tab */}
          {activeTab === 'my-campaigns' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>My Campaign Registrations</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>Track your registered campaigns and attendance status</p>
                </div>
                <button onClick={fetchMyCampaigns} className="btn btn-ghost btn-sm">
                  <svg style={{ width: 16, height: 16, marginRight: '0.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                  <LoadingSpinner size="md" text="Loading your campaigns..." />
                </div>
              ) : myCampaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-tertiary)' }} className="animate-fade-in">
                  <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', opacity: 0.5 }} className="animate-bounce-in">📋</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No campaign registrations</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You haven't registered for any campaigns yet.</p>
                  <button
                    onClick={() => setActiveTab('find-campaigns')}
                    className="btn btn-primary"
                  >
                    🔍 Find Campaigns
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {myCampaigns.map((campaign, idx) => (
                    <div key={campaign.campaignID} className={`card-3d animate-slide-up delay-${Math.min(idx * 50, 300)}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{campaign.title}</h3>
                            {campaign.isToday && (
                              <span className="badge-primary animate-pulse-glow">🔥 TODAY!</span>
                            )}
                          </div>
                          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{campaign.description}</p>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg style={{ width: 16, height: 16, color: 'var(--text-tertiary)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0a4 4 0 00-4 4v2a4 4 0 004 4h8a4 4 0 004-4v-2a4 4 0 00-4-4" />
                              </svg>
                              <span style={{ color: 'var(--text-primary)' }}>📅 {new Date(campaign.campaignDate).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg style={{ width: 16, height: 16, color: 'var(--text-tertiary)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span style={{ color: 'var(--text-primary)' }}>🕐 {campaign.startTime} - {campaign.endTime}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg style={{ width: 16, height: 16, color: 'var(--text-tertiary)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span style={{ color: 'var(--text-primary)' }}>📍 {campaign.venue.name}, {campaign.venue.city}</span>
                            </div>
                          </div>

                          <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                              <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Hospital:</span>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{campaign.hospital.name}</div>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{campaign.hospital.phone || 'N/A'}</div>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Registration Date:</span>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {campaign.participation?.registrationDate
                                    ? new Date(campaign.participation.registrationDate).toLocaleDateString()
                                    : 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge-${campaign.participation?.attendanceStatus === 'Registered' ? 'info' :
                            campaign.participation?.attendanceStatus === 'Marked Done by Donor' ? 'warning' :
                              campaign.participation?.attendanceStatus === 'Verified by Hospital' ? 'success' :
                                'primary'
                            }`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
                            {campaign.participation?.attendanceStatus === 'Registered' ? '📝 Registered' :
                              campaign.participation?.attendanceStatus === 'Marked Done by Donor' ? '⏳ Awaiting Verification' :
                                campaign.participation?.attendanceStatus === 'Verified by Hospital' ? '✅ Verified' :
                                  campaign.participation?.attendanceStatus || 'Unknown'}
                          </span>

                          {campaign.daysUntilCampaign > 0 && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                              {campaign.daysUntilCampaign} days away
                            </div>
                          )}
                        </div>
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ color: 'var(--text-secondary)' }}>Source:</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginLeft: '0.25rem', textTransform: 'capitalize' }}>
                              {campaign.participation?.registrationSource || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginLeft: '0.25rem' }}>
                              {campaign.daysUntilCampaign > 0 ? `${campaign.daysUntilCampaign} days away` :
                                campaign.isToday ? 'Today!' : 'Past'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {campaign.participation?.attendanceStatus === 'Registered' && campaign.isToday && (
                            <button
                              onClick={() => handleMarkCampaignDone(campaign.campaignID)}
                              disabled={loading}
                              className="btn btn-primary btn-sm"
                            >
                              {loading ? 'Marking...' : '✅ Mark as Done'}
                            </button>
                          )}

                          {campaign.participation?.attendanceStatus === 'Registered' && !campaign.hasPassed && (
                            <button
                              onClick={() => handleCampaignCancellation(campaign.campaignID)}
                              disabled={loading}
                              className="btn btn-secondary btn-sm"
                            >
                              {loading ? 'Cancelling...' : '❌ Cancel Registration'}
                            </button>
                          )}

                          {campaign.participation?.attendanceStatus === 'Verified by Hospital' && (
                            <div className="badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                              🎉 Donation Verified - Thank you!
                            </div>
                          )}

                          {campaign.participation?.attendanceStatus === 'Marked Done by Donor' && (
                            <div className="badge-warning" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                              ⏳ Awaiting Hospital Verification
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Donation History Tab */}
          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Donation History</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>Your complete blood donation record and certificates</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="animate-bounce-in" style={{ textAlign: 'right' }}>
                    <div className="stat-number" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{donations.length}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Donations</div>
                  </div>
                  <button
                    onClick={fetchDonorData}
                    className="btn btn-ghost btn-sm"
                  >
                    <svg style={{ width: 16, height: 16, marginRight: '0.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>

              {donations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-tertiary)' }} className="animate-fade-in">
                  <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', opacity: 0.5 }} className="animate-bounce-in">❤️</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No donations recorded</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Your donation history will appear here once you start donating.</p>
                  <button
                    onClick={() => setActiveTab('find-campaigns')}
                    className="btn btn-primary"
                  >
                    🔍 Find Campaigns to Donate
                  </button>
                </div>
              ) : (
                <div className="table-container animate-slide-up">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0a4 4 0 00-4 4v2a4 4 0 004 4h8a4 4 0 004-4v-2a4 4 0 00-4-4" />
                            </svg>
                            Date
                          </div>
                        </th>
                        <th>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Blood Group
                          </div>
                        </th>
                        <th>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Hospital
                          </div>
                        </th>
                        <th>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Status
                          </div>
                        </th>
                        <th>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Blockchain
                          </div>
                        </th>
                        <th>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Certificate
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation, idx) => (
                        <tr key={donation.bloodUnitID} className="animate-fade-in" style={{ animationDelay: `${idx * 0.03}s` }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem' }}>
                                <svg style={{ width: 16, height: 16, color: 'var(--info)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0a4 4 0 00-4 4v2a4 4 0 004 4h8a4 4 0 004-4v-2a4 4 0 00-4-4" />
                                </svg>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {new Date(donation.collectionDate).toLocaleDateString()}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                  {new Date(donation.collectionDate).toLocaleDateString('en-US', { weekday: 'long' })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="blood-badge blood-badge-sm blood-badge-interactive">{donation.bloodGroup}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{donation.originalHospital?.name || 'N/A'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {donation.bloodUnitID}</div>
                          </td>
                          <td>
                            <span className={getStatusColor(donation.status)}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', marginRight: '0.5rem', display: 'inline-block' }}></div>
                              {donation.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.875rem' }}>
                            {donation.donationTxHash ? (
                              <a
                                href={`https://amoy.polygonscan.com/tx/${donation.donationTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-blue)', textDecoration: 'underline', fontWeight: 600 }}
                              >
                                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View TX
                              </a>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-tertiary)' }}>
                                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pending
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.875rem' }}>
                            <button
                              onClick={() => downloadCertificate(donation.bloodUnitID)}
                              disabled={downloadingCert === donation.bloodUnitID}
                              className="btn btn-ghost btn-sm"
                            >
                              {downloadingCert === donation.bloodUnitID ? (
                                <>
                                  <div className="spinner" style={{ width: 16, height: 16, marginRight: '0.5rem' }}></div>
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <svg style={{ width: 16, height: 16, marginRight: '0.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DonorDashboard;
