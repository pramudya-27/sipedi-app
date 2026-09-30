import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import type { User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert,
  Calendar,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const currentUser = useAuthStore(state => state.user);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'CITIZEN' | 'ADMIN' | 'OFFICER', userName: string) => {
    if (!confirm(`Ubah peran untuk "${userName}" menjadi "${newRole}"?`)) {
      return;
    }

    setUpdatingId(userId);
    setError('');
    setSuccessMsg('');

    try {
      await userService.updateUserRole(userId, newRole);
      setSuccessMsg(`Peran untuk ${userName} berhasil diubah menjadi ${newRole}!`);
      // Update state lokal
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mengubah peran pengguna.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Admin
          </span>
        );
      case 'OFFICER':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
            Petugas Lapangan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            Masyarakat
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Manajemen Pengguna & Peran</h2>
          </div>
          <p className="text-gray-600 mt-1 text-sm">
            Sebagai Admin, Anda dapat mengangkat atau mengubah peran pengguna menjadi Admin, Petugas, atau Masyarakat.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-xs font-medium border border-primary-100">
          <Sparkles className="h-4 w-4" />
          <span>Total Pengguna: <strong>{users.length}</strong></span>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Controls & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Filter Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            <option value="ALL">Semua Peran</option>
            <option value="ADMIN">Admin</option>
            <option value="OFFICER">Petugas Lapangan</option>
            <option value="CITIZEN">Masyarakat</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mb-3" />
            <p>Memuat daftar pengguna...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="font-medium">Tidak ada pengguna yang sesuai.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Peran Saat Ini
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Terdaftar
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Atur Peran
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  const dateStr = user.created_at || user.createdAt;
                  const formattedDate = dateStr 
                    ? format(new Date(dateStr), 'dd MMM yyyy', { locale: id })
                    : '-';

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                              {user.name}
                              {isCurrent && (
                                <span className="text-[10px] bg-primary-100 text-primary-700 font-bold px-1.5 py-0.5 rounded">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 sm:hidden">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {formattedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            disabled={updatingId === user.id}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as any, user.name)}
                            className="text-xs font-medium border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                          >
                            <option value="CITIZEN">Masyarakat (CITIZEN)</option>
                            <option value="OFFICER">Petugas (OFFICER)</option>
                            <option value="ADMIN">Admin (ADMIN)</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
