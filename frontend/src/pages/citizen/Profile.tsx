import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Save,
  User,
  Mail,
  Shield,
  Loader2,
  Trash2,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3,
  Download,
  CreditCard,
  ExternalLink
} from "lucide-react";
import { api } from "../../services/api";
import { permitService } from "../../services/permitService";

interface Permit {
  id: string | number;
  permit_number?: string;
  permitNumber?: string;
  business_name?: string;
  businessName?: string;
  type?: string;
  status: string;
  duration_months?: number;
  start_date?: string;
  expired_at?: string;
  remaining_days?: number | null;
  is_expired?: boolean;
  pdf_path?: string;
  active_version?: number;
  created_at?: string;
  latest_invoice?: {
    id?: string;
    invoice_number?: string;
    status?: string;
    total_amount?: number;
    snap_redirect_url?: string;
    pdf_path?: string;
  };
}

interface Complaint {
  id: string | number;
  ticket_number?: string;
  title?: string;
  category?: string;
  status: string;
  created_at?: string;
}

const getProfilePictureUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:8000${url.startsWith("/") ? "" : "/"}${url}`;
};

export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "permits" | "complaints">("profile");
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticatedUser = !!user;

  // State Data Warga
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: (user as any)?.phone || "",
    nik: (user as any)?.nik || "",
    address: (user as any)?.address || "",
  });

  // State Riwayat Data Real-time
  const [permits, setPermits] = useState<Permit[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Helper Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const [renewingId, setRenewingId] = useState<string | null>(null);

  const handleRenewPermit = async (permitId: string | number) => {
    setRenewingId(String(permitId));
    try {
      const res = await permitService.requestRenewal(String(permitId), 1, 'Perpanjangan izin operasional (1 Bulan)');
      if (res?.snap_redirect_url) {
        window.location.href = res.snap_redirect_url;
      } else if (res?.invoice_number) {
        window.location.href = `/pay/${res.invoice_number}`;
      } else {
        triggerToast("Tagihan perpanjangan berhasil dibuat.");
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Gagal mengajukan perpanjangan izin.");
    } finally {
      setRenewingId(null);
    }
  };

  // 1. Fetch Profile Detail
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const res = await api.get("/users/me");
        if (res.data) {
          setFormData({
            name: res.data.name || user?.name || "",
            email: res.data.email || user?.email || "",
            phone: res.data.phone || (user as any)?.phone || "",
            nik: res.data.nik || (user as any)?.nik || "",
            address: res.data.address || (user as any)?.address || "",
          });
        }
      } catch (err) {
        console.error("Gagal mengambil detail profil:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (isAuthenticatedUser) {
      fetchUserProfile();
    }
  }, [user, isAuthenticatedUser]);

  // 2. Fetch Riwayat Perizinan & Pengaduan Khusus User Aktif
  useEffect(() => {
    const fetchUserHistory = async () => {
      try {
        setIsLoadingHistory(true);
        
        const [permitsRes, complaintsRes] = await Promise.allSettled([
          api.get("/permits/my-permits"),
          api.get("/complaints/my-complaints"),
        ]);

        if (permitsRes.status === "fulfilled" && Array.isArray(permitsRes.value.data)) {
          setPermits(permitsRes.value.data);
        }

        if (complaintsRes.status === "fulfilled" && Array.isArray(complaintsRes.value.data)) {
          setComplaints(complaintsRes.value.data);
        }
      } catch (err) {
        console.error("Gagal mengambil riwayat aktivitas:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (isAuthenticatedUser) {
      fetchUserHistory();
    }
  }, [isAuthenticatedUser]);

  // Save Profile ke Backend
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.nik && formData.nik.length !== 16) {
      alert(t('profile.nikLengthError'));
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: formData.name,
        phone: formData.phone,
        nik: formData.nik,
        address: formData.address,
      };

      const res = await api.put("/users/me", payload);

      if (user) {
        login({ 
          ...user, 
          name: formData.name,
          ...(res.data || payload)
        });
      }

      triggerToast(t('profile.profileSaved'));
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal memperbarui profil:", err);
      triggerToast(t('profile.profileSaveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      setIsUploading(true);
      const res = await api.post("/users/profile-picture", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (user) {
        login({ ...user, profile_picture: res.data.profile_picture });
      }
      triggerToast(t('profile.photoUpdated'));
    } catch (err) {
      console.error(err);
      triggerToast(t('profile.photoUploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm(t('profile.photoDeleteConfirm'))) return;
    try {
      setIsUploading(true);
      await api.delete("/users/profile-picture");
      if (user) {
        login({ ...user, profile_picture: undefined });
      }
      triggerToast(t('profile.photoDeleted'));
    } catch (err) {
      console.error(err);
      triggerToast(t('profile.photoDeleteFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  // Badge Status Helper
  const getStatusBadge = (status: string) => {
    const statusUpper = (status || "").toUpperCase();
    if (statusUpper === "APPROVED" || statusUpper === "DISETUJUI" || statusUpper === "SELESAI") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {statusUpper === "SELESAI" ? t('status.completed') : t('status.approved')}
        </span>
      );
    }
    if (statusUpper === "REJECTED" || statusUpper === "DITOLAK") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
          <XCircle className="w-3.5 h-3.5 mr-1" /> {t('status.rejected')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
        <Clock className="w-3.5 h-3.5 mr-1" /> {t('status.inProgress')}
      </span>
    );
  };

  const dateLocale = i18n.language === 'en' ? 'en-US' : 'id-ID';

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Floating Toast Notification */}
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
              <p className="text-sm font-extrabold text-white">{t('profile.successToast')}</p>
              <p className="text-xs text-slate-300 font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        
        {/* Header Title & Navigation Tabs */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('profile.headerTitle')}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
              {t('profile.headerDesc')}
            </p>
          </div>

          {/* Glassmorphic Tab Navigation */}
          <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-sm self-start lg:self-auto">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t('profile.tabProfile')}
            </button>
            <button
              onClick={() => setActiveTab("permits")}
              className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "permits"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>{t('profile.tabPermits')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "permits" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {permits.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("complaints")}
              className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "complaints"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>{t('profile.tabComplaints')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "complaints" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {complaints.length}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Photo & User Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-8 flex flex-col items-center text-center">
              
              <div className="flex flex-col items-center mb-6">
                <div 
                  className="relative group cursor-pointer mb-4"
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                    {user?.profile_picture ? (
                      <img 
                        src={getProfilePictureUrl(user.profile_picture)} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User size={56} className="text-slate-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-xs">
                    {isUploading ? (
                      <Loader2 className="text-white w-8 h-8 animate-spin" />
                    ) : (
                      <Camera className="text-white w-8 h-8" />
                    )}
                  </div>
                </div>
                
                {user?.profile_picture && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => !isUploading && fileInputRef.current?.click()} 
                      className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1.5" /> {t('profile.changePhoto')}
                    </button>
                    <button 
                      onClick={handleDeletePhoto}
                      disabled={isUploading}
                      className="flex items-center text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {t('profile.deletePhoto')}
                    </button>
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-extrabold text-slate-900">
                {formData.name || "Warga SIPEDI"}
              </h2>
              <p className="text-blue-600 font-extrabold text-[11px] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mt-2">
                {t('profile.roleCitizen')}
              </p>

              <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-4 text-left">
                <div className="flex items-center text-xs font-medium text-slate-600 gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="truncate">{formData.email}</span>
                </div>
                <div className="flex items-center text-xs font-medium text-slate-600 gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-emerald-700">{t('profile.verifiedAccount')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tab Content Details */}
          <div className="lg:col-span-2">
            
            {/* TAB 1: FORM EDIT PROFIL */}
            {activeTab === "profile" && (
              <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-8 sm:p-10">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {t('profile.detailInfoTitle')}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {t('profile.detailInfoSubtitle')}
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t('profile.editBtn')}</span>
                    </button>
                  )}
                </div>

                {isLoadingProfile ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                          {t('profile.fullName')}
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          disabled={!isEditing}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                          {t('profile.nik')}
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          value={formData.nik}
                          placeholder="3171xxxxxxxxxxxx"
                          disabled={!isEditing}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, nik: val });
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                          {t('profile.email')}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled={true}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                          {t('profile.phone')}
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          placeholder="081234567890"
                          disabled={!isEditing}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        {t('profile.address')}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.address}
                        placeholder={t('profile.addressPlaceholder')}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all resize-none"
                      ></textarea>
                    </div>

                    {isEditing && (
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 rounded-xl font-extrabold text-xs text-slate-600 hover:bg-slate-100 transition-all cursor-pointer uppercase tracking-wider"
                        >
                          {t('profile.cancelBtn')}
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-8 py-3 rounded-xl font-extrabold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>{t('profile.saveBtn')}</span>
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: RIWAYAT PERIZINAN */}
            {activeTab === "permits" && (
              <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-8 sm:p-10">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center">
                  <FileText className="w-5 h-5 mr-2.5 text-blue-600" /> 
                  {t('profile.permitsHistoryTitle')}
                </h3>

                {isLoadingHistory ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : permits.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <h4 className="text-base font-bold text-slate-700">{t('profile.noPermits')}</h4>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {permits.map((item) => {
                      const pNum = item.permit_number || item.permitNumber || `PERMIT-${item.id}`;
                      const isExpired = item.is_expired || item.status === 'EXPIRED';
                      const isApproved = item.status === 'Approved' || item.status === 'EXTENDED';
                      const hasUnpaidInvoice = item.latest_invoice && item.latest_invoice.status === 'UNPAID';
                      const isRenewingThis = renewingId === String(item.id);

                      return (
                        <div
                          key={item.id}
                          className="p-5 sm:p-6 border border-slate-200/80 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all bg-white shadow-xs space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                  {pNum}
                                </span>
                                {item.active_version && item.active_version > 1 && (
                                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                                    Versi {item.active_version}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-extrabold text-slate-900 mt-2">
                                {item.business_name || item.businessName || item.type || "Izin Usaha Mikro (IUMK)"}
                              </h4>
                              <p className="text-xs text-slate-400 font-medium mt-1">
                                Diajukan: {item.created_at ? new Date(item.created_at).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" }) : "Baru Saja"}
                                {item.expired_at && (
                                  <span> • Berlaku s/d: {new Date(item.expired_at).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}</span>
                                )}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {getStatusBadge(item.status)}
                            </div>
                          </div>

                          {/* Strip Tagihan Belum Lunas (Retribusi / Perpanjangan) */}
                          {hasUnpaidInvoice && item.latest_invoice && (
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div>
                                <p className="text-xs font-bold text-amber-900">
                                  Tagihan Belum Lunas: <span className="font-mono">Rp {item.latest_invoice.total_amount?.toLocaleString('id-ID')}</span>
                                </p>
                                <p className="text-[11px] text-amber-700">
                                  Selesaikan pembayaran via Midtrans (QRIS, VA Bank & E-Wallet) agar pengajuan diproses.
                                </p>
                              </div>
                              {item.latest_invoice.snap_redirect_url ? (
                                <a
                                  href={item.latest_invoice.snap_redirect_url}
                                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition shrink-0 shadow-xs"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Bayar di Midtrans</span>
                                </a>
                              ) : (
                                <a
                                  href={`/pay/${item.latest_invoice.invoice_number}`}
                                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition shrink-0"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Bayar Tagihan</span>
                                </a>
                              )}
                            </div>
                          )}

                          {/* Tombol Aksi Bawah */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Unduh PDF jika disetujui */}
                              {isApproved && (
                                <a
                                  href={`http://localhost:8000/api/permits/${pNum}/download-pdf`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition"
                                >
                                  <Download className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Unduh Surat Resmi (PDF)</span>
                                </a>
                              )}

                              {/* Tombol Perpanjang Izin jika kedaluwarsa & tidak ada invoice unpaid */}
                              {isExpired && !hasUnpaidInvoice && (
                                <button
                                  type="button"
                                  disabled={isRenewingThis}
                                  onClick={() => handleRenewPermit(item.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                                >
                                  {isRenewingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                                  <span>{isRenewingThis ? "Memproses Midtrans..." : "Perpanjang Izin (1 Bulan - Rp 100.000)"}</span>
                                </button>
                              )}
                            </div>

                            {/* Lacak Status */}
                            <a
                              href={`/?track=${encodeURIComponent(pNum)}`}
                              className="text-xs font-bold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 transition"
                            >
                              <span>Lacak Detail</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: RIWAYAT PENGADUAN */}
            {activeTab === "complaints" && (
              <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-8 sm:p-10">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2.5 text-rose-600" /> 
                  {t('profile.complaintsHistoryTitle')}
                </h3>

                {isLoadingHistory ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <h4 className="text-base font-bold text-slate-700">{t('profile.noComplaints')}</h4>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 border border-slate-200/80 rounded-2xl hover:border-rose-200 hover:bg-rose-50/30 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white shadow-xs"
                      >
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                            {item.ticket_number || `ADUAN-${item.id}`}
                          </span>
                          <h4 className="text-base font-extrabold text-slate-900 mt-2">
                            {item.title || item.category || "Laporan Pengaduan Ketertiban"}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium mt-1">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" }) : "Baru Saja"}
                          </p>
                        </div>
                        <div>{getStatusBadge(item.status)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
