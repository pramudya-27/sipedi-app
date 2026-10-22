import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: realData, isLoading, isError } = useDashboardData();
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Memuat data riil dari database MySQL...
      </div>
    );
  }

  if (isError || !realData) {
    return (
      <div className="p-6 text-center text-rose-700 bg-rose-50/90 rounded-2xl border border-rose-200 shadow-sm flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <div>
          <h3 className="font-extrabold text-base">Gagal Terhubung ke Backend</h3>
          <p className="text-xs text-rose-600 mt-1">
            Gagal terhubung ke database MySQL. Pastikan server backend FastAPI dan MySQL berjalan.
          </p>
        </div>
      </div>
    );
  }

  // Fallback data default aman jika salah satu properti bernilai undefined/null
  const stats = realData.stats || {
    totalPermits: 0,
    pendingPermits: 0,
    newComplaints: 0,
    resolvedComplaints: 0,
    resolutionRate: '0%'
  };

  const recentActivities = realData.recentActivities || [];
  const monthlyTrends = realData.monthlyTrends || [];
  const categoryDistribution = realData.categoryDistribution || [];

  const maxTrendVal = Math.max(
    ...monthlyTrends.map(t => Math.max(t.pengaduan || 0, t.perizinan || 0)), 
    10
  );

  const maxCategoryVal = Math.max(
    ...categoryDistribution.map(c => c.count || 0), 
    10
  );

  const svgWidth = 500;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 20;

  const getX = (index: number) => 
    monthlyTrends.length > 1 
      ? paddingX + (index * (svgWidth - 2 * paddingX)) / (monthlyTrends.length - 1)
      : svgWidth / 2;

  const getY = (val: number) => svgHeight - paddingY - ((val || 0) / maxTrendVal) * (svgHeight - 2 * paddingY);

  const buildSmoothPath = (key: 'pengaduan' | 'perizinan') => {
    if (!monthlyTrends || monthlyTrends.length === 0) return '';
    const points = monthlyTrends.map((d, i) => ({ x: getX(i), y: getY(d[key] || 0) }));
    return points.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      const cp1x = a[i - 1].x + (point.x - a[i - 1].x) / 2;
      const cp1y = a[i - 1].y;
      const cp2x = a[i - 1].x + (point.x - a[i - 1].x) / 2;
      const cp2y = point.y;
      return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
    }, '');
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Ringkasan operasional dan statistik layanan SIPEDI Pusat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live MySQL Data
          </span>
        </div>
      </div>

      {/* Grid Status Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Perizinan</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{(stats.totalPermits || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Verifikasi</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.pendingPermits || 0}</span>
            <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg">
              Perlu Tindakan
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengaduan Baru</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.newComplaints || 0}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengaduan Selesai</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.resolvedComplaints || 0}</span>
            <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
              {stats.resolutionRate || '0%'} Rate
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between relative">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">Tren Layanan Bulanan</h2>
            <span className="text-xs text-slate-400 font-medium">Data Realtime</span>
          </div>

          <div className="relative my-4">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 overflow-visible">
              {[0, Math.round(maxTrendVal * 0.25), Math.round(maxTrendVal * 0.5), Math.round(maxTrendVal * 0.75), maxTrendVal].map((val) => (
                <g key={val}>
                  <line 
                    x1={paddingX} 
                    y1={getY(val)} 
                    x2={svgWidth - paddingX} 
                    y2={getY(val)} 
                    stroke="#f1f5f9" 
                    strokeDasharray="4 4" 
                  />
                  <text x={10} y={getY(val) + 4} fill="#94a3b8" fontSize="10" className="font-sans">
                    {val}
                  </text>
                </g>
              ))}

              <path d={buildSmoothPath('pengaduan')} fill="none" stroke="#ef4444" strokeWidth="2.5" />
              <path d={buildSmoothPath('perizinan')} fill="none" stroke="#3b82f6" strokeWidth="2.5" />

              {monthlyTrends.map((d, i) => {
                const x = getX(i);
                const yRed = getY(d.pengaduan || 0);
                const yBlue = getY(d.perizinan || 0);
                const isHovered = hoveredMonth === i;

                return (
                  <g key={i} onMouseEnter={() => setHoveredMonth(i)} className="cursor-pointer">
                    {isHovered && (
                      <line x1={x} y1={paddingY} x2={x} y2={svgHeight - paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
                    )}
                    <circle cx={x} cy={yRed} r={isHovered ? 5 : 3.5} fill="#ffffff" stroke="#ef4444" strokeWidth="2.5" />
                    <circle cx={x} cy={yBlue} r={isHovered ? 5 : 3.5} fill="#ffffff" stroke="#3b82f6" strokeWidth="2.5" />
                    <text x={x} y={svgHeight - 2} textAnchor="middle" fill="#94a3b8" fontSize="10" className="font-sans font-bold">
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredMonth !== null && monthlyTrends[hoveredMonth] && (
              <div 
                className="absolute bg-white border border-slate-200 shadow-md rounded-xl p-3 text-xs z-10 pointer-events-none transition-all duration-150"
                style={{ 
                  left: `${(hoveredMonth / (monthlyTrends.length - 1)) * 70 + 15}%`,
                  top: '30%'
                }}
              >
                <p className="font-bold text-slate-800 mb-1">{monthlyTrends[hoveredMonth].month}</p>
                <p className="text-rose-500 font-semibold">Pengaduan : {monthlyTrends[hoveredMonth].pengaduan || 0}</p>
                <p className="text-blue-600 font-semibold">Perizinan : {monthlyTrends[hoveredMonth].perizinan || 0}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
              <span className="w-3 h-3 rounded-full bg-rose-500" /> Pengaduan
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <span className="w-3 h-3 rounded-full bg-blue-600" /> Perizinan
            </div>
          </div>
        </div>

        {/* Vertical Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">Kategori Pengaduan Terbanyak</h2>
            <span className="text-xs text-slate-400 font-medium">Data Realtime</span>
          </div>

          <div className="h-60 pt-6 pb-6 border-b border-slate-100 flex items-end justify-between gap-3 px-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10">
              {[maxCategoryVal, Math.round(maxCategoryVal * 0.75), Math.round(maxCategoryVal * 0.5), Math.round(maxCategoryVal * 0.25), 0].map((val) => (
                <div key={val} className="w-full flex items-center">
                  <span className="text-[10px] text-slate-400 w-6">{val}</span>
                  <div className="w-full border-b border-dashed border-slate-100 ml-2" />
                </div>
              ))}
            </div>

            {categoryDistribution.length === 0 ? (
              <div className="w-full text-center text-slate-400 text-xs py-10 z-10">Belum ada data pengaduan</div>
            ) : (
              categoryDistribution.map((cat, idx) => (
                <div key={idx} className="relative z-10 flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div 
                    style={{ height: `${((cat.count || 0) / maxCategoryVal) * 100}%` }} 
                    className="w-full bg-blue-500 rounded-lg transition-all duration-300 hover:bg-blue-600"
                    title={`${cat.category}: ${cat.count || 0}`}
                  />
                  <span className="text-[10px] font-bold text-slate-600 truncate max-w-[65px] block text-center mt-1">
                    {cat.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Tabel Aktivitas Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Aktivitas Terbaru</h2>
            <p className="text-xs text-slate-400 font-medium">Transaksi perizinan riil terbaru dari MySQL.</p>
          </div>
          <button
            onClick={() => navigate('/admin/permits')}
            className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors gap-1 cursor-pointer"
          >
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">Belum ada transaksi perizinan yang terdaftar di database MySQL.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
                  <th className="py-3.5 px-5">Pengguna</th>
                  <th className="py-3.5 px-5">Aktivitas / Layanan</th>
                  <th className="py-3.5 px-5">No. Referensi</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900">{act.userName}</td>
                    <td className="py-4 px-5 font-semibold text-slate-800">{act.activity}</td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                        {act.referenceNo}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        act.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        act.status === 'Submitted' ? 'bg-amber-100 text-amber-800' :
                        act.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-400">{act.timeAgo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};