import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useChatStore } from "../../store/chatStore";
import { permitService } from "../../services/permitService";
import { api } from "../../services/api";
import {
  Search,
  FileText,
  ShieldAlert,
  Bot,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Clock,
  Loader2,
  Download,
  CreditCard,
  Building2,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import heroBg from "../../assets/city.jpg";
import heroBg2 from "../../assets/umkm.jpg";
import bgGridTexture from "../../assets/bg2.jpg";
import bgTexture3 from "../../assets/bg3.jpg";

// Danantara-style animation easing curve
const easeOutQuart = [0.16, 1, 0.3, 1] as const;

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { openChat } = useChatStore();

  // State khusus penanganan Lacak Status
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [trackedResult, setTrackedResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [renewing, setRenewing] = useState(false);

  const executeSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Menggunakan instance api axios terkonfigurasi (mendukung production & local)
      const encodedQuery = encodeURIComponent(query.trim());
      try {
        const response = await api.get(`/v1/track/${encodedQuery}`);
        setTrackedResult(response.data);
        setShowModal(true);
      } catch (errFirst) {
        // Fallback ke /track jika backend route tidak menggunakan prefix /v1
        const fallbackRes = await api.get(`/track/${encodedQuery}`);
        setTrackedResult(fallbackRes.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching track status:", error);
      alert(t('hero.trackingNotFound', 'Nomor resi / tiket tidak ditemukan. Pastikan format nomor sudah benar.'));
    } finally {
      setLoading(false);
    }
  };

  // Auto-search jika ada parameter ?track= di URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackCode = params.get('track');
    if (trackCode) {
      setSearchQuery(trackCode);
      executeSearch(trackCode);
    }
  }, []);

  // Handler Lacak Status
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert(t('hero.noTrackingInput', 'Silakan masukkan nomor izin atau resi terlebih dahulu.'));
      return;
    }
    executeSearch(searchQuery);
  };

  // Handler Perpanjang Izin langsung ke Midtrans Snap
  const handleRequestRenewal = async (permitId: string) => {
    setRenewing(true);
    try {
      const res = await permitService.requestRenewal(permitId, 1, 'Perpanjangan izin operasional (1 Bulan)');
      if (res?.snap_redirect_url) {
        window.location.href = res.snap_redirect_url;
      } else if (res?.invoice_number) {
        window.location.href = `/pay/${res.invoice_number}`;
      } else {
        alert("Tagihan perpanjangan berhasil dibuat. Silakan cek email Anda.");
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Gagal membuat tagihan perpanjangan.");
    } finally {
      setRenewing(false);
    }
  };

  // Base URL API untuk PDF download
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans relative overflow-x-hidden">
      
      {/* 1. Hero Section dengan Danantara Smooth Parallax & Stagger Entrance */}
      <section className="relative w-full min-h-[540px] md:min-h-[580px] flex items-center justify-center overflow-hidden">
        {/* Background Image dengan Smooth Scale In */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#070e20]/90 via-[#0b162e]/85 to-[#0f172a]/95 z-10"></div>
          <motion.img
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: easeOutQuart }}
            src={heroBg}
            alt="SIPEDI Layanan"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[45rem] h-[25rem] bg-blue-500/15 rounded-full blur-[130px]"></div>
          <div className="absolute bottom-0 right-1/4 w-[30rem] h-[20rem] bg-cyan-400/10 rounded-full blur-[110px]"></div>
        </div>

        {/* Hero Content Staggered Animations */}
        <div className="relative z-20 w-full max-w-4xl px-4 sm:px-6 flex flex-col items-center pt-8 pb-16">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: easeOutQuart }}
            className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-xl px-4 py-1.5 rounded-full mb-6 shadow-lg shadow-black/20"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="text-xs font-bold text-cyan-100 uppercase tracking-widest">
              {t('hero.badge', 'Sistem Perizinan & Ketertiban Digital')}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.15, ease: easeOutQuart }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 text-center tracking-tight leading-tight max-w-3xl drop-shadow-md"
          >
            {t('hero.title', 'Lacak Perizinan & Pengaduan Anda')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: easeOutQuart }}
            className="text-sm md:text-base text-slate-300/90 mb-8 text-center max-w-2xl leading-relaxed font-medium"
          >
            {t('hero.subtitle', 'Sistem terintegrasi untuk memudahkan pelaku UMKM dalam mengurus perizinan dan melaporkan masalah ketertiban umum.')}
          </motion.p>

          {/* Form Lacak Status Glassmorphism */}
          <motion.form
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.42, ease: easeOutQuart }}
            onSubmit={handleSearch}
            className="bg-white/10 backdrop-blur-2xl p-2.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col md:flex-row gap-2.5 w-full border border-white/25 hover:border-white/40 transition-colors"
          >
            <div className="flex-grow relative flex items-center bg-white/95 rounded-xl overflow-hidden shadow-inner">
              <Search
                className="absolute left-4 text-slate-400 w-5 h-5"
                strokeWidth={2}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('hero.searchPlaceholder', 'Masukkan Nomor Izin atau Resi (Misal: PRM-20261022-AE27EA6A)')}
                className="w-full pl-12 pr-4 py-3.5 md:py-4 text-sm md:text-base border-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 bg-transparent placeholder-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white px-8 py-3.5 md:py-4 font-extrabold text-sm md:text-base rounded-xl transition-all duration-300 w-full md:w-auto shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('common.loading', 'Mencari...')}</span>
                </>
              ) : (
                <span>{t('hero.searchButton', 'Lacak Status')}</span>
              )}
            </button>
          </motion.form>
        </div>
      </section>

      {/* Modal Pop-Up Hasil Lacak Status Real-time */}
      {showModal && trackedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: easeOutQuart }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200/80 shadow-2xl relative overflow-hidden"
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>{trackedResult.type}</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {t('hero.trackingModalTitle', 'Status Berkas')}: <span className="text-blue-600">{trackedResult.code}</span>
            </h3>

            {/* Detail Pelacakan Perizinan / Pengaduan */}
            {trackedResult.category === 'PERMIT' ? (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    trackedResult.status_label?.includes('Aktif') ? 'bg-emerald-100 text-emerald-800' :
                    trackedResult.status_label?.includes('Kedaluwarsa') ? 'bg-rose-100 text-rose-800' :
                    trackedResult.status_label?.includes('Ditolak') ? 'bg-rose-100 text-rose-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {trackedResult.status_label}
                  </span>
                  {trackedResult.remaining_days !== null && !trackedResult.is_expired && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                      {trackedResult.remaining_days} hari tersisa
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-slate-600">
                  <p><strong className="text-slate-800">Usaha / Kegiatan:</strong> {trackedResult.business_name || '-'}</p>
                  <p><strong className="text-slate-800">Durasi:</strong> {trackedResult.duration_months} Bulan</p>
                  <p><strong className="text-slate-800">Masa Berlaku:</strong> {trackedResult.start_date} s/d {trackedResult.expired_at}</p>
                </div>

                {trackedResult.rejection_reason && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <p className="font-bold">Alasan Penolakan Petugas:</p>
                    <p className="mt-0.5">{trackedResult.rejection_reason}</p>
                  </div>
                )}

                {/* Perpanjangan Izin Invoice Link if pending */}
                {trackedResult.invoice && trackedResult.invoice.status === 'UNPAID' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">Tagihan Perpanjangan Izin:</span>
                      <span className="font-mono text-xs font-bold text-amber-800">
                        Rp {trackedResult.invoice.total_amount?.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {trackedResult.invoice.snap_redirect_url ? (
                      <a
                        href={trackedResult.invoice.snap_redirect_url}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Bayar Tagihan via Midtrans
                      </a>
                    ) : (
                      <Link
                        to={`/pay/${trackedResult.invoice.invoice_number}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Bayar Tagihan QRIS Sekarang
                      </Link>
                    )}
                  </div>
                )}

                {/* Tombol Perpanjang Izin jika status Kedaluwarsa */}
                {(trackedResult.is_expired || trackedResult.status_label?.includes('Kedaluwarsa') || trackedResult.status === 'EXPIRED') && (!trackedResult.invoice || trackedResult.invoice.status !== 'UNPAID') && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">Masa Berlaku Kedaluwarsa:</span>
                      <span className="font-bold text-xs text-rose-700">1 Bulan @ Rp 100.000</span>
                    </div>
                    <button
                      type="button"
                      disabled={renewing}
                      onClick={() => handleRequestRenewal(trackedResult.permit_id || trackedResult.code)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                    >
                      {renewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                      <span>{renewing ? "Menghubungkan Midtrans..." : "Perpanjang Izin via Midtrans (1 Bulan)"}</span>
                    </button>
                  </div>
                )}

                {/* Download PDF button if active */}
                {trackedResult.has_pdf && (
                  <a
                    href={`${apiBaseUrl}/permits/${trackedResult.code}/download-pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Unduh Surat Izin Resmi (PDF)
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
                Tanggal: <span className="text-slate-800 font-bold">{trackedResult.date}</span>
              </p>
            )}

            {/* Timeline Progress Status Real-time */}
            <div className="space-y-4 border-l-2 border-slate-100 pl-4 my-6">
              {trackedResult.steps && trackedResult.steps.map((step: any, idx: number) => (
                <div key={idx} className="relative flex items-start gap-3">
                  <div className={`absolute -left-[25px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                    step.done ? 'bg-emerald-500 text-white' : step.active ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-200'
                  }`}>
                    {step.done && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-extrabold ${step.active ? 'text-blue-600' : step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md"
              >
                {t('hero.closeModal', 'Tutup Pelacakan')}
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* 2. Interactive Animated Cards Section with Staggered Scroll Reveal */}
      <section className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 mb-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Buat Izin Usaha */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: easeOutQuart }}
          >
            <Link
              to="/citizen/permits/create"
              className="group relative bg-white rounded-3xl p-7 md:p-8 border border-slate-200/70 shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_rgba(37,99,235,0.16)] hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between h-full"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-100/80 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-sky-200 transition-all duration-700 ease-out pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-50 rounded-full blur-2xl group-hover:scale-125 group-hover:bg-blue-100 transition-all duration-700 ease-out pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-sky-100/90 text-sky-600 flex items-center justify-center p-3 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <FileText className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-extrabold text-sky-700 bg-sky-100/80 border border-sky-200 px-3 py-1 rounded-full tracking-wider uppercase">
                    {t('cards.permitBadge', 'Layanan NIB')}
                  </span>
                </div>

                <h3 className="text-slate-900 font-extrabold text-xl tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                  {t('cards.permitTitle', 'Buat Izin Usaha')}
                </h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                  {t('cards.permitDesc', 'Ajukan perizinan NIB dan surat izin usaha mikro secara online tanpa biaya.')}
                </p>
              </div>

              <div className="relative z-10 mt-8 pt-4 flex items-center text-xs font-bold text-sky-600 group-hover:text-blue-600 transition-colors">
                <span>{t('cards.permitCta', 'Mulai Pengajuan')}</span>
                <ArrowRight size={15} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </Link>
          </motion.div>

          {/* Card 2: Lapor Ketertiban */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.22, ease: easeOutQuart }}
          >
            <Link
              to="/citizen/complaints/create"
              className="group relative bg-white rounded-3xl p-7 md:p-8 border border-slate-200/70 shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_rgba(225,29,72,0.16)] hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between h-full"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-100/80 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-rose-200 transition-all duration-700 ease-out pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-red-50 rounded-full blur-2xl group-hover:scale-125 group-hover:bg-red-100 transition-all duration-700 ease-out pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-rose-100/90 text-rose-600 flex items-center justify-center p-3 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <ShieldAlert className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100/80 border border-rose-200 px-3 py-1 rounded-full tracking-wider uppercase">
                    {t('cards.complaintBadge', 'Siaga 24 Jam')}
                  </span>
                </div>

                <h3 className="text-slate-900 font-extrabold text-xl tracking-tight mb-2 group-hover:text-rose-600 transition-colors">
                  {t('cards.complaintTitle', 'Lapor Ketertiban')}
                </h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                  {t('cards.complaintDesc', 'Sampaikan aduan pelanggaran ketertiban umum di lingkungan sekitar Anda secara cepat.')}
                </p>
              </div>

              <div className="relative z-10 mt-8 pt-4 flex items-center text-xs font-bold text-rose-600 group-hover:text-rose-700 transition-colors">
                <span>{t('cards.complaintCta', 'Lapor Sekarang')}</span>
                <ArrowRight size={15} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </Link>
          </motion.div>

          {/* Card 3: Tanya Asisten AI */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.35, ease: easeOutQuart }}
          >
            <button
              type="button"
              onClick={openChat}
              className="text-left group relative bg-white rounded-3xl p-7 md:p-8 border border-slate-200/70 shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_rgba(217,119,6,0.16)] hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between cursor-pointer w-full h-full"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-100/80 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-amber-200 transition-all duration-700 ease-out pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-yellow-50 rounded-full blur-2xl group-hover:scale-125 group-hover:bg-amber-100 transition-all duration-700 ease-out pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-amber-100/90 text-amber-600 flex items-center justify-center p-3 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Bot className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/80 border border-amber-200 px-3 py-1 rounded-full tracking-wider uppercase">
                    {t('cards.aiBadge', 'Respon AI')}
                  </span>
                </div>

                <h3 className="text-slate-900 font-extrabold text-xl tracking-tight mb-2 group-hover:text-amber-600 transition-colors">
                  {t('cards.aiTitle', 'Tanya Asisten AI')}
                </h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                  {t('cards.aiDesc', 'Dapatkan bantuan otomatis dan jawaban instan terkait prosedur serta persyaratan SIPEDI.')}
                </p>
              </div>

              <div className="relative z-10 mt-8 pt-4 flex items-center text-xs font-bold text-amber-600 group-hover:text-amber-700 transition-colors">
                <span>{t('cards.aiCta', 'Mulai Diskusi')}</span>
                <ArrowRight size={15} className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
          </motion.div>

        </div>
      </section>

      {/* 2.5 Danantara-style Key Metrics & Impact Numbers */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: easeOutQuart }}
          className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.03)]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            <div className="pt-2 md:pt-0 md:px-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mb-2.5">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">1,250+</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1">Izin Usaha Diterbitkan</p>
            </div>

            <div className="pt-4 md:pt-0 md:px-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 mb-2.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">99.2%</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1">Aduan Tertangani Cepat</p>
            </div>

            <div className="pt-4 md:pt-0 md:px-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mb-2.5">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">&lt; 24 Jam</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1">Rata-rata Verifikasi Berkas</p>
            </div>

            <div className="pt-4 md:pt-0 md:px-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600 mb-2.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">100%</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1">Gratis & Bebas Pungli</p>
            </div>

          </div>
        </motion.div>
      </section>

      {/* 3. Layanan Unggulan with Smooth Reveal & Stagger */}
      <section className="py-20 relative overflow-hidden bg-[#f8fafc]">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: `url(${bgTexture3})` }}
        ></div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          <div className="absolute -top-24 -left-24 w-[35rem] h-[35rem] bg-sky-200/50 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-10 -right-20 w-[30rem] h-[30rem] bg-rose-200/40 rounded-full blur-[110px] animate-pulse delay-700"></div>
          <div className="absolute -bottom-20 left-1/3 w-[32rem] h-[32rem] bg-amber-200/40 rounded-full blur-[130px] animate-pulse delay-1000"></div>
          <div className="absolute -bottom-10 -right-10 w-[28rem] h-[28rem] bg-indigo-200/40 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.8, ease: easeOutQuart }}
            className="text-center mb-14"
          >
            <span className="text-blue-600 font-extrabold tracking-wider uppercase text-xs bg-blue-50/90 border border-blue-200/80 px-4 py-1.5 rounded-full shadow-sm backdrop-blur-md">
              {t('landingFeatured.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 mt-4 tracking-tight">
              {t('landingFeatured.title')}
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-14 mb-8">
            
            {/* Image Slide-in */}
            <motion.div
              initial={{ opacity: 0, x: -50, scale: 0.96 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, ease: easeOutQuart }}
              className="w-full md:w-1/2 order-1 md:order-2"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/80 group">
                <img
                  src={heroBg2}
                  alt={t('landingFeatured.title')}
                  className="w-full h-[280px] sm:h-[340px] md:h-[400px] object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </motion.div>

            {/* Text Slide-in */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: 0.15, ease: easeOutQuart }}
              className="w-full md:w-1/2 flex flex-col justify-center order-2 md:order-1"
            >
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-4 leading-tight">
                {t('landingFeatured.heading')}
              </h3>
              <p className="text-slate-600 text-sm md:text-base mb-6 leading-relaxed font-medium">
                {t('landingFeatured.desc')}
              </p>

              <ul className="space-y-3.5 mb-8">
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="flex items-start"
                >
                  <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-3 shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs md:text-sm text-slate-700 font-semibold">
                    {t('landingFeatured.feature1')}
                  </span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-start"
                >
                  <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-3 shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs md:text-sm text-slate-700 font-semibold">
                    {t('landingFeatured.feature2')}
                  </span>
                </motion.li>
              </ul>

              <div>
                <Link
                  to="/citizen/permits/create"
                  className="inline-flex items-center bg-slate-900 hover:bg-blue-600 text-white text-xs md:text-sm font-extrabold py-3.5 px-8 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95 space-x-2"
                >
                  <span>{t('landingFeatured.ctaBtn')}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. Bottom Info Banner with Cascade Reveal */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: easeOutQuart }}
          className="bg-gradient-to-br from-blue-50 via-slate-50/90 to-indigo-50/80 rounded-3xl p-8 lg:p-12 relative overflow-hidden border border-blue-100 shadow-[0_20px_50px_rgba(37,99,235,0.08)]"
        >
          <div
            className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none bg-repeat bg-center"
            style={{ backgroundImage: `url(${bgGridTexture})` }}
          ></div>

          <div className="relative z-10">
            <div className="text-center mb-10">
              <span className="text-blue-600 font-extrabold tracking-wider uppercase text-xs bg-blue-100/80 px-3.5 py-1.5 rounded-full border border-blue-200/80 shadow-sm">
                {t('landingAccess.badge')}
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-3.5 mb-3">
                {t('landingAccess.title')} <span className="text-blue-600">SIPEDI</span>
              </h2>
              <p className="text-xs md:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                {t('landingAccess.desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Perizinan Mikro */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: 0.1, ease: easeOutQuart }}
                className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {t('landingAccess.card1Title')}
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    {t('landingAccess.card1Desc')}
                  </p>
                </div>
                <Link to="/citizen/permits/create" className="text-xs font-bold text-blue-600 group-hover:text-blue-700 inline-flex items-center pt-2 border-t border-slate-100">
                  <span>{t('landingAccess.card1Cta')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </motion.div>

              {/* Card 2: Pengaduan Ketertiban */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: 0.22, ease: easeOutQuart }}
                className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 hover:border-rose-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                    {t('landingAccess.card2Title')}
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    {t('landingAccess.card2Desc')}
                  </p>
                </div>
                <Link to="/citizen/complaints/create" className="text-xs font-bold text-rose-600 group-hover:text-rose-700 inline-flex items-center pt-2 border-t border-slate-100">
                  <span>{t('landingAccess.card2Cta')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </motion.div>

              {/* Card 3: Cek Status */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: 0.35, ease: easeOutQuart }}
                className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {t('landingAccess.card3Title')}
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    {t('landingAccess.card3Desc')}
                  </p>
                </div>
                <Link to="/citizen/profile" className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700 inline-flex items-center pt-2 border-t border-slate-100">
                  <span>{t('landingAccess.card3Cta')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
};
