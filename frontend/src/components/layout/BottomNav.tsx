import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Headphones, Grid, Info, LogIn, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const userRoleUpper = user?.role?.toUpperCase();
  const isAdmin = userRoleUpper === 'ADMIN' || userRoleUpper === 'ADMINISTRATOR';

  const navItems = [
    { label: t('bottomNav.home'), path: '/', icon: Home },
    { label: t('bottomNav.support'), path: '/contact', icon: Headphones },
    { label: t('bottomNav.services'), path: '/services', icon: Grid, isCenter: true },
    { label: t('bottomNav.about'), path: '/about', icon: Info },
    {
      label: isAuthenticated ? (isAdmin ? t('bottomNav.dashboard') : t('bottomNav.profile')) : t('bottomNav.login'),
      path: isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/citizen/profile') : '/login',
      icon: isAuthenticated ? User : LogIn,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isCenter) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center -mt-6 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/30 group-active:scale-95 transition-transform">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border border-blue-400/30">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};