import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { PageTransition } from '../components/layout/PageTransition';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { AboutUs } from '../pages/public/AboutUs';
import { Services } from '../pages/public/Services';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';
import { AIAssistant } from '../pages/public/AIAssistant';

// Citizen Pages
import { CreatePermit } from '../pages/citizen/CreatePermit';
import { CreateComplaint } from '../pages/citizen/CreateComplaint';
import { Profile } from '../pages/citizen/Profile';

// Public Footer Pages
import { Contact } from '../pages/public/Contact';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminPermitList } from '../pages/admin/AdminPermitList';
import { AdminUserList } from '../pages/admin/AdminUserList';
import { AdminComplaintList } from '../pages/admin/AdminComplaintList';

// Placeholder
const Placeholder = ({ title }: { title: string }) => (
  <PageTransition>
    <div className="p-8"><h1 className="text-2xl font-bold">{title}</h1></div>
  </PageTransition>
);

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/ai-assistant" element={<ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}><PageTransition><AIAssistant /></PageTransition></ProtectedRoute>} />
          <Route path="/permits" element={<ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}><Navigate to="/citizen/permits/create" replace /></ProtectedRoute>} />
          <Route path="/permits/create" element={<ProtectedRoute allowedRoles={['CITIZEN']}><Navigate to="/citizen/permits/create" replace /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}><Navigate to="/citizen/complaints/create" replace /></ProtectedRoute>} />
          <Route path="/complaints/create" element={<ProtectedRoute allowedRoles={['CITIZEN']}><Navigate to="/citizen/complaints/create" replace /></ProtectedRoute>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        </Route>

        {/* Citizen Routes */}
        <Route path="/citizen" element={<ProtectedRoute allowedRoles={['CITIZEN']}><PublicLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="permits" element={<Navigate to="/citizen/permits/create" replace />} />
          <Route path="permits/create" element={<PageTransition><CreatePermit /></PageTransition>} />
          <Route path="permits/:id" element={<Placeholder title="Permit Detail" />} />
          <Route path="complaints" element={<Navigate to="/citizen/complaints/create" replace />} />
          <Route path="complaints/create" element={<PageTransition><CreateComplaint /></PageTransition>} />
          <Route path="complaints/:id" element={<Placeholder title="Complaint Detail" />} />
          <Route path="notifications" element={<Placeholder title="Notifications" />} />
          <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="permits" element={<PageTransition><AdminPermitList /></PageTransition>} />
          <Route path="permits/:id" element={<Placeholder title="Permit Detail" />} />
          <Route path="complaints" element={<PageTransition><AdminComplaintList /></PageTransition>} />
          <Route path="complaints/:id" element={<Placeholder title="Complaint Detail" />} />
          <Route path="users" element={<PageTransition><AdminUserList /></PageTransition>} />
          <Route path="audit-logs" element={<Placeholder title="Audit Logs" />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
};
