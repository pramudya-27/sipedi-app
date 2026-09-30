import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { permitService } from '../../services/permitService';
import { FileText, Upload } from 'lucide-react';

export const CreatePermit: React.FC = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('Izin Usaha Mikro');
  const [businessName, setBusinessName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('business_name', businessName);
      if (file) {
        formData.append('documents', file);
      }
      
      await permitService.createPermit(formData);
      alert('Pengajuan berhasil! Anda akan dihubungi lebih lanjut.');
      navigate('/');
    } catch (error) {
      console.error('Failed to create permit:', error);
      alert('Gagal mengajukan izin. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-12 px-4 sm:px-6">
      <div className="bg-[#0b3c5d] p-8 border-b-8 border-[#328cc1] text-white">
        <h2 className="text-3xl font-bold flex items-center mb-2">
          <FileText className="mr-3 h-8 w-8 text-white" />
          Ajukan Izin Baru
        </h2>
        <p className="text-gray-200 text-lg">Isi formulir di bawah ini untuk mengajukan perizinan digital secara mandiri.</p>
      </div>

      <div className="bg-white border border-gray-300 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Jenis Perizinan</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d] bg-gray-50 rounded-none border"
            >
              <option value="Izin Usaha Mikro">Izin Usaha Mikro (IUMK)</option>
              <option value="Izin Reklame">Izin Reklame</option>
              <option value="Izin Keramaian">Izin Keramaian</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Nama Usaha / Kegiatan</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-400 rounded-none focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d] bg-gray-50 text-base"
              placeholder="Contoh: Kedai Kopi Maju Jaya"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">Dokumen Persyaratan (KTP/NPWP)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="space-y-2 text-center">
                <Upload className="mx-auto h-12 w-12 text-[#0b3c5d]" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent font-bold text-[#0b3c5d] hover:text-[#328cc1] focus-within:outline-none underline">
                    <span>Pilih file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                  <p className="pl-1">atau seret ke sini</p>
                </div>
                <p className="text-sm text-gray-500">Format PDF, JPG, PNG (Maks 5MB)</p>
                {file && <p className="text-sm font-bold text-green-700 mt-2">File Terpilih: {file.name}</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-white py-3 px-6 border-2 border-gray-400 text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center py-3 px-8 border-2 border-[#0b3c5d] text-base font-bold text-white bg-[#0b3c5d] hover:bg-[#082a42] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b3c5d] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
