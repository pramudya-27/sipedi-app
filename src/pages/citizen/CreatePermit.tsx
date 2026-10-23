import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { permitService } from '../../services/permitService';
import { useAuthStore } from '../../store/authStore';
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Building2, 
  User, 
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import bgTexture6 from '../../assets/bg7.jpg';

export const CreatePermit: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const formRef = useRef<HTMLFormElement>(null);

  const initialFormData = {
    fullName: user?.name || '',
    nik: '',
    phone: '',
    email: user?.email || '',
    address: '',
    permitType: 'Izin Usaha Mikro (IUMK)',
    businessName: '',
    businessSector: 'Kuliner & Makanan Minuman',
    businessAddress: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State untuk Toast Notification
  const [showToast, setShowToast] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file melebihi batas 5MB.');
        return;
      }
      setErrorMsg('');
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formRef.current && !formRef.current.checkValidity()) {
      const invalidElement = formRef.current.querySelector(':invalid') as HTMLElement;
      if (invalidElement) {
        invalidElement.focus();
        invalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    if (formData.nik.length !== 16) {
      setErrorMsg('NIK harus terdiri dari 16 digit angka sesuai KTP.');
      const nikInput = document.querySelector('input[name="nik"]') as HTMLElement;
      nikInput?.focus();
      nikInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!agreed) {
      setErrorMsg('Harap setujui pernyataan keabsahan data sebelum mengirim.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('type', formData.permitType);
      data.append('business_name', formData.businessName);
      data.append('applicant_name', formData.fullName);
      data.append('full_name', formData.fullName);
      data.append('nik', formData.nik);
      data.append('phone', formData.phone);
      data.append('email', formData.email);
      data.append('address', formData.address);
      data.append('business_sector', formData.businessSector);
      data.append('business_address', formData.businessAddress);

      if (file) {
        data.append('file', file);
        data.append('documents', file);
      }

      await permitService.createPermit(data, file || undefined);

      alert('Pengajuan izin berhasil dikirim!');

      setFormData(initialFormData);
      setFile(null);
      setAgreed(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 3. Munculkan Pop-up Toast 
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 3000);

    } catch (error: any) {
      console.error('Failed to create permit:', error);
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          setErrorMsg(`Gagal: ${detail}`);
        } else if (Array.isArray(detail)) {
          setErrorMsg(`Gagal: ${detail[0]?.msg || 'Format data tidak sesuai.'}`);
        } else {
          setErrorMsg('Gagal mengajukan izin. Silakan periksa kembali data Anda.');
        }
      } else {
        setErrorMsg('Gagal mengajukan izin. Pastikan server aktif dan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col pt-16 lg:pt-20 relative overflow-hidden">
      
      {/* Toast Notification (Floating Popup) */}
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
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-emerald-500/30"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </motion.div>
            <div>
              <p className="text-sm font-extrabold text-white">Data Anda Sudah Disimpan!</p>
              <p className="text-xs text-slate-300 font-medium">Permohonan izin baru telah berhasil tercatat di sistem.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Image Texture */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: `url(${bgTexture6})` }}
      ></div>

      {/* Moving Rainbow Aura Blobs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute -top-16 -left-20 w-[38rem] h-[38rem] bg-sky-200/50 rounded-full blur-[130px] animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-[35rem] h-[35rem] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute -bottom-10 left-1/4 w-[36rem] h-[36rem] bg-rose-200/35 rounded-full blur-[130px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        
        {/* Back Navigation Button */}
        <button
          type="button"
          onClick={() => navigate('/citizen/permits')}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" strokeWidth={1.75} />
          Kembali ke Daftar Perizinan
        </button>

        {/* Page Header Title */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full mb-3 shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
              Layanan Perizinan Usaha Digital
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Pengajuan Izin <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
              Usaha Mikro (IUMK)
            </span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-2 font-medium max-w-2xl">
            Lengkapi formulir data diri dan informasi legalitas usaha Anda untuk penerbitan surat izin dan NIB resmi.
          </p>
        </div>

        {/* Main Glassmorphic Form Card */}
        <div className="bg-white/85 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-[0_15px_35px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500">
          
          {errorMsg && (
            <div className="mx-6 sm:mx-10 mt-8 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm font-medium flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" strokeWidth={2} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
            
            {/* Section 1: Data Diri Pemohon */}
            <div className="space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                  1
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                    Data Diri Pemohon
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Data identitas pemohon sesuai KTP elektronik yang masih berlaku
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Nama Lengkap (Sesuai KTP) <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Contoh: Panji Ibrahim"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    NIK (16 Digit) <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="nik"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, nik: val }));
                    }}
                    placeholder="3171xxxxxxxxxxxx"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Nomor WhatsApp / HP Aktif <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="081234567890"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Alamat Email <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="panji@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Alamat Lengkap Domisili (KTP) <span className="text-blue-600">*</span>
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm resize-none scroll-mt-28"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Informasi Usaha */}
            <div className="space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                  2
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                    Informasi Usaha & Perizinan
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Rincian kategori perizinan serta profil tempat usaha yang didaftarkan
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Jenis Perizinan <span className="text-blue-600">*</span>
                  </label>
                  <select
                    name="permitType"
                    value={formData.permitType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all shadow-sm scroll-mt-28"
                  >
                    <option value="Izin Usaha Mikro (IUMK)">Izin Usaha Mikro (IUMK)</option>
                    <option value="Surat Keterangan Usaha (SKU)">Surat Keterangan Usaha (SKU)</option>
                    <option value="Izin Reklame & Spanduk">Izin Reklame & Pemasangan Spanduk</option>
                    <option value="Izin Keramaian / Kegiatan">Izin Keramaian / Penyelenggaraan Kegiatan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Nama Usaha / Merek Dagang <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Contoh: Kedai Kopi Makmur Jaya"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Bidang / Sektor Usaha <span className="text-blue-600">*</span>
                  </label>
                  <select
                    name="businessSector"
                    value={formData.businessSector}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all shadow-sm scroll-mt-28"
                  >
                    <option value="Kuliner & Makanan Minuman">Kuliner & Makanan Minuman (F&B)</option>
                    <option value="Perdagangan & Retail">Perdagangan, Grosir & Ritel</option>
                    <option value="Jasa & Industri Kreatif">Jasa, Servis & Industri Kreatif</option>
                    <option value="Fashion & Kerajinan">Fashion, Tekstil & Kerajinan Tangan</option>
                    <option value="Pertanian & Peternakan">Pertanian, Perkebunan & Peternakan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Alamat Tempat Usaha <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessAddress"
                    required
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    placeholder="Lokasi gerai/toko atau domisili usaha"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Upload Dokumen Persyaratan */}
            <div className="space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                  3
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                    Dokumen Persyaratan
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Unggah foto/scan KTP atau berkas pendukung lainnya (PDF, JPG, PNG maks 5MB)
                  </p>
                </div>
              </div>

              <div>
                {!file ? (
                  <label
                    htmlFor="permit-file-upload"
                    className="flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/20 hover:bg-blue-50/50 rounded-2xl cursor-pointer transition-all group shadow-inner"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 shadow-sm transition-all mb-3">
                      <Upload className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-800">
                      <span className="text-blue-600 group-hover:underline">Pilih berkas dokumen</span> atau seret ke sini
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      Scan KTP, NPWP, atau Foto Tempat Usaha (PDF, JPG, PNG maks 5MB)
                    </p>
                    <input
                      id="permit-file-upload"
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/jpg"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-blue-200 bg-white/90 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-blue-500/20">
                        DOC
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Hapus berkas"
                    >
                      <Trash2 className="w-4.5 h-4.5" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Pernyataan & Aksi */}
            <div className="pt-4 border-t border-slate-100 space-y-6">
              <label className="flex items-start gap-3 cursor-pointer select-none bg-blue-50/50 p-4 rounded-2xl border border-blue-100/80">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer scroll-mt-28"
                />
                <span className="text-xs text-slate-700 font-medium leading-relaxed">
                  Saya menyatakan dengan sebenar-benarnya bahwa seluruh data dan dokumen yang dilampirkan adalah sah, benar, serta dapat dipertanggungjawabkan sesuai hukum yang berlaku.
                </span>
              </label>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/citizen/permits')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>Memproses...</>
                  ) : (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                      Kirim Pengajuan Izin
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};