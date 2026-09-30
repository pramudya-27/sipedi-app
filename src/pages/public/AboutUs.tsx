import React from "react";
import {Link} from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  Bot,
  Award,
  FileCheck2,
} from "lucide-react";

export const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-10 font-sans">
      {/* Hero Header */}
      <section className="bg-[#333366] text-white py-16 border-b-4 border-[#e71921]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Tentang SIPEDI
          </h1>
          <p className="max-w-3xl text-lg md:text-xl text-gray-100 leading-relaxed font-light">
            Sistem Perizinan Digital Mikro dan Layanan Pengaduan Ketertiban —
            solusi digital terpadu untuk memajukan pelaku usaha mikro dan menjaga ketertiban ruang publik di Indonesia.
          </p>
        </div>
      </section>

      {/* Profil Singkat & Visi Misi */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Transformasi Layanan Publik</h2>
            <div className="text-gray-800">
              <p className="mb-4 text-lg">
                SIPEDI hadir sebagai respon terhadap tantangan birokrasi perizinan usaha mikro dan penanganan ketertiban lingkungan yang sering kali lambat, terfragmentasi, dan minim transparansi.
              </p>
              <p className="mb-8 text-lg">
                Dengan mengadopsi arsitektur digital modern dan otomatisasi, SIPEDI memastikan setiap permohonan izin UMKM diproses cepat dan setiap laporan warga tertangani secara akuntabel.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 border-t border-gray-200 pt-8">
              <div>
                <div className="text-4xl font-extrabold text-[#333366] mb-1">3 Menit</div>
                <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Pengajuan Izin Mandiri</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-[#333366] mb-1">100%</div>
                <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Transparan & Terpantau</div>
              </div>
            </div>
          </div>

          <div className="space-y-8 bg-gray-50 p-8 border border-gray-200">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Building2 className="h-7 w-7 text-[#333366]" />
                <h3 className="text-2xl font-bold text-gray-900">Visi Utama</h3>
              </div>
              <p className="text-gray-800 text-lg leading-relaxed">
                Mewujudkan ekosistem pelayanan publik yang inklusif, cepat, bebas pungutan liar, dan berbasis kecerdasan buatan demi pertumbuhan ekonomi kerakyatan berskala nasional.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="h-7 w-7 text-[#333366]" />
                <h3 className="text-2xl font-bold text-gray-900">Misi Inovasi</h3>
              </div>
              <ul className="text-gray-800 text-lg space-y-3 list-disc list-inside">
                <li>Menyederhanakan regulasi dan proses perizinan usaha mikro.</li>
                <li>Menyediakan kanal pengaduan ketertiban lingkungan yang transparan.</li>
                <li>Memberikan panduan regulasi publik yang terintegrasi.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pilar Utama Layanan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Pilar Utama SIPEDI</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-l-4 border-[#333366] pl-6 py-2">
            <FileCheck2 className="h-8 w-8 text-[#333366] mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Perizinan Mikro Digital</h3>
            <p className="text-gray-800 leading-relaxed mb-4">
              Pengajuan surat izin usaha mikro (IUMK) dan izin reklame secara paperless dengan penerbitan dokumen digital bertanda tangan resmi.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside font-medium">
              <li>Bebas antrean fisik</li>
              <li>Sertifikat izin digital sah</li>
            </ul>
          </div>

          <div className="border-l-4 border-[#333366] pl-6 py-2">
            <ShieldCheck className="h-8 w-8 text-[#333366] mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Pengaduan Ketertiban</h3>
            <p className="text-gray-800 leading-relaxed mb-4">
              Masyarakat dapat melaporkan gangguan fasilitas umum, parkir liar, atau pelanggaran ketertiban dengan bukti foto serta pemantauan tindak lanjut.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside font-medium">
              <li>Pelacakan status real-time</li>
              <li>Penugasan langsung ke petugas</li>
            </ul>
          </div>

          <div className="border-l-4 border-[#333366] pl-6 py-2">
            <Bot className="h-8 w-8 text-[#333366] mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Layanan Informasi Terpadu</h3>
            <p className="text-gray-800 leading-relaxed mb-4">
              Sistem interaktif yang membantu warga memahami syarat izin dan prosedur hukum secara instan tanpa harus datang ke kantor dinas.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside font-medium">
              <li>Akses panduan 24/7</li>
              <li>Instruksi langkah demi langkah</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Nilai Layanan Publik */}
      <section className="bg-gray-50 py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Standar Integritas & Pelayanan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 border border-gray-300">
              <h3 className="font-bold text-xl text-[#333366] mb-3 border-b-2 border-[#e71921] pb-2">Transparan</h3>
              <p className="text-sm text-gray-800 leading-relaxed">Setiap status dokumen dapat dipantau tanpa perantara maupun biaya tersembunyi.</p>
            </div>
            <div className="bg-white p-6 border border-gray-300">
              <h3 className="font-bold text-xl text-[#333366] mb-3 border-b-2 border-[#e71921] pb-2">Akuntabel</h3>
              <p className="text-sm text-gray-800 leading-relaxed">Seluruh proses tercatat dalam log sistem resmi yang diaudit secara berkala.</p>
            </div>
            <div className="bg-white p-6 border border-gray-300">
              <h3 className="font-bold text-xl text-[#333366] mb-3 border-b-2 border-[#e71921] pb-2">Inklusif</h3>
              <p className="text-sm text-gray-800 leading-relaxed">Akses mudah dan ramah pengguna bagi seluruh lapisan masyarakat Indonesia.</p>
            </div>
            <div className="bg-white p-6 border border-gray-300">
              <h3 className="font-bold text-xl text-[#333366] mb-3 border-b-2 border-[#e71921] pb-2">Efisien</h3>
              <p className="text-sm text-gray-800 leading-relaxed">Birokrasi dipersingkat melalui integrasi teknologi yang efektif.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#333366] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between border-l-8 border-[#e71921]">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">Siap Mengurus Izin atau Melaporkan Gangguan?</h3>
            <p className="text-gray-200 text-lg">Daftar sekarang dan nikmati kemudahan pelayanan publik digital secara mandiri.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              to="/register"
              className="bg-white hover:bg-gray-100 text-[#333366] font-bold px-8 py-3 text-center border-2 border-white transition-colors"
            >
              Daftar Akun
            </Link>
            <Link
              to="/login"
              className="bg-transparent hover:bg-white/10 text-white font-bold px-8 py-3 text-center border-2 border-white transition-colors"
            >
              Masuk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
