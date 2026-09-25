import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

export const TopBar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative z-[60] bg-primary-950 text-white text-xs sm:text-sm py-2 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center border-b border-white/10 gap-2 sm:gap-0">
      <div className="flex items-center space-x-6 text-gray-300 text-xs">
        <a href="tel:+628001234567" className="flex items-center space-x-2 hover:text-white transition-colors">
          <Phone size={13} className="text-primary-400" />
          <span>{t('topBar.phone')}</span>
        </a>
        <a href="mailto:halo@sipedi.go.id" className="flex items-center space-x-2 hover:text-white transition-colors">
          <Mail size={13} className="text-primary-400" />
          <span>{t('topBar.email')}</span>
        </a>
      </div>
      
      <div className="flex items-center space-x-4">
        <LanguageSelector />
      </div>
    </div>
  );
};
