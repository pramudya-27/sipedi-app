import React from 'react';
import { LayoutDashboard, CheckSquare } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';

export const OfficerLayout: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/officer/dashboard', icon: LayoutDashboard },
    { name: 'Tugas Saya', href: '/officer/tasks', icon: CheckSquare },
  ];

  return <DashboardLayout navigation={navigation} title="Portal Petugas Lapangan" />;
};
