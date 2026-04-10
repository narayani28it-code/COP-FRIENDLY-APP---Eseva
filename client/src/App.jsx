import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Landing
import Landing from './pages/landing/Landing';

// Auth
import UnifiedLogin from './pages/auth/UnifiedLogin';

// Citizen
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import NewComplaint from './pages/citizen/NewComplaint';
import ComplaintDetail from './pages/citizen/ComplaintDetail';

// Police
import PoliceDashboard from './pages/police/PoliceDashboard';
import PoliceComplaintDetail from './pages/police/PoliceComplaintDetail';
import FIRList from './pages/police/FIRList';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ComplaintsMgmt from './pages/admin/ComplaintsMgmt';
import FIRsMgmt from './pages/admin/FIRsMgmt';
import PoliceMgmt from './pages/admin/PoliceMgmt';
import CitizenMgmt from './pages/admin/CitizenMgmt';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <div className="App-content">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<UnifiedLogin />} />

              {/* Citizen Routes */}
              <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
                <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
                <Route path="/citizen/complaint/new" element={<NewComplaint />} />
                <Route path="/citizen/complaint/:id" element={<ComplaintDetail />} />
              </Route>

              {/* Police Routes */}
              <Route element={<ProtectedRoute allowedRoles={['police']} />}>
                <Route path="/police/dashboard" element={<PoliceDashboard />} />
                <Route path="/police/complaint/:id" element={<PoliceComplaintDetail />} />
                <Route path="/police/firs" element={<FIRList />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/complaints" element={<ComplaintsMgmt />} />
                <Route path="/admin/firs" element={<FIRsMgmt />} />
                <Route path="/admin/police" element={<PoliceMgmt />} />
                <Route path="/admin/citizens" element={<CitizenMgmt />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
