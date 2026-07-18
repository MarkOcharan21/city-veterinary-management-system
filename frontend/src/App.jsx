// Main application component with routing and authentication context - Developed by Mark Lawrence Ocharan

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pets from './pages/Pets';
import Owners from "./pages/Owners";
import Vaccinations from './pages/Vaccinations';
import Payments from './pages/Payments';
import Records from './pages/Records';
import Users from './pages/Users';

// Placeholders — replace as we build each module

const Barangay      = () => <div className="p-8 text-gray-400">Barangay Analytics — coming soon</div>;
const SystemRecords = () => <div className="p-8 text-gray-400">System Records — coming soon</div>;
const Reports       = () => <div className="p-8 text-gray-400">Reports — coming soon</div>;
const AuditTrail    = () => <div className="p-8 text-gray-400">Audit Trail — coming soon</div>;
const Drafts        = () => <div className="p-8 text-gray-400">Offline Drafts — coming soon</div>;

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard"      element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} />
      <Route path="/pets"           element={<ProtectedRoute><Pets /></ProtectedRoute>} />
      <Route path="/owners"         element={<ProtectedRoute roles={['admin','staff']}><Owners /></ProtectedRoute>} />
      <Route path="/vaccinations"   element={<ProtectedRoute roles={['admin','veterinarian']}><Vaccinations /></ProtectedRoute>} />
      <Route path="/payments"       element={<ProtectedRoute roles={['admin','staff']}><Payments /></ProtectedRoute>} />
      <Route path="/records"        element={<ProtectedRoute roles={['admin','veterinarian']}><Records /></ProtectedRoute>} />
      <Route path="/barangay"       element={<ProtectedRoute roles={['admin']}><Barangay /></ProtectedRoute>} />
      <Route path="/system-records" element={<ProtectedRoute roles={['admin']}><SystemRecords /></ProtectedRoute>} />
      <Route path="/reports"        element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
      <Route path="/users"          element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
      <Route path="/audit"          element={<ProtectedRoute roles={['admin']}><AuditTrail /></ProtectedRoute>} />
      <Route path="/drafts"         element={<ProtectedRoute roles={['admin']}><Drafts /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}