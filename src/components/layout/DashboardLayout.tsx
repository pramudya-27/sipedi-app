import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Menu, LogOut, Bell, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';
import logo from '../../assets/logo.png';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface Props {
  navigation: SidebarItem[];
  title: string;
}

export const DashboardLayout: React.FC<Props> = ({ navigation, title }) => {
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary-950 text-white transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-center border-b border-primary-900 px-4">
          <img src={logo} alt="SIPEDI Logo" className="h-8 w-auto mr-3 brightness-0 invert" />
          <span className="font-bold text-xl tracking-tight">SIPEDI</span>
        </div>
        
        <div className="p-4">
          <div className="mb-6 px-4">
            <p className="text-xs text-primary-400 uppercase tracking-wider font-semibold">Menu Utama</p>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-primary-900 hover:text-white transition-colors"
              >
                <item.icon className="mr-3 h-5 w-5 text-primary-400" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900 hidden sm:block">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
            </button>
            
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                {user?.name?.charAt(0) || <UserIcon className="h-5 w-5" />}
              </div>
              <button onClick={handleLogout} className="ml-2 text-gray-400 hover:text-danger-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main section */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};
