import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Clock, AlertCircle, MapPin, User as UserIcon, Download, ShieldCheck, Eye } from 'lucide-react';
import { useComplaints } from '../../hooks/useComplaints';
import { complaintService } from '../../services/complaintService';
import type { Complaint } from '../../types';

export const AdminComplaintList: React.FC = () => {
  const { complaints, data, loading, isLoading, error, refetch } = useComplaints() as any;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Paginasi (20 Data Per Halaman)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Custom Modal Pop-Up State untuk Konfirmasi Aksi Ubah Status & Hapus
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'UPDATE_STATUS' | 'DELETE';
    complaintId: string;
    complaintNumber: string;
    newStatus?: string;
  }>({
    isOpen: false,
    type: 'UPDATE_STATUS',
    complaintId: '',
    complaintNumber: '',
  });

  // Floating Toast Alert Notification State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'amber' | 'emerald' | 'rose' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info',
  });

  const triggerToast = (msg: string, type: 'amber' | 'emerald' | 'rose' | 'info') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  const rawList = complaints || data || [];
  const complaintList: Complaint[] = Array.isArray(rawList) ? rawList : [];

  // Hitung Statistik
  const totalCount = complaintList.length;
  const baruCount = complaintList.filter((c: any) => c.status === 'Baru').length;
  const prosesCount = complaintList.filter((c: any) => c.status === 'Dalam Penanganan').length;
  const selesaiCount = complaintList.filter((c: any) => c.status === 'Selesai').length;

  // Mengurutkan dari yang terbaru berdasarkan tanggal atau created_at
  const filteredComplaints = useMemo(() => {
    const filtered = complaintList.filter((c: any) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (c.complaintNumber && String(c.complaintNumber).toLowerCase().includes(term)) ||
        (c.category && String(c.category).toLowerCase().includes(term)) ||
        (c.location && String(c.location).toLowerCase().includes(term)) ||
        (c.reporterName && String(c.reporterName).toLowerCase().includes(term)) ||
        (c.description && String(c.description).toLowerCase().includes(term));

      const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });

    // parse tanggal/waktu buat agar data baru di paling atas
    return filtered.sort((a: any, b: any) => {
      const dateA = new Date(a.date || a.created_at || 0).getTime();
      const dateB = new Date(b.date || b.created_at || 0).getTime();
      return dateB - dateA; // Terbaru di atas
    });
  }, [complaintList, searchTerm, selectedStatus]);

  // Perhitungan Paginasi
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Helper URL Foto Bukti dari Cloudinary / Uploads
  const getEvidenceUrl = (path?: string) => {
    if (!path) return '/placeholder-image.jpg';
    let cleanPath = String(path).trim();
    if (cleanPath.startsWith('/http://') || cleanPath.startsWith('/https://')) {
      cleanPath = cleanPath.slice(1);
    }
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) return cleanPath;
    const backendOrigin = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:8000';
    return `${backendOrigin}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredComplaints.length === 0) {
      triggerToast('Tidak ada data untuk diexport!', 'rose');
      return;
    }

    const headers = ['No. Pengaduan', 'Kategori', 'Prioritas', 'Lokasi', 'Deskripsi', 'Pelapor', 'Tanggal', 'Status'];
    const rows = filteredComplaints.map((c: any) => [
      `"${c.complaintNumber || ''}"`,
      `"${c.category || ''}"`,
      `"${c.priority || ''}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
      `"${c.reporterName || 'Warga'}"`,
      `"${c.date || c.created_at || ''}"`,
      `"${c.status || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_pengaduan_sipedi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('Data pengaduan berhasil diexport ke CSV!', 'emerald');
  };

  const promptUpdateStatus = (id: string, complaintNumber: string, newStatus: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'UPDATE_STATUS',
      complaintId: id,
      complaintNumber: complaintNumber || id,
      newStatus,
    });
  };

  const promptDelete = (id: string, complaintNumber: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'DELETE',
      complaintId: id,
      complaintNumber: complaintNumber || id,
    });
  };

  const handleExecuteAction = async () => {
    const { type, complaintId, complaintNumber, newStatus } = confirmModal;

    try {
      if (type === 'UPDATE_STATUS' && newStatus) {
        await complaintService.updateStatus(complaintId, newStatus);
        if (refetch) refetch();
        if (newStatus === 'Selesai') {
          triggerToast(`Pengaduan ${complaintNumber} selesai & email konfirmasi berhasil dikirim ke pelapor!`, 'emerald');
        } else {
          triggerToast(`Status pengaduan ${complaintNumber} diperbarui menjadi ${newStatus}!`, 'amber');
        }
      } else if (type === 'DELETE') {
        await complaintService.deleteComplaint(complaintId);
        if (refetch) refetch();
        triggerToast(`Pengaduan ${complaintNumber} berhasil dihapus!`, 'rose');
      }
    } catch (err) {
      console.error('Gagal memproses aksi:', err);
      triggerToast('Terjadi kesalahan saat memproses permintaan.', 'rose');
    } finally {
      setConfirmModal({ isOpen: false, type: 'UPDATE_STATUS', complaintId: '', complaintNumber: '' });
    }
  };

  const openDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const isDataLoading = loading || isLoading;

  return (
    <div className="space-y-6 font-sans relative min-h-screen pb-20">
      {/* Header Utama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Pengaduan</h1>
          <p className="text-xs text-slate-500 mt-1">
            Total <span className="font-bold text-blue-600">{totalCount}</span> laporan aduan masyarakat dari MySQL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => refetch && refetch()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* 4 CARD WIDGET RINGKASAN STATUS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Total Pengaduan</p>
          <p className="text-2xl font-black text-blue-600 mt-2">{totalCount} <span className="text-xs font-semibold text-slate-400">Data</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Aduan Baru</p>
          <p className="text-2xl font-black text-rose-600 mt-2">{baruCount} <span className="text-xs font-semibold text-slate-400">Data</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Dalam Penanganan</p>
          <p className="text-2xl font-black text-amber-500 mt-2">{prosesCount} <span className="text-xs font-semibold text-slate-400">Data</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Selesai</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">{selesaiCount} <span className="text-xs font-semibold text-slate-400">Data</span></p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari No. Tiket, Kategori, Lokasi, atau Nama Pelapor..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-blue-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'Baru', 'Dalam Penanganan', 'Selesai'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Semua Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* State Loading & Error */}
      {isDataLoading && (
        <div className="text-center py-12 text-slate-500 font-medium">
          <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          Memuat data pengaduan dari database MySQL...
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Gagal mengambil data dari server: {String(error)}
        </div>
      )}

      {/* Tabel Data Pengaduan */}
      {!isDataLoading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-white uppercase tracking-wider font-extrabold border-b border-slate-700">
                  <th className="py-3.5 px-3 whitespace-nowrap">NO. PENGADUAN</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">KATEGORI & PRIORITAS</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">LOKASI & DESKRIPSI</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">STATUS</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap w-64">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Tidak ada data pengaduan yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedComplaints.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-blue-600 whitespace-nowrap block">
                          {c.complaintNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDate(c.date || c.created_at)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{c.category || 'Umum'}</div>
                        {c.priority && (
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full mt-1 ${
                              String(c.priority).toLowerCase() === 'tinggi' || String(c.priority).toLowerCase() === 'high'
                                ? 'bg-rose-100 text-rose-800'
                                : String(c.priority).toLowerCase() === 'sedang'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.priority}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          {c.location}
                        </div>
                        <div className="text-slate-500 truncate mt-0.5">{c.description}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                          <UserIcon className="w-3 h-3 shrink-0" /> Pelapor: {c.reporterName || 'Warga'}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            c.status === 'Baru'
                              ? 'bg-rose-100 text-rose-800'
                              : c.status === 'Dalam Penanganan'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-left w-64">
                        <div className="flex items-center justify-start gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openDetail(c)}
                            className="w-14 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer"
                          >
                            Detail
                          </button>

                          {c.status === 'Baru' && (
                            <button
                              onClick={() => promptUpdateStatus(c.id, c.complaintNumber, 'Dalam Penanganan')}
                              className="w-16 py-1 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer"
                            >
                              Diproses
                            </button>
                          )}

                          {c.status !== 'Selesai' && (
                            <button
                              onClick={() => promptUpdateStatus(c.id, c.complaintNumber, 'Selesai')}
                              className="w-16 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer"
                            >
                              Selesaikan
                            </button>
                          )}

                          <button
                            onClick={() => promptDelete(c.id, c.complaintNumber)}
                            className="w-14 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredComplaints.length > 0 && (
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <div>
                Menampilkan <span className="font-bold text-slate-800">{startIndex + 1}</span> -{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(startIndex + itemsPerPage, filteredComplaints.length)}
                </span>{' '}
                dari <span className="font-bold text-slate-800">{filteredComplaints.length}</span> pengaduan
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold transition-all cursor-pointer"
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold transition-all cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: DETAIL PENGADUAN */}
      {isModalOpen && selectedComplaint && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Detail Laporan Pengaduan</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 font-bold hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-400 font-bold">No. Pengaduan</p>
                  <p className="font-mono font-bold text-blue-600 text-sm">{selectedComplaint.complaintNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold">Status Laporan</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold mt-0.5 ${
                    selectedComplaint.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                    selectedComplaint.status === 'Dalam Penanganan' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="text-slate-400 font-bold">Kategori</p>
                  <p className="font-bold text-slate-900">{selectedComplaint.category || 'Umum'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold">Prioritas</p>
                  <p className="font-bold text-amber-600">{selectedComplaint.priority || 'Normal'}</p>
                </div>
                <div className="mt-1">
                  <p className="text-slate-400 font-bold">Nama Pelapor</p>
                  <p className="font-semibold text-slate-800">{selectedComplaint.reporterName || 'Warga'}</p>
                </div>
                <div className="mt-1">
                  <p className="text-slate-400 font-bold">NIK Pelapor (Terproteksi)</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedComplaint.maskedNik || '3201************'}
                  </p>
                </div>
                <div className="mt-1">
                  <p className="text-slate-400 font-bold">Email Pelapor</p>
                  <p className="font-semibold text-blue-600 truncate">{selectedComplaint.email || '-'}</p>
                </div>
                <div className="mt-1">
                  <p className="text-slate-400 font-bold">No. Telepon / WhatsApp</p>
                  <p className="font-semibold text-slate-800">{selectedComplaint.contactNumber || '-'}</p>
                </div>
                <div className="mt-1 col-span-2">
                  <p className="text-slate-400 font-bold">Tanggal Pengajuan</p>
                  <p className="font-medium text-slate-700">{formatDate(selectedComplaint.date)}</p>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-400 font-bold mb-1">Lokasi Kejadian</p>
                  <p className="font-medium text-slate-800">📍 {selectedComplaint.location}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold mb-1">Deskripsi Masalah</p>
                  <p className="font-medium text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                    {selectedComplaint.description}
                  </p>
                </div>
              </div>

              {selectedComplaint.evidences && selectedComplaint.evidences.length > 0 && (
                <div>
                  <p className="font-bold text-slate-800 mb-2">Bukti Foto / Lampiran</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedComplaint.evidences.map((ev: any, idx: number) => {
                      const imgUrl = getEvidenceUrl(ev.filePath || ev.file_path);
                      return (
                        <div key={idx} className="relative group overflow-hidden rounded-xl border border-slate-200 bg-white p-1">
                          <img
                            src={imgUrl}
                            alt="Bukti Pengaduan"
                            className="w-full h-36 object-cover rounded-lg hover:scale-[1.01] transition-transform cursor-pointer"
                            onClick={() => window.open(imgUrl, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-lg">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <div>
                {selectedComplaint.status !== 'Selesai' && (
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      promptUpdateStatus(selectedComplaint.id, selectedComplaint.complaintNumber, 'Selesai');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <span>✓ Selesaikan & Kirim Email</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                Tutup Modal
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: KONFIRMASI */}
      {confirmModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="text-3xl">
              {confirmModal.type === 'DELETE' ? '⚠️' : confirmModal.newStatus === 'Selesai' ? '✅' : '🔄'}
            </div>
            <h3 className="font-black text-slate-900 text-base">
              {confirmModal.type === 'DELETE' ? 'Hapus Pengaduan?' : 'Ubah Status Pengaduan?'}
            </h3>
            <div className="text-xs text-slate-500 space-y-2">
              {confirmModal.type === 'DELETE' ? (
                <p>
                  Apakah Anda yakin ingin menghapus pengaduan{' '}
                  <span className="font-bold text-slate-800">{confirmModal.complaintNumber}</span>?
                </p>
              ) : (
                <>
                  <p>
                    Ubah status pengaduan <span className="font-bold text-slate-800">{confirmModal.complaintNumber}</span> menjadi{' '}
                    <span className="font-bold text-blue-600">"{confirmModal.newStatus}"</span>?
                  </p>
                  {confirmModal.newStatus === 'Selesai' && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] font-medium text-left space-y-1">
                      <p className="font-bold flex items-center gap-1 text-emerald-900">
                        📧 Notifikasi Email Otomatis:
                      </p>
                      <p>
                        Sistem akan mengirimkan email resmi ke pelapor bahwa laporan pengaduan telah berhasil ditindaklanjuti dan diselesaikan.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: 'UPDATE_STATUS', complaintId: '', complaintNumber: '' })}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteAction}
                className={`px-4 py-2 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer ${
                  confirmModal.type === 'DELETE'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FLOATING TOAST ALERT NOTIFICATION */}
      {toast.show && createPortal(
        <div
          className={`fixed bottom-6 right-6 z-[99999] flex items-center gap-2.5 text-white text-xs font-bold px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 animate-bounce ${
            toast.type === 'emerald'
              ? 'bg-emerald-600'
              : toast.type === 'rose'
              ? 'bg-rose-600'
              : toast.type === 'amber'
              ? 'bg-amber-600'
              : 'bg-blue-600'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{toast.message}</span>
        </div>,
        document.body
      )}
    </div>
  );
};