import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, MapPin, Headphones, LayoutDashboard, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="relative z-[60] bg-white text-[#004b87] py-2 px-4 md:px-8 flex justify-end items-center border-b border-gray-200 text-xs font-bold font-sans">
      <div className="flex items-center space-x-6">
        <button className="flex items-center space-x-1 hover:text-[#e71921] transition-colors">
          <Globe size={14} />
          <span>English</span>
        </button>
        <Link to="/services" className="flex items-center space-x-1 hover:text-[#e71921] transition-colors">
          <MapPin size={14} />
          <span>Lokasi Cabang</span>
        </Link>
        <Link to="/about" className="flex items-center space-x-1 hover:text-[#e71921] transition-colors">
          <Headphones size={14} />
          <span>Bantuan</span>
        </Link>
        <Link to="/ai-assistant" className="flex items-center space-x-1 hover:text-[#e71921] transition-colors">
          <LayoutDashboard size={14} />
          <span>Asisten AI</span>
        </Link>
        
        {isAuthenticated ? (
          <span className="flex items-center space-x-1">
             <User size={14} />
             <span>Halo, {user?.name}</span>
          </span>
        ) : (
          <Link to="/login" className="flex items-center space-x-1 hover:text-[#e71921] transition-colors">
            <span>Daftar / Masuk</span>
          </Link>
        )}
      </div>
    </div>
  );
};
