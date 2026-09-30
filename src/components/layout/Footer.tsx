import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import logo from '../../assets/logo1.png';

const InfoModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-[#0f172a]">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'faq' | null>(null);

  const renderModalContent = () => {
    if (activeModal === 'terms') {
      return (
        <div className="space-y-4">
          <p className="font-semibold text-lg text-[#0f172a]">Selamat datang di SIPEDI.</p>
          <p>Dengan menggunakan layanan kami, Anda menyetujui syarat dan ketentuan berikut:</p>
          <ol className="list-decimal pl-5 space-y-3 mt-4">
            <li>Layanan ini diperuntukkan bagi warga negara dan pelaku UMKM yang sah.</li>
            <li>Data yang Anda berikan harus akurat dan dapat dipertanggungjawabkan.</li>
            <li>Penyalahgunaan sistem untuk pelaporan palsu dapat dikenakan sanksi sesuai perundang-undangan.</li>
            <li>Kami berhak mengubah ketentuan ini sewaktu-waktu dengan pemberitahuan di situs web ini.</li>
          </ol>
        </div>
      );
    }
    if (activeModal === 'privacy') {
      return (
        <div className="space-y-4">
          <p className="font-semibold text-lg text-[#0f172a]">Privasi Anda sangat penting bagi kami.</p>
          <p>Kebijakan ini menjelaskan bagaimana kami mengumpulkan dan melindungi data Anda.</p>
          <ul className="list-disc pl-5 space-y-3 mt-4">
            <li><strong className="text-[#0f172a]">Pengumpulan Data:</strong> Kami mengumpulkan NIK, Email, dan data usaha yang Anda serahkan.</li>
            <li><strong className="text-[#0f172a]">Penggunaan Data:</strong> Data hanya digunakan untuk keperluan penerbitan dokumen perizinan dan tindak lanjut pengaduan.</li>
            <li><strong className="text-[#0f172a]">Keamanan:</strong> Kami menerapkan standar enkripsi yang ketat untuk melindungi data sensitif Anda.</li>
          </ul>
        </div>
      );
    }
    if (activeModal === 'faq') {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#0f172a]">1. Berapa lama proses perizinan UMKM?</h3>
            <p className="mt-2">Umumnya perizinan akan selesai dalam 1-3 hari kerja jika seluruh dokumen lengkap.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0f172a]">2. Apakah pengajuan izin dipungut biaya?</h3>
            <p className="mt-2">Tidak. Seluruh layanan pendaftaran NIB dan Izin Usaha Mikro melalui SIPEDI adalah GRATIS.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0f172a]">3. Bagaimana cara melacak laporan pengaduan saya?</h3>
            <p className="mt-2">Gunakan nomor resi yang diberikan setelah Anda membuat laporan, lalu masukkan di kolom pencarian pada Halaman Beranda.</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getModalTitle = () => {
    switch(activeModal) {
      case 'terms': return 'Syarat & Ketentuan';
      case 'privacy': return 'Kebijakan Privasi';
      case 'faq': return 'FAQ (Tanya Jawab)';
      default: return '';
    }
  };

  return (
    <>
      <footer className="bg-[#1e293b] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <img src={logo} alt="SIPEDI Logo" className="h-10 w-auto brightness-0 invert" />
                <span className="font-bold text-2xl tracking-tight">SIPEDI</span>
              </div>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed font-light">
                Sistem Perizinan Digital Mikro dan Layanan Pengaduan Ketertiban. Mewujudkan ekosistem pelayanan publik yang inklusif dan bebas pungutan liar.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg border-b border-gray-600 pb-2 inline-block">Layanan</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link to="/permits" className="hover:text-white transition-colors hover:underline">Perizinan Mikro</Link></li>
                <li><Link to="/complaints" className="hover:text-white transition-colors hover:underline">Pengaduan Ketertiban</Link></li>
                <li><Link to="/ai-assistant" className="hover:text-white transition-colors hover:underline">Panduan Publik</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors hover:underline">Status Layanan</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg border-b border-gray-600 pb-2 inline-block">Informasi</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link to="/about" className="hover:text-white transition-colors hover:underline">Tentang Kami</Link></li>
                <li><button onClick={() => setActiveModal('terms')} className="text-left hover:text-white transition-colors hover:underline focus:outline-none">Syarat & Ketentuan</button></li>
                <li><button onClick={() => setActiveModal('privacy')} className="text-left hover:text-white transition-colors hover:underline focus:outline-none">Kebijakan Privasi</button></li>
                <li><button onClick={() => setActiveModal('faq')} className="text-left hover:text-white transition-colors hover:underline focus:outline-none">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg border-b border-gray-600 pb-2 inline-block">Kontak</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>Pusat Pelayanan Terpadu</li>
                <li>Jl. Merdeka No. 1, Jakarta</li>
                <li>Email: kontak@sipedi.go.id</li>
                <li>Telepon: 1500-123</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Sipedi - Pelayanan Publik Republik Indonesia. Hak Cipta Dilindungi.
          </div>
        </div>
      </footer>

      {/* Render Modal Outside Footer Flow */}
      <InfoModal 
        isOpen={activeModal !== null} 
        onClose={() => setActiveModal(null)} 
        title={getModalTitle()}
      >
        {renderModalContent()}
      </InfoModal>
    </>
  );
};
