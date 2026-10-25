import React, {useEffect, useState} from "react";
import {
  Wallet,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  FileText,
  Sparkles,
  ArrowUpRight,
  Receipt,
  QrCode,
  DollarSign,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import {paymentService} from "../../services/paymentService";

interface RevenueSummary {
  total_revenue: number;
  this_month_revenue: number;
  total_paid_transactions: number;
  total_pending_invoices: number;
  breakdown: {
    iuran_kebersihan: number;
    iuran_keamanan: number;
  };
  monthly_trend: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

interface TransactionItem {
  id: string;
  invoice_number: string;
  permit_id: string;
  permit_number: string;
  applicant_name: string;
  nik?: string;
  phone?: string;
  business_name: string;
  business_sector?: string;
  duration_months?: number;
  subtotal: number;
  total_amount: number;
  kebersihan_amount: number;
  keamanan_amount: number;
  status: string;
  payment_method: string;
  due_date: string;
  paid_at: string | null;
  created_at: string;
  pdf_path: string | null;
}

export const AdminRevenuePage: React.FC = () => {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const [sumRes, txRes] = await Promise.all([
        paymentService.getRevenueSummary(),
        paymentService.getRevenueTransactions(statusFilter, searchTerm),
      ]);
      setSummary(sumRes);
      setTransactions(txRes || []);
    } catch (err) {
      console.error("Gagal mengambil data pendapatan:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleSimulatePayment = async (orderId: string) => {
    try {
      setIsSimulating(true);
      const res = await paymentService.simulatePayment(orderId, "settlement");
      setActionSuccessMsg(
        res.message || "Pembayaran berhasil disimulasikan sebagai lunas!",
      );
      await loadData();
      if (selectedTx && selectedTx.invoice_number === orderId) {
        setSelectedTx(null);
      }
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(
        err.response?.data?.detail || "Gagal memproses simulasi pembayaran.",
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDeleteInvoice = async (invoiceNumber: string) => {
    if (
      !window.confirm(
        `Hapus data tagihan ${invoiceNumber} dari buku kas? Data terkait akan dibersihkan secara permanen.`,
      )
    ) {
      return;
    }
    try {
      await paymentService.deleteInvoice(invoiceNumber);
      setActionSuccessMsg(`Tagihan ${invoiceNumber} berhasil dihapus.`);
      await loadData();
      if (selectedTx && selectedTx.invoice_number === invoiceNumber) {
        setSelectedTx(null);
      }
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Gagal menghapus tagihan.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-900/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-400/30">
            <Wallet className="w-3.5 h-3.5" />
            Modul Keuangan & Pendapatan Retribusi
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Pemasukan & Keuangan SIPEDI
          </h1>
          <p className="text-blue-200/80 text-sm mt-1 max-w-2xl">
            Transparansi pelaporan retribusi resmi iuran kebersihan dan keamanan
            perizinan terintegrasi payment gateway QRIS.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={paymentService.getExportExcelUrl(statusFilter, searchTerm)}
            target="_blank"
            rel="noreferrer"
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition shadow-lg shadow-emerald-900/40 border border-emerald-400/40"
            title="Download Laporan Audit Keuangan Lengkap (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Audit Excel</span>
          </a>

          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition border border-white/10 backdrop-blur-md disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">{actionSuccessMsg}</p>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Wallet className="w-16 h-16 text-blue-600" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Pemasukan
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {formatIDR(summary?.total_revenue || 0)}
          </h3>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Penerimaan Kas Retribusi Lunas</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <TrendingUp className="w-16 h-16 text-indigo-600" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pemasukan Bulan Ini
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {formatIDR(summary?.this_month_revenue || 0)}
          </h3>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              Bulan Berjalan (
              {new Date().toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
              )
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Transaksi Lunas
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {summary?.total_paid_transactions || 0}
            <span className="text-sm font-medium text-slate-400 ml-1.5">
              transaksi
            </span>
          </h3>
          <div className="mt-3 text-xs font-semibold text-slate-500">
            Terverifikasi otomatis
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Clock className="w-16 h-16 text-amber-600" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Menunggu Pembayaran
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {summary?.total_pending_invoices || 0}
            <span className="text-sm font-medium text-slate-400 ml-1.5">
              tagihan
            </span>
          </h3>
          <div className="mt-3 text-xs font-semibold text-amber-600">
            Invoice aktif belum terbayar
          </div>
        </div>
      </div>

      {/* Breakdown Retribusi Transparan */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Rincian Komponen Retribusi Daerah
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Alokasi transparansi dana pendapatan retribusi perizinan resmi
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
            Perda No. 12/2024
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kebersihan */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Iuran Kebersihan
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Rp50.000 / bln
              </span>
            </div>
            <h4 className="text-2xl font-black text-emerald-950">
              {formatIDR(summary?.breakdown.iuran_kebersihan || 0)}
            </h4>
            <p className="text-xs text-emerald-700/80">
              Pengelolaan limbah dan kebersihan area sekitar usaha/kegiatan.
            </p>
          </div>

          {/* Keamanan */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                Iuran Ketertiban & Keamanan
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Rp50.000 / bln
              </span>
            </div>
            <h4 className="text-2xl font-black text-blue-950">
              {formatIDR(summary?.breakdown.iuran_keamanan || 0)}
            </h4>
            <p className="text-xs text-blue-700/80">
              Monitoring keteraturan, ketertiban umum, dan pengawasan berkala.
            </p>
          </div>
        </div>

        {/* Tren 6 Bulan */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Tren Pendapatan Bulanan
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {summary?.monthly_trend.map((trend, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center"
              >
                <p className="text-[11px] font-bold text-slate-500">
                  {trend.month}
                </p>
                <p className="text-xs font-black text-slate-800 mt-1">
                  {formatIDR(trend.amount)}
                </p>
                <span className="text-[10px] text-slate-400">
                  {trend.count} bayar
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Buku Kas & Riwayat Transaksi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar invoice tagihan retribusi perpanjangan perizinan digital
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="PAID">Lunas (PAID)</option>
                <option value="UNPAID">Menunggu Pembayaran (UNPAID)</option>
                <option value="CANCELLED">Dibatalkan / Kadaluwarsa</option>
              </select>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Cari Invoice, Izin, NIK, Usaha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            {/* Quick Export Excel Button */}
            <a
              href={paymentService.getExportExcelUrl(statusFilter, searchTerm)}
              target="_blank"
              rel="noreferrer"
              download
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition shadow-xs"
              title="Download Data Terpilih ke Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel</span>
            </a>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nomor Invoice</th>
                <th className="px-6 py-4">Pemohon & Usaha</th>
                <th className="px-6 py-4">No. Perizinan</th>
                <th className="px-6 py-4">Rincian Retribusi</th>
                <th className="px-6 py-4">Total Biaya</th>
                <th className="px-6 py-4">Status & Tanggal</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat data transaksi...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Belum ada data transaksi atau tagihan sesuai filter.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{tx.invoice_number}</span>
                      </div>
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                        Dibuat: {tx.created_at}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {tx.applicant_name}
                      </div>
                      {tx.nik && tx.nik !== "-" && (
                        <div className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 inline-block mt-0.5 font-semibold">
                          NIK: {tx.nik}
                        </div>
                      )}
                      <div className="text-slate-700 font-semibold text-[11px] mt-1">
                        {tx.business_name}
                      </div>
                      {tx.business_sector && (
                        <div className="text-slate-400 text-[10px]">
                          {tx.business_sector}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {tx.permit_number}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[11px] text-slate-600 space-y-0.5">
                      <div>
                        Kebersihan:{" "}
                        <span className="font-bold">
                          {formatIDR(tx.kebersihan_amount)}
                        </span>
                      </div>
                      <div>
                        Keamanan:{" "}
                        <span className="font-bold">
                          {formatIDR(tx.keamanan_amount)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-black text-slate-900 text-sm">
                        {formatIDR(tx.total_amount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Via {tx.payment_method}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {tx.status === "PAID" ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Lunas
                          </span>
                          <div className="text-[10px] text-slate-400">
                            {tx.paid_at || "-"}
                          </div>
                        </div>
                      ) : tx.status === "UNPAID" ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Menunggu Bayar
                          </span>
                          <div className="text-[10px] text-slate-400">
                            Jatuh tempo: {tx.due_date}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {tx.status}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                          title="Lihat Detail Tagihan"
                        >
                          Detail
                        </button>

                        <a
                          href={`http://localhost:8000/api/v1/payments/invoice/${tx.invoice_number}/download-pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                          title="Unduh PDF Invoice Tagihan"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {tx.status === "UNPAID" && (
                          <button
                            onClick={() =>
                              handleSimulatePayment(tx.invoice_number)
                            }
                            disabled={isSimulating}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                            title="Simulasikan Pelunasan QRIS Instan (Sandbox)"
                          >
                            <QrCode className="w-3 h-3" />
                            Bayar
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteInvoice(tx.invoice_number)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                          title="Hapus Data Tagihan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Invoice */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-black text-slate-900">
                  Detail Invoice Retribusi
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Invoice:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedTx.invoice_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Izin Terkait:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedTx.permit_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pemohon:</span>
                  <span className="font-bold text-slate-900">
                    {selectedTx.applicant_name}
                  </span>
                </div>
                {selectedTx.nik && selectedTx.nik !== "-" && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">NIK Pemohon:</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {selectedTx.nik}
                    </span>
                  </div>
                )}
                {selectedTx.phone && selectedTx.phone !== "-" && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Telepon / HP:</span>
                    <span className="font-medium text-slate-800">
                      {selectedTx.phone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Usaha:</span>
                  <span className="font-bold text-slate-900">
                    {selectedTx.business_name}
                  </span>
                </div>
                {selectedTx.business_sector && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sektor Usaha:</span>
                    <span className="font-medium text-slate-700">
                      {selectedTx.business_sector}
                    </span>
                  </div>
                )}
                {selectedTx.duration_months && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Durasi Izin:</span>
                    <span className="font-bold text-slate-800">
                      {selectedTx.duration_months} Bulan
                    </span>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Rincian Tarif Resmi
                </p>
                <div className="flex justify-between text-slate-600">
                  <span>Iuran Kebersihan Lingkungan</span>
                  <span className="font-bold">
                    {formatIDR(selectedTx.kebersihan_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Iuran Ketertiban & Keamanan</span>
                  <span className="font-bold">
                    {formatIDR(selectedTx.keamanan_amount)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-900 font-black text-sm">
                  <span>Total Tagihan</span>
                  <span className="text-blue-600">
                    {formatIDR(selectedTx.total_amount)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-2xl space-y-2 border border-blue-100">
                <div className="flex justify-between">
                  <span className="text-blue-700">Status Pembayaran:</span>
                  <span className="font-bold text-blue-900">
                    {selectedTx.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Metode Bayar:</span>
                  <span className="font-bold text-blue-900">
                    {selectedTx.payment_method}
                  </span>
                </div>
                {selectedTx.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Waktu Lunas:</span>
                    <span className="font-bold text-blue-900">
                      {selectedTx.paid_at}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <a
                  href={`http://localhost:8000/api/v1/payments/invoice/${selectedTx.invoice_number}/download-pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  <Download className="w-4 h-4" />
                  Unduh PDF Invoice
                </a>

                <button
                  onClick={() => handleDeleteInvoice(selectedTx.invoice_number)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition border border-rose-200/50"
                  title="Hapus Tagihan & Data Terkait"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>

              {selectedTx.status === "UNPAID" && (
                <button
                  onClick={() =>
                    handleSimulatePayment(selectedTx.invoice_number)
                  }
                  disabled={isSimulating}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/30"
                >
                  <QrCode className="w-4 h-4" />
                  Simulasikan Bayar Lunas
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
