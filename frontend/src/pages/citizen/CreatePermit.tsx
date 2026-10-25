import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    durationMonths: 1,
    startDate: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [nikError, setNikError] = useState('');
  const [checkingNik, setCheckingNik] = useState(false);

  // Real-time validasi keunikan NIK pada perizinan
  const checkNikUnique = async (inputNik: string) => {
    const clean = inputNik.replace(/\D/g, '');
    if (clean.length !== 16) {
      setNikError('');
      return;
    }
    setCheckingNik(true);
    try {
      const res = await permitService.checkNikAvailability(clean);
      if (res && !res.is_available) {
        setNikError(res.message || `NIK ${clean} sudah terdaftar pada perizinan aktif.`);
      } else {
        setNikError('');
      }
    } catch {
      setNikError('');
    } finally {
      setCheckingNik(false);
    }
  };
  
  // State untuk Toast Notification
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState<{ title: string; desc: string }>({
    title: '',
    desc: ''
  });

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
        setErrorMsg(t('permits.errorFileSize'));
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
      setErrorMsg(t('permits.errorNikLength'));
      const nikInput = document.querySelector('input[name="nik"]') as HTMLElement;
      nikInput?.focus();
      nikInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (nikError) {
      setErrorMsg(nikError);
      const nikInput = document.querySelector('input[name="nik"]') as HTMLElement;
      nikInput?.focus();
      nikInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!agreed) {
      setErrorMsg(t('permits.errorAgree'));
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
      data.append('duration_months', String(formData.durationMonths));
      data.append('start_date', formData.startDate);

      if (file) {
        data.append('document', file);
      }

      const res = await permitService.createPermit(data);
      
      const invData = res?.latest_invoice || res?.latest_inv_data;
      const invNum = invData?.invoice_number;
      const snapRedirectUrl = invData?.snap_redirect_url;

      if (snapRedirectUrl || invNum) {
        setToastContent({
          title: "Pengajuan Tercatat — Menuju Pembayaran Midtrans",
          desc: "Mengalihkan Anda langsung ke portal pembayaran resmi Midtrans (QRIS, VA Bank & E-Wallet)..."
        });
        setShowToast(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          if (snapRedirectUrl) {
            window.location.href = snapRedirectUrl;
          } else {
            navigate(`/pay/${invNum}`);
          }
        }, 1200);
      } else {
        setToastContent({
          title: t('permits.toastSavedTitle', 'Pengajuan Berhasil Dikirim'),
          desc: t('permits.toastSavedDesc', 'Data permohonan izin Anda telah dicatat.')
        });
        setShowToast(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          navigate('/citizen/profile');
        }, 1800);
      }

    } catch (err: any) {
      console.error("Submit permit error:", err);
      const detail = err.response?.data?.detail || err.response?.data?.message || err.message;
      if (typeof detail === 'string') {
        setErrorMsg(detail);
      } else if (Array.isArray(detail)) {
        setErrorMsg(detail.map((d: any) => d.msg || JSON.stringify(d)).join(', '));
      } else if (typeof detail === 'object') {
        setErrorMsg(JSON.stringify(detail));
      } else {
        setErrorMsg('Gagal mengajukan izin. Silakan periksa kelengkapan data Anda.');
      }
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col pt-16 lg:pt-20 pb-16 relative overflow-hidden">
      
      {/* Toast Notification */}
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
              <p className="text-sm font-extrabold text-white">{toastContent.title || t('permits.toastSavedTitle')}</p>
              <p className="text-xs text-slate-300 font-medium">{toastContent.desc || t('permits.toastSavedDesc')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Image Texture */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: `url(${bgTexture6})` }}
      ></div>

      {/* Moving Aura Blobs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute -top-16 -left-20 w-[38rem] h-[38rem] bg-sky-200/50 rounded-full blur-[130px] animate-pulse"></div>
        <div className="absolute top-1/4 -right-20 w-[34rem] h-[34rem] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute top-2/3 -left-20 w-[35rem] h-[35rem] bg-rose-200/35 rounded-full blur-[130px] animate-pulse delay-1000"></div>
        <div className="absolute -bottom-10 -right-10 w-[30rem] h-[30rem] bg-amber-200/35 rounded-full blur-[110px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/citizen/permits')}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-blue-600 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm mb-6 transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>{t('permits.backToList')}</span>
        </button>

        {/* Page Header Title */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full mb-3 shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
              {t('permits.badge')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t('permits.createTitle')}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-2 font-medium max-w-2xl">
            {t('permits.createDesc')}
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
                    {t('permits.sec1Title')}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('permits.sec1Desc')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.fullName')} <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={t('permits.placeholderName')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      {t('permits.nik')} <span className="text-blue-600">*</span>
                    </label>
                    {checkingNik && (
                      <span className="text-[11px] font-semibold text-blue-600 animate-pulse">
                        Memeriksa ketersediaan NIK...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="nik"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, nik: val }));
                      if (val.length === 16) {
                        checkNikUnique(val);
                      } else {
                        if (nikError) setNikError('');
                      }
                    }}
                    onBlur={() => {
                      if (formData.nik.length === 16) {
                        checkNikUnique(formData.nik);
                      }
                    }}
                    placeholder={t('permits.placeholderNik')}
                    className={`w-full px-4 py-3 rounded-xl border bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28 ${
                      nikError
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200/80 focus:ring-blue-600/20 focus:border-blue-500'
                    }`}
                  />
                  {nikError && (
                    <p className="text-xs font-semibold text-rose-600 flex items-start gap-1.5 pt-1 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                      <span>{nikError}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.phone')} <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('permits.placeholderPhone')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.email')} <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('permits.placeholderEmail')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.domicileAddress')} <span className="text-blue-600">*</span>
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={t('permits.placeholderAddress')}
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
                    {t('permits.sec2Title')}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('permits.sec2Desc')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.permitType')} <span className="text-blue-600">*</span>
                  </label>
                  <select
                    name="permitType"
                    value={formData.permitType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all shadow-sm scroll-mt-28"
                  >
                    <option value="Izin Usaha Mikro (IUMK)">{t('permits.optTypeIumk')}</option>
                    <option value="Surat Keterangan Usaha (SKU)">{t('permits.optTypeSku')}</option>
                    <option value="Izin Reklame & Spanduk">{t('permits.optTypeBanner')}</option>
                    <option value="Izin Keramaian / Kegiatan">{t('permits.optTypeEvent')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.businessName')} <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder={t('permits.placeholderBusinessName')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.businessSector')} <span className="text-blue-600">*</span>
                  </label>
                  <select
                    name="businessSector"
                    value={formData.businessSector}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all shadow-sm scroll-mt-28"
                  >
                    <option value="Kuliner & Makanan Minuman">{t('permits.optSectorFnB')}</option>
                    <option value="Perdagangan & Retail">{t('permits.optSectorRetail')}</option>
                    <option value="Jasa & Industri Kreatif">{t('permits.optSectorService')}</option>
                    <option value="Fashion & Kerajinan">{t('permits.optSectorFashion')}</option>
                    <option value="Pertanian & Peternakan">{t('permits.optSectorAgri')}</option>
                    <option value="Lainnya">{t('permits.optSectorOther')}</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.businessAddress')} <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessAddress"
                    required
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    placeholder={t('permits.placeholderBusinessAddress')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Durasi Izin yang Diminta <span className="text-blue-600">*</span>
                  </label>
                  <select
                    name="durationMonths"
                    value={formData.durationMonths}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all shadow-sm scroll-mt-28"
                  >
                    <option value={1}>1 Bulan (Retribusi Resmi - Rp 100.000)</option>
                    <option value={3}>3 Bulan (Retribusi Resmi)</option>
                    <option value={6}>6 Bulan (Retribusi Resmi)</option>
                    <option value={12}>12 Bulan (1 Tahun Penuh)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Tanggal Mulai Izin Diminta <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all shadow-sm scroll-mt-28"
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
                    {t('permits.sec3Title')}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('permits.sec3Desc')}
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
                      {t('permits.dragDropText')}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      {t('permits.uploadHint')}
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
                      title={t('permits.deleteFile')}
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
                  {t('permits.declaration')}
                </span>
              </label>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/citizen/permits')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>{t('permits.submitting')}</>
                  ) : (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                      {t('permits.submitBtn')}
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
