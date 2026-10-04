import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo1.png';
import { api } from '../../services/api';
import { UserPlus, AlertCircle, ArrowLeft, Check, X, Eye, EyeOff, Lock } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Validation Criteria
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const isConfirmMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Kata sandi belum memenuhi seluruh ketentuan keamanan di bawah.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    
    try {
      const name = `${firstName} ${lastName}`.trim();
      await api.post('/auth/register', { name, email, password, role: 'CITIZEN' });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Waves */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 1000">
          <defs>
            <linearGradient id="waveRegGrad1" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="waveRegGrad2" x1="100%" y1="20%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path d="M0,50 C280,180 520,30 820,120 C1120,210 1280,80 1440,150 L1440,0 L0,0 Z" fill="url(#waveRegGrad1)" />
          <path d="M0,100 C320,200 580,70 880,160 C1160,250 1320,120 1440,180 L1440,0 L0,0 Z" fill="url(#waveRegGrad2)" />
        </svg>
        <div className="absolute top-1/4 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-blue-300/30 to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-300/20 via-sky-200/10 to-transparent rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 group cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" strokeWidth={1.75} />
          Kembali ke Beranda
        </Link>
        <div className="flex justify-center">
          <img src={logo} alt="SIPEDI Logo" className="h-14 w-auto" />
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daftar Akun Baru
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-[2rem] border border-white/60 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl text-sm text-red-700 bg-red-50/90 border border-red-200 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Depan
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Belakang
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${
                    password.length > 0 && !isPasswordValid
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Buat kata sandi yang kuat"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
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
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${
                    confirmPassword.length > 0 && !isConfirmMatch
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi Anda"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showConfirmPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" strokeWidth={2} />
                {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} SIPEDI GovTech. Dilindungi sistem keamanan terenkripsi.</p>
        </div>
      </div>
    </div>
  );
};
