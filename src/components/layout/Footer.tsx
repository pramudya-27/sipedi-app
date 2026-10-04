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
      <footer className="relative bg-[#020617] text-white pt-16 pb-0 overflow-hidden font-sans border-t border-white/5">
        {/* Soft Blue Radial Gradient / Glow in the background */}
        <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[80%] bg-[#1e3a8a] opacity-30 blur-[130px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Col 1: Logo & Address */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 mb-8">
                <img src={logo} alt="SIPEDI Logo" className="h-10 w-auto brightness-0 invert" />
                <span className="font-bold text-2xl tracking-tight">SIPEDI</span>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm font-semibold mb-2">Alamat</h4>
                <p className="text-gray-300 text-sm leading-relaxed mb-1">
                  Pusat Pelayanan Terpadu
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Duri Kosambi Baru<br/>
                  Jakarta Barat, 11750
                </p>
              </div>
            </div>

            {/* Col 2: Layanan */}
            <div>
              <h4 className="text-gray-400 text-sm font-semibold mb-4">Layanan Utama</h4>
              <ul className="space-y-4 text-[15px] font-medium text-white">
                <li><Link to="/permits" className="hover:text-blue-400 transition-colors">Perizinan Mikro</Link></li>
                <li><Link to="/complaints" className="hover:text-blue-400 transition-colors">Pengaduan Ketertiban</Link></li>
                <li><Link to="/" className="hover:text-blue-400 transition-colors">Status Layanan</Link></li>
              </ul>
            </div>

            {/* Col 3: Pusat Bantuan */}
            <div>
              <h4 className="text-gray-400 text-sm font-semibold mb-4">Pusat Bantuan</h4>
              <ul className="space-y-4 text-[15px] font-medium text-white">
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">Tentang Kami</Link></li>
                <li><Link to="/ai-assistant" className="hover:text-blue-400 transition-colors">Panduan Publik</Link></li>
                <li><button onClick={() => setActiveModal('faq')} className="text-left hover:text-blue-400 transition-colors">FAQ</button></li>
              </ul>
            </div>

            {/* Col 4: Tautan Lainnya */}
            <div>
              <h4 className="text-gray-400 text-sm font-semibold mb-4">Tautan Lainnya</h4>
              <ul className="space-y-4 text-[15px] font-medium text-white">
                <li><button onClick={() => setActiveModal('terms')} className="text-left hover:text-blue-400 transition-colors">Syarat & Ketentuan</button></li>
                <li><button onClick={() => setActiveModal('privacy')} className="text-left hover:text-blue-400 transition-colors">Kebijakan Privasi</button></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Hubungi Kami</Link></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-6 pb-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 font-medium mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Sistem Perizinan Digital (SIPEDI)
            </div>
            
            {/* Social Icons (Placeholder using SVG or text) */}
            <div className="flex space-x-5">
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom decorative color line */}
        <div className="w-full flex h-2 relative z-10">
          <div className="w-1/4 bg-[#1e40af]"></div>
          <div className="w-1/4 bg-[#2563eb]"></div>
          <div className="w-1/4 bg-[#3b82f6]"></div>
          <div className="w-1/4 bg-[#60a5fa]"></div>
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
