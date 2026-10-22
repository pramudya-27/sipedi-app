import React, { useState, useEffect } from 'react';
import { auditLogService } from '../../services/auditLogService';
import type { AuditLogItem } from '../../services/auditLogService';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  History,
  RotateCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  
  // Filter Tanggal
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Fetch data audit logs dari backend MySQL
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditLogService.getLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Gagal mengambil audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter Logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      (log.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = moduleFilter === 'All' || log.module.toUpperCase() === moduleFilter.toUpperCase();
    
    // Filter rentang tanggal
    const logDate = log.created_at ? log.created_at.split(' ')[0] : '';
    const matchesStartDate = !startDate || logDate >= startDate;
    const matchesEndDate = !endDate || logDate <= endDate;

    return matchesSearch && matchesModule && matchesStartDate && matchesEndDate;
  });

  // Calculate Pagination
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, moduleFilter, startDate, endDate, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs (Rekam Jejak Sistem)</h2>
          <p className="text-gray-500 text-sm mt-1">Catatan aktivitas real-time dan keamanan operasional SIPEDI.</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RotateCw size={14} className={loading ? 'animate-spin text-blue-600' : 'text-gray-500'} />
          Refresh Data
        </button>
      </div>

      {/* Control Bar & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari Nama User / Action / Reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['All', 'PERMITS', 'COMPLAINTS', 'AUTH', 'USERS'].map((mod) => (
              <button
                key={mod}
                onClick={() => setModuleFilter(mod)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  moduleFilter === mod
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {mod === 'All' ? 'Semua Modul' : mod}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="font-semibold text-gray-700">Filter Tanggal:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 focus:outline-none focus:border-blue-500"
            />
            <span>s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-blue-600 hover:underline font-semibold ml-auto md:ml-0"
            >
              Reset Tanggal
            </button>
          )}
        </div>
      </div>

      {/* Tabel Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-sm">Memuat rekam jejak sistem dari database...</p>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <History className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-sm">Tidak ada rekam jejak yang ditemukan.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Waktu & User</th>
                    <th className="px-6 py-3.5 text-left">Role</th>
                    <th className="px-6 py-3.5 text-left">Aksi & Modul</th>
                    <th className="px-6 py-3.5 text-left">Referensi</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{log.user_name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar size={12} /> {log.created_at}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                          log.role === 'OFFICER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs font-bold text-gray-800">{log.action}</p>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase">{log.module}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {log.reference}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {log.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> SUCCESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle size={12} /> FAILED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span>Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value={5}>5 baris</option>
                  <option value={10}>10 baris</option>
                  <option value={25}>25 baris</option>
                  <option value={50}>50 baris</option>
                </select>
                <span>
                  Menampilkan <strong className="text-gray-900">{totalItems > 0 ? startIndex + 1 : 0}</strong> - <strong className="text-gray-900">{Math.min(startIndex + itemsPerPage, totalItems)}</strong> dari <strong className="text-gray-900">{totalItems}</strong> log
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-3 font-semibold text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};