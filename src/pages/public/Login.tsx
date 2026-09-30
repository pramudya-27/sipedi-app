import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/logo1.png';
import { api } from '../../services/api';
import { LogIn, AlertCircle } from 'lucide-react';

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
        role: user.role
      });

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Email atau password salah. Silakan periksa kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src={logo} alt="SIPEDI Logo" className="h-16 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Masuk ke SIPEDI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Atau <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">daftar akun baru</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-300 sm:px-10 border-t-8 border-[#0b3c5d]">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-400 rounded-none placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d] text-base bg-gray-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-400 rounded-none placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d] text-base bg-gray-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border-2 border-[#0b3c5d] rounded-none text-base font-bold text-white bg-[#0b3c5d] hover:bg-[#082a42] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b3c5d] disabled:opacity-50 transition-colors"
              >
                <LogIn className="w-5 h-5 mr-2" />
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
