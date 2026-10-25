import React, { useState } from 'react';
import { 
  Search, 
  User, 
  LogOut 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { LanguageSelector } from './LanguageSelector';

export const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Arahkan otomatis berdasarkan query (PRM untuk permit, CMP untuk complaint)
    const query = searchQuery.toUpperCase();
    if (query.startsWith('PRM')) {
      navigate(`/admin/permits?search=${query}`);
    } else if (query.startsWith('CMP')) {
      navigate(`/admin/complaints?search=${query}`);
    } else {
      navigate(`/admin/permits?search=${query}`);
    }
  };

  return (
    <header className="relative z-[60] bg-white text-gray-700 py-2.5 px-4 md:px-8 flex items-center justify-between border-b border-gray-200 text-xs font-sans shadow-sm">
      {/* Search Bar Global */}
      <form onSubmit={handleSearch} className="relative w-64 md:w-80">
        <input
          type="text"
          placeholder={t('admin.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-50 text-gray-900 text-xs rounded-lg pl-9 pr-8 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
        <kbd className="hidden sm:inline-block absolute right-2.5 top-2 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-200/60 rounded border border-gray-300">
          /
        </kbd>
      </form>

      {/* Menu Kanan */}
      <div className="flex items-center space-x-5">
        {/* Bahasa */}
        <LanguageSelector textColor="text-slate-700 hover:text-blue-600" />

        {/* Lonceng Notifikasi Modular */}
        <NotificationDropdown />

        <div className="h-4 w-px bg-gray-200" />

        {/* User Profile */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="font-bold text-gray-900 leading-tight">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-gray-400 font-medium capitalize">{user?.role || 'Admin Utama'}</p>
              </div>
            </button>

            {/* Dropdown Profile */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                  <p className="font-bold text-gray-900 text-xs">{user?.name}</p>
                  <p className="text-[10px] text-gray-400">{user?.role}</p>
                </div>
                <Link
                  to="/admin/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                >
                  <User size={14} />
                  <span>{t('admin.profileSettings')}</span>
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut size={14} />
                  <span>{t('admin.logout')}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center space-x-1.5 bg-blue-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-sm"
          >
            <User size={14} />
            <span>Masuk Portal</span>
          </Link>
        )}
      </div>
    </header>
  );
};