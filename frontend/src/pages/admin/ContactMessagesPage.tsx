import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Clock, MessageSquare, RefreshCw, ChevronLeft, ChevronRight, Trash2, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
}

export const ContactMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Pagination
  const [page, setPage] = useState(1);
  const limit = 15;
  const [hasMore, setHasMore] = useState(true);

  // State untuk Modal Konfirmasi Hapus, Status Update, & Toast Notifikasi
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CLOSED'>('ALL');
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({
    title: "Data Sudah Dihapus!",
    desc: "Pesan warga berhasil dihapus dari sistem."
  });

  const fetchMessages = async (currentPage: number) => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * limit;
      const response = await fetch(`http://localhost:8000/api/v1/contact/admin/all?skip=${skip}&limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setHasMore(data.length === limit);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar pesan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
  }, [page]);

  // Fungsi untuk update status ke backend (Tandai Selesai / Buka Kembali)
  const handleUpdateStatus = async (messageId: number, newStatus: string) => {
    setUpdatingId(messageId);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/contact/admin/${messageId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, status: newStatus } : m))
        );
        const isClosed = newStatus === 'CLOSED' || newStatus === 'SELESAI';
        setToastInfo({
          title: isClosed ? "Pesan Ditandai Selesai!" : "Status Menunggu!",
          desc: isClosed 
            ? "Pesan bantuan telah berhasil ditandai selesai." 
            : "Status pesan telah dikembalikan ke Menunggu (PENDING)."
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert("Gagal memperbarui status pesan.");
      }
    } catch (error) {
      console.error("Error updating message status:", error);
      alert("Gagal terhubung ke server backend.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Fungsi untuk konfirmasi hapus
  const confirmDelete = (id: number) => {
    setSelectedMessageId(id);
    setShowDeleteModal(true);
  };

  // Fungsi eksekusi hapus ke backend
  const handleDelete = async () => {
    if (selectedMessageId === null) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/contact/admin/${selectedMessageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedMessageId(null);
        fetchMessages(page);

        setToastInfo({
          title: "Data Sudah Dihapus!",
          desc: "Pesan warga berhasil dihapus dari sistem."
        });
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } else {
        alert("Gagal menghapus pesan.");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Gagal terhubung ke server backend.");
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'CLOSED') return msg.status === 'CLOSED' || msg.status === 'SELESAI';
    if (statusFilter === 'PENDING') return msg.status === 'PENDING' || !msg.status;
    return true;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen flex flex-col justify-between relative">
      
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
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-emerald-500/30"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </motion.div>
            <div>
              <p className="text-sm font-extrabold text-white">{toastInfo.title}</p>
              <p className="text-xs text-slate-300 font-medium">{toastInfo.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Pusat Pesan & Bantuan</h1>
            <p className="text-xs text-slate-500 mt-1">
              Daftar masukan, pertanyaan, dan kendala teknis dari warga (Maks. 15 data per halaman)
            </p>
          </div>
          <button
            onClick={() => fetchMessages(page)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Pesan ({messages.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Menunggu (Pending) ({messages.filter(m => m.status === 'PENDING' || !m.status).length})
          </button>
          <button
            onClick={() => setStatusFilter('CLOSED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'CLOSED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Selesai ({messages.filter(m => m.status === 'CLOSED' || m.status === 'SELESAI').length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm font-medium">
            Memuat pesan masuk...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Tidak Ada Pesan</h3>
            <p className="text-xs text-slate-400 mt-1">
              {statusFilter === 'ALL'
                ? 'Pesan dari formulir Hubungi Kami akan muncul di sini.'
                : `Tidak ada pesan dengan status ${statusFilter === 'PENDING' ? 'Menunggu' : 'Selesai'}.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      {msg.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                      {/* Tombol Ikon Hapus */}
                      <button
                        onClick={() => confirmDelete(msg.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="Hapus Pesan"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-1">{msg.name}</h3>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center text-xs text-slate-500 font-medium gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{msg.email}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 font-medium gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{msg.phone}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium leading-relaxed mb-4">
                    "{msg.message}"
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    {msg.status === 'CLOSED' || msg.status === 'SELESAI' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Menunggu (PENDING)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.status !== 'CLOSED' && msg.status !== 'SELESAI' ? (
                      <button
                        onClick={() => handleUpdateStatus(msg.id, 'CLOSED')}
                        disabled={updatingId === msg.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white shadow-xs transition cursor-pointer"
                        title="Tandai bantuan ini sudah selesai ditindaklanjuti"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {updatingId === msg.id ? "Menyimpan..." : "Tandai Selesai"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(msg.id, 'PENDING')}
                        disabled={updatingId === msg.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                        title="Kembalikan status ke Menunggu"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Buka Kembali
                      </button>
                    )}

                    <a
                      href={`mailto:${msg.email}?subject=Tanggapan Layanan SIPEDI: ${encodeURIComponent(msg.category)}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors ml-1"
                      title="Balas pesan langsung via email warga"
                    >
                      <Mail className="w-3.5 h-3.5" /> Balas Email
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">
          Menampilkan Halaman <span className="text-slate-900">{page}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 || loading}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          
          <span className="px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-600 text-white shadow-sm">
            {page}
          </span>

          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasMore || loading}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2">Hapus Pesan Ini?</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              Data pesan atau pengaduan warga ini akan dihapus secara permanen dari sistem.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-extrabold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};