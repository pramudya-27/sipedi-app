import React from 'react';
import { LayoutDashboard, FileText, ShieldAlert, Users, History } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';

export const AdminLayout: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manajemen Perizinan', href: '/admin/permits', icon: FileText },
    { name: 'Manajemen Pengaduan', href: '/admin/complaints', icon: ShieldAlert },
    { name: 'Pengguna', href: '/admin/users', icon: Users },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  ];

  return <DashboardLayout navigation={navigation} title="Portal Admin SIPEDI" />;
};
