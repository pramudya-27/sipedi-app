import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { FileText, Clock, AlertTriangle, CheckCircle, ArrowRight, Bot, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CitizenDashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary-600">
        <h2 className="text-2xl font-bold text-gray-900">Selamat datang, {user?.name?.split(' ')[0] || 'Warga'}</h2>
        <p className="text-gray-600 mt-1">Ini adalah ringkasan layanan publik Anda di SIPEDI.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Perizinan</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
          </div>
          <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Menunggu Verifikasi</p>
            <p className="text-3xl font-bold text-warning-600 mt-1">1</p>
          </div>
          <div className="h-12 w-12 bg-warning-50 text-warning-600 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pengaduan Aktif</p>
            <p className="text-3xl font-bold text-danger-600 mt-1">2</p>
          </div>
          <div className="h-12 w-12 bg-danger-50 text-danger-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Selesai</p>
            <p className="text-3xl font-bold text-success-600 mt-1">4</p>
          </div>
          <div className="h-12 w-12 bg-success-50 text-success-600 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-lg text-gray-900">Aksi Cepat</h3>
          <Link to="/citizen/permits/create" className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all flex items-center justify-between group">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center mr-3 text-primary-600">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-medium text-gray-900">Ajukan Perizinan</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
          </Link>
          
          <Link to="/citizen/complaints/create" className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-danger-500 hover:shadow-md transition-all flex items-center justify-between group">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-danger-50 rounded-lg flex items-center justify-center mr-3 text-danger-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="font-medium text-gray-900">Buat Pengaduan</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-danger-600" />
          </Link>

          <Link to="/ai-assistant" className="w-full bg-gradient-to-r from-primary-600 to-primary-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-between group text-white">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <Bot className="h-5 w-5" />
              </div>
              <span className="font-medium">Tanya AI Assistant</span>
            </div>
            <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-white" />
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-900">Aktivitas Terkini</h3>
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700">Lihat Semua</button>
            </div>
            <div className="divide-y divide-gray-100">
              {/* Mock items */}
              <div className="p-6 flex items-start">
                <div className="h-10 w-10 bg-warning-50 text-warning-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Perizinan Usaha Warung Makan</h4>
                  <p className="text-sm text-gray-500 mt-1">Status: <span className="text-warning-600 font-medium">Dalam Verifikasi</span></p>
                  <p className="text-xs text-gray-400 mt-1">2 hari yang lalu</p>
                </div>
              </div>
              <div className="p-6 flex items-start">
                <div className="h-10 w-10 bg-danger-50 text-danger-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Laporan Pungutan Liar (Pasar Baru)</h4>
                  <p className="text-sm text-gray-500 mt-1">Status: <span className="text-danger-600 font-medium">Dalam Penanganan Petugas</span></p>
                  <p className="text-xs text-gray-400 mt-1">5 hari yang lalu</p>
                </div>
              </div>
              <div className="p-6 flex items-start">
                <div className="h-10 w-10 bg-success-50 text-success-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Perizinan Papan Reklame</h4>
                  <p className="text-sm text-gray-500 mt-1">Status: <span className="text-success-600 font-medium">Izin Diterbitkan</span></p>
                  <p className="text-xs text-gray-400 mt-1">1 minggu yang lalu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
