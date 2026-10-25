import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Building2,
  Smartphone,
  Info,
  Sparkles
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  renewal_id?: string | null;
  permit_id: string;
  permit_number: string;
  business_name: string;
  applicant_name: string;
  subtotal: number;
  total_amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  snap_token: string | null;
  snap_redirect_url: string | null;
  qris_url: string | null;
  pdf_path: string | null;
  items: Array<{
    id: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

export const PermitPaymentPage: React.FC = () => {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSuccess, setSimSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'QRIS' | 'VA' | 'EWALLET' | 'OFFICIAL_SIM'>('QRIS');
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'MANDIRI' | 'BNI' | 'BRI' | 'PERMATA'>('BCA');
  const [qrImgError, setQrImgError] = useState<boolean>(false);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const fetchInvoice = async () => {
    if (!invoiceNumber) return;
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getInvoice(invoiceNumber);
      setInvoice(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Tagihan invoice tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  // Otomatis verifikasi lunas jika kembali dari redirect sukses Midtrans
  useEffect(() => {
    const txStatus = (searchParams.get('transaction_status') || '').toLowerCase();
    const statusCode = searchParams.get('status_code');

    if (invoiceNumber && (txStatus === 'settlement' || txStatus === 'capture' || statusCode === '200')) {
      paymentService.simulatePayment(invoiceNumber, 'settlement', 'MIDTRANS_GATEWAY')
        .then(() => {
          setSimSuccess('Pembayaran via Midtrans berhasil diverifikasi dan lunas!');
          fetchInvoice();
        })
        .catch(() => {
          fetchInvoice();
        });
    } else {
      fetchInvoice();
    }
  }, [invoiceNumber, searchParams]);

  const handleSimulatePayment = async (methodName: string = 'QRIS') => {
    if (!invoiceNumber) return;
    try {
      setIsSimulating(true);
      const res = await paymentService.simulatePayment(invoiceNumber, 'settlement', methodName);
      setSimSuccess(res.message || `Pembayaran ${methodName} berhasil diverifikasi!`);
      await fetchInvoice();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal memproses simulasi pembayaran.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Helper untuk QR Code Image URL yang valid
  const getQrCodeSrc = () => {
    const raw = invoice?.qris_url || invoice?.snap_redirect_url;
    if (!raw) return null;
    if (raw.includes('api.qrserver.com') || raw.startsWith('data:image')) {
      return raw;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(raw)}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 text-sm font-medium">Memuat rincian tagihan perizinan...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 p-6 rounded-3xl max-w-md w-full text-center border border-red-200 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Tagihan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-600">{error || 'Invoice yang dicari tidak tersedia dalam sistem.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <span className="text-xs font-mono text-slate-400">
            {invoice.invoice_number}
          </span>
        </div>

        {simSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-medium">{simSuccess}</p>
            </div>
          </div>
        )}

        {/* Invoice Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-400/30">
                  <Receipt className="w-3.5 h-3.5" />
                  Surat Ketetapan Retribusi Perizinan
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">
                  {invoice.renewal_id ? 'Tagihan Perpanjangan Izin' : 'Tagihan Retribusi Perizinan'}
                </h1>
                <p className="text-xs text-blue-200/80 mt-1 font-mono">
                  No. Invoice: {invoice.invoice_number}
                </p>
              </div>

              <div>
                {invoice.status === 'PAID' ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black">
                    <CheckCircle2 className="w-4 h-4" />
                    LUNAS TERVERIFIKASI
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                    <Clock className="w-4 h-4" />
                    MENUNGGU PEMBAYARAN
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Pemohon & Izin Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Pemohon / Penanggung Jawab:</span>
                <p className="font-bold text-slate-800 text-sm">{invoice.applicant_name}</p>
                <p className="text-slate-500">{invoice.business_name}</p>
              </div>
              <div className="space-y-1 sm:text-right">
                <span className="text-slate-400 font-medium">Nomor Perizinan SIPEDI:</span>
                <p className="font-mono font-bold text-blue-700 text-sm">{invoice.permit_number}</p>
                <p className="text-slate-500">Jatuh Tempo: {invoice.due_date}</p>
              </div>
            </div>

            {/* Rincian Komponen Biaya Transparan */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Rincian Tarif Retribusi Resmi (Perda)
              </h3>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                {invoice.items.map((it) => (
                  <div key={it.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{it.item_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {it.quantity} x {formatIDR(it.unit_price)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-800">{formatIDR(it.subtotal)}</span>
                  </div>
                ))}
                
                <div className="p-4 bg-slate-50/80 flex items-center justify-between text-sm font-black text-slate-900">
                  <span>Total Tagihan Retribusi</span>
                  <span className="text-blue-700 text-lg font-black">{formatIDR(invoice.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Jika Status PAID */}
            {invoice.status === 'PAID' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-950">Pembayaran Berhasil Diterima</h3>
                  <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                    {invoice.renewal_id
                      ? 'Masa berlaku izin usaha Anda telah resmi diperpanjang. Surat Izin Digital versi terbaru telah diterbitkan dan dikirimkan ke email Anda.'
                      : 'Pembayaran retribusi perizinan telah lunas. Pengajuan Anda kini masuk antrean pemeriksaan Admin SIPEDI untuk diverifikasi dan diterbitkan.'}
                  </p>
                  {invoice.paid_at && (
                    <p className="text-[11px] text-emerald-600 mt-2 font-mono">
                      Waktu Lunas: {invoice.paid_at}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {invoice.renewal_id ? (
                    <a
                      href={`http://localhost:8000/api/v1/permits/${invoice.permit_id}/download-pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30"
                    >
                      <Download className="w-4 h-4" />
                      Unduh Surat Izin Versi Baru (PDF)
                    </a>
                  ) : (
                    <Link
                      to={`/track/${invoice.permit_number}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Pantau Status Pelacakan Perizinan
                    </Link>
                  )}
                  <a
                    href={`http://localhost:8000/api/v1/payments/invoice/${invoice.invoice_number}/download-pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Bukti Tagihan (PDF)
                  </a>
                </div>
              </div>
            ) : (
              /* Jika Status UNPAID -> Sediakan Pilihan Pembayaran & Simulator */
              <div className="border border-slate-200 rounded-3xl p-6 bg-gradient-to-b from-white to-slate-50 space-y-6">
                
                {/* 1. Opsi Membuka Midtrans Snap Langsung (Semua Bank & E-Wallet) */}
                {invoice.snap_redirect_url && (
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
                        <Sparkles className="w-3 h-3" />
                        Midtrans Payment Gateway
                      </div>
                      <h4 className="text-sm font-extrabold text-white">Buka Portal Pembayaran Midtrans Snap</h4>
                      <p className="text-xs text-blue-200/80 leading-relaxed">
                        Pilih langsung dari antarmuka resmi Midtrans: BCA, Mandiri, BNI, BRI, Permata, GoPay, ShopeePay & QRIS.
                      </p>
                    </div>

                    <a
                      href={invoice.snap_redirect_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-black transition shadow-sm shrink-0"
                    >
                      <span>Buka Pembayaran</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* 2. Selector Tab Metode Simulasi */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                    <button
                      onClick={() => setActiveTab('QRIS')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeTab === 'QRIS'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      QRIS Nasional
                    </button>

                    <button
                      onClick={() => setActiveTab('VA')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeTab === 'VA'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Virtual Account (Semua Bank)
                    </button>

                    <button
                      onClick={() => setActiveTab('EWALLET')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeTab === 'EWALLET'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      E-Wallet (GoPay / ShopeePay)
                    </button>

                    <button
                      onClick={() => setActiveTab('OFFICIAL_SIM')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeTab === 'OFFICIAL_SIM'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Simulator Resmi Midtrans.com
                    </button>
                  </div>
                </div>

                {/* Tab Konten 1: QRIS */}
                {activeTab === 'QRIS' && (
                  <div className="space-y-5 text-center">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold">
                        <QrCode className="w-3.5 h-3.5" />
                        Pembayaran Standar QRIS Nasional
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">Scan QRIS untuk Melakukan Pembayaran</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Gunakan aplikasi GoPay, OVO, Dana, BCA, Mandiri, atau m-Banking pilihan Anda yang mendukung QRIS.
                      </p>
                    </div>

                    {/* QR Code Box */}
                    <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-slate-200 shadow-inner max-w-xs mx-auto space-y-3">
                      <div className="w-56 h-56 bg-slate-900 rounded-xl p-3 flex items-center justify-center shadow-md overflow-hidden relative">
                        {getQrCodeSrc() && !qrImgError ? (
                          <img
                            src={getQrCodeSrc()!}
                            alt="QRIS Code"
                            onError={() => setQrImgError(true)}
                            className="w-full h-full object-contain bg-white rounded-lg p-2"
                          />
                        ) : (
                          /* Fallback QR Graphic SVG yang selalu tampil */
                          <div className="w-full h-full bg-white rounded-lg p-3 flex flex-col items-center justify-between text-slate-900">
                            <div className="w-full flex items-center justify-between px-1 border-b border-slate-200 pb-1">
                              <span className="text-[10px] font-black text-rose-600 tracking-wider">QRIS</span>
                              <span className="text-[8px] font-bold text-slate-400">STANDAR BI</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="w-6 h-6 bg-slate-900 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-200 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-900 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-200 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-900 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-200 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-900 rounded-xs"></div>
                              <div className="w-6 h-6 bg-blue-600 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-900 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-200 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-900 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-200 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-900 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-200 rounded-xs"></div>
                              <div className="w-6 h-6 bg-slate-900 rounded-xs"></div>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-600 tracking-wider">
                              {invoice.invoice_number}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <p className="font-bold text-xs text-slate-800">NMID: ID1020249876543</p>
                        <p className="text-[11px] text-slate-400">SIPEDI DPMPTSP KOTA</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleSimulatePayment('QRIS')}
                        disabled={isSimulating}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isSimulating ? 'Memverifikasi Pembayaran...' : 'Simulasikan Pembayaran QRIS Lunas (Sandbox)'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab Konten 2: Virtual Account (Semua Bank) */}
                {activeTab === 'VA' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Transfer Virtual Account (VA) Bank</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pilih bank tujuan untuk melihat nomor rekening virtual dan simulasikan pelunasan secara instan.
                      </p>
                    </div>

                    {/* Bank Selector Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {(['BCA', 'MANDIRI', 'BNI', 'BRI', 'PERMATA'] as const).map((b) => (
                        <button
                          key={b}
                          onClick={() => setSelectedBank(b)}
                          className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                            selectedBank === b
                              ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-extrabold ring-2 ring-blue-500/20 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                          }`}
                        >
                          <p className="text-xs">{b}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Virtual Account</p>
                        </button>
                      ))}
                    </div>

                    {/* VA Info Card */}
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-500">Bank Tujuan:</span>
                        <span className="text-xs font-extrabold text-blue-700">Bank {selectedBank} (Virtual Account)</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-slate-400 uppercase font-semibold">Nomor Virtual Account:</p>
                          <p className="font-mono text-base font-black text-slate-900 tracking-wider">
                            {selectedBank === 'BCA' && `80012 082177505749`}
                            {selectedBank === 'MANDIRI' && `70012 082177505749 (Biller Code)`}
                            {selectedBank === 'BNI' && `8277 082177505749`}
                            {selectedBank === 'BRI' && `10777 082177505749`}
                            {selectedBank === 'PERMATA' && `8528 082177505749`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-slate-400">Total Nominal:</p>
                          <p className="text-sm font-black text-blue-700">{formatIDR(invoice.total_amount)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        onClick={() => handleSimulatePayment(`${selectedBank}_VA`)}
                        disabled={isSimulating}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isSimulating ? 'Memproses Transfer...' : `Simulasikan Pembayaran VA ${selectedBank} Lunas (Sandbox)`}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab Konten 3: E-Wallet */}
                {activeTab === 'EWALLET' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Pembayaran Dompet Digital (E-Wallet)</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Didukung oleh GoPay, ShopeePay, OVO, dan DANA.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-black text-xs">
                          GP
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">GoPay / GoPay App</h4>
                        <button
                          onClick={() => handleSimulatePayment('GOPAY')}
                          disabled={isSimulating}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        >
                          Simulasikan GoPay Lunas
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-black text-xs">
                          SP
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">ShopeePay / OVO</h4>
                        <button
                          onClick={() => handleSimulatePayment('SHOPEEPAY')}
                          disabled={isSimulating}
                          className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        >
                          Simulasikan ShopeePay Lunas
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Konten 4: Simulator Resmi Midtrans */}
                {activeTab === 'OFFICIAL_SIM' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-2">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
                          Portal Simulator Resmi Midtrans Sandbox
                        </h4>
                      </div>
                      <p className="text-xs leading-relaxed text-indigo-800">
                        Midtrans menyediakan portal simulator resmi untuk menguji skenario pembayaran nyata dengan webhook otomatis.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <a
                        href="https://simulator.sandbox.midtrans.com/openapi/qris/index"
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition flex items-center justify-between text-slate-800 font-bold"
                      >
                        <span>Simulator QRIS Midtrans</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>

                      <a
                        href="https://simulator.sandbox.midtrans.com/bca/va/index"
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition flex items-center justify-between text-slate-800 font-bold"
                      >
                        <span>Simulator BCA Virtual Account</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>

                      <a
                        href="https://simulator.sandbox.midtrans.com/mandiri/bill/index"
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition flex items-center justify-between text-slate-800 font-bold"
                      >
                        <span>Simulator Mandiri Bill Payment</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>

                      <a
                        href="https://simulator.sandbox.midtrans.com/bni/va/index"
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition flex items-center justify-between text-slate-800 font-bold"
                      >
                        <span>Simulator BNI Virtual Account</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>

                      <a
                        href="https://simulator.sandbox.midtrans.com/bri/va/index"
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition flex items-center justify-between text-slate-800 font-bold"
                      >
                        <span>Simulator BRI Virtual Account</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>

                      <a
                        href="https://simulator.sandbox.midtrans.com/gopay/partner/web/index"
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition flex items-center justify-between text-slate-800 font-bold"
                      >
                        <span>Simulator GoPay / E-Wallet</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Tombol Unduh Invoice PDF & Info Keamanan */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <a
                    href={`http://localhost:8000/api/v1/payments/invoice/${invoice.invoice_number}/download-pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Bukti Tagihan (PDF)
                  </a>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 text-center sm:text-right">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Diverifikasi otomatis secara instan oleh Midtrans Sandbox Gateway</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>© 2026 SIPEDI — Sistem Perizinan Digital Terpadu.</p>
          <p>Jika mengalami kendala pembayaran, hubungi layanan dukungan pengaduan SIPEDI.</p>
        </div>

      </div>
    </div>
  );
};
