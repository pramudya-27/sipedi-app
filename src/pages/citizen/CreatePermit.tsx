import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { permitService } from '../../services/permitService';
import { useAuthStore } from '../../store/authStore';
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Building2, 
  User, 
  AlertCircle 
} from 'lucide-react';

export const CreatePermit: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    nik: '',
    phone: '',
    email: user?.email || '',
    address: '',
    permitType: 'Izin Usaha Mikro (IUMK)',
    businessName: '',
    businessSector: 'Kuliner & Makanan Minuman',
    businessAddress: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file melebihi batas 5MB.');
        return;
      }
      setErrorMsg('');
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setErrorMsg('Harap setujui pernyataan keabsahan data sebelum mengirim.');
      return;
    }
    if (formData.nik.length !== 16) {
      setErrorMsg('NIK harus terdiri dari 16 digit angka sesuai KTP.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('type', formData.permitType);
      data.append('business_name', formData.businessName);
      data.append('full_name', formData.fullName);
      data.append('applicant_name', formData.fullName);
      data.append('nik', formData.nik);
      data.append('phone', formData.phone);
      data.append('email', formData.email);
      data.append('address', formData.address);
      data.append('business_sector', formData.businessSector);
      data.append('business_address', formData.businessAddress);

      if (file) {
        data.append('documents', file);
      }

      await permitService.createPermit(data);
      alert('Pengajuan izin berhasil dikirim! Silakan pantau status permohonan Anda secara berkala.');
      navigate('/');
    } catch (error) {
      console.error('Failed to create permit:', error);
      setErrorMsg('Gagal mengajukan izin. Pastikan server aktif dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Back Navigation */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" strokeWidth={1.75} />
        Kembali ke Beranda
      </button>

      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0 shadow-sm">
          <FileText className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pengajuan Izin Usaha Digital
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Lengkapi formulir data diri dan informasi legalitas usaha Anda untuk penerbitan surat izin resmi.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {errorMsg && (
          <div className="mx-6 sm:mx-10 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" strokeWidth={1.75} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
          {/* Section 1: Data Diri Pemohon */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-100">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
                  Data Diri Pemohon
                </h2>
                <p className="text-xs text-slate-500">
                  Data identitas pemohon sesuai KTP elektronik yang masih berlaku
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  NIK (16 Digit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nik"
                  required
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, nik: val }));
                  }}
                  placeholder="3171xxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nomor WhatsApp / HP Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="budi@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Alamat Lengkap Domisili (KTP) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Informasi Usaha */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-100">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
                  Informasi Usaha & Perizinan
                </h2>
                <p className="text-xs text-slate-500">
                  Rincian kategori perizinan serta profil tempat usaha yang didaftarkan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Jenis Perizinan <span className="text-red-500">*</span>
                </label>
                <select
                  name="permitType"
                  value={formData.permitType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                >
                  <option value="Izin Usaha Mikro (IUMK)">Izin Usaha Mikro (IUMK)</option>
                  <option value="Surat Keterangan Usaha (SKU)">Surat Keterangan Usaha (SKU)</option>
                  <option value="Izin Reklame & Spanduk">Izin Reklame & Pemasangan Spanduk</option>
                  <option value="Izin Keramaian / Kegiatan">Izin Keramaian / Penyelenggaraan Kegiatan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Usaha / Merek Dagang <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  required
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Contoh: Kedai Kopi Makmur Jaya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Bidang / Sektor Usaha <span className="text-red-500">*</span>
                </label>
                <select
                  name="businessSector"
                  value={formData.businessSector}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                >
                  <option value="Kuliner & Makanan Minuman">Kuliner & Makanan Minuman (F&B)</option>
                  <option value="Perdagangan & Retail">Perdagangan, Grosir & Ritel</option>
                  <option value="Jasa & Industri Kreatif">Jasa, Servis & Industri Kreatif</option>
                  <option value="Fashion & Kerajinan">Fashion, Tekstil & Kerajinan Tangan</option>
                  <option value="Pertanian & Peternakan">Pertanian, Perkebunan & Peternakan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Alamat Tempat Usaha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessAddress"
                  required
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  placeholder="Lokasi gerai/toko atau domisili usaha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Upload Dokumen Persyaratan */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-100">
                3
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
                  Dokumen Persyaratan
                </h2>
                <p className="text-xs text-slate-500">
                  Unggah foto/scan KTP atau berkas pendukung lainnya (PDF, JPG, PNG maks 5MB)
                </p>
              </div>
            </div>

            <div>
              {!file ? (
                <label
                  htmlFor="permit-file-upload"
                  className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20 rounded-2xl cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:shadow-sm transition-all mb-3">
                    <Upload className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    <span className="text-blue-600 group-hover:underline">Pilih berkas dokumen</span> atau seret ke sini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Scan KTP, NPWP, atau Foto Tempat Usaha (PDF, JPG, PNG)
                  </p>
                  <input
                    id="permit-file-upload"
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      DOC
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Hapus berkas"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Pernyataan & Aksi */}
          <div className="pt-4 border-t border-slate-100 space-y-6">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Saya menyatakan dengan sebenar-benarnya bahwa seluruh data dan dokumen yang dilampirkan adalah sah, benar, serta dapat dipertanggungjawabkan sesuai hukum yang berlaku.
              </span>
            </label>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>Memproses...</>
                ) : (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2} />
                    Kirim Pengajuan Izin
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
