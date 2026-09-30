import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Camera, Save, User, Mail, Phone, MapPin, Shield } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '081234567890',
    nik: '3171234567890001',
    address: 'Jl. Contoh Alamat No. 123, RT 01/RW 02, Jakarta'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      alert('Profil berhasil diperbarui!');
      setIsEditing(false);
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0f172a]">Profil Pengguna</h1>
        <p className="text-gray-600 mt-2">Kelola informasi data diri dan akun Anda.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Col - Photo & Quick Info */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className="relative mb-6 group cursor-pointer">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                <User size={64} className="text-gray-400" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-8 h-8" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#0f172a]">{formData.name}</h2>
            <p className="text-gray-500 font-medium">{user?.role === 'ADMIN' ? 'Administrator' : 'Masyarakat / UMKM'}</p>
            
            <div className="w-full border-t border-gray-100 mt-6 pt-6 space-y-4 text-left">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-3 text-[#2563eb]" />
                <span className="truncate">{formData.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 mr-3 text-green-600" />
                <span>Akun Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Form */}
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-[#0f172a]">Informasi Detail</h3>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
                >
                  Edit Profil
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    disabled={!isEditing}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2563eb] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Induk Kependudukan (NIK)</label>
                  <input 
                    type="text" 
                    value={formData.nik}
                    disabled={!isEditing}
                    onChange={e => setFormData({...formData, nik: e.target.value})}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2563eb] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled={true} // Email usually immutable or needs verification
                    className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon / WhatsApp</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      +62
                    </span>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      disabled={!isEditing}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="flex-1 w-full p-3 rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-[#2563eb] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Domisili</label>
                <textarea 
                  rows={3}
                  value={formData.address}
                  disabled={!isEditing}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2563eb] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                ></textarea>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 rounded-lg font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
