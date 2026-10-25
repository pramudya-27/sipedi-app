import React, { useEffect, useState, useMemo } from 'react';
import { 
  AlertCircle, 
  FileText, 
  Download, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  Building2,
  User,
  Plus
} from 'lucide-react';
import { permitService } from '../../services/permitService';

export const AdminPermitList: React.FC = () => {
  const [permits, setPermits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search
  const [search, setSearch] = useState<string>('');
  const [searchBy, setSearchBy] = useState<'ALL' | 'NAME' | 'NUMBER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination (20 item per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Modal States
  const [selectedPermit, setSelectedPermit] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [permitToDelete, setPermitToDelete] = useState<string | null>(null);

  // Modal Persetujuan & Penolakan
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    permit: any | null;
    action: 'Approved' | 'Rejected' | null;
    durationMonths: number;
    startDate: string;
    rejectionReason: string;
  }>({
    isOpen: false,
    permit: null,
    action: null,
    durationMonths: 1,
    startDate: new Date().toISOString().split('T')[0],
    rejectionReason: ''
  });

  // Modal Konfirmasi Perpanjangan Izin
  const [renewalModal, setRenewalModal] = useState<{
    isOpen: boolean;
    permit: any | null;
    durationMonths: number;
    notes: string;
    submitting: boolean;
  }>({
    isOpen: false,
    permit: null,
    durationMonths: 1,
    notes: 'Perpanjangan operasional perizinan usaha',
    submitting: false
  });

  // State Lampiran File untuk Tambah Perizinan Baru
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State Loading Kirim Ulang Email
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Toast Notification
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
    }, 3500);
  };

  // Form Tambah Perizinan
  const [form, setForm] = useState({
    applicant_name: '',
    nik: '',
    phone: '',
    email: '',
    type: 'Izin Usaha Mikro Kecil (IUMK)',
    business_name: '',
    business_address: '',
    duration_months: 1,
    start_date: new Date().toISOString().split('T')[0]
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
  const approvedCount = permits.filter(p => ['Approved', 'ACTIVE', 'EXTENDED'].includes(p.status)).length;
  const submittedCount = permits.filter(p => ['Submitted', 'Draft', 'Under Verification'].includes(p.status)).length;
  const rejectedCount = permits.filter(p => p.status === 'Rejected').length;
  const expiredCount = permits.filter(p => p.status === 'EXPIRED' || p.remaining_days === 0).length;

  // Filter & Sorting Data 
  const filteredPermits = useMemo(() => {
    const filtered = permits.filter(p => {
      const q = search.toLowerCase();
      const nameMatch = (p.applicantName || p.applicant_name || '').toLowerCase().includes(q);
      const numMatch = (p.permitNumber || p.permit_number || '').toLowerCase().includes(q);
      const bizMatch = (p.businessName || p.business_name || '').toLowerCase().includes(q);

      let matchesSearch = true;
      if (searchBy === 'NAME') matchesSearch = nameMatch;
      else if (searchBy === 'NUMBER') matchesSearch = numMatch;
      else matchesSearch = nameMatch || numMatch || bizMatch;

      let matchesStatus = true;
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'Approved') {
          matchesStatus = ['Approved', 'ACTIVE', 'EXTENDED'].includes(p.status);
        } else if (statusFilter === 'Submitted') {
          matchesStatus = ['Submitted', 'Draft', 'Under Verification'].includes(p.status);
        } else if (statusFilter === 'EXPIRED') {
          matchesStatus = p.status === 'EXPIRED' || p.remaining_days === 0;
        } else {
          matchesStatus = (p.status || '').toLowerCase() === statusFilter.toLowerCase();
        }
      }

      return matchesSearch && matchesStatus;
    });

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

  // Handler Buka Modal Persetujuan / Penolakan
  const handleOpenStatusModal = (permit: any, action: 'Approved' | 'Rejected') => {
    setStatusModal({
      isOpen: true,
      permit,
      action,
      durationMonths: permit.duration_months || 1,
      startDate: new Date().toISOString().split('T')[0],
      rejectionReason: ''
    });
  };

  // Handler Eksekusi Persetujuan / Penolakan
  const handleExecuteStatusUpdate = async () => {
    const { permit, action, durationMonths, startDate, rejectionReason } = statusModal;
    if (!permit || !action) return;

    if (action === 'Rejected' && (!rejectionReason || !rejectionReason.trim())) {
      alert("Alasan penolakan wajib diisi.");
      return;
    }

    try {
      const payload: any = {
        status: action,
        duration_months: durationMonths,
        start_date: startDate
      };

      if (action === 'Rejected') {
        payload.rejection_reason = rejectionReason;
        payload.admin_note = rejectionReason;
      }

      const updated = await permitService.updateStatus(permit.id, action, payload);
      
      setPermits(prev =>
        prev.map(p => (String(p.id) === String(permit.id) ? { ...p, ...updated, status: action } : p))
      );

      if (selectedPermit && String(selectedPermit.id) === String(permit.id)) {
        setSelectedPermit({ ...selectedPermit, ...updated, status: action });
      }

      setStatusModal({ isOpen: false, permit: null, action: null, durationMonths: 1, startDate: '', rejectionReason: '' });

      if (action === 'Approved') {
        showToast(`Permohonan izin ${permit.permitNumber || permit.permit_number} berhasil disetujui (${durationMonths} Bulan)! Surat izin PDF resmi telah diterbitkan dan dikirimkan ke email pemohon.`, 'approved');
      } else {
        showToast(`Permohonan izin ${permit.permitNumber || permit.permit_number} ditolak. Notifikasi telah dikirimkan.`, 'rejected');
      }

      fetchPermits();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Gagal memproses perubahan status.', 'error');
    }
  };

  // Handler Eksekusi Perpanjangan Izin
  const handleExecuteRenewal = async () => {
    const { permit, durationMonths, notes } = renewalModal;
    if (!permit) return;

    setRenewalModal(prev => ({ ...prev, submitting: true }));

    try {
      const res = await permitService.requestRenewal(permit.id, durationMonths, notes);
      
      showToast(`Tagihan perpanjangan (${res.invoice_number}) berhasil dibuat! Email tagihan dan QRIS telah dikirim ke pemohon.`, 'approved');
      setRenewalModal({ isOpen: false, permit: null, durationMonths: 1, notes: '', submitting: false });
      
      fetchPermits();
      if (selectedPermit && String(selectedPermit.id) === String(permit.id)) {
        setIsDetailOpen(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Gagal memproses perpanjangan izin.', 'error');
      setRenewalModal(prev => ({ ...prev, submitting: false }));
    }
  };

  // Handler Kirim Ulang Email
  const handleResendEmail = async (permitId: string) => {
    setResendingId(permitId);
    try {
      await permitService.resendApprovalEmail(permitId);
      showToast("Surat izin resmi berhasil dikirim ulang ke email pemohon via Brevo!", 'approved');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Gagal mengirim ulang email.', 'error');
    } finally {
      setResendingId(null);
    }
  };

  // Handler Periksa Kedaluwarsa
  const handleCheckExpired = async () => {
    try {
      const res = await permitService.checkExpiredPermits();
      showToast(res.message, 'info');
      fetchPermits();
    } catch (err: any) {
      showToast('Gagal memeriksa kedaluwarsa.', 'error');
    }
  };

  // Handler Single Delete
  const handleDelete = async () => {
    if (!permitToDelete) return;
    try {
      await permitService.deletePermit(permitToDelete);
      setPermits(prev => prev.filter(p => String(p.id) !== String(permitToDelete)));
      setIsDeleteOpen(false);
      setPermitToDelete(null);
      if (selectedPermit && String(selectedPermit.id) === String(permitToDelete)) {
        setIsDetailOpen(false);
      }
      showToast('Data perizinan berhasil dihapus!', 'deleted');
    } catch (err) {
      showToast('Gagal menghapus data perizinan', 'error');
    }
  };

  // Handler Form Tambah Perizinan
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(form).forEach(key => {
        data.append(key, (form as any)[key]);
      });
      if (selectedFile) {
        data.append('document', selectedFile);
      }
      const newPermit = await permitService.createPermit(data);
      setPermits(prev => [newPermit, ...prev]);
      setIsCreateOpen(false);
      setSelectedFile(null);
      setForm({
        applicant_name: '',
        nik: '',
        phone: '',
        email: '',
        type: 'Izin Usaha Mikro Kecil (IUMK)',
        business_name: '',
        business_address: '',
        duration_months: 1,
        start_date: new Date().toISOString().split('T')[0]
      });
      showToast('Perizinan baru berhasil ditambahkan!', 'approved');
      fetchPermits();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Gagal menambahkan perizinan', 'error');
    }
  };

  // Handler Export CSV
  const handleExportCSV = () => {
    if (filteredPermits.length === 0) {
      alert("Tidak ada data perizinan untuk diekspor!");
      return;
    }
    const headers = [
      "No. Perizinan", "Nama Pemohon", "NIK", "No. Telepon", "Email",
      "Jenis Izin", "Nama Usaha", "Durasi (Bulan)", "Tgl Mulai", "Tgl Kedaluwarsa", "Status", "Tgl Pengajuan"
    ];
    const rows = filteredPermits.map(p => [
      `"${p.permitNumber || p.permit_number || ''}"`,
      `"${p.applicantName || p.applicant_name || ''}"`,
      `"${p.nik || ''}"`,
      `"${p.phone || ''}"`,
      `"${p.email || ''}"`,
      `"${p.type || p.permitType || ''}"`,
      `"${p.businessName || p.business_name || ''}"`,
      `"${p.duration_months || 1}"`,
      `"${p.start_date || ''}"`,
      `"${p.expired_at || ''}"`,
      `"${p.status || ''}"`,
      `"${p.submissionDate || p.submission_date || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Perizinan_SIPEDI_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Memuat data perizinan dari MySQL...</div>;
  if (error) return <div className="p-8 text-center text-rose-500 font-bold">{error}</div>;

  return (
    <div className="space-y-6 font-sans relative min-h-screen pb-20">
      {/* Header Utama & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Perizinan Digital</h1>
          <p className="text-xs text-slate-500 mt-1">
            Total <span className="font-bold text-blue-600">{totalCount}</span> data perizinan riil terhubung ke MySQL
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Izin</span>
          </button>
          <button
            onClick={handleCheckExpired}
            title="Perbarui status izin yang melewati batas kedaluwarsa"
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Cek Kedaluwarsa</span>
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

      {/* 5 CARD WIDGET RINGKASAN STATUS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Total Pengajuan</p>
          <p className="text-2xl font-black text-blue-600 mt-2">{totalCount} <span className="text-xs font-semibold text-slate-400">Berkas</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Aktif & Disetujui</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">{approvedCount} <span className="text-xs font-semibold text-slate-400">Izin</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Menunggu Verifikasi</p>
          <p className="text-2xl font-black text-amber-500 mt-2">{submittedCount} <span className="text-xs font-semibold text-slate-400">Izin</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Ditolak</p>
          <p className="text-2xl font-black text-rose-600 mt-2">{rejectedCount} <span className="text-xs font-semibold text-slate-400">Izin</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400">Kedaluwarsa</p>
          <p className="text-2xl font-black text-purple-600 mt-2">{expiredCount} <span className="text-xs font-semibold text-slate-400">Izin</span></p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
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
                : 'Cari nama pemohon, usaha, atau no. perizinan...'
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
            className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">Semua Status</option>
            <option value="Submitted">Submitted / Menunggu</option>
            <option value="Approved">Approved / Aktif</option>
            <option value="EXPIRED">EXPIRED / Kedaluwarsa</option>
            <option value="Rejected">Rejected / Ditolak</option>
          </select>
        </div>
      </div>

      {/* TABEL DATA PERIZINAN */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white uppercase tracking-wider font-extrabold border-b border-slate-700">
                <th className="py-3.5 px-3 whitespace-nowrap">No. Perizinan</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Pemohon</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Jenis Izin & Usaha</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">Durasi & Berlaku</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">Status</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">Tanggal Pengajuan</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap w-64">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada data perizinan yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                currentItems.map((p: any) => {
                  const isApproved = ['Approved', 'ACTIVE', 'EXTENDED'].includes(p.status);
                  const isSubmitted = ['Submitted', 'Draft', 'Under Verification'].includes(p.status);
                  const isExpired = p.status === 'EXPIRED' || p.remaining_days === 0 || p.is_expired || p.isExpired;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-blue-700 whitespace-nowrap">
                        {p.permitNumber || p.permit_number}
                        {p.active_version > 1 && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                            v{p.active_version}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">{p.applicantName || p.applicant_name}</div>
                        <div className="text-[11px] text-slate-500">{p.phone || p.email || 'NIK: ' + (p.nik || '-')}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{p.businessName || p.business_name}</div>
                        <div className="text-[11px] text-slate-500">{p.type || p.permitType}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-bold text-slate-800">{p.duration_months} Bulan</div>
                        {p.expired_at ? (
                          <div className="mt-0.5">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isExpired 
                                ? 'bg-purple-100 text-purple-700' 
                                : p.remaining_days !== null && p.remaining_days <= 14 
                                ? 'bg-amber-100 text-amber-700 animate-pulse'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {isExpired ? 'Kedaluwarsa' : `Sisa ${p.remaining_days} Hari`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Belum disetujui</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                          isApproved ? 'bg-emerald-100 text-emerald-700' :
                          isSubmitted ? 'bg-amber-100 text-amber-700' :
                          isExpired ? 'bg-purple-100 text-purple-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap text-slate-500 text-[11px]">
                        {new Date(p.submissionDate || p.submission_date).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Tombol Detail */}
                          <button
                            onClick={() => {
                              setSelectedPermit(p);
                              setIsDetailOpen(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Detail
                          </button>

                          {/* Tombol Setujui / Tolak jika masih Submitted */}
                          {isSubmitted && (
                            <>
                              <button
                                onClick={() => handleOpenStatusModal(p, 'Approved')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => handleOpenStatusModal(p, 'Rejected')}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {/* Tombol Unduh PDF jika disetujui */}
                          {isApproved && (
                            <a
                              href={`${API_BASE_URL}/api/permits/${p.id}/download-pdf`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Unduh Surat Izin PDF"
                            >
                              <Download className="w-3 h-3" />
                              <span>PDF</span>
                            </a>
                          )}

                          {/* Tombol Kirim Ulang Email ke Pemohon jika disetujui */}
                          {isApproved && (
                            <button
                              onClick={() => handleResendEmail(p.id)}
                              disabled={resendingId === p.id}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-emerald-200 disabled:opacity-50"
                              title="Kirim ulang surat izin resmi ke email pemohon via Brevo"
                            >
                              {resendingId === p.id ? (
                                <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>{resendingId === p.id ? 'Mengirim...' : 'Kirim Email'}</span>
                            </button>
                          )}

                          {/* Tombol Kirim Tagihan Perpanjangan QRIS HANYA jika sudah EXPIRED */}
                          {isExpired && (
                            <button
                              onClick={() => setRenewalModal({
                                isOpen: true,
                                permit: p,
                                durationMonths: 1,
                                notes: `Perpanjangan izin usaha ${p.businessName || p.business_name} (1 Bulan)`,
                                submitting: false
                              })}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Izin telah kedaluwarsa. Kirim email tagihan perpanjangan 1 bulan (Rp 100.000) via QRIS ke pemohon"
                            >
                              <Send className="w-3 h-3" />
                              <span>Kirim Tagihan QRIS</span>
                            </button>
                          )}

                          {/* Tombol Hapus */}
                          <button
                            onClick={() => {
                              setPermitToDelete(p.id);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Izin"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Halaman <b>{currentPage}</b> dari <b>{totalPages}</b>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: PERSETUJUAN & PENOLAKAN DENGAN DURASI & ALASAN
         ======================================================== */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  {statusModal.action === 'Approved' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Setujui Permohonan Perizinan</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span>Tolak Permohonan Perizinan</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: <span className="font-bold text-blue-600">{statusModal.permit?.permitNumber || statusModal.permit?.permit_number}</span>
                </p>
              </div>
              <button
                onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {statusModal.action === 'Approved' ? (
              <div className="space-y-4">
                {statusModal.durationMonths === 1 ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Bebas Biaya (Gratis Rp 0) — Izin 1 Bulan</span>
                    </div>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      Persetujuan durasi 1 bulan tidak membebankan biaya retribusi. Surat Izin Resmi (PDF) langsung diterbitkan dan otomatis dikirimkan ke email pemohon.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Retribusi Resmi ({statusModal.durationMonths} Bulan) — LUNAS DIBAYAR
                      </span>
                      <span className="font-mono font-black text-emerald-950 text-sm">
                        Rp{(100000 * statusModal.durationMonths).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-800 space-y-0.5 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <div className="flex justify-between">
                        <span>• Iuran Kebersihan Lingkungan:</span>
                        <span className="font-bold">Rp{(50000 * statusModal.durationMonths).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Iuran Ketertiban & Keamanan:</span>
                        <span className="font-bold">Rp{(50000 * statusModal.durationMonths).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-emerald-700 pt-0.5">
                      Pemohon telah melunasi retribusi resmi via QRIS. Surat Izin Resmi (PDF) langsung diterbitkan dan otomatis dikirimkan ke email pemohon.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Durasi Disetujui</label>
                    <select
                      value={statusModal.durationMonths}
                      onChange={e => setStatusModal({ ...statusModal, durationMonths: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                    >
                      <option value={1}>1 Bulan (Gratis)</option>
                      <option value={3}>3 Bulan (Retribusi)</option>
                      <option value={6}>6 Bulan (Retribusi)</option>
                      <option value={12}>12 Bulan (1 Tahun)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Mulai Berlaku</label>
                    <input
                      type="date"
                      value={statusModal.startDate}
                      onChange={e => setStatusModal({ ...statusModal, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Alasan Penolakan <span className="text-rose-600">* (Wajib diisi)</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan alasan penolakan secara jelas agar pemohon dapat melengkapi berkasnya..."
                  value={statusModal.rejectionReason}
                  onChange={e => setStatusModal({ ...statusModal, rejectionReason: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-rose-600 transition-all resize-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModal({ ...statusModal, isOpen: false })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteStatusUpdate}
                className={`px-4 py-2 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md ${
                  statusModal.action === 'Approved' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {statusModal.action === 'Approved' 
                  ? (statusModal.durationMonths === 1 ? 'Setujui & Terbitkan Surat Resmi (Gratis)' : 'Setujui & Terbitkan Surat Resmi (PDF)') 
                  : 'Konfirmasi Penolakan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: KONFIRMASI PERPANJANGAN IZIN (SECTION 6 & 7)
         ======================================================== */}
      {renewalModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-600 animate-spin-reverse" />
                  <span>Kirim Tagihan Perpanjangan Izin (1 Bulan)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Usaha: <span className="font-bold text-slate-800">{renewalModal.permit?.businessName || renewalModal.permit?.business_name}</span> ({renewalModal.permit?.permitNumber || renewalModal.permit?.permit_number})
                </p>
              </div>
              <button
                onClick={() => setRenewalModal({ ...renewalModal, isOpen: false })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <p className="text-xs font-bold text-amber-900">Perpanjangan Masa Berlaku Resmi: 1 Bulan</p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Sesuai ketentuan, perizinan yang telah kedaluwarsa dikenakan retribusi perpanjangan untuk masa berlaku <b>1 Bulan</b> sebesar <b>Rp 100.000</b>.
                </p>
              </div>

              {/* Rincian Biaya Transparan (Section 7) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-xs text-slate-800 flex items-center justify-between">
                  <span>Rincian Biaya Retribusi Resmi</span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Transparan</span>
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>• Iuran Kebersihan Lingkungan (1 Bulan):</span>
                    <span className="font-bold text-slate-900">Rp50.000</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>• Iuran Ketertiban & Keamanan (1 Bulan):</span>
                    <span className="font-bold text-slate-900">Rp50.000</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-blue-700">
                    <span>Total Tagihan Perpanjangan:</span>
                    <span>Rp100.000</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
                <b>Alur Otomatis:</b> Sistem akan mengirimkan email tagihan berisikan tautan pembayaran QRIS kepada <b>{renewalModal.permit?.email || 'pemohon'}</b>. Begitu pemohon membayar via link tersebut, surat izin resmi dengan <b>ID yang sama</b> otomatis diperpanjang <b>1 bulan</b> dan dokumen surat versi terbaru langsung terkirim ke email pemohon.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={renewalModal.submitting}
                onClick={() => setRenewalModal({ ...renewalModal, isOpen: false })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={renewalModal.submitting}
                onClick={handleExecuteRenewal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {renewalModal.submitting ? (
                  <span>Mengirim Email Tagihan...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Tagihan QRIS ke Pemohon</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: DETAIL LENGKAP PERIZINAN & DOKUMEN
         ======================================================== */}
      {isDetailOpen && selectedPermit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {selectedPermit.type || selectedPermit.permitType}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 mt-1">
                  {selectedPermit.businessName || selectedPermit.business_name}
                </h3>
                <p className="text-xs text-slate-500">
                  No. Izin: <span className="font-bold text-slate-700">{selectedPermit.permitNumber || selectedPermit.permit_number}</span>
                </p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Grid Informasi Pemohon & Usaha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Data Diri Pemohon
                </p>
                <p><span className="text-slate-400">Nama:</span> <b className="text-slate-900">{selectedPermit.applicantName || selectedPermit.applicant_name}</b></p>
                <p><span className="text-slate-400">NIK:</span> {selectedPermit.nik || '-'}</p>
                <p><span className="text-slate-400">Telepon:</span> {selectedPermit.phone || '-'}</p>
                <p><span className="text-slate-400">Email:</span> {selectedPermit.email || '-'}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Masa Berlaku & Status
                </p>
                <p><span className="text-slate-400">Status:</span> <b className="text-blue-600">{selectedPermit.status}</b></p>
                <p><span className="text-slate-400">Durasi:</span> <b>{selectedPermit.duration_months} Bulan</b></p>
                <p><span className="text-slate-400">Mulai:</span> {selectedPermit.start_date ? new Date(selectedPermit.start_date).toLocaleDateString('id-ID') : '-'}</p>
                <p><span className="text-slate-400">Kedaluwarsa:</span> <b className="text-rose-600">{selectedPermit.expired_at ? new Date(selectedPermit.expired_at).toLocaleDateString('id-ID') : '-'}</b></p>
              </div>
            </div>

            {/* Dokumen Surat Izin Resmi (PDF) */}
            {['Approved', 'ACTIVE', 'EXTENDED'].includes(selectedPermit.status) && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-emerald-950">Surat Izin Resmi (PDF Ber-QR Code)</h4>
                    <p className="text-[11px] text-emerald-700">Telah diterbitkan secara elektronik dan sah.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`${API_BASE_URL}/api/permits/${selectedPermit.id}/download-pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF</span>
                  </a>
                  <button
                    onClick={() => handleResendEmail(selectedPermit.id)}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5"
                    title="Kirim ulang surat izin ke email pemohon"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Ulang Email</span>
                  </button>
                </div>
              </div>
            )}

            {/* Berkas Lampiran Pengajuan */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800">Berkas Persyaratan yang Diunggah</h4>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {selectedPermit.documents ? `${selectedPermit.documents.length} berkas` : '0 berkas'}
                </span>
              </div>

              {selectedPermit.documents && selectedPermit.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPermit.documents.map((doc: any) => {
                    const filePath = doc.filePath || doc.file_path || '';
                    const fullUrl = filePath.startsWith('http')
                      ? filePath
                      : `${API_BASE_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
                    const isImg = doc.mime_type?.includes('image') || /\.(png|jpe?g|webp)$/i.test(doc.file_name || filePath);

                    return (
                      <div
                        key={doc.id}
                        className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-2xl flex flex-col justify-between gap-2.5 transition-all group"
                      >
                        {isImg && (
                          <div className="w-full h-32 rounded-xl bg-slate-200 overflow-hidden relative border border-slate-200/60 flex items-center justify-center">
                            <img
                              src={fullUrl}
                              alt={doc.file_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-800 truncate" title={doc.file_name}>
                              {doc.file_name}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              {doc.document_type || 'BERKAS PERSYARATAN'}
                            </p>
                          </div>

                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-slate-200 transition-colors shrink-0 shadow-2xs"
                            title="Buka / Unduh Berkas Ukuran Penuh"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-medium">Pemohon tidak melampirkan berkas persyaratan khusus.</p>
                </div>
              )}
            </div>

            {/* Riwayat Tagihan / Perpanjangan */}
            {selectedPermit.renewals && selectedPermit.renewals.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-xs text-slate-800">Riwayat Perpanjangan Izin</h4>
                <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-200/80 overflow-hidden text-xs">
                  {selectedPermit.renewals.map((r: any) => (
                    <div key={r.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{r.renewal_number}</span>
                        <p className="text-[11px] text-slate-500">Durasi: +{r.duration_months} Bulan • {r.invoice_number}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {r.status}
                        </span>
                        <p className="text-[11px] font-bold text-blue-600 mt-0.5">Rp{r.total_amount?.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {/* Tombol Perpanjang HANYA jika izin sudah expired */}
              {(selectedPermit.status === 'EXPIRED' || selectedPermit.remaining_days === 0 || selectedPermit.is_expired || selectedPermit.isExpired) ? (
                <button
                  onClick={() => {
                    setRenewalModal({
                      isOpen: true,
                      permit: selectedPermit,
                      durationMonths: 1,
                      notes: `Perpanjangan izin usaha ${selectedPermit.businessName || selectedPermit.business_name} (1 Bulan)`,
                      submitting: false
                    });
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Konfirmasi Perpanjangan Izin (1 Bulan)</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: HAPUS PERIZINAN
         ======================================================== */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Hapus Data Perizinan?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tindakan ini permanen dan akan menghapus data perizinan beserta seluruh berkas dokumen terkait dari sistem.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: TAMBAH PERIZINAN MANUAL
         ======================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Tambah Data Perizinan Baru</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pemohon *</label>
                  <input
                    type="text"
                    required
                    value={form.applicant_name}
                    onChange={e => setForm({ ...form, applicant_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK (16 Digit) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={form.nik}
                    onChange={e => setForm({ ...form, nik: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Aktif *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Usaha *</label>
                  <input
                    type="text"
                    required
                    value={form.business_name}
                    onChange={e => setForm({ ...form, business_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Izin *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Izin Usaha Mikro Kecil (IUMK)">IUMK</option>
                    <option value="Surat Keterangan Usaha (SKU)">SKU</option>
                    <option value="Izin Reklame & Spanduk">Izin Reklame</option>
                    <option value="Izin Keramaian / Kegiatan">Izin Keramaian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durasi Izin</label>
                  <select
                    value={form.duration_months}
                    onChange={e => setForm({ ...form, duration_months: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value={1}>1 Bulan</option>
                    <option value={3}>3 Bulan</option>
                    <option value={6}>6 Bulan</option>
                    <option value={12}>12 Bulan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Usaha *</label>
                <textarea
                  required
                  rows={2}
                  value={form.business_address}
                  onChange={e => setForm({ ...form, business_address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Upload Berkas Pendukung (Opsional)</label>
                <input
                  type="file"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Perizinan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING TOAST ALERT */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[10000] px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold text-white flex items-center gap-2 animate-in slide-in-from-bottom-5 ${
          toast.type === 'approved' ? 'bg-emerald-600 border-emerald-500' :
          toast.type === 'rejected' ? 'bg-amber-600 border-amber-500' :
          toast.type === 'deleted' ? 'bg-rose-600 border-rose-500' :
          toast.type === 'error' ? 'bg-red-600 border-red-500' :
          'bg-slate-900 border-slate-800'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
