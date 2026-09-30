# SIPEDI - FastAPI Backend

This is the FastAPI backend for **SIPEDI** (Sistem Perizinan Digital Mikro dan Layanan Pengaduan Ketertiban Berbasis Asisten AI).

## Setup Instructions

1. Ensure **MySQL** is running via Laragon on `127.0.0.1:3306`.
2. Create the database: `CREATE DATABASE sipedi_db;`
3. Set up the Python virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```
4. Run Database Migrations:
   ```bash
   alembic upgrade head
   ```
5. Seed Dummy Data:
   ```bash
   python seed.py
   ```
6. Run the Backend Server:
   ```bash
   python main.py
   ```
   *(Or using uvicorn directly: `uvicorn app.main:app --reload --port 8000`)*

## Dummy Accounts (For Demo)

You can use the "Simulasi Peran" dropdown on the Login page or use these credentials:

- **Admin Pusat**: `admin@sipedi.go.id` / `admin123`
- **Petugas Lapangan**: `petugas@sipedi.go.id` / `petugas123`
- **Masyarakat (Citizen)**: `andi@gmail.com` / `warga123`

## Features Implemented

- **JWT Authentication** (Login/Register)
- **Role-based Access Control** (Admin, Officer, Citizen)
- **Digital Permit Filing & Approval** (Generates a Mock Digital Permit Document valid for 3 months)
- **Public Complaint Lodging & Tracking**
- **File Uploads** (Locally saved to `backend/uploads/`)
- **Automated Mock Email Notification**: When Admin approves a permit, the system prints a mock email in the terminal with a simulated PDF/TXT attachment containing the 3-month valid permit.

## Limitations / Rules Followed

- Database: MySQL via `sipedi_db`
- Email & Cloud Storage: Mocked / Local files due to competition constraints preventing real SMTP/AWS services.
- ORM: SQLAlchemy 2.x standard synchronous with `pymysql`.
