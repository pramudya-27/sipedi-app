import React from 'react';
import { Home, FileText, ShieldAlert, Bell, User } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { useTranslation } from 'react-i18next';

export const CitizenLayout: React.FC = () => {
  const { t } = useTranslation();
  
  const navigation = [
    { name: t('nav.home'), href: '/citizen/dashboard', icon: Home },
    { name: t('nav.permits'), href: '/citizen/permits', icon: FileText },
    { name: t('nav.complaints'), href: '/citizen/complaints', icon: ShieldAlert },
    { name: 'Notifikasi', href: '/citizen/notifications', icon: Bell },
    { name: 'Profil', href: '/citizen/profile', icon: User },
  ];

  return <DashboardLayout navigation={navigation} title="Dashboard Citizen" />;
};
