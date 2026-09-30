import React, { useState } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ShieldAlert, Plus, Search, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CitizenComplaintList: React.FC = () => {
  const { data: complaints, isLoading } = useComplaints();
  const [search, setSearch] = useState('');

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mb-3" />
        <p>Memuat data pengaduan...</p>
      </div>
    );
  }

  const filtered = complaints?.filter(c => 
    c.complaintNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-danger-600" />
            Pengaduan Ketertiban Saya
          </h2>
          <p className="text-gray-600 mt-1 text-sm">
            Pantau status laporan gangguan ketertiban umum dan fasilitas publik yang Anda laporkan.
          </p>
        </div>
        <Link 
          to="/citizen/complaints/create" 
          className="bg-danger-600 hover:bg-danger-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Buat Pengaduan Baru
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute inset-y-0 left-0 pl-3 my-auto h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:border-danger-500"
              placeholder="Cari nomor, kategori, atau lokasi..."
            />
          </div>
        </div>
        
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShieldAlert className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="font-medium">Belum ada data pengaduan yang diajukan.</p>
            <p className="text-xs text-gray-400 mt-1">Klik tombol di atas untuk membuat laporan pengaduan baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Pengaduan</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi Kejadian</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioritas</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((item) => {
                  const dateStr = item.date;
                  const formattedDate = dateStr 
                    ? format(new Date(dateStr), 'dd MMM yyyy', { locale: id })
                    : '-';

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-sm text-danger-700">
                          {item.complaintNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          item.priority === 'Tinggi' 
                            ? 'bg-red-100 text-red-800' 
                            : item.priority === 'Sedang' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
