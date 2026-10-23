import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore'; 
import { api } from '../../services/api'; 
import logoImg from '../../assets/logo1.png';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, logout } = useAuthStore();

  useEffect(() => {
    document.title = 'Masuk Portal Admin — SIPEDI';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. endpoint auth/login
      const response = await api.post('/auth/login', {
        email: email,
        password: password,
      });

      const { access_token, user, token } = response.data;
      const realToken = access_token || token;
      const userRoleUpper = user?.role?.toUpperCase();

      // 2. hanya ADMIN yang bisa lewat
      if (userRoleUpper !== 'ADMIN' && userRoleUpper !== 'ADMINISTRATOR') {
        setError('Akses ditolak. Akun Anda bukan Administrator.');
        setIsLoading(false);
        return;
      }

      // 3. Hapus total session lama 
      logout();
      localStorage.removeItem('token');

      // 4. Simpan Token JWT ke localStorage & Store Auth
      localStorage.setItem('token', realToken);
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
      });

      // 5. Navigate langsung ke Dashboard Admin
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login Error:', err);

      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Email atau password salah, atau server backend tidak terjangkau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Kembali ke Portal Admin
        </Link>
      </div>

      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl p-2 border border-slate-100 flex items-center justify-center mx-auto shadow-sm overflow-hidden">
            <img 
              src={logoImg} 
              alt="Logo SIPEDI" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Masuk Portal Admin
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Silakan masuk menggunakan akun administrator terverifikasi.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start space-x-3 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
              Alamat Email / Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sipedi.go.id"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg hover:shadow-blue-500/25 transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk Portal Admin</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            SIPEDI &copy; {new Date().getFullYear()} — Akses terbatas hanya untuk petugas berwenang.
          </p>
        </div>
      </div>
    </div>
  );
};