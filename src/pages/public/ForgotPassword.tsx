import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo1.png';
import { api } from '../../services/api';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'Terjadi kesalahan saat memproses permintaan. Silakan periksa kembali email Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link 
          to="/login" 
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" strokeWidth={1.75} />
          Kembali ke Halaman Masuk
        </Link>
        <div className="flex justify-center">
          <img src={logo} alt="SIPEDI Logo" className="h-14 w-auto" />
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Lupa Kata Sandi?
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
          Masukkan alamat email yang terdaftar untuk menerima instruksi konfirmasi pembaruan kata sandi.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/90 shadow-sm">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          {!isSubmitted ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Alamat Email Terdaftar
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" strokeWidth={1.75} />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                >
                  {loading ? (
                    <>Memproses Permintaan...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" strokeWidth={2} />
                      Kirim Tautan Konfirmasi
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                <CheckCircle2 className="w-7 h-7" strokeWidth={2} />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900">Periksa Email Anda</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tautan konfirmasi ganti password telah dikirim ke: <br />
                  <strong className="text-slate-900 font-semibold">{email}</strong>
                </p>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 text-left mt-3">
                  <span className="font-semibold text-slate-700">Tips:</span> Silakan buka email Anda dan klik tombol konfirmasi. Jika tidak muncul dalam 2 menit, periksa folder <em>Spam</em> atau <em>Junk</em>.
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Kirim ulang ke email lain
                </button>
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors inline-block"
                >
                  Kembali ke Halaman Masuk
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
