import React from 'react';
import { FileText, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';

const monthlyData = [
  { name: 'Jan', perizinan: 400, pengaduan: 240 },
  { name: 'Feb', perizinan: 300, pengaduan: 139 },
  { name: 'Mar', perizinan: 200, pengaduan: 980 },
  { name: 'Apr', perizinan: 278, pengaduan: 390 },
  { name: 'Mei', perizinan: 189, pengaduan: 480 },
  { name: 'Jun', perizinan: 239, pengaduan: 380 },
];

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Pemerintahan</h2>
        <p className="text-gray-600 mt-1">Ringkasan operasional SIPEDI Pusat.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Perizinan</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">1,248</p>
          </div>
          <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Menunggu Verifikasi</p>
            <p className="text-3xl font-bold text-warning-600 mt-1">37</p>
          </div>
          <div className="h-12 w-12 bg-warning-50 text-warning-600 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pengaduan Baru</p>
            <p className="text-3xl font-bold text-danger-600 mt-1">18</p>
          </div>
          <div className="h-12 w-12 bg-danger-50 text-danger-600 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pengaduan Selesai</p>
            <p className="text-3xl font-bold text-success-600 mt-1">302</p>
          </div>
          <div className="h-12 w-12 bg-success-50 text-success-600 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Tren Layanan Bulanan</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="perizinan" stroke="#2563eb" name="Perizinan" />
                <Line type="monotone" dataKey="pengaduan" stroke="#ef4444" name="Pengaduan" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Kategori Pengaduan Terbanyak</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Pungli', count: 120 },
                { name: 'Premanisme', count: 80 },
                { name: 'Ketertiban', count: 200 },
                { name: 'Lainnya', count: 50 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Jumlah" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Table placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg text-gray-900">Aktivitas Terbaru</h3>
        </div>
        <div className="p-6 text-center text-gray-500 py-12">
          Tabel aktivitas akan ditampilkan di sini.
        </div>
      </div>
    </div>
  );
};
