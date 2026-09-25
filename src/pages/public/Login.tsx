import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../store/authStore';
import logo from '../../assets/logo.png';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('CITIZEN');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login
    login({
      id: 'usr-1',
      name: role === 'ADMIN' ? 'Admin Pusat' : role === 'OFFICER' ? 'Petugas Budi' : 'Andi Pratama',
      email: email || 'user@example.com',
      role: role
    });

    if (role === 'CITIZEN') navigate('/citizen/dashboard');
    if (role === 'ADMIN') navigate('/admin/dashboard');
    if (role === 'OFFICER') navigate('/officer/dashboard');
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
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-primary-600">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email / NIK
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="andi@example.com / 3171..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  defaultValue="password123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Simulasi Peran (Khusus Demo)</label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={role || ''}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="CITIZEN">Masyarakat (Citizen)</option>
                <option value="ADMIN">Pemerintah (Admin)</option>
                <option value="OFFICER">Petugas Lapangan (Officer)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Masuk
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
