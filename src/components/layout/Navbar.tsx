import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="SIPEDI Logo" className="h-10 w-auto" />
              <span className="font-bold text-2xl tracking-tight text-primary-900 hidden sm:block">SIPEDI</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">{t('nav.home')}</Link>
            <Link to="/services" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">{t('nav.services')}</Link>
            <Link to="/permits" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">{t('nav.permits')}</Link>
            <Link to="/complaints" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">{t('nav.complaints')}</Link>
            <Link to="/ai-assistant" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">{t('nav.aiAssistant')}</Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              {t('nav.login')}
            </Link>
            <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-md font-medium transition-colors shadow-sm">
              {t('nav.register')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-primary-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md">{t('nav.home')}</Link>
            <Link to="/services" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md">{t('nav.services')}</Link>
            <Link to="/permits" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md">{t('nav.permits')}</Link>
            <Link to="/complaints" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md">{t('nav.complaints')}</Link>
            <Link to="/ai-assistant" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md">{t('nav.aiAssistant')}</Link>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col space-y-2 px-3">
              <Link to="/login" className="block text-center text-primary-600 font-medium py-2 border border-primary-600 rounded-md">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="block text-center bg-primary-600 text-white font-medium py-2 rounded-md">
                {t('nav.register')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
