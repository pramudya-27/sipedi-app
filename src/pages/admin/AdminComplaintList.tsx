import React, { useState } from 'react';
import { useComplaints } from '../../hooks/useComplaints';
import { complaintService } from '../../services/complaintService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Check, Clock, AlertTriangle } from 'lucide-react';

export const AdminComplaintList: React.FC = () => {
  const { data: complaints, isLoading, refetch } = useComplaints();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleUpdateStatus = async (complaintId: string, newStatus: string) => {
    if (!confirm('Ubah status pengaduan menjadi ' + newStatus + '?')) return;
    setProcessingId(complaintId);
    try {
      await complaintService.updateStatus(complaintId, newStatus, 'High');
      alert('Status pengaduan berhasil diubah menjadi ' + newStatus + '.');
      if (refetch) refetch();
    } catch (error) {
      alert('Gagal mengubah status pengaduan.');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Manajemen Pengaduan (Admin)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Pengaduan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints?.map((comp) => (
                <tr key={comp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comp.complaintNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comp.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comp.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={comp.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {comp.status !== 'Selesai' && comp.status !== 'Ditolak' ? (
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleUpdateStatus(comp.id, 'Diproses')}
                          disabled={processingId === comp.id}
                          className="text-white bg-warning-600 hover:bg-warning-700 px-3 py-1 rounded-md flex items-center text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" /> Proses
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(comp.id, 'Selesai')}
                          disabled={processingId === comp.id}
                          className="text-white bg-success-600 hover:bg-success-700 px-3 py-1 rounded-md flex items-center text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" /> Selesai
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
