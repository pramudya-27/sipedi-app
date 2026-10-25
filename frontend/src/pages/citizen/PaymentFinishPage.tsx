import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  FileText, 
  ExternalLink, 
  RotateCw, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';

export const PaymentFinishPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Parameter dari Midtrans callback redirect
  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || '';
  const transactionStatus = searchParams.get('transaction_status') || '';
  const statusCode = searchParams.get('status_code') || '';

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkStatus = async (isManualRefresh = false) => {
    if (!orderId) {
      setErrorMsg('Nomor pesanan / tagihan (order_id) tidak ditemukan pada URL redirect.');
      setLoading(false);
      return;
    }

    if (isManualRefresh) setVerifying(true);
    else setLoading(true);

    try {
      const res = await paymentService.verifyPayment(orderId, {
        transaction_status: transactionStatus,
        status_code: statusCode
      });
      setPaymentData(res);
      setErrorMsg(null);
    } catch (err: any) {
      console.error('Error verifying payment:', err);
      // Jika endpoint verifikasi gagal, coba ambil detail tagihan secara fallback
      try {
        const inv = await paymentService.getInvoice(orderId);
        setPaymentData({
          status: inv.status,
          invoice_number: inv.invoice_number,
          total_amount: inv.total_amount,
          permit_number: inv.permit_number,
          permit_id: inv.permit_id,
          is_renewal: Boolean(inv.renewal_id),
          snap_redirect_url: inv.snap_redirect_url,
          paid_at: inv.paid_at
        });
      } catch (fallbackErr: any) {
        setErrorMsg(err.response?.data?.detail || 'Gagal memverifikasi status transaksi dari server.');
      }
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [orderId]);

  // Handler Simulasi Sandbox Instan
  const handleInstantSandboxSimulate = async () => {
    if (!orderId) return;
    setVerifying(true);
    try {
      await paymentService.simulatePayment(orderId, 'settlement', 'QRIS');
      await checkStatus(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menjalankan simulasi pembayaran.');
    } finally {
      setVerifying(false);
    }
  };

  const isPaid = paymentData?.status === 'PAID';
  const isPending = paymentData?.status === 'PENDING' || paymentData?.status === 'UNPAID';
  const isCancelled = paymentData?.status === 'CANCELLED' || paymentData?.status === 'EXPIRED';
  const isRenewal = Boolean(paymentData?.is_renewal);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-blue-100/60 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-xl mx-auto">
        
        {/* Loading State */}
        {loading && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 border border-slate-200/80 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <RotateCw className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Memverifikasi Status Pembayaran</h2>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                Menghubungkan ke gateway Midtrans untuk memvalidasi pelunasan tagihan Anda...
              </p>
            </div>
          </div>
        )}

        {/* Error State: Order ID Not Found */}
        {!loading && errorMsg && !paymentData && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-rose-200 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Gagal Memverifikasi Transaksi</h2>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">{errorMsg}</p>
            </div>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-md hover:bg-slate-800 transition"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}

        {/* Success State: PAID */}
        {!loading && isPaid && (
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-7 sm:p-10 border border-emerald-100 shadow-[0_20px_50px_rgba(16,185,129,0.12)] space-y-6">
            
            {/* Header Icon */}
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="inline-flex items-center gap-1.5 bg-emerald-100/80 text-emerald-800 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pembayaran Berhasil & Terverifikasi</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {isRenewal ? "Izin Resmi Telah Diperpanjang!" : "Pembayaran Retribusi Berhasil Diterima!"}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
                {isRenewal 
                  ? "Masa berlaku izin usaha Anda telah diperpanjang selama 1 bulan. Surat izin resmi versi terbaru telah diterbitkan dan dikirimkan ke email Anda."
                  : "Retribusi resmi telah lunas. Pengajuan perizinan usaha Anda kini telah masuk antrean verifikasi Admin SIPEDI untuk diperiksa dan disetujui."
                }
              </p>
            </div>

            {/* Rincian Transaksi Card */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Nomor Tagihan / Resi:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {paymentData?.invoice_number || orderId}
                </span>
              </div>

              {paymentData?.permit_number && (
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Nomor Perizinan:</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {paymentData.permit_number}
                  </span>
                </div>
              )}

              {paymentData?.total_amount && (
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Total Dibayar:</span>
                  <span className="font-black text-slate-900 text-sm">
                    Rp {Number(paymentData.total_amount).toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status Pengajuan:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                  isRenewal 
                    ? "bg-emerald-100 text-emerald-800" 
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {isRenewal ? "Aktif & Berlaku" : "Menunggu Verifikasi Admin"}
                </span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-3 pt-2">
              {/* Jika Renewal, tombol Unduh Surat Izin Baru */}
              {isRenewal && (
                <a
                  href={`http://localhost:8000/api/permits/${paymentData?.permit_number || paymentData?.permit_id}/download-pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Surat Izin Resmi Terbaru (PDF)</span>
                </a>
              )}

              {/* Lacak Status Permohonan */}
              <Link
                to={`/?track=${encodeURIComponent(paymentData?.permit_number || orderId)}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/20 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Lacak Status Berkas ({paymentData?.permit_number || 'Perizinan'})</span>
              </Link>

              {/* Unduh Bukti Tagihan Retribusi (PDF) */}
              <a
                href={`http://localhost:8000/api/payments/invoice/${paymentData?.invoice_number || orderId}/download-pdf`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs border border-slate-200/80 transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Unduh Bukti Tagihan / Resi Retribusi (PDF)</span>
              </a>

              {/* Kembali ke Profil Perizinan */}
              <div className="text-center pt-2">
                <Link
                  to="/citizen/profile"
                  className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <span>Buka Halaman Profil & Riwayat Saya</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* Pending State */}
        {!loading && isPending && (
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-7 sm:p-10 border border-amber-200 shadow-xl space-y-6 text-center">
            
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                <span>Menunggu Konfirmasi Pembayaran</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Pembayaran Belum Terdeteksi Selesai
              </h1>
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                Kami belum menerima konfirmasi pelunasan dari bank / e-wallet Anda. Jika Anda baru saja menyelesaikan transaksi di Midtrans, silakan klik tombol Cek Ulang Status di bawah.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-xs space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nomor Tagihan:</span>
                <span className="font-mono font-bold text-slate-800">{orderId}</span>
              </div>
              {paymentData?.total_amount && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Tagihan:</span>
                  <span className="font-bold text-slate-900">
                    Rp {Number(paymentData.total_amount).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => checkStatus(true)}
                disabled={verifying}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <RotateCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                <span>{verifying ? 'Memeriksa ke Midtrans...' : 'Cek Ulang Status Pembayaran'}</span>
              </button>

              {paymentData?.snap_redirect_url && (
                <a
                  href={paymentData.snap_redirect_url}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Layar Pembayaran Midtrans</span>
                </a>
              )}

              {/* Tombol Simulasi Pembayaran Sandbox (Untuk Pengujian Instan) */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium mb-2">
                  Mode Pengujian Sandbox (Dev Simulator):
                </p>
                <button
                  onClick={handleInstantSandboxSimulate}
                  disabled={verifying}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Simulasi Bayar QRIS Sandbox (Instan)</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Cancelled / Expired State */}
        {!loading && isCancelled && (
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-7 sm:p-10 border border-slate-200 shadow-xl space-y-6 text-center">
            
            <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Pembayaran Tidak Berhasil
              </h1>
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                Transaksi ini telah dibatalkan atau masa berlaku pembayaran telah kedaluwarsa. Silakan lakukan pengajuan atau perpanjangan ulang.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/citizen/profile"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition"
              >
                <span>Kembali ke Halaman Perizinan</span>
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
