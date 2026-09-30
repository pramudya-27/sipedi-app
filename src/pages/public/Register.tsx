import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo1.png';
import { api } from '../../services/api';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/auth/register', { name, email, password, role: 'CITIZEN' });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
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
          Daftar Akun Baru
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sudah punya akun? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Masuk di sini</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-300 sm:px-10 border-t-8 border-[#0b3c5d]">
          {error && <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 border border-red-200">{error}</div>}
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700">Nama Lengkap</label>
              <div className="mt-1">
                <input id="name" type="text" required value={name} onChange={e => setName(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d] bg-gray-50 text-base" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700">Email</label>
              <div className="mt-1">
                <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d] bg-gray-50 text-base" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">Password</label>
              <div className="mt-1">
                <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d] bg-gray-50 text-base" />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border-2 border-[#0b3c5d] rounded-none text-base font-bold text-white bg-[#0b3c5d] hover:bg-[#082a42] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b3c5d] disabled:opacity-50 transition-colors">
                {loading ? 'Mendaftar...' : 'Daftar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
