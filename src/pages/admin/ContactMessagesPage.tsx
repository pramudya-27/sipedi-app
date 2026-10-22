import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Clock, MessageSquare, RefreshCw, ChevronLeft, ChevronRight, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

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

  // State untuk Modal Konfirmasi Hapus & Toast Notifikasi
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

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
              <p className="text-sm font-extrabold text-white">Data Sudah Dihapus!</p>
              <p className="text-xs text-slate-300 font-medium">Pesan warga berhasil dihapus dari sistem.</p>
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

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm font-medium">
            Memuat pesan masuk...
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Belum Ada Pesan</h3>
            <p className="text-xs text-slate-400 mt-1">Pesan dari formulir Hubungi Kami akan muncul di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {messages.map((msg) => (
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
                      {/* Tombol Ikon  */}
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

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                    Status: {msg.status}
                  </span>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Balas via Email →
                  </a>
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