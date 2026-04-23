import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminPanel from './pages/AdminPanel';
import Unauthorized from './pages/Unauthorized';
import PublicBloodSearch from './pages/PublicBloodSearch';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blood-search" element={<PublicBloodSearch />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes - Donor */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Hospital */}
          <Route
            path="/hospital/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Hospital']}>
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/panel"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
