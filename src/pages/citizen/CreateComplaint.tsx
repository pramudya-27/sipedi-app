import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { ShieldAlert, Upload, ArrowLeft } from 'lucide-react';

export const CreateComplaint: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Fasilitas Umum');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('location', location);
      formData.append('description', description);
      if (file) {
        formData.append('evidences', file);
      }
      
      await complaintService.createComplaint(formData);
      alert('Pengaduan berhasil dikirim! Kami akan segera menindaklanjutinya.');
      navigate('/');
    } catch (error) {
      console.error('Failed to create complaint:', error);
      alert('Gagal mengirim pengaduan. Silakan periksa koneksi dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-12 px-4 sm:px-6">
      <div className="bg-[#0b3c5d] p-8 border-b-8 border-[#328cc1] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center mb-2">
            <ShieldAlert className="mr-3 h-8 w-8 text-white" />
            Buat Pengaduan Baru
          </h2>
          <p className="text-gray-200 text-lg">
            Laporkan gangguan ketertiban umum atau kerusakan fasilitas publik di sekitar Anda.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-white hover:text-gray-200 text-sm flex items-center gap-1 font-bold underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
      </div>

      <div className="bg-white border border-gray-300 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">
              Kategori Pengaduan
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-4 py-3 text-base border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d] bg-gray-50"
            >
              <option value="Fasilitas Umum">Fasilitas Umum (Lampu jalan, jalan rusak, taman)</option>
              <option value="Ketertiban Lingkungan">Ketertiban Lingkungan (Kebisingan, sampah liar)</option>
              <option value="Parkir Liar">Parkir Liar & Kemacetan</option>
              <option value="Pungutan Liar">Pungutan Liar (Pungli)</option>
              <option value="Pelanggaran Perizinan Usaha">Pelanggaran Perizinan Usaha</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">
              Lokasi Kejadian
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-400 rounded-none bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d]"
              placeholder="Contoh: Jl. Sudirman No. 45, depan Halte Busway"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">
              Deskripsi Gangguan / Kejadian
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-400 rounded-none bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d]"
              placeholder="Jelaskan detail pengaduan, waktu kejadian, dan dampak yang ditimbulkan secara jelas..."
            />
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-2">
              Foto Bukti Kejadian (Opsional)
            </label>
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-400 border-dashed bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="space-y-2 text-center">
                <Upload className="mx-auto h-12 w-12 text-[#0b3c5d]" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-complaint" className="relative cursor-pointer bg-transparent font-bold text-[#0b3c5d] hover:text-[#328cc1] focus-within:outline-none underline">
                    <span>Unggah foto bukti</span>
                    <input 
                      id="file-complaint" 
                      type="file" 
                      accept="image/*,.pdf" 
                      className="sr-only" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)} 
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">Format JPG, PNG, atau PDF (Maks 5MB)</p>
                {file && (
                  <p className="text-sm text-green-700 font-bold mt-2">
                    File terpilih: {file.name}
                  </p>
                )}
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
              {loading ? 'Mengirim Laporan...' : 'Kirim Pengaduan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
