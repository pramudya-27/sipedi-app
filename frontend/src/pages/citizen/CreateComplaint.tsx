import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { complaintService } from "../../services/complaintService";
import { useAuthStore } from "../../store/authStore";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Check,
  User,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import bgTexture7 from "../../assets/bg7.jpg";

export const CreateComplaint: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const formRef = useRef<HTMLFormElement>(null);

  const initialFormData = {
    fullName: user?.name || "",
    nik: "",
    phone: "",
    email: user?.email || "",
    address: "",
    category: "Fasilitas Umum",
    title: "",
    location: "",
    incidentDate: new Date().toISOString().split("T")[0],
    description: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showToast, setShowToast] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setErrorMsg(t("complaints.errorFileSize"));
        return;
      }
      setErrorMsg("");
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
      setErrorMsg(t("complaints.errorNikLength"));
      const nikInput = document.querySelector('input[name="nik"]') as HTMLElement;
      nikInput?.focus();
      nikInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!agreed) {
      setErrorMsg(t("complaints.errorAgree"));
      const checkboxInput = document.querySelector('input[type="checkbox"]') as HTMLElement;
      checkboxInput?.focus();
      checkboxInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const data = new FormData();
      data.append("category", formData.category);
      data.append("title", formData.title || formData.category);
      data.append("location", formData.location);
      data.append("description", formData.description);
      data.append("full_name", formData.fullName);
      data.append("reporter_name", formData.fullName);
      data.append("nik", formData.nik);
      data.append("phone", formData.phone);
      data.append("email", formData.email);
      data.append("address", formData.address);
      data.append("incident_date", formData.incidentDate);

      if (file) {
        data.append("evidences", file);
        data.append("file_name", file.name);
        data.append("file_type", file.type || "image/png");
      }

      await complaintService.createComplaint(data);

      setFormData(initialFormData);
      setFile(null);
      setAgreed(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        navigate('/citizen/profile');
      }, 2000);

    } catch (error: any) {
      console.error("Failed to create complaint:", error);
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          setErrorMsg(`Gagal: ${detail}`);
        } else {
          setErrorMsg(t('complaints.errorSubmitFail'));
        }
      } else {
        setErrorMsg(t("complaints.errorServer"));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col pt-16 lg:pt-20 relative overflow-hidden">
      
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
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-emerald-500/30"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </motion.div>
            <div>
              <p className="text-sm font-extrabold text-white">{t('complaints.toastSavedTitle')}</p>
              <p className="text-xs text-slate-300 font-medium">{t('complaints.toastSavedDesc')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Image Texture */}
      <div 
        className="absolute inset-0 h-full w-full z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: `url(${bgTexture7})` }}
      ></div>

      {/* Moving Aura Blobs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute -top-16 -left-20 w-[38rem] h-[38rem] bg-rose-200/50 rounded-full blur-[130px] animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-[35rem] h-[35rem] bg-amber-200/40 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute -bottom-10 left-1/4 w-[36rem] h-[36rem] bg-indigo-200/35 rounded-full blur-[130px] animate-pulse delay-1000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pb-8 flex-1">
        
        {/* Back Navigation Button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft
            className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1"
            strokeWidth={1.75}
          />
          {t('complaints.backToList')}
        </button>

        {/* Page Header Title */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 bg-rose-50 border border-rose-200/80 px-4 py-1.5 rounded-full mb-3 shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-extrabold text-rose-700 uppercase tracking-wider">
              {t('complaints.badge')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t('complaints.createTitle')}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-2 font-medium max-w-2xl">
            {t('complaints.createDesc')}
          </p>
        </div>

        {/* Main Glassmorphic Form Card */}
        <div className="bg-white/85 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-[0_15px_35px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500 mb-6">
          
          {errorMsg && (
            <div className="mx-6 sm:mx-10 mt-8 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm font-medium flex items-start gap-3 shadow-sm">
              <AlertCircle
                className="w-5 h-5 shrink-0 mt-0.5 text-rose-600"
                strokeWidth={2}
              />
              <span>{errorMsg}</span>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
            
            {/* Section 1: Data Diri Pelapor */}
            <div className="space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
                  1
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-rose-600" strokeWidth={2.5} />
                    {t('complaints.sec1Title')}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('complaints.sec1Desc')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.fullName')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={t('complaints.placeholderName')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.nik')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="nik"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({ ...prev, nik: val }));
                    }}
                    placeholder={t('complaints.placeholderNik')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.phone')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('complaints.placeholderPhone')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.email')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('complaints.placeholderEmail')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('permits.domicileAddress')} <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={t('complaints.placeholderAddress')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-500 transition-all placeholder:text-slate-400 shadow-sm resize-none scroll-mt-28"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Rincian Pengaduan */}
            <div className="space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
                  2
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-600" strokeWidth={2.5} />
                    {t('complaints.sec2Title')}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('complaints.sec2Desc')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('complaints.category')} <span className="text-rose-600">*</span>
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-500 transition-all shadow-sm scroll-mt-28"
                  >
                    <option value="Fasilitas Umum">
                      {t('complaints.catPublicFacility')}
                    </option>
                    <option value="Ketertiban Lingkungan">
                      {t('complaints.catOrder')}
                    </option>
                    <option value="Parkir Liar & Kemacetan">
                      {t('complaints.catParking')}
                    </option>
                    <option value="Pungutan Liar">
                      {t('complaints.catPungli')}
                    </option>
                    <option value="Pelanggaran Perizinan Usaha">
                      {t('complaints.catBusinessViolation')}
                    </option>
                    <option value="Lainnya">{t('complaints.catOther')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('complaints.incidentDate')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="incidentDate"
                    required
                    value={formData.incidentDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-500 transition-all shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('complaints.location')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder={t('complaints.placeholderLocation')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-500 transition-all placeholder:text-slate-400 shadow-sm scroll-mt-28"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    {t('complaints.description')} <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={t('complaints.placeholderDesc')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-500 transition-all placeholder:text-slate-400 shadow-sm resize-none scroll-mt-28"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Upload Bukti Pendukung */}
            <div className="space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
                  3
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-600" strokeWidth={2.5} />
                    {t('complaints.sec3Title')}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('complaints.sec3Desc')}
                  </p>
                </div>
              </div>

              <div>
                {!file ? (
                  <label
                    htmlFor="complaint-file-upload"
                    className="flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-rose-200 hover:border-rose-500 bg-rose-50/20 hover:bg-rose-50/50 rounded-2xl cursor-pointer transition-all group shadow-inner"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 shadow-sm transition-all mb-3">
                      <Upload className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-800">
                      <span className="text-rose-600 group-hover:underline">{t('complaints.uploadLink')}</span> {t('complaints.orDragHere')}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      {t('complaints.uploadHint')}
                    </p>
                    <input
                      id="complaint-file-upload"
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-rose-200 bg-white/90 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-rose-500/20">
                        {t('complaints.evidenceTag')}
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
                      title={t('complaints.deleteFile')}
                    >
                      <Trash2 className="w-4.5 h-4.5" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Pernyataan & Aksi */}
            <div className="pt-4 border-t border-slate-100 space-y-6">
              <label className="flex items-start gap-3 cursor-pointer select-none bg-rose-50/50 p-4 rounded-2xl border border-rose-100/80">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer scroll-mt-28"
                />
                <span className="text-xs text-slate-700 font-medium leading-relaxed">
                  {t('complaints.declaration')}
                </span>
              </label>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>{t('complaints.submitting')}</>
                  ) : (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                      {t('complaints.submitBtn')}
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
