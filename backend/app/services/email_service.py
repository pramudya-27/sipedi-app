import os
import json
import base64
import logging
import urllib.request
import urllib.error
from datetime import datetime
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.payment import EmailLog

logger = logging.getLogger(__name__)

def log_email(email_type: str, recipient_email: str, recipient_name: str, subject: str, reference_id: str, status: str, error_message: str = None, db = None):
    """Mencatat aktivitas pengiriman email ke tabel email_logs."""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    try:
        log_entry = EmailLog(
            email_type=email_type,
            recipient_email=recipient_email,
            recipient_name=recipient_name or "-",
            subject=subject,
            reference_id=reference_id or "-",
            status=status,
            error_message=error_message
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        logger.error(f"Gagal mencatat log email: {e}")
    finally:
        if should_close:
            db.close()

def send_brevo_email(
    recipient_email: str,
    recipient_name: str,
    subject: str,
    html_content: str,
    email_type: str,
    reference_id: str = None,
    attachments: list = None,
    db = None
) -> bool:
    """
    Mengirim email transaksional melalui Brevo API v3.
    Mendukung lampiran file (PDF dsb) via base64.
    """
    clean_email = recipient_email.strip() if recipient_email else ""
    if not clean_email or "@" not in clean_email:
        logger.warning(f"Email tidak valid: {recipient_email}")
        log_email(email_type, clean_email, recipient_name, subject, reference_id, "FAILED", "Email tidak valid", db)
        return False

    # Jika API key belum diisi, cetak ke console (Dev fallback)
    if not settings.BREVO_API_KEY or settings.BREVO_API_KEY.strip() == "":
        print("\n" + "="*70)
        print(f" [BREVO EMAIL DEV MODE - API KEY NOT SET] Tipo: {email_type}")
        print(f" Recipient : {recipient_name} <{clean_email}>")
        print(f" Subject   : {subject}")
        print(f" Reference : {reference_id}")
        if attachments:
            print(f" Attachments: {[a.get('name') for a in attachments]}")
        print("="*70 + "\n")
        log_email(email_type, clean_email, recipient_name, subject, reference_id, "SENT", "Dev mode simulated", db)
        return True

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": settings.BREVO_API_KEY.strip(),
        "Content-Type": "application/json",
        "accept": "application/json"
    }

    payload = {
        "sender": {
            "name": settings.BREVO_SENDER_NAME,
            "email": settings.BREVO_SENDER_EMAIL
        },
        "to": [
            {
                "email": clean_email,
                "name": recipient_name if recipient_name else "Pengguna SIPEDI"
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }

    if attachments and len(attachments) > 0:
        payload["attachment"] = attachments

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=20) as response:
            if response.status in [200, 201, 202]:
                logger.info(f"Email ({email_type}) berhasil dikirim ke {clean_email}")
                log_email(email_type, clean_email, recipient_name, subject, reference_id, "SENT", None, db)
                return True
            else:
                err_msg = f"Brevo returned status {response.status}"
                logger.error(err_msg)
                log_email(email_type, clean_email, recipient_name, subject, reference_id, "FAILED", err_msg, db)
                return False
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="ignore")
        print(f"\n[BREVO SEND ERROR] Status {e.code}: {error_body}\n")
        logger.error(f"Gagal mengirim email via Brevo ({e.code}): {error_body}")
        log_email(email_type, clean_email, recipient_name, subject, reference_id, "FAILED", f"HTTP {e.code}: {error_body}", db)
        return False
    except Exception as e:
        logger.error(f"Error tidak terduga kirim email Brevo: {str(e)}")
        log_email(email_type, clean_email, recipient_name, subject, reference_id, "FAILED", str(e), db)
        return False

# ==========================================
# 1. EMAIL A — PENGAJUAN DITERIMA
# ==========================================
def send_permit_submitted_email(permit, db=None) -> bool:
    permit_num = getattr(permit, 'permit_number', f"PRM-{permit.id}")
    app_name = getattr(permit, 'applicant_name', 'Pemohon')
    email = getattr(permit, 'email', '')
    biz_name = getattr(permit, 'business_name', '-')
    permit_type = getattr(permit, 'type', 'Izin Layanan Usaha')
    duration = getattr(permit, 'duration_months', 1)
    tracking_url = f"{settings.FRONTEND_URL}/track/{permit_num}"

    subject = f"Pengajuan Perizinan SIPEDI Diterima — {permit_num}"

    html = f"""
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }}
            .header {{ background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 24px; text-align: center; color: #ffffff; }}
            .content {{ padding: 32px 28px; }}
            .badge {{ display: inline-block; background-color: #eff6ff; color: #1d4ed8; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 12px; }}
            .card {{ background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }}
            .btn {{ display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; margin-top: 15px; }}
            .footer {{ background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin:0; font-size: 22px;">SIPEDI LAYANAN PUBLIK</h1>
                <p style="margin:6px 0 0; font-size: 13px; opacity: 0.9;">Sistem Informasi Perizinan & Ketertiban Digital</p>
            </div>
            <div class="content">
                <span class="badge">STATUS: MENUNGGU VERIFIKASI PETUGAS</span>
                <h2 style="font-size: 18px; margin: 16px 0 8px; color: #0f172a;">Halo, {app_name}</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                    Permohonan perizinan Anda telah berhasil kami terima dalam sistem SIPEDI. Berkas Anda saat ini berada dalam tahap pemeriksaan administratif dan verifikasi teknis oleh tim dinas terkait.
                </p>
                <div class="card">
                    <table style="width: 100%; font-size: 13px; line-height: 1.8;">
                        <tr><td style="color: #64748b; width: 40%;">Nomor Pengajuan</td><td style="font-weight: 700; color: #1e3a8a;">: {permit_num}</td></tr>
                        <tr><td style="color: #64748b;">Nama Usaha</td><td style="font-weight: 600;">: {biz_name}</td></tr>
                        <tr><td style="color: #64748b;">Jenis Izin</td><td>: {permit_type}</td></tr>
                        <tr><td style="color: #64748b;">Durasi Diminta</td><td>: {duration} Bulan</td></tr>
                        <tr><td style="color: #64748b;">Tanggal Masuk</td><td>: {datetime.now().strftime("%d %B %Y, %H:%M WIB")}</td></tr>
                    </table>
                </div>
                <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
                    Anda dapat melacak progres verifikasi secara real-time kapan saja melalui tautan pelacakan resmi di bawah ini:
                </p>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{tracking_url}" target="_blank" class="btn">Lacak Status Perizinan</a>
                </div>
            </div>
            <div class="footer">
                &copy; 2026 SIPEDI — Pelayanan Terpadu Satu Pintu Pemerintah Indonesia.<br/>
                Pesan ini dibuat secara otomatis oleh sistem, mohon tidak membalas email ini.
            </div>
        </div>
    </body>
    </html>
    """

    return send_brevo_email(
        recipient_email=email,
        recipient_name=app_name,
        subject=subject,
        html_content=html,
        email_type="SUBMISSION_RECEIVED",
        reference_id=permit_num,
        attachments=None,
        db=db
    )

# ==========================================
# 2. EMAIL B — PERIZINAN DISETUJUI (+ PDF)
# ==========================================
def send_permit_approved_email(permit, pdf_bytes: bytes, db=None) -> bool:
    permit_num = getattr(permit, 'permit_number', f"PRM-{permit.id}")
    app_name = getattr(permit, 'applicant_name', '') or (permit.applicant.name if hasattr(permit, 'applicant') and permit.applicant else 'Pemohon')
    email = getattr(permit, 'email', '') or (permit.applicant.email if hasattr(permit, 'applicant') and permit.applicant else '')
    biz_name = getattr(permit, 'business_name', '-')
    permit_type = getattr(permit, 'type', 'Izin Layanan Usaha')
    duration = getattr(permit, 'duration_months', 1)
    
    start_dt = getattr(permit, 'start_date', None) or datetime.utcnow()
    exp_dt = getattr(permit, 'expired_at', None) or datetime.utcnow()
    start_str = start_dt.strftime("%d %B %Y")
    exp_str = exp_dt.strftime("%d %B %Y")

    tracking_url = f"{settings.FRONTEND_URL}/track/{permit_num}"
    subject = f"Surat Perizinan SIPEDI Telah Diterbitkan — {permit_num}"

    # Lampiran file PDF
    attachments = []
    if pdf_bytes:
        b64_content = base64.b64encode(pdf_bytes).decode('utf-8')
        attachments.append({
            "name": f"SURAT_IZIN_RESMI_{permit_num}.pdf",
            "content": b64_content
        })

    html = f"""
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }}
            .header {{ background: linear-gradient(135deg, #15803d 0%, #16a34a 100%); padding: 32px 24px; text-align: center; color: #ffffff; }}
            .content {{ padding: 32px 28px; }}
            .badge {{ display: inline-block; background-color: #f0fdf4; color: #166534; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 12px; }}
            .card {{ background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }}
            .btn {{ display: inline-block; background-color: #16a34a; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; margin-top: 15px; }}
            .footer {{ background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin:0; font-size: 22px;">SIPEDI LAYANAN PUBLIK</h1>
                <p style="margin:6px 0 0; font-size: 13px; opacity: 0.9;">Surat Ketetapan Perizinan Resmi Diterbitkan</p>
            </div>
            <div class="content">
                <span class="badge">STATUS: RESMI DISETUJUI & AKTIF</span>
                <h2 style="font-size: 18px; margin: 16px 0 8px; color: #0f172a;">Selamat, {app_name}!</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                    Permohonan perizinan Anda telah <b>disetujui</b> oleh Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu. Dokumen <b>Surat Izin Resmi (PDF)</b> telah diterbitkan dan terlampir pada email ini.
                </p>
                <div class="card">
                    <table style="width: 100%; font-size: 13px; line-height: 1.8;">
                        <tr><td style="color: #64748b; width: 42%;">Nomor Dokumen Izin</td><td style="font-weight: 700; color: #15803d;">: {permit_num}</td></tr>
                        <tr><td style="color: #64748b;">Nama Usaha</td><td style="font-weight: 600;">: {biz_name}</td></tr>
                        <tr><td style="color: #64748b;">Jenis Izin</td><td>: {permit_type}</td></tr>
                        <tr><td style="color: #64748b;">Durasi Disetujui</td><td>: <b>{duration} Bulan</b></td></tr>
                        <tr><td style="color: #64748b;">Mulai Berlaku</td><td>: {start_str}</td></tr>
                        <tr><td style="color: #64748b;">Berlaku Sampai</td><td style="font-weight: 700; color: #b91c1c;">: {exp_str}</td></tr>
                    </table>
                </div>
                <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                    Dokumen PDF terlampir telah dilengkapi QR Code verifikasi keaslian digital yang dapat dipindai oleh pihak berwenang kapan pun.
                </p>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{tracking_url}" target="_blank" class="btn">Buka Halaman Pelacakan Izin</a>
                </div>
            </div>
            <div class="footer">
                &copy; 2026 SIPEDI — Pelayanan Terpadu Satu Pintu Pemerintah Indonesia.<br/>
                Simpan dokumen surat izin terlampir dengan baik sebagai bukti legalitas usaha Anda.
            </div>
        </div>
    </body>
    </html>
    """

    return send_brevo_email(
        recipient_email=email,
        recipient_name=app_name,
        subject=subject,
        html_content=html,
        email_type="PERMIT_APPROVED",
        reference_id=permit_num,
        attachments=attachments,
        db=db
    )

# ==========================================
# 3. EMAIL C — TAGIHAN PERPANJANGAN (+ INVOICE)
# ==========================================
def send_renewal_invoice_email(invoice, permit, pdf_bytes: bytes = None, db=None) -> bool:
    inv_num = getattr(invoice, 'invoice_number', f"INV-{invoice.id}")
    permit_num = getattr(permit, 'permit_number', f"PRM-{permit.id}")
    app_name = getattr(permit, 'applicant_name', 'Pemohon')
    email = getattr(permit, 'email', '')
    biz_name = getattr(permit, 'business_name', '-')
    
    total_amt = float(getattr(invoice, 'total_amount', 100000) or 100000)
    due_dt = getattr(invoice, 'due_date', None) or datetime.utcnow()
    due_str = due_dt.strftime("%d %B %Y, %H:%M WIB")

    snap_url = getattr(invoice, 'snap_redirect_url', None)
    pay_url = snap_url if snap_url else f"{settings.FRONTEND_URL}/pay/{inv_num}"
    subject = f"Tagihan Perpanjangan Perizinan SIPEDI — {inv_num}"

    attachments = []
    if pdf_bytes:
        b64_content = base64.b64encode(pdf_bytes).decode('utf-8')
        attachments.append({
            "name": f"TAGIHAN_{inv_num}.pdf",
            "content": b64_content
        })

    html = f"""
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }}
            .header {{ background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }}
            .content {{ padding: 32px 28px; }}
            .badge {{ display: inline-block; background-color: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 12px; }}
            .card {{ background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }}
            .btn {{ display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 13px 32px; border-radius: 10px; margin-top: 15px; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }}
            .footer {{ background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin:0; font-size: 22px;">SIPEDI LAYANAN PUBLIK</h1>
                <p style="margin:6px 0 0; font-size: 13px; opacity: 0.9;">Tagihan Resmi Perpanjangan Perizinan Usaha</p>
            </div>
            <div class="content">
                <span class="badge">STATUS: MENUNGGU PEMBAYARAN QRIS</span>
                <h2 style="font-size: 18px; margin: 16px 0 8px; color: #0f172a;">Halo, {app_name}</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                    Permohonan perpanjangan izin untuk usaha <b>{biz_name}</b> ({permit_num}) telah diproses oleh petugas admin SIPEDI. Berikut adalah rincian tagihan retribusi perpanjangan izin:
                </p>
                <div class="card">
                    <table style="width: 100%; font-size: 13px; line-height: 1.8;">
                        <tr><td style="color: #64748b; width: 42%;">Nomor Tagihan</td><td style="font-weight: 700; color: #d97706;">: {inv_num}</td></tr>
                        <tr><td style="color: #64748b;">ID Perizinan</td><td style="font-weight: 600;">: {permit_num}</td></tr>
                        <tr><td style="color: #64748b;">Iuran Kebersihan</td><td>: Rp50.000</td></tr>
                        <tr><td style="color: #64748b;">Iuran Ketertiban & Keamanan</td><td>: Rp50.000</td></tr>
                        <tr style="border-top: 1px solid #cbd5e1;"><td style="font-weight: 700; color: #0f172a; padding-top: 8px;">Total Pembayaran</td><td style="font-weight: 800; color: #2563eb; font-size: 15px; padding-top: 8px;">: Rp{total_amt:,.0f}</td></tr>
                        <tr><td style="color: #64748b;">Batas Waktu Pembayaran</td><td style="color: #b91c1c; font-weight: 600;">: {due_str}</td></tr>
                    </table>
                </div>
                <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                    <i>Penting:</i> Masa berlaku izin terbaru hanya akan diterbitkan dan aktif secara hukum setelah pembayaran terverifikasi secara sah oleh payment gateway QRIS.
                </p>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{pay_url}" target="_blank" class="btn">Bayar Sekarang via QRIS</a>
                </div>
            </div>
            <div class="footer">
                &copy; 2026 SIPEDI — Pelayanan Terpadu Satu Pintu Pemerintah Indonesia.<br/>
                Lampiran invoice resmi format PDF telah disertakan pada email ini.
            </div>
        </div>
    </body>
    </html>
    """

    return send_brevo_email(
        recipient_email=email,
        recipient_name=app_name,
        subject=subject,
        html_content=html,
        email_type="RENEWAL_INVOICE",
        reference_id=inv_num,
        attachments=attachments,
        db=db
    )

# ==========================================
# 4. EMAIL D — PEMBAYARAN BERHASIL & DIPERPANJANG (+ SURAT BARU)
# ==========================================
def send_renewal_success_email(invoice, permit, pdf_bytes: bytes, db=None) -> bool:
    inv_num = getattr(invoice, 'invoice_number', f"INV-{invoice.id}")
    permit_num = getattr(permit, 'permit_number', f"PRM-{permit.id}")
    app_name = getattr(permit, 'applicant_name', 'Pemohon')
    email = getattr(permit, 'email', '')
    biz_name = getattr(permit, 'business_name', '-')
    
    total_amt = float(getattr(invoice, 'total_amount', 100000) or 100000)
    duration = getattr(permit, 'duration_months', 1)
    
    start_dt = getattr(permit, 'start_date', None) or datetime.utcnow()
    exp_dt = getattr(permit, 'expired_at', None) or datetime.utcnow()
    start_str = start_dt.strftime("%d %B %Y")
    exp_str = exp_dt.strftime("%d %B %Y")
    pay_time_str = datetime.now().strftime("%d %B %Y, %H:%M WIB")

    tracking_url = f"{settings.FRONTEND_URL}/track/{permit_num}"
    subject = f"Pembayaran Berhasil — Perizinan SIPEDI Diperpanjang — {permit_num}"

    attachments = []
    if pdf_bytes:
        b64_content = base64.b64encode(pdf_bytes).decode('utf-8')
        version = getattr(permit, 'active_version', 2) or 2
        attachments.append({
            "name": f"SURAT_IZIN_TERBARU_{permit_num}_v{version}.pdf",
            "content": b64_content
        })

    html = f"""
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }}
            .header {{ background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; color: #ffffff; }}
            .content {{ padding: 32px 28px; }}
            .badge {{ display: inline-block; background-color: #ecfdf5; color: #065f46; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 12px; }}
            .card {{ background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }}
            .btn {{ display: inline-block; background-color: #059669; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; margin-top: 15px; }}
            .footer {{ background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin:0; font-size: 22px;">SIPEDI LAYANAN PUBLIK</h1>
                <p style="margin:6px 0 0; font-size: 13px; opacity: 0.9;">Konfirmasi Pembayaran Lunas & Perpanjangan Izin</p>
            </div>
            <div class="content">
                <span class="badge">STATUS: LUNAS & MASA BERLAKU BERHASIL DIPERPANJANG</span>
                <h2 style="font-size: 18px; margin: 16px 0 8px; color: #0f172a;">Terima Kasih, {app_name}!</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                    Pembayaran tagihan perpanjangan izin Anda untuk usaha <b>{biz_name}</b> telah berhasil diverifikasi oleh sistem. Masa berlaku izin Anda telah otomatis diperpanjang dan <b>Surat Izin Versi Terbaru (PDF)</b> telah terbit terlampir.
                </p>
                <div class="card">
                    <table style="width: 100%; font-size: 13px; line-height: 1.8;">
                        <tr><td style="color: #64748b; width: 42%;">Nomor Dokumen Izin</td><td style="font-weight: 700; color: #059669;">: {permit_num}</td></tr>
                        <tr><td style="color: #64748b;">Nomor Transaksi/Invoice</td><td>: {inv_num}</td></tr>
                        <tr><td style="color: #64748b;">Jumlah Dibayar</td><td style="font-weight: 700; color: #2563eb;">: Rp{total_amt:,.0f} (LUNAS)</td></tr>
                        <tr><td style="color: #64748b;">Waktu Pembayaran</td><td>: {pay_time_str}</td></tr>
                        <tr><td style="color: #64748b;">Durasi Perpanjangan</td><td>: <b>+{duration} Bulan</b></td></tr>
                        <tr><td style="color: #64748b;">Masa Berlaku Baru Mulai</td><td>: {start_str}</td></tr>
                        <tr><td style="color: #64748b;">Masa Berlaku Baru Sampai</td><td style="font-weight: 800; color: #166534; font-size: 14px;">: {exp_str}</td></tr>
                    </table>
                </div>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{tracking_url}" target="_blank" class="btn">Lihat Dokumen di Portal SIPEDI</a>
                </div>
            </div>
            <div class="footer">
                &copy; 2026 SIPEDI — Pelayanan Terpadu Satu Pintu Pemerintah Indonesia.<br/>
                Surat izin versi terbaru (PDF) terlampir dan sudah aktif untuk kegiatan usaha Anda.
            </div>
        </div>
    </body>
    </html>
    """

    return send_brevo_email(
        recipient_email=email,
        recipient_name=app_name,
        subject=subject,
        html_content=html,
        email_type="PAYMENT_SUCCESS_RENEWED",
        reference_id=permit_num,
        attachments=attachments,
        db=db
    )

# ==========================================
# 5. EMAIL PASSWORD RESET (Eksisting)
# ==========================================
def build_reset_email_html(recipient_name: str, reset_url: str) -> str:
    name_display = recipient_name if recipient_name else "Warga / Pemohon"
    expire_minutes = settings.RESET_TOKEN_EXPIRE_MINUTES
    return f"""
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <title>Permintaan Reset Password SIPEDI</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
            .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }}
            .header {{ background-color: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }}
            .content {{ padding: 36px 32px; }}
            .btn {{ display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; }}
            .footer {{ background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin:0; font-size:22px;">SIPEDI</h1>
                <p style="margin:6px 0 0; color:#94a3b8; font-size:13px;">Sistem Informasi Perizinan & Pengaduan Digital</p>
            </div>
            <div class="content">
                <h3 style="margin-top:0;">Halo, {name_display}</h3>
                <p style="font-size:14px; line-height:1.6; color:#475569;">
                    Kami menerima permintaan untuk mengatur ulang kata sandi (password) akun SIPEDI Anda. Klik tombol di bawah ini:
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="{reset_url}" target="_blank" class="btn">Atur Ulang Kata Sandi</a>
                </div>
                <p style="font-size:12px; color:#64748b;">Tautan ini hanya berlaku selama {expire_minutes} menit.</p>
            </div>
            <div class="footer">&copy; 2026 SIPEDI — Pelayanan Publik Republik Indonesia.</div>
        </div>
    </body>
    </html>
    """

def send_password_reset_email(email: str, name: str, reset_url: str) -> bool:
    subject = "Atur Ulang Kata Sandi Akun SIPEDI"
    html = build_reset_email_html(name, reset_url)
    return send_brevo_email(
        recipient_email=email,
        recipient_name=name,
        subject=subject,
        html_content=html,
        email_type="PASSWORD_RESET",
        reference_id="RESET",
        attachments=None
    )

# ==========================================
# 5. EMAIL E — PENGADUAN SELESAI DITINDAKLANJUTI
# ==========================================
def send_complaint_resolved_email(complaint, db=None) -> bool:
    """
    Mengirimkan notifikasi email transaksional kepada pelapor/pengguna saat
    pengaduan telah selesai ditindaklanjuti ('Selesai').
    """
    comp_num = getattr(complaint, 'complaint_number', f"CMP-{getattr(complaint, 'id', '')[:8]}")
    category = getattr(complaint, 'category', 'Pengaduan Layanan Publik')
    location = getattr(complaint, 'location', '-')
    description = getattr(complaint, 'description', '-')
    admin_note = getattr(complaint, 'admin_note', None)
    
    # Deteksi nama pelapor
    reporter_name = getattr(complaint, 'reporter_name', None)
    if not reporter_name and hasattr(complaint, 'reporter') and complaint.reporter:
        reporter_name = getattr(complaint.reporter, 'name', None)
    if not reporter_name or reporter_name in ["Anonim", "Masyarakat"]:
        reporter_name = "Warga Pelapor SIPEDI"

    # Deteksi email pelapor
    recipient_email = getattr(complaint, 'email', None)
    if not recipient_email and hasattr(complaint, 'reporter') and complaint.reporter:
        recipient_email = getattr(complaint.reporter, 'email', None)
    if not recipient_email and getattr(complaint, 'reporter_id', None):
        try:
            from app.models.user import User
            if db:
                user = db.query(User).filter(User.id == complaint.reporter_id).first()
                if user and user.email:
                    recipient_email = user.email
            else:
                db_temp = SessionLocal()
                user = db_temp.query(User).filter(User.id == complaint.reporter_id).first()
                if user and user.email:
                    recipient_email = user.email
                db_temp.close()
        except Exception as e:
            logger.error(f"Error lookup reporter user for complaint {comp_num}: {e}")

    if not recipient_email or "@" not in str(recipient_email):
        logger.warning(f"Tidak dapat mengirim email penyelesaian pengaduan {comp_num}: email tidak valid / kosong ({recipient_email}).")
        return False

    comp_date = getattr(complaint, 'date', None) or datetime.utcnow()
    date_str = comp_date.strftime("%d %B %Y, %H:%M WIB")
    resolved_date_str = datetime.now().strftime("%d %B %Y, %H:%M WIB")

    portal_url = f"{settings.FRONTEND_URL}/complaints"
    subject = f"Laporan Pengaduan Selesai Ditindaklanjuti — {comp_num}"

    note_section = ""
    if admin_note and str(admin_note).strip():
        note_section = f"""
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin: 18px 0;">
            <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase;">Catatan Tindak Lanjut Petugas:</p>
            <p style="margin: 0; font-size: 13px; color: #14532d; line-height: 1.6;">{admin_note}</p>
        </div>
        """

    html = f"""
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }}
            .header {{ background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; color: #ffffff; }}
            .content {{ padding: 32px 28px; }}
            .badge {{ display: inline-block; background-color: #ecfdf5; color: #065f46; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 12px; border: 1px solid #a7f3d0; }}
            .card {{ background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }}
            .btn {{ display: inline-block; background-color: #059669; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; margin-top: 15px; box-shadow: 0 4px 12px rgba(5,150,105,0.25); }}
            .footer {{ background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin:0; font-size: 22px;">SIPEDI LAYANAN PUBLIK</h1>
                <p style="margin:6px 0 0; font-size: 13px; opacity: 0.95;">Layanan Pengaduan & Ketertiban Masyarakat Terpadu</p>
            </div>
            <div class="content">
                <span class="badge">STATUS: LAPORAN BERHASIL DISELESAIKAN</span>
                <h2 style="font-size: 18px; margin: 16px 0 8px; color: #0f172a;">Halo, {reporter_name}</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                    Kami menginformasikan bahwa laporan pengaduan Anda yang diajukan melalui portal <b>SIPEDI</b> telah <b>berhasil ditindaklanjuti dan diselesaikan</b> oleh petugas dinas berwenang.
                </p>
                <div class="card">
                    <table style="width: 100%; font-size: 13px; line-height: 1.8;">
                        <tr><td style="color: #64748b; width: 40%;">Nomor Laporan</td><td style="font-weight: 700; color: #059669;">: {comp_num}</td></tr>
                        <tr><td style="color: #64748b;">Kategori Pengaduan</td><td style="font-weight: 600;">: {category}</td></tr>
                        <tr><td style="color: #64748b;">Lokasi Kejadian</td><td>: {location}</td></tr>
                        <tr><td style="color: #64748b;">Rincian Masalah</td><td>: {description[:120] + ('...' if len(description) > 120 else '')}</td></tr>
                        <tr><td style="color: #64748b;">Tanggal Masuk</td><td>: {date_str}</td></tr>
                        <tr><td style="color: #64748b;">Tanggal Selesai</td><td style="font-weight: 700; color: #166534;">: {resolved_date_str}</td></tr>
                        <tr><td style="color: #64748b;">Status Akhir</td><td>: <b style="color: #059669;">Selesai Ditindaklanjuti</b></td></tr>
                    </table>
                </div>
                {note_section}
                <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
                    Terima kasih atas partisipasi aktif dan kepedulian Anda dalam membantu kami menciptakan ketertiban, kebersihan, dan kenyamanan lingkungan bersama.
                </p>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{portal_url}" target="_blank" class="btn">Buka Portal Pengaduan</a>
                </div>
            </div>
            <div class="footer">
                &copy; 2026 SIPEDI — Pelayanan Terpadu Satu Pintu Pemerintah Indonesia.<br/>
                Pesan ini dikirim secara otomatis oleh sistem sebagai konfirmasi resmi penyelesaian laporan.
            </div>
        </div>
    </body>
    </html>
    """

    return send_brevo_email(
        recipient_email=str(recipient_email).strip(),
        recipient_name=reporter_name,
        subject=subject,
        html_content=html,
        email_type="COMPLAINT_RESOLVED",
        reference_id=comp_num,
        attachments=None,
        db=db
    )
