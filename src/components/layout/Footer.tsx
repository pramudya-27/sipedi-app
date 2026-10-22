import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, MapPin } from 'lucide-react';
import logo from '../../assets/logo1.png';

const InfoModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/70 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#0f172a]">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100 focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-gray-700 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'faq' | null>(null);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const renderModalContent = () => {
    if (activeModal === 'terms') {
      return (
        <div className="space-y-4">
          <p className="font-semibold text-base text-[#0f172a]">Selamat datang di SIPEDI.</p>
          <p>Dengan menggunakan layanan kami, Anda menyetujui syarat dan ketentuan berikut:</p>
          <ol className="list-decimal pl-5 space-y-2 mt-3">
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
          <p className="font-semibold text-base text-[#0f172a]">Privasi Anda sangat penting bagi kami.</p>
          <p>Kebijakan ini menjelaskan bagaimana kami mengumpulkan dan melindungi data Anda.</p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong className="text-[#0f172a]">Pengumpulan Data:</strong> Kami mengumpulkan NIK, Email, dan data usaha yang Anda serahkan.</li>
            <li><strong className="text-[#0f172a]">Penggunaan Data:</strong> Data hanya digunakan untuk keperluan penerbitan dokumen perizinan dan tindak lanjut pengaduan.</li>
            <li><strong className="text-[#0f172a]">Keamanan:</strong> Kami menerapkan standar enkripsi yang ketat untuk melindungi data sensitif Anda.</li>
          </ul>
        </div>
      );
    }
    if (activeModal === 'faq') {
      return (
        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-[#0f172a]">1. Berapa lama proses perizinan UMKM?</h3>
            <p className="mt-1 text-gray-600">Umumnya perizinan akan selesai dalam 1-3 hari kerja jika seluruh dokumen lengkap.</p>
          </div>
          <div>
            <h3 className="font-bold text-[#0f172a]">2. Apakah pengajuan izin dipungut biaya?</h3>
            <p className="mt-1 text-gray-600">Tidak. Seluruh layanan pendaftaran NIB dan Izin Usaha Mikro melalui SIPEDI adalah GRATIS.</p>
          </div>
          <div>
            <h3 className="font-bold text-[#0f172a]">3. Bagaimana cara melacak laporan pengaduan saya?</h3>
            <p className="mt-1 text-gray-600">Gunakan nomor resi yang diberikan setelah Anda membuat laporan, lalu masukkan di kolom pencarian pada Halaman Beranda.</p>
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
      <footer className="w-full bg-[#080d1a] text-slate-300 border-t border-slate-800/80 font-sans pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-10">
            
            {/* Col 1: Brand Info & Address */}
            <div className="lg:col-span-5 space-y-4">
              <Link to="/" onClick={scrollToTop} className="inline-flex items-center space-x-3 group">
                {/* Logo diberi filter brightness-0 invert*/}
                <div className="p-1.5 rounded-xl bg-white/10 border border-white/10 group-hover:bg-white/20 transition-all">
                  <img
                    src={logo}
                    alt="SIPEDI Logo"
                    className="h-8 w-auto brightness-0 invert group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight text-white leading-none">
                    SIPEDI
                  </span>
                  <span className="text-[10px] font-semibold text-blue-400 tracking-widest uppercase mt-1">
                    Layanan UMKM
                  </span>
                </div>
              </Link>

              <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-sm">
                Sistem terintegrasi untuk memudahkan pelaku UMKM dalam mengurus perizinan dan melaporkan masalah ketertiban umum secara digital.
              </p>

              <div className="flex items-start space-x-2 text-xs text-slate-400 pt-1">
                <MapPin size={15} className="text-blue-400 shrink-0 mt-0.5" />
                <span>Pusat Pelayanan Terpadu, Duri Kosambi Baru, Jakarta Barat, 11750</span>
              </div>
            </div>

            {/* Col 2 & 3: Links (Menyamping 2 Kolom di Desktop maupun Mobile) */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-6 sm:gap-10">
              
              {/* Layanan Utama */}
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2.5">
                  Layanan Utama
                </h3>
                <ul className="space-y-2.5 text-xs md:text-sm">
                  <li>
                    <Link
                      to="/services"
                      onClick={scrollToTop}
                      className="hover:text-blue-400 transition-all duration-200 inline-block hover:translate-x-1"
                    >
                      Perizinan Mikro
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/services"
                      onClick={scrollToTop}
                      className="hover:text-blue-400 transition-all duration-200 inline-block hover:translate-x-1"
                    >
                      Pengaduan Ketertiban
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/services"
                      onClick={scrollToTop}
                      className="hover:text-blue-400 transition-all duration-200 inline-block hover:translate-x-1"
                    >
                      Status Layanan
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Pusat Bantuan */}
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2.5">
                  Pusat Bantuan
                </h3>
                <ul className="space-y-2.5 text-xs md:text-sm">
                  <li>
                    <Link
                      to="/about"
                      onClick={scrollToTop}
                      className="hover:text-emerald-400 transition-all duration-200 inline-block hover:translate-x-1"
                    >
                      Tentang Kami
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal('faq')}
                      className="hover:text-emerald-400 transition-all duration-200 inline-block hover:translate-x-1 text-left cursor-pointer"
                    >
                      FAQ / Bantuan
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal('terms')}
                      className="hover:text-emerald-400 transition-all duration-200 inline-block hover:translate-x-1 text-left cursor-pointer"
                    >
                      Syarat & Ketentuan
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveModal('privacy')}
                      className="hover:text-emerald-400 transition-all duration-200 inline-block hover:translate-x-1 text-left cursor-pointer"
                    >
                      Kebijakan Privasi
                    </button>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* Bottom Bar: Copyright & Sosmed */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} SIPEDI GovTech. Hak Cipta Dilindungi.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2.5 rounded-full bg-slate-800/80 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-slate-300 hover:text-white transition-all duration-200 shadow-md hover:scale-110 cursor-pointer"
              >
                <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2.5 rounded-full bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white transition-all duration-200 shadow-md hover:scale-110 cursor-pointer"
              >
                <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2.5 rounded-full bg-slate-800/80 hover:bg-blue-700 text-slate-300 hover:text-white transition-all duration-200 shadow-md hover:scale-110 cursor-pointer"
              >
                <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* Modal render */}
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