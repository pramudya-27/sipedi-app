import React from 'react';
import logo from '../../assets/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-950 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img src={logo} alt="SIPEDI Logo" className="h-10 w-auto brightness-0 invert" />
              <span className="font-bold text-2xl tracking-tight">SIPEDI</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Sistem Perizinan Digital Mikro dan Layanan Pengaduan Ketertiban Berbasis Asisten AI.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Layanan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Perizinan Mikro</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pengaduan Ketertiban</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Panduan AI</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status Layanan</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Informasi</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Kontak</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Gedung Pemerintahan Pusat</li>
              <li>Jl. Merdeka No. 1, Jakarta</li>
              <li>Email: halo@sipedi.go.id</li>
              <li>Telepon: +62 (800) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-900 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Kementerian Pelayanan Publik - SIPEDI. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
};
