import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { PageTransition } from '../components/layout/PageTransition';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout';
import { CitizenLayout } from '../components/layout/CitizenLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { OfficerLayout } from '../components/layout/OfficerLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';
import { AIAssistant } from '../pages/public/AIAssistant';

// Citizen Pages
import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { CitizenPermitList } from '../pages/citizen/CitizenPermitList';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';

// Officer Pages
import { OfficerDashboard } from '../pages/officer/OfficerDashboard';

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
          <Route path="/services" element={<Placeholder title="Services Directory" />} />
          <Route path="/ai-assistant" element={<PageTransition><AIAssistant /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        </Route>

        {/* Citizen Routes */}
        <Route path="/citizen" element={<ProtectedRoute allowedRoles={['CITIZEN']}><CitizenLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<PageTransition><CitizenDashboard /></PageTransition>} />
          <Route path="permits" element={<PageTransition><CitizenPermitList /></PageTransition>} />
          <Route path="permits/create" element={<Placeholder title="Create Permit" />} />
          <Route path="permits/:id" element={<Placeholder title="Permit Detail" />} />
          <Route path="complaints" element={<Placeholder title="My Complaints" />} />
          <Route path="complaints/create" element={<Placeholder title="Create Complaint" />} />
          <Route path="complaints/:id" element={<Placeholder title="Complaint Detail" />} />
          <Route path="notifications" element={<Placeholder title="Notifications" />} />
          <Route path="profile" element={<Placeholder title="Profile" />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="permits" element={<Placeholder title="Manage Permits" />} />
          <Route path="permits/:id" element={<Placeholder title="Permit Detail" />} />
          <Route path="complaints" element={<Placeholder title="Manage Complaints" />} />
          <Route path="complaints/:id" element={<Placeholder title="Complaint Detail" />} />
          <Route path="users" element={<Placeholder title="Manage Users" />} />
          <Route path="audit-logs" element={<Placeholder title="Audit Logs" />} />
        </Route>

        {/* Officer Routes */}
        <Route path="/officer" element={<ProtectedRoute allowedRoles={['OFFICER']}><OfficerLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<PageTransition><OfficerDashboard /></PageTransition>} />
          <Route path="tasks" element={<Placeholder title="My Tasks" />} />
          <Route path="tasks/:id" element={<Placeholder title="Task Detail" />} />
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
