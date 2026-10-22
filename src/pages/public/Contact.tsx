import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  MapPin, 
  Mail, 
  Phone, 
  HelpCircle, 
  ChevronDown, 
  MessageSquare,
  Sparkles,
  FileText,
  ShieldAlert,
  Bot,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import bgTexture5 from '../../assets/bg5.jpg';

export const Contact: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // State Form & Loading untuk API Contact
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  
  // State untuk Toast Notification Bergerak ala Perizinan
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert("Silakan pilih kategori laporan terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // 1. Reset Form & Scroll 
        setFormData({
          name: '',
          email: '',
          phone: '',
          category: '',
          message: ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 2. Munculkan Toast Pop-up
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
        }, 3000);

      } else {
        alert("Gagal mengirim pesan. Mohon periksa kembali isian formulir Anda.");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Gagal terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: 'Berapa lama proses penerbitan Surat Izin Usaha Mikro (IUMK) & NIB?',
      answer: 'Proses verifikasi dan penerbitan NIB melalui sistem SIPEDI berlangsung secara otomatis dan instan (dalam waktu 5-15 menit) setelah seluruh dokumen persyaratan diunggah dengan benar.'
    },
    {
      question: 'Apakah pengajuan perizinan dan pengaduan dikenakan biaya?',
      answer: 'Seluruh pelayanan publik di SIPEDI (baik pembuatan Izin Usaha Mikro maupun Laporan Pengaduan Ketertiban) 100% GRATIS dan bebas dari segala bentuk pungutan liar (pungli).'
    },
    {
      question: 'Bagaimana cara melacak status pengaduan ketertiban yang sudah dikirim?',
      answer: 'Anda dapat memasukkan Nomor Resi / ID Pengaduan pada fitur "Lacak Status" di halaman Beranda atau melihat perkembangan tindak lanjut petugas di Dashboard Akun Anda secara real-time.'
    },
    {
      question: 'Apa yang harus dilakukan jika lupa kata sandi akun SIPEDI?',
      answer: 'Klik menu "Masuk / Daftar", pilih tautan "Lupa Sandi?", lalu masukkan email terdaftar Anda. Tautan pemulihan kata sandi akan dikirimkan langsung ke kotak masuk email Anda.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col pt-16 lg:pt-20 relative overflow-hidden">
      
      {/* Toast Notification (Floating Popup ala Perizinan) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: [1, 1.05, 1],
              transition: { duration: 0.5, ease: "easeOut" }
            }}
            exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.3 } }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-emerald-500/30"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </motion.div>
            <div>
              <p className="text-sm font-extrabold text-white">Pesan Berhasil Dikirim!</p>
              <p className="text-xs text-slate-300 font-medium">Masukan Anda telah tercatat dan masuk ke pusat layanan.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Image Texture */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: `url(${bgTexture5})` }}
      ></div>

      {/* Moving Rainbow Aura Blobs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute -top-16 -left-20 w-[38rem] h-[38rem] bg-sky-200/50 rounded-full blur-[130px] animate-pulse"></div>
        <div className="absolute top-1/4 -right-20 w-[34rem] h-[34rem] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute top-2/3 -left-20 w-[35rem] h-[35rem] bg-rose-200/35 rounded-full blur-[130px] animate-pulse delay-1000"></div>
        <div className="absolute -bottom-10 -right-10 w-[30rem] h-[30rem] bg-amber-200/35 rounded-full blur-[110px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="pt-10 pb-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full mb-4 shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
              Pusat Bantuan & Layanan Kontak
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Ada yang Bisa Kami <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
              Bantu Hari Ini?
            </span>
          </h1>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
            Sampaikan pertanyaan, kendala, atau masukan Anda secara langsung kepada tim layanan SIPEDI.
          </p>
        </div>

        {/* Quick Category Shortcut Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto my-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Panduan Perizinan</h3>
              <p className="text-xs text-slate-500">Syarat & langkah NIB</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Aduan Ketertiban</h3>
              <p className="text-xs text-slate-500">Prosedur penanganan</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Asisten AI 24/7</h3>
              <p className="text-xs text-slate-500">Diskusi otomatis instan</p>
            </div>
          </div>
        </div>

        {/* Main Grid: Contact Form & Info */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 py-6">
          
          {/* Left Column: Form */}
          <div className="w-full">
            <div className="bg-white/85 backdrop-blur-md py-10 px-8 sm:px-12 rounded-[2.5rem] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-500">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Kirim Formulir Pesan</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                  Hubungi Kami
                </h2>
                <p className="text-xs md:text-sm leading-relaxed text-slate-600 font-medium">
                  Sampaikan pertanyaan, kendala, atau masukan Anda. Tim kami akan segera menindaklanjutinya secara langsung.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Nama Lengkap <span className="text-blue-600">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                    className="flex w-full border bg-white/90 px-4 py-3 text-sm rounded-xl border-slate-200/80 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 font-medium transition-all" 
                    placeholder="Nama lengkap Anda" 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Email <span className="text-blue-600">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required 
                      className="flex w-full border bg-white/90 px-4 py-3 text-sm rounded-xl border-slate-200/80 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 font-medium transition-all" 
                      placeholder="Alamat email aktif" 
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Telepon <span className="text-blue-600">*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required 
                      className="flex w-full border bg-white/90 px-4 py-3 text-sm rounded-xl border-slate-200/80 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 font-medium transition-all" 
                      placeholder="Nomor telepon" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Kategori Laporan <span className="text-blue-600">*</span>
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required 
                    className="flex w-full border bg-white/90 px-4 py-3 text-sm rounded-xl border-slate-200/80 shadow-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all"
                  >
                    <option value="" disabled>Pilih kategori yang sesuai</option>
                    <option value="Bantuan Perizinan Usaha Mikro">Bantuan Perizinan Usaha Mikro</option>
                    <option value="Tindak Lanjut Pengaduan Ketertiban">Tindak Lanjut Pengaduan Ketertiban</option>
                    <option value="Kendala Akses Sistem / Akun">Kendala Akses Sistem / Akun</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Pesan Detail <span className="text-blue-600">*</span>
                  </label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required 
                    className="flex w-full border bg-white/90 px-4 py-3 text-sm rounded-xl border-slate-200/80 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 font-medium transition-all min-h-[120px] resize-none" 
                    placeholder="Jelaskan kebutuhan atau kendala Anda secara rinci..."
                  ></textarea>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer py-4 gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirim Pesan...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Pesan Sekarang</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Contact Info & Map */}
          <div className="w-full flex flex-col gap-6">
            <div className="bg-white/85 backdrop-blur-md p-8 sm:p-10 rounded-[2.5rem] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Informasi Kontak Official</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 mr-5 border border-blue-100 shadow-sm">
                      <MapPin className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 mb-1">Gedung Pelayanan Terpadu</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        Duri Kosambi Baru, Cengkareng<br />Jakarta Barat, DKI Jakarta 11750
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 mr-5 border border-indigo-100 shadow-sm">
                      <Phone className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 mb-1">Telepon & Call Center</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        Layanan Siaga 24 Jam: 1500-123<br />WA Bisnis: 0811-8888-9999
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 mr-5 border border-emerald-100 shadow-sm">
                      <Mail className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 mb-1">Email Resmi Layanan</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        bantuan@sipedi.go.id<br />info@sipedi.go.id
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100">
                <a 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  href="https://www.google.com/maps/search/?api=1&query=Duri+Kosambi+Baru+Jakarta+Barat" 
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>Buka Petunjuk Arah Google Maps</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </a>
              </div>
            </div>

            {/* Map Card */}
            <div className="relative w-full h-[320px] rounded-[2.5rem] overflow-hidden border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] bg-slate-100">
              <iframe 
                title="Peta Lokasi Duri Kosambi Baru Jakarta Barat" 
                src="https://maps.google.com/maps?q=Duri+Kosambi+Baru+Jakarta+Barat&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                className="absolute inset-0 h-full w-full border-0" 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-4xl mx-auto pt-10 pb-24">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/80 shadow-sm">
              Pertanyaan Sering Diajukan
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-3">
              FAQ Layanan SIPEDI
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-extrabold text-slate-900 text-sm md:text-base cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${openFaq === index ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                
                {openFaq === index && (
                  <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};