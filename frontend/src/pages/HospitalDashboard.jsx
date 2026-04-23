import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { hospitalAPI, adminAPI } from '../services/api';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import TabNavigation from '../components/TabNavigation';
import ActionButton from '../components/ActionButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const HospitalDashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(user?.isVerified ? 'overview' : 'verification');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  // Filters
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Forms
  const [donationForm, setDonationForm] = useState({
    donorEmail: '',
    bloodGroup: '',
    collectionDate: new Date().toISOString().split('T')[0]
  });
  const [donorInfo, setDonorInfo] = useState(null);

  const [transferForm, setTransferForm] = useState({
    bloodUnitID: '',
    destinationHospitalID: ''
  });
  const [hospitals, setHospitals] = useState([]);

  const [usageForm, setUsageForm] = useState({
    bloodUnitID: '',
    patientID: ''
  });

  const [emergencyForm, setEmergencyForm] = useState({
    bloodGroup: '',
    quantity: 1,
    urgencyLevel: 'High',
    notes: ''
  });
  const [emergencyRequests, setEmergencyRequests] = useState([]);

  const [demandBloodGroup, setDemandBloodGroup] = useState('O+');
  const [demandPrediction, setDemandPrediction] = useState(null);

  // Campaign state
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    venue: {
      name: '',
      address: '',
      city: user?.city || '',
      pincode: user?.pincode || ''
    },
    campaignDate: '',
    startTime: '',
    endTime: '',
    bloodGroupsNeeded: [],
    targetQuantity: 10
  });
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignParticipants, setCampaignParticipants] = useState([]);

  useEffect(() => {
    if (!user?.isVerified) {
      setActiveTab('verification');
      return;
    }

    if (activeTab === 'overview') {
      fetchDashboardStats();
    } else if (activeTab === 'inventory') {
      fetchInventory();
    } else if (activeTab === 'emergency') {
      fetchEmergencyRequests();
    } else if (activeTab === 'campaigns') {
      fetchCampaigns();
    }
  }, [activeTab, bloodGroupFilter, statusFilter, campaignStatusFilter, user?.isVerified]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await hospitalAPI.getDashboardStats();
      setDashboardStats(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefreshStatus = async () => {
    setRefreshingStatus(true);
    setError('');
    setSuccess('');

    const result = await refreshUser();

    if (result.success) {
      if (result.user.isVerified) {
        setSuccess('✅ Your hospital has been verified! You now have access to all features.');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError('Your hospital is still pending verification. Please wait for admin approval.');
        setTimeout(() => setError(''), 3000);
      }
    } else {
      setError('Failed to refresh status. Please try logging out and back in.');
    }

    setRefreshingStatus(false);
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await hospitalAPI.getInventory(params);
      setInventory(response.data.data.inventory);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const searchDonor = async () => {
    if (!donationForm.donorEmail) {
      setError('Please enter donor email');
      return;
    }

    try {
      setLoading(true);
      setDonorInfo({ email: donationForm.donorEmail, status: 'Searching...' });
      setError('');
    } catch (err) {
      setError('Donor not found');
      setDonorInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await hospitalAPI.recordDonation(donationForm);
      const bloodUnitID = response.data.data.bloodUnitID;
      const blockchainStatus = response.data.data.blockchainStatus || 'Pending';

      setSuccess(`✅ Donation recorded successfully! Blood Unit ID: ${bloodUnitID} | Blockchain: ${blockchainStatus}`);

      setDonationForm({
        donorEmail: '',
        bloodGroup: '',
        collectionDate: new Date().toISOString().split('T')[0]
      });
      setDonorInfo(null);
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record donation');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await hospitalAPI.transferBlood(transferForm);
      const data = response.data.data;
      setSuccess(`✅ Blood unit transferred successfully! From: ${data.fromHospital} → To: ${data.toHospital} | Blockchain: ${data.blockchainStatus}`);

      setTransferForm({ bloodUnitID: '', destinationHospitalID: '' });
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to transfer blood');
    } finally {
      setLoading(false);
    }
  };

  const handleUsageSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await hospitalAPI.recordUsage(usageForm);
      const data = response.data.data;
      setSuccess(`✅ Blood usage recorded successfully! Blood Unit: ${data.bloodUnitID} | Patient: ${usageForm.patientID} | Blockchain: ${data.blockchainStatus}`);

      setUsageForm({ bloodUnitID: '', patientID: '' });
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record usage');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const requestData = {
        ...emergencyForm,
        city: user?.city || 'Mumbai',
        pincode: user?.pincode || '400001'
      };

      const response = await hospitalAPI.createEmergencyRequest(requestData);
      setSuccess(`✅ Emergency request created! ${response.data.data.notifiedDonors} donors notified.`);

      setEmergencyForm({
        bloodGroup: 'O+',
        quantity: 1,
        urgencyLevel: 'High',
        notes: ''
      });
      fetchEmergencyRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create emergency request');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyRequests = async () => {
    try {
      const response = await hospitalAPI.getEmergencyRequests({ status: 'Active' });
      setEmergencyRequests(response.data.data.requests);
    } catch (err) {
      console.error('Failed to fetch emergency requests:', err);
    }
  };

  const fulfillEmergencyRequest = async (requestID) => {
    try {
      await hospitalAPI.fulfillEmergencyRequest(requestID);
      setSuccess('Emergency request fulfilled!');
      fetchEmergencyRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fulfill request');
    }
  };

  const fetchDemandPrediction = async () => {
    try {
      setLoading(true);
      const response = await hospitalAPI.predictDemand(demandBloodGroup);
      setDemandPrediction(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch demand prediction');
      setDemandPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedHospitals = async () => {
    try {
      const response = await hospitalAPI.getVerifiedHospitals();
      setHospitals(response.data.data.hospitals);
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
      setError('Failed to load hospitals for transfer');
    }
  };

  useEffect(() => {
    if (activeTab === 'transfer' && hospitals.length === 0) {
      fetchVerifiedHospitals();
    }
  }, [activeTab]);

  // Campaign functions
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (campaignStatusFilter) params.status = campaignStatusFilter;

      const response = await hospitalAPI.getCampaigns(params);
      setCampaigns(response.data.data.campaigns);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await hospitalAPI.createCampaign(campaignForm);
      setSuccess(`✅ Campaign created successfully! Campaign ID: ${response.data.data.campaignID}`);

      setCampaignForm({
        title: '',
        description: '',
        venue: {
          name: '',
          address: '',
          city: user?.city || '',
          pincode: user?.pincode || ''
        },
        campaignDate: '',
        startTime: '',
        endTime: '',
        bloodGroupsNeeded: [],
        targetQuantity: 10
      });
      setShowCreateCampaign(false);
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignStatusUpdate = async (campaignID, newStatus) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await hospitalAPI.updateCampaignStatus(campaignID, newStatus);
      const data = response.data.data;

      if (newStatus === 'Active' && data.invitationsSent) {
        setSuccess(`✅ Campaign activated! ${data.invitationsSent} invitation emails sent to eligible donors.`);
      } else {
        setSuccess(`✅ Campaign status updated to ${newStatus}`);
      }

      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update campaign status');
    } finally {
      setLoading(false);
    }
  };

  const handleBloodGroupToggle = (bloodGroup) => {
    const currentGroups = campaignForm.bloodGroupsNeeded;
    const updatedGroups = currentGroups.includes(bloodGroup)
      ? currentGroups.filter(bg => bg !== bloodGroup)
      : [...currentGroups, bloodGroup];

    setCampaignForm({
      ...campaignForm,
      bloodGroupsNeeded: updatedGroups
    });
  };

  const fetchCampaignParticipants = async (campaignID) => {
    try {
      setLoading(true);
      const response = await hospitalAPI.getCampaignParticipants(campaignID);
      setCampaignParticipants(response.data.data.participants);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDonation = async (campaignID, donorID, bloodGroup) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await hospitalAPI.verifyCampaignDonation(campaignID, {
        donorID,
        bloodGroup,
        collectionDate: new Date().toISOString().split('T')[0]
      });

      const data = response.data.data;
      setSuccess(`✅ Donation verified! Blood Unit ID: ${data.bloodUnitID} | Blockchain: ${data.blockchainStatus}`);

      fetchCampaignParticipants(campaignID);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify donation');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async (campaignID, donorID) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await hospitalAPI.markParticipantAbsent(campaignID, donorID);
      setSuccess('✅ Participant marked as absent');

      fetchCampaignParticipants(campaignID);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as absent');
    } finally {
      setLoading(false);
    }
  };

  const getExpiryColor = (daysUntilExpiry) => {
    if (daysUntilExpiry < 3) return 'expiry-danger';
    if (daysUntilExpiry <= 7) return 'expiry-warn';
    return 'expiry-ok';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Collected': 'badge-info',
      'Stored': 'badge-info',
      'Transferred': 'badge-warning',
      'Used': 'badge-success',
      'Expired': 'badge-primary'
    };
    return colors[status] || 'badge';
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
        {/* Page Hero */}
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
            }}>Hospital Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{user?.hospitalName || 'Blood Management System'}</p>
          </div>
          {user?.isVerified ? (
            <span className="badge-success">Verified</span>
          ) : (
            <span className="badge-warning">Pending Approval</span>
          )}
        </div>

        {/* Verification Warning */}
        {!user?.isVerified && (
          <div className="animate-slide-down" style={{
            padding: '1rem 1.25rem',
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#92400E'
          }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div style={{ flex: 1 }}>
              <strong>Pending Admin Verification</strong>
              <p style={{ marginTop: 4, fontSize: '0.875rem' }}>Your hospital account is awaiting admin approval. Click "Check Status" after admin approves.</p>
            </div>
            <button onClick={handleRefreshStatus} disabled={refreshingStatus} className="btn btn-secondary btn-sm">
              {refreshingStatus ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        )}

        {/* Tabs */}
        {user?.isVerified && (
          <TabNavigation
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'inventory', label: 'Blood Inventory' },
              { id: 'campaigns', label: 'Campaigns' },
              { id: 'donation', label: 'Record Donation' },
              { id: 'transfer', label: 'Transfer' },
              { id: 'usage', label: 'Record Usage' },
              { id: 'emergency', label: 'Emergency' },
              { id: 'ai', label: 'AI Predictions' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        {/* Messages */}
        {error && <ErrorMessage message={error} onRetry={() => setError('')} />}
        {success && (
          <div className="animate-slide-down" style={{
            padding: '1rem 1.25rem',
            background: 'var(--success-bg)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1rem',
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
        {user?.isVerified ? (
          <div className="card-3d animate-slide-up delay-100" style={{ padding: '2rem' }}>
            {/* Dashboard Overview Tab */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Hospital Dashboard</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Real-time overview of your hospital's blood management</p>
                  </div>
                  <button onClick={fetchDashboardStats} disabled={loading} className="btn btn-ghost btn-sm">
                    🔄 Refresh
                  </button>
                </div>

                {loading && !dashboardStats ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <LoadingSpinner size="lg" text="Loading dashboard..." />
                  </div>
                ) : dashboardStats ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
                      <div className="stat-card stat-card-red animate-slide-up">
                        <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-100)', borderRadius: 'var(--radius-lg)', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Blood Units</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{dashboardStats.totalUnits || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>In your inventory</div>
                      </div>
                      <div className="stat-card stat-card-green animate-slide-up delay-100">
                        <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--success-bg)', borderRadius: 'var(--radius-lg)', color: 'var(--success)', marginBottom: '0.75rem' }}>
                          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Available Units</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{dashboardStats.availableUnits || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Ready for use</div>
                      </div>
                      <div className="stat-card stat-card-purple animate-slide-up delay-200">
                        <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDE9FE', borderRadius: 'var(--radius-lg)', color: 'var(--accent-purple)', marginBottom: '0.75rem' }}>
                          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Active Campaigns</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{dashboardStats.activeCampaigns || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Running campaigns</div>
                      </div>
                      <div className="stat-card stat-card-yellow animate-slide-up delay-300">
                        <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--warning-bg)', borderRadius: 'var(--radius-lg)', color: 'var(--warning)', marginBottom: '0.75rem' }}>
                          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Emergency Requests</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{dashboardStats.emergencyRequests || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Active requests</div>
                      </div>
                    </div>

                    {/* Blood Group Distribution */}
                    {dashboardStats.bloodGroupDistribution && Object.keys(dashboardStats.bloodGroupDistribution).length > 0 && (
                      <div className="card-3d animate-slide-up delay-100">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Blood Group Distribution</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--spacing-lg)' }}>
                          {Object.entries(dashboardStats.bloodGroupDistribution).map(([bloodGroup, count]) => (
                            <div key={bloodGroup} style={{ textAlign: 'center' }}>
                              <div className="blood-badge-lg" style={{ margin: '0 auto 0.5rem' }}>{bloodGroup}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{count} units</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Activity */}
                    {dashboardStats.recentActivity && dashboardStats.recentActivity.length > 0 && (
                      <div className="card-3d animate-slide-up delay-200">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Recent Activity</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {dashboardStats.recentActivity.slice(0, 6).map((activity, index) => (
                            <div key={index} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-base)', cursor: 'pointer' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{activity.description}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{new Date(activity.timestamp).toLocaleString()}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-tertiary)' }} className="animate-fade-in">
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', opacity: 0.5 }}>📊</div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No dashboard data available</p>
                    <button onClick={fetchDashboardStats} disabled={loading} className="btn btn-primary">
                      Load Dashboard Data
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>🩸 Blood Inventory</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Track all blood units by group and expiry status</p>
                  </div>
                  <button onClick={fetchInventory} className="btn btn-ghost btn-sm">↺ Refresh</button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  <select value={bloodGroupFilter} onChange={(e) => setBloodGroupFilter(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: 150 }}>
                    <option value="">All Blood Groups</option>
                    {bloodGroups.map(bg => (<option key={bg} value={bg}>{bg}</option>))}
                  </select>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: 150 }}>
                    <option value="">All Statuses</option>
                    <option value="Collected">Collected</option>
                    <option value="Stored">Stored</option>
                    <option value="Transferred">Transferred</option>
                    <option value="Used">Used</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                {/* Inventory Table */}
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><LoadingSpinner text="Loading inventory..." /></div>
                ) : inventory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-tertiary)' }} className="animate-fade-in">
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', opacity: 0.5 }}>🩸</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No blood units found</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Try adjusting the filters above</div>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead><tr>
                        <th>Blood Unit ID</th><th>Group</th><th>Collection</th><th>Expiry</th><th>Days Left</th><th>Status</th>
                      </tr></thead>
                      <tbody>
                        {inventory.map((unit) => {
                          const d = unit.daysUntilExpiry;
                          const exClass = getExpiryColor(d);
                          return (
                            <tr key={unit.bloodUnitID}>
                              <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>{unit.bloodUnitID}</td>
                              <td><span className="blood-badge">{unit.bloodGroup}</span></td>
                              <td>{new Date(unit.collectionDate).toLocaleDateString()}</td>
                              <td>{new Date(unit.expiryDate).toLocaleDateString()}</td>
                              <td><span className={exClass} style={{ fontWeight: 600 }}>{d > 0 ? `${d} days` : `Expired`}</span></td>
                              <td><span className={`badge ${getStatusColor(unit.status)}`}>{unit.status}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Campaign Management</h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setShowCreateCampaign(true)} className="btn btn-primary btn-sm">
                      Create Campaign
                    </button>
                    <button onClick={fetchCampaigns} className="btn btn-ghost btn-sm">
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Create Campaign Form */}
                {showCreateCampaign && (
                  <div className="card-glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create New Campaign</h3>
                      <button onClick={() => setShowCreateCampaign(false)} className="btn btn-ghost btn-sm">
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCampaignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                        <div className="form-group">
                          <label className="form-label">Campaign Title *</label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            value={campaignForm.title}
                            onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                            placeholder="e.g., Emergency Blood Drive - Mumbai"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Target Quantity *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            className="form-input"
                            value={campaignForm.targetQuantity}
                            onChange={(e) => setCampaignForm({ ...campaignForm, targetQuantity: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea
                          required
                          rows="3"
                          className="form-input"
                          value={campaignForm.description}
                          onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                          placeholder="Describe the campaign purpose and any special requirements..."
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                        <div className="form-group">
                          <label className="form-label">Venue Name *</label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            value={campaignForm.venue.name}
                            onChange={(e) => setCampaignForm({
                              ...campaignForm,
                              venue: { ...campaignForm.venue, name: e.target.value }
                            })}
                            placeholder="e.g., Community Center Hall"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Campaign Date *</label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="form-input"
                            value={campaignForm.campaignDate}
                            onChange={(e) => setCampaignForm({ ...campaignForm, campaignDate: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Venue Address *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={campaignForm.venue.address}
                          onChange={(e) => setCampaignForm({
                            ...campaignForm,
                            venue: { ...campaignForm.venue, address: e.target.value }
                          })}
                          placeholder="Full address of the venue"
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: "1rem" }}>
                        <div className="form-group">
                          <label className="form-label">City *</label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            value={campaignForm.venue.city}
                            onChange={(e) => setCampaignForm({
                              ...campaignForm,
                              venue: { ...campaignForm.venue, city: e.target.value }
                            })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Pincode *</label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            value={campaignForm.venue.pincode}
                            onChange={(e) => setCampaignForm({
                              ...campaignForm,
                              venue: { ...campaignForm.venue, pincode: e.target.value }
                            })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Start Time *</label>
                          <input
                            type="time"
                            required
                            className="form-input"
                            value={campaignForm.startTime}
                            onChange={(e) => setCampaignForm({ ...campaignForm, startTime: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">End Time *</label>
                          <input
                            type="time"
                            required
                            className="form-input"
                            value={campaignForm.endTime}
                            onChange={(e) => setCampaignForm({ ...campaignForm, endTime: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Blood Groups Needed * (Select multiple)</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "1rem", marginTop: '0.5rem' }}>
                          {bloodGroups.map(bg => (
                            <label key={bg} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={campaignForm.bloodGroupsNeeded.includes(bg)}
                                onChange={() => handleBloodGroupToggle(bg)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              <span className="blood-badge-sm">{bg}</span>
                            </label>
                          ))}
                        </div>
                        {campaignForm.bloodGroupsNeeded.length === 0 && (
                          <p style={{ color: 'var(--primary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Please select at least one blood group</p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          type="submit"
                          disabled={loading || campaignForm.bloodGroupsNeeded.length === 0}
                          className="btn btn-primary"
                        >
                          {loading ? 'Creating...' : 'Create Campaign'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateCampaign(false)}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Campaign Filters */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <select
                    value={campaignStatusFilter}
                    onChange={(e) => setCampaignStatusFilter(e.target.value)}
                    className="form-input"
                    style={{ width: 'auto', minWidth: 150 }}
                  >
                    <option value="">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Campaigns List */}
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "var(--spacing-2xl)", color: "var(--text-tertiary)" }} className="animate-fade-in">
                    <div style={{ fontSize: "4rem", marginBottom: "var(--spacing-lg)", opacity: 0.5 }}>📋</div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No campaigns found.</p>
                    <button
                      onClick={() => setShowCreateCampaign(true)}
                      className="btn btn-primary"
                    >
                      Create Your First Campaign
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {campaigns.map((campaign) => (
                      <div key={campaign.campaignID} className="card-3d">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{campaign.title}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{campaign.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              <span>📅 {new Date(campaign.campaignDate).toLocaleDateString()}</span>
                              <span>🕐 {campaign.startTime} - {campaign.endTime}</span>
                              <span>📍 {campaign.venue.name}, {campaign.venue.city}</span>
                            </div>
                          </div>
                          <div>
                            <span className={`badge ${campaign.status === 'Active' ? 'badge-success' :
                              campaign.status === 'Draft' ? 'badge-warning' :
                                campaign.status === 'Completed' ? 'badge-info' :
                                  'badge-primary'
                              }`}>
                              {campaign.status}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: 'repeat(4,1fr)', gap: "1rem", marginBottom: '1rem', fontSize: '0.875rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-secondary)' }}>Blood Groups:</span>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{campaign.bloodGroupsNeeded.join(', ')}</div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-secondary)' }}>Target:</span>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{campaign.targetQuantity} units</div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-secondary)' }}>Registered:</span>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{campaign.registeredCount} donors</div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-secondary)' }}>Collected:</span>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{campaign.collectedCount || 0} units</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {campaign.status === 'Draft' && (
                            <>
                              <button
                                onClick={() => handleCampaignStatusUpdate(campaign.campaignID, 'Active')}
                                className="btn btn-primary btn-sm"
                              >
                                Activate & Send Invitations
                              </button>
                              <button
                                onClick={() => handleCampaignStatusUpdate(campaign.campaignID, 'Cancelled')}
                                className="btn btn-secondary btn-sm"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {campaign.status === 'Active' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedCampaign(campaign);
                                  fetchCampaignParticipants(campaign.campaignID);
                                }}
                                className="btn btn-primary btn-sm"
                              >
                                Manage Participants ({campaign.registeredCount})
                              </button>
                              <button
                                onClick={() => handleCampaignStatusUpdate(campaign.campaignID, 'Completed')}
                                className="btn btn-secondary btn-sm"
                              >
                                Mark Complete
                              </button>
                            </>
                          )}

                          <span className="badge" style={{ fontSize: '0.7rem' }}>
                            ID: {campaign.campaignID}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Campaign Participants Modal */}
                {selectedCampaign && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div className="card-glass" style={{ padding: '1.5rem', maxWidth: '1000px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Participants - {selectedCampaign.title}
                        </h3>
                        <button
                          onClick={() => {
                            setSelectedCampaign(null);
                            setCampaignParticipants([]);
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          ✕
                        </button>
                      </div>

                      {campaignParticipants.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No participants registered yet.</p>
                      ) : (
                        <div className="table-container">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Donor</th>
                                <th>Blood Group</th>
                                <th>Status</th>
                                <th>Contact</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {campaignParticipants.map((participant) => (
                                <tr key={participant.donor?.id || participant.participantID}>
                                  <td>
                                    <div>
                                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {participant.donor?.name || 'N/A'}
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {participant.donor?.city}, {participant.donor?.pincode}
                                      </div>
                                    </div>
                                  </td>
                                  <td><span className="blood-badge">{participant.donor?.bloodGroup || 'N/A'}</span></td>
                                  <td>
                                    <span className={`badge ${participant.attendance?.status === 'Registered' ? 'badge-info' :
                                      participant.attendance?.status === 'Marked Done by Donor' ? 'badge-warning' :
                                        participant.attendance?.status === 'Verified by Hospital' ? 'badge-success' :
                                          'badge-primary'
                                      }`}>
                                      {participant.attendance?.status || 'Unknown'}
                                    </span>
                                  </td>
                                  <td style={{ fontSize: '0.875rem' }}>
                                    <div>{participant.donor?.email || 'N/A'}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{participant.donor?.phone || 'N/A'}</div>
                                  </td>
                                  <td>
                                    {participant.attendance?.status === 'Marked Done by Donor' && (
                                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                          onClick={() => handleVerifyDonation(
                                            selectedCampaign.campaignID,
                                            participant.donor?.id,
                                            participant.donor?.bloodGroup
                                          )}
                                          className="btn btn-primary btn-sm"
                                        >
                                          Verify Donation
                                        </button>
                                        <button
                                          onClick={() => handleMarkAbsent(selectedCampaign.campaignID, participant.donor?.id)}
                                          className="btn btn-secondary btn-sm"
                                        >
                                          Mark Absent
                                        </button>
                                      </div>
                                    )}
                                    {participant.attendance?.status === 'Registered' && (
                                      <button
                                        onClick={() => handleMarkAbsent(selectedCampaign.campaignID, participant.donor?.id)}
                                        className="btn btn-secondary btn-sm"
                                      >
                                        Mark Absent
                                      </button>
                                    )}
                                    {participant.attendance?.status === 'Verified by Hospital' && (
                                      <span style={{ color: 'var(--success)', fontSize: '0.875rem' }}>✅ Completed</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Record Donation Tab */}
            {activeTab === 'donation' && (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>Record Blood Donation</h2>

                <form onSubmit={handleDonationSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Donor Email *</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="email"
                        required
                        className="form-input"
                        style={{ flex: 1 }}
                        value={donationForm.donorEmail}
                        onChange={(e) => setDonationForm({ ...donationForm, donorEmail: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={searchDonor}
                        className="btn btn-secondary"
                      >
                        Search
                      </button>
                    </div>
                    {donorInfo && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Donor found: {donorInfo.email}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Group *</label>
                    <select
                      required
                      className="form-input"
                      value={donationForm.bloodGroup}
                      onChange={(e) => setDonationForm({ ...donationForm, bloodGroup: e.target.value })}
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Collection Date *</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={donationForm.collectionDate}
                      onChange={(e) => setDonationForm({ ...donationForm, collectionDate: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Recording...' : 'Record Donation'}
                  </button>
                </form>
              </div>
            )}

            {/* Transfer Blood Tab */}
            {activeTab === 'transfer' && (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>Transfer Blood Unit</h2>

                <form onSubmit={handleTransferSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Blood Unit ID *</label>
                    <select
                      required
                      className="form-input"
                      value={transferForm.bloodUnitID}
                      onChange={(e) => setTransferForm({ ...transferForm, bloodUnitID: e.target.value })}
                    >
                      <option value="">Select Blood Unit</option>
                      {inventory.filter(u => u.status === 'Stored' || u.status === 'Collected').map(unit => (
                        <option key={unit.bloodUnitID} value={unit.bloodUnitID}>
                          {unit.bloodUnitID} - {unit.bloodGroup}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination Hospital *</label>
                    <select
                      required
                      className="form-input"
                      value={transferForm.destinationHospitalID}
                      onChange={(e) => setTransferForm({ ...transferForm, destinationHospitalID: e.target.value })}
                    >
                      <option value="">Select Hospital</option>
                      {hospitals.map(h => (
                        <option key={h.hospitalID} value={h.hospitalID}>
                          {h.hospitalName} - {h.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Transferring...' : 'Transfer Blood Unit'}
                  </button>
                </form>
              </div>
            )}

            {/* Record Usage Tab */}
            {activeTab === 'usage' && (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>Record Blood Usage</h2>

                <form onSubmit={handleUsageSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Blood Unit ID *</label>
                    <select
                      required
                      className="form-input"
                      value={usageForm.bloodUnitID}
                      onChange={(e) => setUsageForm({ ...usageForm, bloodUnitID: e.target.value })}
                    >
                      <option value="">Select Blood Unit</option>
                      {inventory.filter(u => u.status === 'Stored' || u.status === 'Collected').map(unit => (
                        <option key={unit.bloodUnitID} value={unit.bloodUnitID}>
                          {unit.bloodUnitID} - {unit.bloodGroup}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Patient ID *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Enter patient ID"
                      value={usageForm.patientID}
                      onChange={(e) => setUsageForm({ ...usageForm, patientID: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-secondary"
                  >
                    {loading ? 'Recording...' : 'Record Usage'}
                  </button>
                </form>
              </div>
            )}

            {/* Emergency Requests Tab */}
            {activeTab === 'emergency' && (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>Emergency Requests</h2>

                {/* Create Emergency Request Form */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Create New Emergency Request</h3>
                  <form onSubmit={handleEmergencySubmit} style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                      <div className="form-group">
                        <label className="form-label">Blood Group *</label>
                        <select
                          required
                          className="form-input"
                          value={emergencyForm.bloodGroup}
                          onChange={(e) => setEmergencyForm({ ...emergencyForm, bloodGroup: e.target.value })}
                        >
                          <option value="">Select Blood Group</option>
                          {bloodGroups.map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Quantity *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="form-input"
                          value={emergencyForm.quantity}
                          onChange={(e) => setEmergencyForm({ ...emergencyForm, quantity: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Urgency Level *</label>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        {['Critical', 'High', 'Medium'].map(level => (
                          <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="urgency"
                              value={level}
                              checked={emergencyForm.urgencyLevel === level}
                              onChange={(e) => setEmergencyForm({ ...emergencyForm, urgencyLevel: e.target.value })}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <span className={`badge ${level === 'Critical' ? 'badge-primary' :
                              level === 'High' ? 'badge-warning' :
                                'badge-info'
                              }`}>{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-input"
                        rows="3"
                        placeholder="Additional information..."
                        value={emergencyForm.notes}
                        onChange={(e) => setEmergencyForm({ ...emergencyForm, notes: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary animate-pulse"
                    >
                      {loading ? 'Creating...' : 'Create Emergency Request'}
                    </button>
                  </form>
                </div>

                {/* Active Emergency Requests */}
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Active Emergency Requests</h3>
                  {emergencyRequests.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No active emergency requests.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {emergencyRequests.map(req => (
                        <div key={req.requestID || req._id} className="card-3d">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                <span className="blood-badge" style={{ marginRight: '0.5rem' }}>{req.bloodGroup}</span>
                                {req.quantity} units
                              </p>
                              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                Urgency: <span className={`badge ${req.urgencyLevel === 'Critical' ? 'badge-primary' :
                                  req.urgencyLevel === 'High' ? 'badge-warning' :
                                    'badge-info'
                                  }`}>{req.urgencyLevel}</span>
                              </p>
                              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Location: {req.location?.city || 'N/A'}, {req.location?.pincode || 'N/A'}
                              </p>
                              {req.notes && (
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Notes: {req.notes}</p>
                              )}
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                Created: {new Date(req.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => fulfillEmergencyRequest(req.requestID || req._id)}
                              className="btn btn-primary"
                            >
                              Mark Fulfilled
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Demand Prediction Tab */}
            {activeTab === 'ai' && (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>AI Demand Prediction</h2>

                <div style={{ maxWidth: '700px' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <select
                      className="form-input"
                      style={{ flex: 1 }}
                      value={demandBloodGroup}
                      onChange={(e) => setDemandBloodGroup(e.target.value)}
                    >
                      {bloodGroups.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                    <button
                      onClick={fetchDemandPrediction}
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? 'Predicting...' : 'Get Prediction'}
                    </button>
                  </div>

                  {demandPrediction && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="stat-card stat-card-blue">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>7-Day Forecast for {demandBloodGroup}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                          Current Inventory: {demandPrediction.currentInventory} units |
                          Historical Data Points: {demandPrediction.historicalDataPoints}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {demandPrediction.predictions && demandPrediction.predictions.length > 0 ? (
                            demandPrediction.predictions.map((pred, index) => (
                              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Day {pred.day || index + 1}</span>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{pred.predictedDemand?.toFixed(1) || 0} units</span>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No prediction data available</p>
                          )}
                        </div>
                        {demandPrediction.totalPredictedDemand && (
                          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                              <span style={{ color: 'var(--text-primary)' }}>Total 7-Day Demand:</span>
                              <span style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}>{demandPrediction.totalPredictedDemand.toFixed(1)} units</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="stat-card stat-card-green">
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Recommendation</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{demandPrediction.recommendation}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>
                          Confidence: {((demandPrediction.confidence || 0.5) * 100).toFixed(1)}% |
                          AI Service: {demandPrediction.aiServiceStatus || 'unknown'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card-3d" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Welcome, {user?.hospitalName}!</h2>
            <div style={{
              padding: '1rem 1.25rem',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-lg)',
              color: '#92400E'
            }}>
              Your hospital account is pending admin verification. You'll be able to access all features once approved.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HospitalDashboard;
