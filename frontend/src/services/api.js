import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getCurrentUser: () => api.get('/api/auth/me')
};

// Donor API
export const donorAPI = {
  getProfile: () => api.get('/api/donor/profile'),
  getDonations: () => api.get('/api/donor/donations'),
  getCertificate: (bloodUnitID) => api.get(`/api/donor/certificate/${bloodUnitID}`, {
    responseType: 'blob'
  }),
  
  // Campaign Management
  getCampaigns: (params) => api.get('/api/donor/campaigns', { params })
};

// Hospital API
export const hospitalAPI = {
  getDashboardStats: () => api.get('/api/hospital/dashboard-stats'),
  getInventory: (params) => api.get('/api/hospital/inventory', { params }),
  getVerifiedHospitals: () => api.get('/api/hospital/verified-hospitals'),
  recordDonation: (data) => api.post('/api/hospital/donate', data),
  updateBloodUnitStatus: (bloodUnitID, status) => 
    api.patch(`/api/hospital/blood-unit/${bloodUnitID}/status`, { status }),
  transferBlood: (data) => api.post('/api/hospital/transfer', data),
  recordUsage: (data) => api.post('/api/hospital/use', data),
  createEmergencyRequest: (data) => api.post('/api/hospital/emergency-request', data),
  getEmergencyRequests: (params) => api.get('/api/hospital/emergency-requests', { params }),
  fulfillEmergencyRequest: (requestID) => 
    api.patch(`/api/hospital/emergency-request/${requestID}/fulfill`),
  predictDemand: (bloodGroup) => api.get(`/api/hospital/predict-demand/${bloodGroup}`),
  
  // Campaign Management
  getCampaigns: (params) => api.get('/api/hospital/campaigns', { params }),
  createCampaign: (data) => api.post('/api/hospital/campaigns', data),
  updateCampaign: (campaignID, data) => api.patch(`/api/hospital/campaigns/${campaignID}`, data),
  deleteCampaign: (campaignID) => api.delete(`/api/hospital/campaigns/${campaignID}`),
  updateCampaignStatus: (campaignID, status) => 
    api.patch(`/api/hospital/campaigns/${campaignID}/status`, { status }),
  getCampaignParticipants: (campaignID, params) => 
    api.get(`/api/hospital/campaigns/${campaignID}/participants`, { params }),
  verifyCampaignDonation: (campaignID, data) => 
    api.post(`/api/hospital/campaigns/${campaignID}/verify-donation`, data),
  markParticipantAbsent: (campaignID, donorID) => 
    api.patch(`/api/hospital/campaigns/${campaignID}/participants/${donorID}/absent`)
};

// Admin API
export const adminAPI = {
  getPendingHospitals: () => api.get('/api/admin/pending-hospitals'),
  verifyHospital: (hospitalID) => api.post(`/api/admin/verify-hospital/${hospitalID}`),
  rejectHospital: (hospitalID) => api.delete(`/api/admin/reject-hospital/${hospitalID}`),
  getStatistics: () => api.get('/api/admin/statistics'),
  getDetailedStatistics: () => api.get('/api/admin/detailed-statistics'),
  getHospitalInventories: () => api.get('/api/admin/hospital-inventories'),
  getAllBloodUnits: () => api.get('/api/admin/all-blood-units')
};

// Blockchain API
export const blockchainAPI = {
  getMilestones: (bloodUnitID) => api.get(`/api/blockchain/milestones/${bloodUnitID}`),
  verifyTransaction: (txHash) => api.get(`/api/blockchain/verify/${txHash}`)
};

// System API
export const systemAPI = {
  getHealth: () => api.get('/api/health')
};

// Campaign API (Public)
export const campaignAPI = {
  getActiveCampaigns: (params) => api.get('/api/campaigns/active', { params }),
  registerForCampaign: (campaignID) => api.post(`/api/campaigns/${campaignID}/register`),
  markCampaignDone: (campaignID) => api.post(`/api/campaigns/${campaignID}/mark-done`),
  cancelCampaignRegistration: (campaignID) => api.delete(`/api/campaigns/${campaignID}/register`)
};

// Public API
export const publicAPI = {
  getBloodAvailability: (params) => api.get('/api/public/blood-availability', { params }),
  getHospitals: (params) => api.get('/api/public/hospitals', { params })
};

export default api;
