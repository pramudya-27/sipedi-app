import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/logo1.png';
import { api } from '../../services/api';
import { LogIn, AlertCircle, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture
      });

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Email atau password salah. Silakan periksa kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background Waves */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-70"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 1000"
        >
          <defs>
            <linearGradient id="waveLoginGrad1" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="waveLoginGrad2" x1="100%" y1="20%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          <path
            d="M0,50 C280,180 520,30 820,120 C1120,210 1280,80 1440,150 L1440,0 L0,0 Z"
            fill="url(#waveLoginGrad1)"
          />
          <path
            d="M0,100 C320,200 580,70 880,160 C1160,250 1320,120 1440,180 L1440,0 L0,0 Z"
            fill="url(#waveLoginGrad2)"
          />
        </svg>

        <div className="absolute top-1/4 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-blue-300/30 to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-300/20 via-sky-200/10 to-transparent rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 group bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/50">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" strokeWidth={1.75} />
          Kembali ke Beranda
        </Link>
        <div className="flex justify-center">
          <img src={logo} alt="SIPEDI Logo" className="h-16 w-auto drop-shadow-sm" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
          Portal Masuk SIPEDI
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Belum memiliki akun?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Daftar sekarang
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

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Kata Sandi
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Lupa Sandi?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi Anda"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <LogIn className="w-4 h-4" strokeWidth={2} />
                {loading ? 'Memproses Masuk...' : 'Masuk ke Akun'}
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
