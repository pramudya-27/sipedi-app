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
import { ForgotPassword } from '../pages/public/ForgotPassword';
import { ResetPassword } from '../pages/public/ResetPassword';
import { AIAssistant } from '../pages/public/AIAssistant';
import { Contact } from '../pages/public/Contact';

// Citizen Pages
import { CitizenPermitList } from '../pages/citizen/CitizenPermitList';
import { CitizenComplaintList } from '../pages/citizen/CitizenComplaintList';
import { CreatePermit } from '../pages/citizen/CreatePermit';
import { CreateComplaint } from '../pages/citizen/CreateComplaint';
import { Profile } from '../pages/citizen/Profile';

// Admin Pages
import { AdminLanding } from '../pages/admin/AdminLanding';
import { AdminLogin } from '../pages/admin/AdminLogin';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminPermitList } from '../pages/admin/AdminPermitList';
import { AdminUserList } from '../pages/admin/AdminUserList';
import { AdminComplaintList } from '../pages/admin/AdminComplaintList';
import { AdminAuditLogs } from '../pages/admin/AdminAuditLogs';
import { ContactMessagesPage } from '../pages/admin/ContactMessagesPage';

import { ScrollToTop } from '../components/common/ScrollToTop';

// Placeholder
const Placeholder = ({ title }: { title: string }) => (
  <PageTransition>
    <div className="p-8"><h1 className="text-2xl font-bold text-slate-800">{title}</h1></div>
  </PageTransition>
);

// Protected Route khusus Tamu
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuthStore();
  const userRoleUpper = user?.role?.toUpperCase();

  if (isAuthenticated) {
    if (userRoleUpper === 'ADMIN' || userRoleUpper === 'ADMINISTRATOR') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/citizen/profile" replace />;
  }

  return <>{children}</>;
};

// Protected Route khusus Warga
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuthStore();
  const userRoleUpper = user?.role?.toUpperCase();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userRoleUpper && !allowedRoles.map(r => r.toUpperCase()).includes(userRoleUpper)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Protected Route khusus Admin
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuthStore();
  const userRoleUpper = user?.role?.toUpperCase();

  if (!isAuthenticated || (userRoleUpper !== 'ADMIN' && userRoleUpper !== 'ADMINISTRATOR')) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const userRoleUpper = user?.role?.toUpperCase();
  const isAdmin = isAuthenticated && (userRoleUpper === 'ADMIN' || userRoleUpper === 'ADMINISTRATOR');

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* 1. Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          
          <Route path="/login" element={
            <GuestRoute>
              <PageTransition><Login /></PageTransition>
            </GuestRoute>
          } />
          <Route path="/register" element={
            <GuestRoute>
              <PageTransition><Register /></PageTransition>
            </GuestRoute>
          } />
          
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          
          <Route path="/ai-assistant" element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
              <PageTransition><AIAssistant /></PageTransition>
            </ProtectedRoute>
          } />
        </Route>

        {/* 2. Isolated Standalone Admin Landing & Login */}
        <Route path="/admin" element={<PageTransition><AdminLanding /></PageTransition>} />
        <Route 
          path="/admin/login" 
          element={
            isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <PageTransition><AdminLogin /></PageTransition>
            )
          } 
        />

        {/* 3. Citizen Routes */}
        <Route path="/citizen" element={<ProtectedRoute allowedRoles={['CITIZEN']}><PublicLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="permits" element={<PageTransition><CitizenPermitList /></PageTransition>} />
          <Route path="permits/create" element={<PageTransition><CreatePermit /></PageTransition>} />
          <Route path="permits/:id" element={<Placeholder title="Permit Detail" />} />
          <Route path="complaints" element={<PageTransition><CitizenComplaintList /></PageTransition>} />
          <Route path="complaints/create" element={<PageTransition><CreateComplaint /></PageTransition>} />
          <Route path="complaints/:id" element={<Placeholder title="Complaint Detail" />} />
          <Route path="notifications" element={<Placeholder title="Notifications" />} />
          <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />
        </Route>

        {/* 4. Direct Flat Admin Routes dengan AdminLayout */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <PageTransition><AdminDashboard /></PageTransition>
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/permits" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <PageTransition><AdminPermitList /></PageTransition>
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/permits/:id" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <Placeholder title="Detail Perizinan" />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/complaints" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <PageTransition><AdminComplaintList /></PageTransition>
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/complaints/:id" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <Placeholder title="Detail Pengaduan" />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <PageTransition><AdminUserList /></PageTransition>
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/audit-logs" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <PageTransition><AdminAuditLogs /></PageTransition>
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/contact-messages" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <PageTransition><ContactMessagesPage /></PageTransition>
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AnimatePresence>
  );
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatedRoutes />
    </BrowserRouter>
  );
};