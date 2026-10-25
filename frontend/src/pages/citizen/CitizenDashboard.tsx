import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, AlertTriangle, CheckCircle, ArrowRight, Bot, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyPermits } from '../../hooks/usePermits';
import { useMyComplaints } from '../../hooks/useComplaints';
import { format } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';

export const CitizenDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { openChat } = useChatStore();
  const user = useAuthStore(state => state.user);
  const currentLocale = i18n.language === 'en' ? enUS : idLocale;

  const { data: permits = [] } = useMyPermits();
  const { complaints = [] } = useMyComplaints();

  const totalPermits = permits.length;
  const waitingVerification = 
    permits.filter(p => ['Submitted', 'Under Verification', 'Draft'].includes(p.status)).length +
    complaints.filter(c => ['Baru', 'Verifikasi'].includes(c.status)).length;
  const activeComplaints = complaints.filter(c => ['Baru', 'Verifikasi', 'Diteruskan', 'Dalam Penanganan'].includes(c.status)).length;
  const completed = 
    permits.filter(p => p.status === 'Approved').length + 
    complaints.filter(c => c.status === 'Selesai').length;

  const recentActivities = [
    ...permits.map(p => ({
      id: `permit-${p.id}`,
      title: `${p.type} (${p.permitNumber})`,
      status: p.status,
      date: new Date(p.submissionDate || Date.now()),
      type: 'permit' as const,
      link: '/citizen/permits'
    })),
    ...complaints.map(c => ({
      id: `complaint-${c.id}`,
      title: `${c.category} - ${c.complaintNumber}`,
      status: c.status,
      date: new Date(c.date || Date.now()),
      type: 'complaint' as const,
      link: '/citizen/complaints'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary-600">
        <h2 className="text-2xl font-bold text-gray-900">{t('citizenDashboard.welcome')} {user?.name?.split(' ')[0] || t('citizenDashboard.defaultUser')}</h2>
        <p className="text-gray-600 mt-1">{t('citizenDashboard.summaryDesc')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{t('citizenDashboard.totalPermits')}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalPermits}</p>
          </div>
          <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{t('citizenDashboard.waitingVerification')}</p>
            <p className="text-3xl font-bold text-warning-600 mt-1">{waitingVerification}</p>
          </div>
          <div className="h-12 w-12 bg-warning-50 text-warning-600 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{t('citizenDashboard.activeComplaints')}</p>
            <p className="text-3xl font-bold text-danger-600 mt-1">{activeComplaints}</p>
          </div>
          <div className="h-12 w-12 bg-danger-50 text-danger-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{t('citizenDashboard.completed')}</p>
            <p className="text-3xl font-bold text-success-600 mt-1">{completed}</p>
          </div>
          <div className="h-12 w-12 bg-success-50 text-success-600 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-lg text-gray-900">{t('citizenDashboard.quickActions')}</h3>
          <Link to="/citizen/permits/create" className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all flex items-center justify-between group">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center mr-3 text-primary-600">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-medium text-gray-900">{t('citizenDashboard.applyPermit')}</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
          </Link>
          
          <Link to="/citizen/complaints/create" className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-danger-500 hover:shadow-md transition-all flex items-center justify-between group">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-danger-50 rounded-lg flex items-center justify-center mr-3 text-danger-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="font-medium text-gray-900">{t('citizenDashboard.createComplaint')}</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-danger-600" />
          </Link>

          <button 
            type="button"
            onClick={openChat} 
            className="w-full bg-gradient-to-r from-primary-600 to-primary-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-between group text-white cursor-pointer text-left"
          >
            <div className="flex items-center">
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <Bot className="h-5 w-5" />
              </div>
              <span className="font-medium">{t('citizenDashboard.askAi')}</span>
            </div>
            <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-white" />
          </button>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-900">{t('citizenDashboard.recentActivity')}</h3>
              <Link to="/citizen/profile" className="text-sm text-primary-600 font-medium hover:text-primary-700">{t('citizenDashboard.viewAll')}</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  {t('profile.emptyAll')}
                </div>
              ) : (
                recentActivities.map((act) => (
                  <Link key={act.id} to={act.link} className="p-6 flex items-start hover:bg-gray-50 transition-colors">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
                      act.type === 'permit' ? 'bg-primary-50 text-primary-600' : 'bg-danger-50 text-danger-600'
                    }`}>
                      {act.type === 'permit' ? <FileText className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{act.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('common.status')}: <span className="font-medium text-primary-600">{act.status}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(act.date, 'dd MMM yyyy, HH:mm', { locale: currentLocale })}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
