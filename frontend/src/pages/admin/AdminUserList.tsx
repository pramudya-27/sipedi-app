import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Sparkles,
  AlertTriangle,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const getProfilePictureUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://localhost:8000${url.startsWith("/") ? "" : "/"}${url}`;
};

interface PendingRoleChange {
  userId: string;
  userName: string;
  newRole: 'CITIZEN' | 'ADMIN' | 'OFFICER';
}

interface PendingDelete {
  userId: string;
  userName: string;
}

export const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Paginasi State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal & Toast State
  const [pendingChange, setPendingChange] = useState<PendingRoleChange | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const currentUser = useAuthStore(state => state.user);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Fetch users error:', err);
      setToast({
        message: err.response?.data?.detail || 'Gagal memuat daftar pengguna dari server.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter Data
  const filteredUsers = users.filter(user => {
    const userName = user.name || (user as any).full_name || '';
    const userEmail = user.email || '';
    const matchesSearch = 
      userName.toLowerCase().includes(search.toLowerCase()) ||
      userEmail.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Hitung Paginasi
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectRole = (userId: string, newRole: 'CITIZEN' | 'ADMIN' | 'OFFICER', userName: string) => {
    setPendingChange({ userId, userName, newRole });
  };

  const confirmRoleChange = async () => {
    if (!pendingChange) return;

    const { userId, userName, newRole } = pendingChange;
    setUpdatingId(userId);
    setPendingChange(null);

    try {
      await userService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setToast({
        message: `Peran untuk ${userName} berhasil diperbarui menjadi ${newRole}!`,
        type: 'success'
      });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.detail || 'Gagal mengubah peran pengguna.',
        type: 'error'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!pendingDelete) return;

    const { userId, userName } = pendingDelete;
    setUpdatingId(userId);
    setPendingDelete(null);

    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setToast({
        message: `Pengguna ${userName} berhasil dihapus!`,
        type: 'success'
      });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.detail || 'Gagal menghapus pengguna.',
        type: 'error'
      });
    } finally {
      setUpdatingId(null);
    }
  };

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
    <div className="space-y-6 relative">
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

      {/* Controls & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Filter Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
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
          <>
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
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedUsers.map((user) => {
                    const isCurrent = currentUser?.id === user.id;
                    const displayName = user.name || (user as any).full_name || 'Pengguna';
                    const dateStr = user.created_at || (user as any).createdAt;
                    
                    let formattedDate = '-';
                    if (dateStr) {
                      try {
                        formattedDate = format(new Date(dateStr), 'dd MMM yyyy', { locale: id });
                      } catch {
                        formattedDate = String(dateStr).split('T')[0] || '-';
                      }
                    }

                    return (
                      <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {user.profile_picture ? (
                              <img
                                src={getProfilePictureUrl(user.profile_picture)}
                                alt={displayName}
                                className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm border border-primary-200/50 shrink-0">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                                {displayName}
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
                          {user.email || '-'}
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
                              onChange={(e) => handleSelectRole(user.id, e.target.value as any, displayName)}
                              className="text-xs font-medium border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 cursor-pointer"
                            >
                              <option value="CITIZEN">Masyarakat (CITIZEN)</option>
                              <option value="OFFICER">Petugas (OFFICER)</option>
                              <option value="ADMIN">Admin (ADMIN)</option>
                            </select>

                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => setPendingDelete({ userId: user.id, userName: displayName })}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginasi Controls */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <span>
                Menampilkan <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</strong> dari <strong>{filteredUsers.length}</strong> pengguna
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* POP-UP MODAL UBAH PERAN  */}
      {pendingChange && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl transform transition-all scale-100">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ubah Peran Pengguna?</h3>
            
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Apakah Anda yakin ingin mengubah peran <strong className="text-gray-800">{pendingChange.userName}</strong> menjadi <strong className="text-primary-600">{pendingChange.newRole}</strong>?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPendingChange(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmRoleChange}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm shadow-md transition-colors"
              >
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* POP-UP MODAL HAPUS PENGGUNA  */}
      {pendingDelete && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl transform transition-all scale-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Pengguna?</h3>
            
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Pengguna <strong className="text-gray-800">{pendingDelete.userName}</strong> akan dihapus permanen dari sistem.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-md transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* TOAST NOTIFIKASI MENGAMBANG (via Portal) */}
      {toast && createPortal(
        <div className="fixed bottom-6 right-6 z-[99999] animate-bounce-in">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg border text-white text-sm font-medium ${
            toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-red-600 border-red-500'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-80 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};