import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {complaintService} from "../../services/complaintService";
import {useAuthStore} from "../../store/authStore";
import {
  ArrowLeft,
  ShieldAlert,
  Upload,
  Trash2,
  Check,
  User,
  MapPin,
  FileText,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export const CreateComplaint: React.FC = () => {
  const navigate = useNavigate();
  const {user} = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    nik: "",
    phone: "",
    email: user?.email || "",
    address: "",
    category: "Fasilitas Umum",
    title: "",
    location: "",
    incidentDate: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setErrorMsg("Ukuran file melebihi batas 5MB.");
        return;
      }
      setErrorMsg("");
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setErrorMsg(
        "Harap setujui pernyataan pertanggungjawaban sebelum mengirim aduan.",
      );
      return;
    }
    if (formData.nik.length !== 16) {
      setErrorMsg("NIK harus terdiri dari 16 digit angka sesuai KTP.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const data = new FormData();
      data.append("category", formData.category);
      data.append("title", formData.title || formData.category);
      data.append("location", formData.location);
      data.append("description", formData.description);
      data.append("full_name", formData.fullName);
      data.append("reporter_name", formData.fullName);
      data.append("nik", formData.nik);
      data.append("phone", formData.phone);
      data.append("email", formData.email);
      data.append("address", formData.address);
      data.append("incident_date", formData.incidentDate);

      if (file) {
        data.append("evidences", file);
      }

      await complaintService.createComplaint(data);
      alert(
        "Pengaduan berhasil dikirim! Tim pengawas akan segera memverifikasi dan menindaklanjuti.",
      );
      navigate("/");
    } catch (error) {
      console.error("Failed to create complaint:", error);
      setErrorMsg(
        "Gagal mengirim pengaduan. Pastikan server aktif dan periksa koneksi Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Back Navigation */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft
          className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1"
          strokeWidth={1.75}
        />
        Kembali ke Beranda
      </button>

      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0 shadow-sm">
          <ShieldAlert className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Layanan Pengaduan & Ketertiban
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Laporkan kerusakan infrastruktur publik, gangguan ketertiban, atau
            keluhan pelayanan secara langsung.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {errorMsg && (
          <div className="mx-6 sm:mx-10 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle
              className="w-5 h-5 shrink-0 mt-0.5 text-red-500"
              strokeWidth={1.75}
            />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
          {/* Section 1: Data Diri Pelapor */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center border border-rose-100">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-600" strokeWidth={1.75} />
                  Data Diri Pelapor
                </h2>
                <p className="text-xs text-slate-500">
                  Identitas pelapor dijaga kerahasiaannya dan hanya untuk
                  kebutuhan verifikasi petugas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Lengkap (Sesuai KTP){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Contoh: Siti Rahmawati"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all placeholder:text-slate-400"
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
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData((prev) => ({...prev, nik: val}));
                  }}
                  placeholder="3201xxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nomor WhatsApp / HP Aktif{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="081298765432"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all placeholder:text-slate-400"
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
                  placeholder="siti@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Alamat Domisili Pelapor{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Alamat tempat tinggal pelapor saat ini"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Rincian Pengaduan */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center border border-rose-100">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin
                    className="w-4 h-4 text-rose-600"
                    strokeWidth={1.75}
                  />
                  Rincian & Lokasi Pengaduan
                </h2>
                <p className="text-xs text-slate-500">
                  Uraikan kronologi, tempat, dan jenis gangguan yang dialami
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Kategori Pengaduan <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all"
                >
                  <option value="Fasilitas Umum">
                    Fasilitas Umum (Jalan rusak, lampu padam, drainase)
                  </option>
                  <option value="Ketertiban Lingkungan">
                    Ketertiban Lingkungan (Kebisingan, limbah liar)
                  </option>
                  <option value="Parkir Liar & Kemacetan">
                    Parkir Liar & Hambatan Lalu Lintas
                  </option>
                  <option value="Pungutan Liar">
                    Pungutan Liar (Pungli) & Gratifikasi
                  </option>
                  <option value="Pelanggaran Perizinan Usaha">
                    Pelanggaran Ketertiban Tempat Usaha
                  </option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tanggal Kejadian <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="incidentDate"
                  required
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Lokasi Kejadian Spesifik{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Contoh: Jl. Ahmad Yani No. 12, depan Halte Busway Sukajadi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Deskripsi Masalah / Gangguan{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Jelaskan secara rinci kronologi kejadian, waktu kemunculan masalah, dan dampak yang dirasakan oleh warga sekitar..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Upload Bukti Pendukung */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center border border-rose-100">
                3
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck
                    className="w-4 h-4 text-rose-600"
                    strokeWidth={1.75}
                  />
                  Foto Bukti Kejadian
                </h2>
                <p className="text-xs text-slate-500">
                  Lampirkan foto tempat kejadian atau dokumen penunjang untuk
                  mempercepat verifikasi
                </p>
              </div>
            </div>

            <div>
              {!file ? (
                <label
                  htmlFor="complaint-file-upload"
                  className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-slate-200 hover:border-rose-500 bg-slate-50/60 hover:bg-rose-50/20 rounded-2xl cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-rose-600 group-hover:border-rose-200 group-hover:shadow-sm transition-all mb-3">
                    <Upload className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    <span className="text-rose-600 group-hover:underline">
                      Unggah foto bukti
                    </span>{" "}
                    atau seret ke sini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Format JPG, JPEG, PNG, atau PDF (Maksimal 5MB)
                  </p>
                  <input
                    id="complaint-file-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl border border-rose-200 bg-rose-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                      BUKTI
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
                className="w-4 h-4 mt-0.5 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Saya menyatakan bahwa laporan pengaduan ini dibuat dengan
                sebenar-benarnya tanpa unsur rekayasa, fitnah, atau kepentingan
                merugikan pihak lain secara tidak sah.
              </span>
            </label>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>Mengirim Aduan...</>
                ) : (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2} />
                    Kirim Pengaduan
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
