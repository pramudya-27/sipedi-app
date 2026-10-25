import React from 'react';
import { LayoutDashboard, FileText, ShieldAlert, Users, History, MessageSquare, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from './DashboardLayout';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t } = useTranslation();

  const navigation = [
    { name: t('adminNav.dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('adminNav.permits'), href: '/admin/permits', icon: FileText },
    { name: t('adminNav.revenue'), href: '/admin/revenue', icon: Wallet },
    { name: t('adminNav.complaints'), href: '/admin/complaints', icon: ShieldAlert },
    { name: t('adminNav.messages'), href: '/admin/contact-messages', icon: MessageSquare },
    { name: t('adminNav.users'), href: '/admin/users', icon: Users },
    { name: t('adminNav.auditLogs'), href: '/admin/audit-logs', icon: History },
  ];

  return (
    <DashboardLayout navigation={navigation} title={t('adminNav.portalTitle')}>
      {children}
    </DashboardLayout>
  );
};