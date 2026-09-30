import React, { useState } from 'react';
import { usePermits } from '../../hooks/usePermits';
import { permitService } from '../../services/permitService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Check, X } from 'lucide-react';

export const AdminPermitList: React.FC = () => {
  const { data: permits, isLoading, refetch } = usePermits();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (permitId: string) => {
    if (!confirm('Setujui izin ini dan kirim dokumen digital ke pemohon?')) return;
    setProcessingId(permitId);
    try {
      await permitService.updateStatus(permitId, 'Approved');
      alert('Izin disetujui! Dokumen digital (berlaku 3 bulan) telah dikirim ke email pemohon.');
      if (refetch) refetch();
    } catch (error) {
      alert('Gagal menyetujui izin.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (permitId: string) => {
    if (!confirm('Tolak izin ini?')) return;
    setProcessingId(permitId);
    try {
      await permitService.updateStatus(permitId, 'Rejected');
      alert('Izin ditolak.');
      if (refetch) refetch();
    } catch (error) {
      alert('Gagal menolak izin.');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Manajemen Perizinan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Izin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Izin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Usaha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permits?.map((permit) => (
                <tr key={permit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{permit.permitNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permit.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permit.businessName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={permit.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {permit.status === 'Submitted' || permit.status === 'Under Verification' ? (
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleApprove(permit.id)}
                          disabled={processingId === permit.id}
                          className="text-white bg-success-600 hover:bg-success-700 px-3 py-1 rounded-md flex items-center text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" /> Setujui
                        </button>
                        <button 
                          onClick={() => handleReject(permit.id)}
                          disabled={processingId === permit.id}
                          className="text-white bg-danger-600 hover:bg-danger-700 px-3 py-1 rounded-md flex items-center text-xs"
                        >
                          <X className="h-3 w-3 mr-1" /> Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Selesai</span>
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
