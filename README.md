# SIPEDI Backend Service (FastAPI)

Branch ini dikhususkan untuk implementasi REST API Backend dari platform **SIPEDI** menggunakan FastAPI & Python.

## Arsitektur & Endpoint yang Disiapkan

Layanan backend ini dirancang untuk melayani integrasi dengan Frontend SIPEDI:

1. **Authentication & Authorization**:
   - `POST /api/auth/login`
   - `POST /api/auth/register`
   - `GET /api/auth/me`

2. **Perizinan Mikro (Permits)**:
   - `GET /api/permits` (Filter berdasarkan status, pemohon)
   - `POST /api/permits` (Pengajuan izin mikro baru)
   - `GET /api/permits/{id}` (Detail izin & visual timeline)
   - `PATCH /api/permits/{id}/status` (Verifikasi, Revisi, Persetujuan oleh Admin)

3. **Pengaduan Ketertiban & Pungli (Complaints)**:
   - `GET /api/complaints` (Daftar pengaduan warga)
   - `POST /api/complaints` (Pelaporan baru)
   - `GET /api/complaints/{id}` (Detail kronologi, barang bukti, audit trail)
   - `POST /api/complaints/{id}/assign` (Penugasan ke Petugas Lapangan)
   - `PATCH /api/complaints/{id}/status` (Update status penanganan)

4. **AI Assistant & Rekomendasi**:
   - `POST /api/ai/chat` (Konsultasi perizinan dan klasifikasi aduan)
   - `POST /api/ai/classify-complaint` (Analisis awal kategori aduan)

5. **Petugas Lapangan (Officer)**:
   - `GET /api/officer/tasks` (Daftar tugas penanganan aktif)
   - `PATCH /api/officer/tasks/{id}` (Update progres lapangan & catatan)

## Persyaratan Lingkungan (Environment Requirements)

- Python 3.10+
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy / SQLModel / Tortoise ORM

## Menjalankan Layanan (Development)

```bash
# Aktifkan virtual environment
source .venv/bin/activate  # Linux / macOS
# atau
.venv\Scripts\activate     # Windows

# Install dependensi
pip install -r requirements.txt

# Jalankan server
uvicorn main:app --reload --port 8000
```
