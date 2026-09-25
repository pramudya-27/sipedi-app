import React from 'react';
import { usePermits } from '../../hooks/usePermits';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FileText, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CitizenPermitList: React.FC = () => {
  const { data: permits, isLoading } = usePermits();

  if (isLoading) return <div className="p-8 text-center text-gray-500">Memuat data perizinan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Perizinan Saya</h2>
          <p className="text-gray-600 mt-1">Daftar perizinan yang telah Anda ajukan.</p>
        </div>
        <Link 
          to="/citizen/permits/create" 
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium flex items-center shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajukan Izin Baru
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Cari nomor izin..."
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Izin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Izin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Usaha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pengajuan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permits?.map((permit) => (
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
                    {format(new Date(permit.submissionDate), 'dd MMM yyyy', { locale: id })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={permit.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/citizen/permits/${permit.id}`} className="text-primary-600 hover:text-primary-900">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
              {(!permits || permits.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Belum ada pengajuan izin.
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
