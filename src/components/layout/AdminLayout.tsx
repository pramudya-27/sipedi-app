import React from 'react';
import { LayoutDashboard, FileText, ShieldAlert, Users, History, MessageSquare } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manajemen Perizinan', href: '/admin/permits', icon: FileText },
    { name: 'Manajemen Pengaduan', href: '/admin/complaints', icon: ShieldAlert },
    { name: 'Pusat Pesan', href: '/admin/contact-messages', icon: MessageSquare },
    { name: 'Pengguna', href: '/admin/users', icon: Users },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  ];

  return (
    <DashboardLayout navigation={navigation} title="Portal Admin SIPEDI">
      {children}
    </DashboardLayout>
  );
};