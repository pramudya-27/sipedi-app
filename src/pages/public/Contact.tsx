import React from 'react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-[#0f172a] mb-4">Pusat Bantuan & Kontak</h1>
          <p className="text-lg text-gray-600">Hubungi kami untuk pertanyaan lebih lanjut seputar perizinan dan layanan SIPEDI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Hubungi Kami</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-[#2563eb] mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Alamat Kantor</h3>
                  <p className="text-gray-600 mt-1">Pusat Pelayanan Terpadu<br/>Jl. Merdeka No. 1, Jakarta<br/>Indonesia 10110</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-[#2563eb] mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-600 mt-1">kontak@sipedi.go.id</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-[#2563eb] mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Telepon</h3>
                  <p className="text-gray-600 mt-1">1500-123 (Senin-Jumat, 08:00-16:00)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Kirim Pesan</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Pesan telah terkirim!'); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" required className="w-full border-gray-300 rounded-lg p-3 border focus:ring-[#2563eb] focus:border-[#2563eb]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required className="w-full border-gray-300 rounded-lg p-3 border focus:ring-[#2563eb] focus:border-[#2563eb]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                <textarea required rows={4} className="w-full border-gray-300 rounded-lg p-3 border focus:ring-[#2563eb] focus:border-[#2563eb]"></textarea>
              </div>
              <button type="submit" className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center">
                <MessageSquare className="w-5 h-5 mr-2" /> Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
