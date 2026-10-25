import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMyPermits } from '../../hooks/usePermits';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { format } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';
import { FileText, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CitizenPermitList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: permits, isLoading } = useMyPermits();
  const [searchTerm, setSearchTerm] = useState('');

  const currentLocale = i18n.language === 'en' ? enUS : idLocale;

  if (isLoading) return <div className="p-8 text-center text-gray-500">{t('permits.loading')}</div>;

  const filteredPermits = permits?.filter((p) => 
    (p.permitNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.businessName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('permits.myPermitsTitle')}</h2>
          <p className="text-gray-600 mt-1">{t('permits.myPermitsDesc')}</p>
        </div>
        <Link 
          to="/citizen/permits/create" 
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium flex items-center shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('permits.newPermitBtn')}
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder={t('permits.searchPlaceholder')}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('permits.colNo')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('permits.colType')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('permits.colBusiness')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('permits.colDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('permits.colStatus')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('permits.colAction')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermits?.map((permit) => (
                <tr key={permit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-primary-600">
                      <FileText className="h-4 w-4 mr-2" />
                      {permit.permitNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{permit.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permit.businessName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(permit.submissionDate), 'dd MMM yyyy', { locale: currentLocale })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={permit.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/citizen/permits/${permit.id}`} className="text-primary-600 hover:text-primary-900">
                      {t('permits.detail')}
                    </Link>
                  </td>
                </tr>
              ))}
              {(!filteredPermits || filteredPermits.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('permits.emptyTitle')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
