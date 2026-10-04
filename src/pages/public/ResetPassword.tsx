import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo1.png';
import { api } from '../../services/api';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, Check, X } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password Validation Criteria
  const hasMinLength = newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const isConfirmMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token reset password tidak ditemukan pada tautan.');
      return;
    }

    if (!isPasswordValid) {
      setError('Kata sandi baru belum memenuhi seluruh ketentuan keamanan di bawah.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: newPassword
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'Gagal memperbarui kata sandi. Tautan mungkin telah kedaluwarsa.'
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
          Buat Kata Sandi Baru
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
          Silakan buat kata sandi baru yang kuat untuk mengamankan akun SIPEDI Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/90 shadow-sm">
          {!token ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
                <AlertCircle className="w-7 h-7" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Tautan Tidak Valid</h2>
                <p className="text-sm text-slate-600">
                  Tautan konfirmasi ini tidak memuat token verifikasi yang sah atau telah kedaluwarsa.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/forgot-password"
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Ajukan Permohonan Ulang
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                <CheckCircle2 className="w-7 h-7" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Kata Sandi Berhasil Diperbarui</h2>
                <p className="text-sm text-slate-600">
                  Kata sandi lama telah diganti dengan kata sandi baru. Anda sekarang dapat masuk kembali ke akun Anda.
                </p>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Masuk Sekarang
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" strokeWidth={1.75} />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="newPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${
                        newPassword.length > 0 && !isPasswordValid
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
                      }`}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Buat kata sandi baru"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" strokeWidth={1.75} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Requirement Checklist */}
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 text-xs space-y-2">
                    <span className="font-semibold text-slate-700 block">
                      Ketentuan Kata Sandi:
                    </span>
                    <ul className="space-y-1.5">
                      <li className={`flex items-center gap-2 transition-colors ${
                        hasMinLength ? 'text-emerald-700 font-medium' : 'text-red-600'
                      }`}>
                        {hasMinLength ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                        ) : (
                          <X className="w-4 h-4 text-red-500 shrink-0" strokeWidth={2.5} />
                        )}
                        <span>Minimal 6 karakter</span>
                      </li>
                      <li className={`flex items-center gap-2 transition-colors ${
                        hasUppercase ? 'text-emerald-700 font-medium' : 'text-red-600'
                      }`}>
                        {hasUppercase ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                        ) : (
                          <X className="w-4 h-4 text-red-500 shrink-0" strokeWidth={2.5} />
                        )}
                        <span>Setidaknya 1 huruf kapital / besar (A-Z)</span>
                      </li>
                      <li className={`flex items-center gap-2 transition-colors ${
                        hasLowercase ? 'text-emerald-700 font-medium' : 'text-red-600'
                      }`}>
                        {hasLowercase ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                        ) : (
                          <X className="w-4 h-4 text-red-500 shrink-0" strokeWidth={2.5} />
                        )}
                        <span>Setidaknya 1 huruf kecil (a-z)</span>
                      </li>
                      <li className={`flex items-center gap-2 transition-colors ${
                        hasNumber ? 'text-emerald-700 font-medium' : 'text-red-600'
                      }`}>
                        {hasNumber ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                        ) : (
                          <X className="w-4 h-4 text-red-500 shrink-0" strokeWidth={2.5} />
                        )}
                        <span>Setidaknya 1 angka (0-9)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${
                        confirmPassword.length > 0 && !isConfirmMatch
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
                      }`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" strokeWidth={1.75} />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showConfirm ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <div className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${
                      isConfirmMatch ? 'text-emerald-700' : 'text-red-600'
                    }`}>
                      {isConfirmMatch ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2.5} />
                          <span>Kata sandi cocok</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 text-red-500 shrink-0" strokeWidth={2.5} />
                          <span>Kata sandi tidak cocok</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !isPasswordValid}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                  >
                    {loading ? (
                      <>Menyimpan Perubahan...</>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" strokeWidth={2} />
                        Perbarui Kata Sandi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
