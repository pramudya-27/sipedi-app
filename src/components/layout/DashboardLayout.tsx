import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Menu, LogOut, User as UserIcon, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';
import logo from '../../assets/logo1.png';
import { NotificationDropdown } from '../common/NotificationDropdown';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface Props {
  navigation: SidebarItem[];
  title: string;
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<Props> = ({ navigation, title, children }) => {
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  // State Konfirmasi Logout
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // sidebar selalu dalam posisi terbuka (full)
  useEffect(() => {
    const saved = localStorage.getItem('sipedi_sidebar_open');
    if (saved === null && window.innerWidth >= 768 && setSidebarOpen) {
      setSidebarOpen(true);
    }
  }, [setSidebarOpen]);

  // Eksekusi logout setelah pengguna mengonfirmasi di modal
  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col justify-between shrink-0",
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-20"
        )}
      >
        <div>
          <div className="h-20 flex items-center px-4 border-b border-slate-800">
            <img src={logo} alt="SIPEDI Logo" className="h-8 w-auto mr-3 brightness-0 invert shrink-0" />
            {isSidebarOpen && (
              <span className="font-bold text-xl tracking-tight whitespace-nowrap">SIPEDI</span>
            )}
          </div>

          <div className="p-4">
            {isSidebarOpen && (
              <div className="mb-4 px-2">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Menu Utama</p>
              </div>
            )}
            <nav className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-colors",
                      isActive
                        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                      !isSidebarOpen && "justify-center"
                    )
                  }
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <item.icon className={clsx("h-5 w-5 shrink-0", isSidebarOpen && "mr-3")} />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none transition-colors"
              title="Buka/Tutup Sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-xl font-bold text-slate-900 hidden sm:block">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifikasi Dropdown Modular */}
            <NotificationDropdown />

            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="hidden md:block text-right">
                <div className="text-sm font-bold text-slate-900">{user?.name || 'Admin Pusat'}</div>
                <div className="text-xs font-semibold text-blue-600">{user?.role || 'ADMIN'}</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                {user?.name?.charAt(0) || <UserIcon className="h-5 w-5" />}
              </div>
              
              {/* Tombol Logout - Memicu Pop-Up Alert Konfirmasi */}
              <button
                onClick={() => setShowLogoutModal(true)}
                title="Keluar / Logout"
                className="ml-2 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main section */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900 bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* MODAL DIALOG ALERT KONFIRMASI LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Konfirmasi Logout</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin keluar dari Portal Admin SIPEDI?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-rose-600/20"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};