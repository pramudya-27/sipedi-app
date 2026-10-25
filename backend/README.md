---
title: SIPEDI Backend API
emoji: 🏛️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# SIPEDI - FastAPI Backend API

Sistem Informasi Perizinan & Pengaduan Digital (SIPEDI) Backend Service built with **FastAPI**, **SQLAlchemy**, and **Python 3.12**.

## Hugging Face Spaces Deployment

- **SDK:** Docker
- **Default Port:** 7860
- **Direct REST API URL:** `https://<YOUR_HF_USERNAME>-<YOUR_SPACE_NAME>.hf.space/api`

### Environment Variables & Secrets (Set in HF Space Settings -> Variables and secrets):

| Variable / Secret | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Aiven MySQL Connection URL | `mysql+pymysql://avnadmin:PASSWORD@mysql-xxxx.aivencloud.com:PORT/defaultdb?ssl_ca=ca.pem` |
| `AIVEN_CA_CERT` | (Optional) Content of Aiven `ca.pem` certificate | `-----BEGIN CERTIFICATE-----...` |
| `FRONTEND_URL` | User Domain URL | `https://sipedi.id` |
| `ADMIN_FRONTEND_URL` | Admin Domain URL | `https://admin.sipedi.id` |
| `MIDTRANS_SERVER_KEY` | Midtrans Server Key | `SB-Mid-server-xxxx` |
| `MIDTRANS_CLIENT_KEY` | Midtrans Client Key | `SB-Mid-client-xxxx` |
| `MIDTRANS_IS_PRODUCTION` | Midtrans Environment | `False` |
| `BREVO_API_KEY` | Brevo API Key | `xkeysib-xxxx` |
| `BREVO_SENDER_NAME` | Brevo Sender Name | `SIPEDI Layanan Publik` |
| `BREVO_SENDER_EMAIL` | Brevo Sender Email | `notifikasi@sipedi.id` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary Cloud Name | `xxxx` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `xxxx` |
| `CLOUDINARY_API_SECRET`| Cloudinary API Secret | `xxxx` |
| `SECRET_KEY` | JWT Secret Key | `xxxx` |
