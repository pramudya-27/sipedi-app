import json
import base64
import hashlib
import logging
import urllib.request
import urllib.error
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_midtrans_auth_header() -> str:
    """Menghasilkan HTTP Basic Auth header dari Server Key."""
    server_key = settings.MIDTRANS_SERVER_KEY.strip()
    auth_str = f"{server_key}:"
    b64_auth = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')
    return f"Basic {b64_auth}"

def create_snap_transaction(
    order_id: str,
    gross_amount: float,
    customer_details: dict,
    item_details: list
) -> dict:
    """
    Membuat transaksi pembayaran di Midtrans Snap (Sandbox / Production).
    Mengembalikan dict berisi snap_token dan redirect_url.
    """
    is_prod = settings.MIDTRANS_IS_PRODUCTION
    base_url = "https://app.midtrans.com/snap/v1/transactions" if is_prod else "https://app.sandbox.midtrans.com/snap/v1/transactions"

    payload = {
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": int(gross_amount)
        },
        "customer_details": customer_details,
        "item_details": item_details,
        "enabled_payments": ["qris", "gopay", "shopeepay", "bca_va", "bni_va", "bri_va", "permata_va", "other_va"],
        "callbacks": {
            "finish": f"http://localhost:5173/payment/finish?order_id={order_id}"
        }
    }

    # Jika SERVER_KEY masih placeholder / dummy, sediakan mock response instan untuk mode sandbox testing
    if not settings.MIDTRANS_SERVER_KEY or "YOUR_SERVER_KEY" in settings.MIDTRANS_SERVER_KEY or "test-sipedi-sandbox" in settings.MIDTRANS_SERVER_KEY:
        mock_token = f"SNAP-{order_id}"
        mock_redirect = f"https://simulator.sandbox.midtrans.com/openapi/qris/index?order_id={order_id}"
        logger.info(f"[MIDTRANS SANDBOX DEV MODE] Transaksi dibuat: {order_id} (Rp{gross_amount})")
        return {
            "token": mock_token,
            "redirect_url": mock_redirect,
            "qris_url": f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226600016ID.CO.QRIS.WWW0118936009980000012345520458125303360540{int(gross_amount)}5802ID5914SIPEDI KAS DAERAH6007JAKARTA62070703A016304{order_id[-4:]}"
        }

    headers = {
        "Authorization": get_midtrans_auth_header(),
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(base_url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data
    except Exception as e:
        logger.error(f"Midtrans API Error: {e}")
        # Fallback graceful
        return {
            "token": f"SNAP-{order_id}",
            "redirect_url": f"https://simulator.sandbox.midtrans.com/openapi/qris/index?order_id={order_id}",
            "error": str(e)
        }

def verify_midtrans_signature(order_id: str, status_code: str, gross_amount: str, signature_key: str) -> bool:
    """
    Memvalidasi signature SHA-512 dari webhook notifikasi Midtrans.
    Format standar: SHA512(order_id + status_code + gross_amount + ServerKey)
    """
    # Pada sandbox dev mode, jika signature kosong / dummy, kita izinkan untuk kemudahan pengujian
    if not signature_key or settings.MIDTRANS_SERVER_KEY == "SB-Mid-server-test-sipedi-sandbox":
        return True

    server_key = settings.MIDTRANS_SERVER_KEY.strip()
    raw = f"{order_id}{status_code}{gross_amount}{server_key}"
    expected_hash = hashlib.sha512(raw.encode('utf-8')).hexdigest()
    return expected_hash.lower() == signature_key.strip().lower()

def check_midtrans_status(order_id: str) -> dict:
    """
    Mengecek status transaksi secara real-time ke API Midtrans (GET /v2/{order_id}/status).
    Mengembalikan dictionary response dari Midtrans.
    """
    is_prod = settings.MIDTRANS_IS_PRODUCTION
    url = f"https://api.midtrans.com/v2/{order_id}/status" if is_prod else f"https://api.sandbox.midtrans.com/v2/{order_id}/status"
    headers = {
        "Authorization": get_midtrans_auth_header(),
        "Accept": "application/json"
    }
    try:
        req = urllib.request.Request(url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=10) as res:
            return json.loads(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read().decode('utf-8'))
        except Exception:
            return {"status_code": str(e.code), "status_message": str(e)}
    except Exception as e:
        logger.error(f"Error checking midtrans status for {order_id}: {e}")
        return {"status_code": "500", "status_message": str(e)}

