import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';
import { permitService } from '../../services/permitService';

export const AdminPermitList: React.FC = () => {
  const [permits, setPermits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search
  const [search, setSearch] = useState<string>('');
  const [searchBy, setSearchBy] = useState<'ALL' | 'NAME' | 'NUMBER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination (20 item per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Modal States
  const [selectedPermit, setSelectedPermit] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [permitToDelete, setPermitToDelete] = useState<string | null>(null);

  // State Lampiran File untuk Tambah Perizinan Baru
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Floating Toast Alert Notification State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'approved' | 'rejected' | 'deleted' | 'info' | 'error';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  const showToast = (
    message: string,
    type: 'approved' | 'rejected' | 'deleted' | 'info' | 'error' = 'info'
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  // State Modal Konfirmasi Status
  const [statusConfirmModal, setStatusConfirmModal] = useState<{
    isOpen: boolean;
    permit: any | null;
    nextStatus: 'Approved' | 'Rejected' | null;
  }>({
    isOpen: false,
    permit: null,
    nextStatus: null
  });

  // Form State Tambah Perizinan
  const [form, setForm] = useState({
    applicant_name: '',
    nik: '',
    phone: '',
    email: '',
    type: 'Izin Usaha Mikro Kecil (IUMK)',
    business_name: '',
    business_address: ''
  });

  const fetchPermits = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await permitService.getPermits();
      setPermits(data);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data perizinan dari server backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
  }, []);

  // Ringkasan Statistik Data
  const totalCount = permits.length;
  const approvedCount = permits.filter(p => p.status === 'Approved').length;
  const submittedCount = permits.filter(p => p.status === 'Submitted').length;
  const rejectedCount = permits.filter(p => p.status === 'Rejected').length;

  // Filter & Sorting Data 
  const filteredPermits = useMemo(() => {
    const filtered = permits.filter(p => {
      const q = search.toLowerCase();
      const nameMatch = (p.applicantName || p.applicant_name || '').toLowerCase().includes(q);
      const numMatch = (p.permitNumber || p.permit_number || '').toLowerCase().includes(q);

      let matchesSearch = true;
      if (searchBy === 'NAME') matchesSearch = nameMatch;
      else if (searchBy === 'NUMBER') matchesSearch = numMatch;
      else matchesSearch = nameMatch || numMatch;

      const matchesStatus =
        statusFilter === 'ALL' || (p.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    // PENGURUTAN TERBARU: parse tanggal submissionDate / submission_date / created_at
    return filtered.sort((a, b) => {
      const dateA = new Date(a.submissionDate || a.submission_date || a.created_at || 0).getTime();
      const dateB = new Date(b.submissionDate || b.submission_date || b.created_at || 0).getTime();
      return dateB - dateA; 
    });
  }, [permits, search, searchBy, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPermits.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPermits.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [search, searchBy, statusFilter]);

  // Handler Checkbox Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentItems.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Handler Bulk Status Update
  const handleBulkUpdateStatus = async (newStatus: 'Approved' | 'Rejected') => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => permitService.updateStatus(id, newStatus)));
      setPermits(prev =>
        prev.map(p => (selectedIds.includes(String(p.id)) ? { ...p, status: newStatus } : p))
      );
      showToast(
        `${selectedIds.length} perizinan berhasil diubah statusnya menjadi ${newStatus}!`,
        newStatus === 'Approved' ? 'approved' : 'rejected'
      );
      setSelectedIds([]);
    } catch (err) {
      showToast('Gagal memproses perubahan status massal', 'error');
    }
  };

  // Handler Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Hapus ${selectedIds.length} perizinan terpilih?`)) return;
    try {
      await Promise.all(selectedIds.map(id => permitService.deletePermit(id)));
      setPermits(prev => prev.filter(p => !selectedIds.includes(String(p.id))));
      showToast(`${selectedIds.length} perizinan berhasil dihapus!`, 'deleted');
      setSelectedIds([]);
    } catch (err) {
      showToast('Gagal menghapus data perizinan massal', 'error');
    }
  };

  // Handler Single Status Confirmation
  const openStatusConfirm = (permit: any, nextStatus: 'Approved' | 'Rejected') => {
    setStatusConfirmModal({
      isOpen: true,
      permit,
      nextStatus
    });
  };

  const executeStatusUpdate = async () => {
    const { permit, nextStatus } = statusConfirmModal;
    if (!permit || !nextStatus) return;

    try {
      await permitService.updateStatus(permit.id, nextStatus);
      setPermits((prev: any[]) =>
        prev.map((p: any) =>
          String(p.id) === String(permit.id) ? { ...p, status: nextStatus } : p
        )
      );
      if (selectedPermit && String(selectedPermit.id) === String(permit.id)) {
        setSelectedPermit({ ...selectedPermit, status: nextStatus });
      }
      setStatusConfirmModal({ isOpen: false, permit: null, nextStatus: null });
      
      showToast(
        `Status perizinan ${permit.permitNumber || permit.permit_number} diperbarui menjadi ${nextStatus}!`,
        nextStatus === 'Approved' ? 'approved' : 'rejected'
      );
    } catch (err) {
      showToast('Gagal memperbarui status perizinan', 'error');
    }
  };

  // Handler Export CSV
  const handleExportCSV = () => {
    if (filteredPermits.length === 0) {
      showToast('Tidak ada data perizinan untuk di-export', 'error');
      return;
    }
    const headers = ['No. Perizinan', 'Pemohon', 'Jenis Izin', 'Nama Usaha', 'Status', 'Tanggal Pengajuan'];
    const rows = filteredPermits.map(p => [
      `"${p.permitNumber || p.permit_number}"`,
      `"${p.applicantName || p.applicant_name}"`,
      `"${p.type || p.permitType}"`,
      `"${p.businessName || p.business_name}"`,
      `"${p.status}"`,
      `"${p.submissionDate || p.submission_date || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Perizinan_SIPEDI_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data perizinan berhasil diexport ke CSV!', 'info');
  };

  // Handler Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.applicant_name || !form.business_name) {
      showToast('Nama Pemohon dan Nama Usaha wajib diisi!', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('applicant_name', form.applicant_name);
      formData.append('nik', form.nik);
      formData.append('phone', form.phone);
      formData.append('email', form.email);
      formData.append('type', form.type);
      formData.append('business_name', form.business_name);
      formData.append('business_address', form.business_address);

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await permitService.createPermit(formData);
      setIsCreateOpen(false);
      setSelectedFile(null);
      setForm({
        applicant_name: '',
        nik: '',
        phone: '',
        email: '',
        type: 'Izin Usaha Mikro Kecil (IUMK)',
        business_name: '',
        business_address: ''
      });
      showToast('Permohonan perizinan baru berhasil ditambahkan!', 'approved');
      fetchPermits();
    } catch (err) {
      showToast('Gagal menambahkan perizinan baru', 'error');
    }
  };

  // Handler Delete
  const handleDeleteConfirm = async () => {
    if (!permitToDelete) return;
    try {
      await permitService.deletePermit(permitToDelete);
      setPermits(prev => prev.filter(p => String(p.id) !== String(permitToDelete)));
      setIsDeleteOpen(false);
      setPermitToDelete(null);
      showToast('Data perizinan berhasil dihapus!', 'deleted');
    } catch (err) {
      showToast('Gagal menghapus perizinan', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Memuat data perizinan dari MySQL...</div>;
  if (error) return <div className="p-8 text-center text-rose-500 font-bold">{error}</div>;

  return (
    <div className="space-y-6 font-sans relative min-h-screen pb-20">
      {/* Header Utama & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Perizinan</h1>
          <p className="text-xs text-slate-500 mt-1">
            Total <span className="font-bold text-blue-600">{totalCount}</span> data perizinan riil dari MySQL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            + Tambah Perizinan
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            📊 Export CSV
          </button>
          <button
            onClick={fetchPermits}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* 4 CARD WIDGET RINGKASAN STATUS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Total Perizinan</p>
          <p className="text-2xl font-black text-blue-600 mt-2">{totalCount} <span className="text-xs font-semibold text-slate-400">Data</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Disetujui</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">{approvedCount} <span className="text-xs font-semibold text-slate-400">Data</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Menunggu</p>
          <p className="text-2xl font-black text-amber-500 mt-2">{submittedCount} <span className="text-xs font-semibold text-slate-400">Data</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Ditolak</p>
          <p className="text-2xl font-black text-rose-600 mt-2">{rejectedCount} <span className="text-xs font-semibold text-slate-400">Data</span></p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <select
            value={searchBy}
            onChange={e => setSearchBy(e.target.value as any)}
            className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Cari Semua</option>
            <option value="NAME">Nama Pemohon</option>
            <option value="NUMBER">No. Perizinan</option>
          </select>

          <input
            type="text"
            placeholder={
              searchBy === 'NAME'
                ? 'Ketik nama pemohon...'
                : searchBy === 'NUMBER'
                ? 'Ketik nomor perizinan...'
                : 'Cari nama pemohon atau no. perizinan...'
            }
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-blue-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full md:w-44 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">Semua Status</option>
            <option value="Submitted">Submitted / Menunggu</option>
            <option value="Approved">Approved / Disetujui</option>
            <option value="Rejected">Rejected / Ditolak</option>
          </select>
        </div>
      </div>

      {/* ACTION BAR BULK SELECTION */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-md">
          <span className="font-bold">
            Terpilih <span className="text-blue-400 font-extrabold">{selectedIds.length}</span> perizinan
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkUpdateStatus('Approved')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
            >
              Setujui Terpilih
            </button>
            <button
              onClick={() => handleBulkUpdateStatus('Rejected')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer"
            >
              Tolak Terpilih
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer"
            >
              Hapus Terpilih
            </button>
          </div>
        </div>
      )}

      {/* TABEL DATA */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white uppercase tracking-wider font-extrabold border-b border-slate-700">
                <th className="py-3.5 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={currentItems.length > 0 && selectedIds.length === currentItems.length}
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">No. Perizinan</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Pemohon</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Jenis Izin</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Nama Usaha</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">Status</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">Tanggal Pengajuan</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap w-64">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data perizinan yang ditemukan.
                  </td>
                </tr>
              ) : (
                currentItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                        className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {item.permitNumber || item.permit_number}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">{item.applicantName || item.applicant_name}</td>
                    <td className="py-3.5 px-3 whitespace-nowrap">{item.type || item.permitType}</td>
                    <td className="py-3.5 px-3 whitespace-nowrap">{item.businessName || item.business_name}</td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          item.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-500 whitespace-nowrap">
                      {(item.submissionDate || item.submission_date) ? String(item.submissionDate || item.submission_date).slice(0, 10) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-left w-64">
                      <div className="flex items-center justify-start gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedPermit(item);
                            setIsDetailOpen(true);
                          }}
                          className="w-14 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer"
                        >
                          Detail
                        </button>

                        {item.status !== 'Approved' && (
                          <button
                            onClick={() => openStatusConfirm(item, 'Approved')}
                            className="w-14 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer"
                          >
                            Setujui
                          </button>
                        )}

                        {item.status !== 'Rejected' && (
                          <button
                            onClick={() => openStatusConfirm(item, 'Rejected')}
                            className="w-14 py-1 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer"
                          >
                            Tolak
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setPermitToDelete(item.id);
                            setIsDeleteOpen(true);
                          }}
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

        {/* Kontrol Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{filteredPermits.length > 0 ? indexOfFirstItem + 1 : 0}</span> -{' '}
            <span className="font-bold text-slate-800">
              {Math.min(indexOfLastItem, filteredPermits.length)}
            </span>{' '}
            dari <span className="font-bold text-slate-800">{filteredPermits.length}</span> perizinan
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold transition-all cursor-pointer"
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold transition-all cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* POP-UP MODAL 1: DETAIL PERIZINAN */}
      {isDetailOpen && selectedPermit && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">Detail Permohonan Izin</h3>
              <button 
                onClick={() => setIsDetailOpen(false)} 
                className="text-slate-400 font-bold hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Ringkasan Header */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-400 font-bold">No. Perizinan</p>
                  <p className="font-mono font-bold text-blue-600 text-sm">
                    {selectedPermit.permitNumber || selectedPermit.permit_number}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold">Status Saat Ini</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold mt-0.5 ${
                    selectedPermit.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    selectedPermit.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedPermit.status}
                  </span>
                </div>
              </div>

              {/* Data Pemohon */}
              <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="text-slate-400 font-bold">Nama Pemohon</p>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedPermit.applicantName || selectedPermit.applicant_name}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold">NIK / Identitas</p>
                  <p className="font-semibold text-slate-800">
                    {selectedPermit.nik || '3510210306040098'}
                  </p>
                </div>
                <div className="mt-1">
                  <p className="text-slate-400 font-bold">No. HP / WhatsApp</p>
                  <p className="font-semibold text-slate-800">
                    {selectedPermit.phone || '081945448959'}
                  </p>
                </div>
                <div className="mt-1">
                  <p className="text-slate-400 font-bold">Email</p>
                  <p className="font-semibold text-slate-800">
                    {selectedPermit.email || 'agus12345@gmail.com'}
                  </p>
                </div>
              </div>

              {/* Data Usaha */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-400 font-bold">Jenis Perizinan</p>
                  <p className="font-semibold text-slate-800">
                    {selectedPermit.type || selectedPermit.permitType}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold">Nama Usaha / Objek</p>
                  <p className="font-semibold text-slate-800">
                    {selectedPermit.businessName || selectedPermit.business_name}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold">Alamat Usaha</p>
                  <p className="font-medium text-slate-700">
                    {selectedPermit.business_address || 'RT/RW:03/03, Duri Kosambi, Cengkareng, Jakarta Barat'}
                  </p>
                </div>
              </div>

              {/* Lampiran Dokumen Persyaratan Pemohon & Preview Gambar */}
              <div>
                <p className="font-bold text-slate-800 mb-2">Dokumen Persyaratan Pemohon</p>
                {selectedPermit.documents && selectedPermit.documents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPermit.documents
                      .filter((doc: any, index: number, self: any[]) =>
                        index === self.findIndex((d: any) => (d.file_name || d.fileName) === (doc.file_name || doc.fileName))
                      )
                      .map((doc: any, index: number) => {
                        const fileName = doc.file_name || doc.fileName || doc.name || 'Dokumen Persyaratan';
                        const rawPath = doc.file_path || doc.filePath || doc.url || '';
                        
                        const imgUrl = rawPath.startsWith('http')
                          ? rawPath
                          : `http://localhost:8000${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;

                        return (
                          <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-base">🖼️</span>
                                <div className="truncate">
                                  <p className="font-bold text-slate-800 text-xs truncate">{fileName}</p>
                                  <p className="text-[10px] text-slate-400">{doc.document_type || doc.documentType || 'PERSYARATAN'}</p>
                                </div>
                              </div>
                              <a
                                href={imgUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] shrink-0 transition-all shadow-sm cursor-pointer"
                              >
                                Buka Gambar Full
                              </a>
                            </div>

                            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
                              <img
                                src={imgUrl}
                                alt={fileName}
                                className="w-full h-44 object-contain rounded cursor-pointer hover:scale-[1.01] transition-transform"
                                onClick={() => window.open(imgUrl, '_blank')}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                    Tidak ada dokumen lampiran yang diunggah.
                  </div>
                )}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div>
                {selectedPermit.status === 'Approved' && (
                  <button
                    onClick={() => {
                      const suratContent = `
==================================================
           SURAT IZIN RESMI SIPEDI
==================================================
Nomor Perizinan : ${selectedPermit.permitNumber || selectedPermit.permit_number}
Nama Pemohon    : ${selectedPermit.applicantName || selectedPermit.applicant_name}
Jenis Izin      : ${selectedPermit.type || selectedPermit.permitType}
Nama Usaha      : ${selectedPermit.businessName || selectedPermit.business_name}
Status          : DISETUJUI (APPROVED)
==================================================
                      `;
                      const blob = new Blob([suratContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Surat_Izin_${selectedPermit.permitNumber || selectedPermit.permit_number}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs border border-blue-200 transition-all cursor-pointer"
                  >
                    📄 Unduh Surat Izin
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedPermit.status !== 'Rejected' && (
                  <button
                    onClick={() => {
                      setIsDetailOpen(false);
                      openStatusConfirm(selectedPermit, 'Rejected');
                    }}
                    className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Tolak Izin
                  </button>
                )}
                {selectedPermit.status !== 'Approved' && (
                  <button
                    onClick={() => {
                      setIsDetailOpen(false);
                      openStatusConfirm(selectedPermit, 'Approved');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    Setujui Izin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* POP-UP MODAL 2: KONFIRMASI STATUS */}
      {statusConfirmModal.isOpen && statusConfirmModal.permit && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="text-3xl">
              {statusConfirmModal.nextStatus === 'Approved' ? '✅' : '⚠️'}
            </div>
            <h3 className="font-black text-slate-900 text-base">
              {statusConfirmModal.nextStatus === 'Approved' ? 'Setujui Perizinan?' : 'Tolak Perizinan?'}
            </h3>
            <p className="text-xs text-slate-500">
              Apakah Anda yakin ingin mengubah status perizinan{' '}
              <span className="font-bold text-slate-800">{statusConfirmModal.permit.permitNumber || statusConfirmModal.permit.permit_number}</span>{' '}
              menjadi <span className="font-bold">{statusConfirmModal.nextStatus}</span>?
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setStatusConfirmModal({ isOpen: false, permit: null, nextStatus: null })}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeStatusUpdate}
                className={`px-4 py-2 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer ${
                  statusConfirmModal.nextStatus === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* POP-UP MODAL 3: FORMULIR TAMBAH PERIZINAN */}
      {isCreateOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Permohonan Izin Baru</h3>
                <p className="text-[11px] text-slate-400">Isi data lengkap pemohon dan bidang usaha perizinan.</p>
              </div>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-slate-400 font-bold hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pemohon *</label>
                  <input
                    type="text"
                    placeholder="Nama sesuai KTP"
                    value={form.applicant_name}
                    onChange={e => setForm({ ...form, applicant_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK Pemohon</label>
                  <input
                    type="text"
                    placeholder="16 digit NIK"
                    value={form.nik}
                    onChange={e => setForm({ ...form, nik: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Pemohon</label>
                  <input
                    type="email"
                    placeholder="email@contoh.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Layanan Perizinan *</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 font-semibold text-slate-700"
                >
                  <option value="Izin Usaha Mikro Kecil (IUMK)">Izin Usaha Mikro Kecil (IUMK)</option>
                  <option value="Izin Mendirikan Bangunan (IMB)">Izin Mendirikan Bangunan (IMB)</option>
                  <option value="Izin Reklame & Baliho">Izin Reklame & Baliho</option>
                  <option value="Izin Usaha Restoran / Kuliner">Izin Usaha Restoran / Kuliner</option>
                  <option value="Izin Keramaian / Acara">Izin Keramaian / Acara</option>
                  <option value="Izin Pengoperasian Alat Berat">Izin Pengoperasian Alat Berat</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Usaha / Objek *</label>
                <input
                  type="text"
                  placeholder="Contoh: Kedai Kopi Melati"
                  value={form.business_name}
                  onChange={e => setForm({ ...form, business_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Usaha / Lokasi</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Pemuda No. 123, Kelurahan..."
                  value={form.business_address}
                  onChange={e => setForm({ ...form, business_address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              {/* INPUT FILE LAMPIRAN DOKUMEN */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unggah Dokumen Persyaratan (KTP / Lampiran)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Simpan & Ajukan
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* POP-UP MODAL 4: KONFIRMASI HAPUS */}
      {isDeleteOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="text-3xl">⚠️</div>
            <h3 className="font-black text-slate-900 text-base">Hapus Data Perizinan?</h3>
            <p className="text-xs text-slate-500">Tindakan ini akan menghapus data perizinan permanen dari sistem.</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Ya, Hapus
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
            toast.type === 'approved'
              ? 'bg-emerald-600'
              : toast.type === 'rejected'
              ? 'bg-amber-600'
              : toast.type === 'deleted' || toast.type === 'error'
              ? 'bg-rose-600'
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