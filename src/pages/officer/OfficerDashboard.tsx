import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Halo, {user?.name}</h2>
        <p className="text-gray-600 mt-1">Berikut adalah ringkasan tugas lapangan Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Tugas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">12</p>
          </div>
          <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Sedang Berjalan</p>
            <p className="text-3xl font-bold text-warning-600 mt-1">4</p>
          </div>
          <div className="h-12 w-12 bg-warning-50 text-warning-600 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Selesai</p>
            <p className="text-3xl font-bold text-success-600 mt-1">8</p>
          </div>
          <div className="h-12 w-12 bg-success-50 text-success-600 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg text-gray-900">Tugas Prioritas Hari Ini</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map((task) => (
            <div key={task} className="p-6 flex items-start justify-between">
              <div className="flex items-start">
                <div className="h-10 w-10 bg-danger-50 text-danger-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="font-bold">P{task}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Verifikasi Lokasi Pengaduan ADU-2026-00{task}</h4>
                  <p className="text-sm text-gray-500 mt-1">Lokasi: Pasar Induk Kramat Jati</p>
                  <p className="text-xs font-medium text-danger-600 mt-1">Prioritas Tinggi</p>
                </div>
              </div>
              <button className="bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded text-sm font-medium transition-colors">
                Detail
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
