import json
import logging
import urllib.request
import urllib.error
from app.core.config import settings

logger = logging.getLogger(__name__)

def build_reset_email_html(recipient_name: str, reset_url: str) -> str:
    name_display = recipient_name if recipient_name else "Warga / Pemohon"
    expire_minutes = settings.RESET_TOKEN_EXPIRE_MINUTES
    return f"""
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Permintaan Reset Password SIPEDI</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
            .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
            .header {{ background-color: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }}
            .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }}
            .header p {{ margin: 8px 0 0 0; color: #94a3b8; font-size: 13px; }}
            .content {{ padding: 36px 32px; }}
            .greeting {{ font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }}
            .text {{ font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }}
            .btn-wrapper {{ text-align: center; margin: 32px 0; }}
            .btn {{ display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }}
            .warning {{ background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 16px; font-size: 12px; line-height: 1.5; color: #1e40af; margin-bottom: 24px; }}
            .footer {{ background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; }}
            .footer a {{ color: #2563eb; text-decoration: none; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SIPEDI</h1>
                <p>Sistem Informasi Perizinan & Pengaduan Digital</p>
            </div>
            <div class="content">
                <div class="greeting">Halo, {name_display}</div>
                <div class="text">
                    Kami menerima permintaan untuk mengatur ulang kata sandi (password) akun SIPEDI Anda. Klik tombol di bawah ini untuk melanjutkan pembuatan kata sandi baru:
                </div>
                <div class="btn-wrapper">
                    <a href="{reset_url}" target="_blank" class="btn">Atur Ulang Kata Sandi</a>
                </div>
                <div class="warning">
                    <strong>Penting:</strong> Tautan konfirmasi ini hanya berlaku selama <strong>{expire_minutes} menit</strong>. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini dan akun Anda tetap aman.
                </div>
                <div class="text" style="font-size: 12px; color: #64748b; margin-bottom: 0;">
                    Jika tombol di atas tidak dapat diklik, salin dan buka tautan berikut di peramban Anda:<br>
                    <a href="{reset_url}" style="color: #2563eb; word-break: break-all;">{reset_url}</a>
                </div>
            </div>
            <div class="footer">
                &copy; 2026 SIPEDI - Pelayanan Publik Republik Indonesia.<br>
                Email otomatis, mohon tidak membalas email ini.
            </div>
        </div>
    </body>
    </html>
    """

def send_password_reset_email(email: str, name: str, reset_url: str) -> bool:
    """
    Sends password reset email via Brevo REST API v3.
    If BREVO_API_KEY is not configured, logs the reset URL to console as developer fallback.
    """
    if not settings.BREVO_API_KEY or settings.BREVO_API_KEY.strip() == "":
        print("\n" + "="*70)
        print(" [BREVO EMAIL DEV MODE - API KEY NOT SET]")
        print(f" Recipient : {name} <{email}>")
        print(f" Reset Link: {reset_url}")
        print(" Note: Set BREVO_API_KEY in backend/.env to send real emails via Brevo.")
        print("="*70 + "\n")
        logger.warning(f"BREVO_API_KEY not configured. Password reset link for {email}: {reset_url}")
        return True

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": settings.BREVO_API_KEY,
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
                "email": email,
                "name": name if name else "Pengguna SIPEDI"
            }
        ],
        "subject": "Atur Ulang Kata Sandi Akun SIPEDI",
        "htmlContent": build_reset_email_html(name, reset_url)
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=15) as response:
            if response.status in [200, 201, 202]:
                logger.info(f"Password reset email sent successfully via Brevo to {email}")
                return True
            else:
                logger.error(f"Brevo API returned unexpected status {response.status}")
                return False
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="ignore")
        logger.error(f"Failed to send email via Brevo API ({e.code}): {error_body}")
        print(f"[BREVO ERROR] Code {e.code}: {error_body}")
        # Even if sending fails, we don't want to completely crash the flow, but log clearly
        return False
    except Exception as e:
        logger.error(f"Unexpected error while sending email via Brevo: {str(e)}")
        print(f"[BREVO EXCEPTION] {str(e)}")
        return False
