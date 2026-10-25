import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import {AnimatePresence} from "framer-motion";
import {useAuthStore} from "../store/authStore";
import {PageTransition} from "../components/layout/PageTransition";

// Layouts
import {PublicLayout} from "../components/layout/PublicLayout";
import {AdminLayout} from "../components/layout/AdminLayout";

// Public Pages
import {LandingPage} from "../pages/public/LandingPage";
import {AboutUs} from "../pages/public/AboutUs";
import {Services} from "../pages/public/Services";
import {Login} from "../pages/public/Login";
import {Register} from "../pages/public/Register";
import {ForgotPassword} from "../pages/public/ForgotPassword";
import {ResetPassword} from "../pages/public/ResetPassword";
import {Contact} from "../pages/public/Contact";
import {FloatingAIChat} from "../components/chat/FloatingAIChat";
import {useChatStore} from "../store/chatStore";

// Citizen Pages
import {CitizenPermitList} from "../pages/citizen/CitizenPermitList";
import {CitizenComplaintList} from "../pages/citizen/CitizenComplaintList";
import {CreatePermit} from "../pages/citizen/CreatePermit";
import {CreateComplaint} from "../pages/citizen/CreateComplaint";
import {Profile} from "../pages/citizen/Profile";
import {PermitPaymentPage} from "../pages/citizen/PermitPaymentPage";
import {PaymentFinishPage} from "../pages/citizen/PaymentFinishPage";

// Admin Pages
import {AdminLanding} from "../pages/admin/AdminLanding";
import {AdminLogin} from "../pages/admin/AdminLogin";
import {AdminDashboard} from "../pages/admin/AdminDashboard";
import {AdminPermitList} from "../pages/admin/AdminPermitList";
import {AdminRevenuePage} from "../pages/admin/AdminRevenuePage";
import {AdminUserList} from "../pages/admin/AdminUserList";
import {AdminComplaintList} from "../pages/admin/AdminComplaintList";
import {AdminAuditLogs} from "../pages/admin/AdminAuditLogs";
import {ContactMessagesPage} from "../pages/admin/ContactMessagesPage";

import {ScrollToTop} from "../components/common/ScrollToTop";

// Redirect /ai-assistant ke halaman saat ini dan buka floating chat
const AIAssistantRedirect = () => {
  const {openChat} = useChatStore();

  React.useEffect(() => {
    openChat();
  }, [openChat]);

  return <Navigate to="/" replace />;
};

// Placeholder
const Placeholder = ({title}: {title: string}) => (
  <PageTransition>
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    </div>
  </PageTransition>
);

// Protected Route khusus Tamu
const GuestRoute = ({children}: {children: React.ReactNode}) => {
  const {citizenUser, user} = useAuthStore();
  const activeUser = citizenUser || user;
  const userRoleUpper = activeUser?.role?.toUpperCase();

  if (activeUser) {
    if (userRoleUpper === "ADMIN" || userRoleUpper === "ADMINISTRATOR") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/citizen/profile" replace />;
  }

  return <>{children}</>;
};

// Protected Route khusus Warga
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const {citizenUser, user} = useAuthStore();
  const activeUser = citizenUser || (user?.role !== "ADMIN" ? user : null);
  const userRoleUpper = activeUser?.role?.toUpperCase();

  if (!activeUser) return <Navigate to="/login" replace />;
  if (
    userRoleUpper &&
    !allowedRoles.map((r) => r.toUpperCase()).includes(userRoleUpper)
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Protected Route khusus Admin
const AdminProtectedRoute = ({children}: {children: React.ReactNode}) => {
  const {adminUser, user} = useAuthStore();
  const activeUser = adminUser || (user?.role === "ADMIN" ? user : null);
  const userRoleUpper = activeUser?.role?.toUpperCase();

  if (
    !activeUser ||
    (userRoleUpper !== "ADMIN" && userRoleUpper !== "ADMINISTRATOR")
  ) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const {syncPortalSession, adminUser, user} = useAuthStore();

  React.useEffect(() => {
    syncPortalSession();
  }, [location.pathname, syncPortalSession]);

  const activeAdmin = adminUser || (user?.role === "ADMIN" ? user : null);
  const isAdmin =
    !!activeAdmin &&
    (activeAdmin.role?.toUpperCase() === "ADMIN" ||
      activeAdmin.role?.toUpperCase() === "ADMINISTRATOR");

  // Deteksi jika domain yang diakses adalah domain khusus admin (misal: admin.sipedi.id)
  const isDomainAdmin =
    typeof window !== "undefined" &&
    (window.location.hostname.startsWith("admin.") ||
      import.meta.env.VITE_APP_MODE === "ADMIN");

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Standalone Admin Domain Root Route */}
        {isDomainAdmin && (
          <Route
            path="/"
            element={
              isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <PageTransition>
                  <AdminLanding />
                </PageTransition>
              )
            }
          />
        )}

        {/* 1. Public Routes */}
        <Route element={<PublicLayout />}>
          {!isDomainAdmin && (
            <Route
              path="/"
              element={
                <PageTransition>
                  <LandingPage />
                </PageTransition>
              }
            />
          )}
          <Route
            path="/about"
            element={
              <PageTransition>
                <AboutUs />
              </PageTransition>
            }
          />
          <Route
            path="/services"
            element={
              <PageTransition>
                <Services />
              </PageTransition>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <Contact />
              </PageTransition>
            }
          />

          <Route
            path="/login"
            element={
              isDomainAdmin ? (
                <Navigate to="/admin/login" replace />
              ) : (
                <GuestRoute>
                  <PageTransition>
                    <Login />
                  </PageTransition>
                </GuestRoute>
              )
            }
          />
          <Route
            path="/register"
            element={
              isDomainAdmin ? (
                <Navigate to="/admin/login" replace />
              ) : (
                <GuestRoute>
                  <PageTransition>
                    <Register />
                  </PageTransition>
                </GuestRoute>
              )
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PageTransition>
                <ResetPassword />
              </PageTransition>
            }
          />
          <Route
            path="/pay/:invoiceNumber"
            element={
              <PageTransition>
                <PermitPaymentPage />
              </PageTransition>
            }
          />
          <Route
            path="/payment/finish"
            element={
              <PageTransition>
                <PaymentFinishPage />
              </PageTransition>
            }
          />
          <Route
            path="/payment/unfinish"
            element={
              <PageTransition>
                <PaymentFinishPage />
              </PageTransition>
            }
          />
          <Route
            path="/payment/error"
            element={
              <PageTransition>
                <PaymentFinishPage />
              </PageTransition>
            }
          />

          <Route path="/ai-assistant" element={<AIAssistantRedirect />} />
        </Route>

        {/* 2. Isolated Standalone Admin Landing & Login */}
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <PageTransition>
                <AdminLanding />
              </PageTransition>
            )
          }
        />
        <Route
          path="/admin/login"
          element={
            isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <PageTransition>
                <AdminLogin />
              </PageTransition>
            )
          }
        />

        {/* 3. Citizen Routes */}
        <Route
          path="/citizen"
          element={
            <ProtectedRoute allowedRoles={["CITIZEN"]}>
              <PublicLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route
            path="permits"
            element={
              <PageTransition>
                <CitizenPermitList />
              </PageTransition>
            }
          />
          <Route
            path="permits/create"
            element={
              <PageTransition>
                <CreatePermit />
              </PageTransition>
            }
          />
          <Route
            path="permits/pay/:invoiceNumber"
            element={
              <PageTransition>
                <PermitPaymentPage />
              </PageTransition>
            }
          />
          <Route
            path="permits/:id"
            element={<Placeholder title="Permit Detail" />}
          />
          <Route
            path="complaints"
            element={
              <PageTransition>
                <CitizenComplaintList />
              </PageTransition>
            }
          />
          <Route
            path="complaints/create"
            element={
              <PageTransition>
                <CreateComplaint />
              </PageTransition>
            }
          />
          <Route
            path="complaints/:id"
            element={<Placeholder title="Complaint Detail" />}
          />
          <Route
            path="notifications"
            element={<Placeholder title="Notifications" />}
          />
          <Route
            path="profile"
            element={
              <PageTransition>
                <Profile />
              </PageTransition>
            }
          />
        </Route>

        {/* 4. Direct Flat Admin Routes dengan AdminLayout */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <PageTransition>
                  <AdminDashboard />
                </PageTransition>
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/permits"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <PageTransition>
                  <AdminPermitList />
                </PageTransition>
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <PageTransition>
                  <AdminRevenuePage />
                </PageTransition>
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
                <PageTransition>
                  <AdminComplaintList />
                </PageTransition>
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
                <PageTransition>
                  <AdminUserList />
                </PageTransition>
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <PageTransition>
                  <AdminAuditLogs />
                </PageTransition>
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/contact-messages"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <PageTransition>
                  <ContactMessagesPage />
                </PageTransition>
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
      <FloatingAIChat />
    </BrowserRouter>
  );
};
