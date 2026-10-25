import sys
import os

# Tambahkan backend ke sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.core.database import engine

def run_migration():
    print("=== MEMULAI MIGRASI SISTEM PERIZINAN, PEMBAYARAN & EMAIL SIPEDI ===")
    
    with engine.connect() as conn:
        # 1. Update kolom di tabel permits
        print("\n1. Memeriksa & Mengubah kolom tabel 'permits'...")
        try:
            # Ubah status enum menjadi VARCHAR(50) agar mendukung status baru: ACTIVE, EXPIRED, EXTENDED, dll.
            conn.execute(text("ALTER TABLE permits MODIFY COLUMN status VARCHAR(50) DEFAULT 'Submitted'"))
            print("   -> permits.status diubah menjadi VARCHAR(50)")
        except Exception as e:
            print("   -> Info status column:", e)

        # Kolom tambahan di permits
        additional_permit_columns = [
            ("nik", "VARCHAR(20) NULL"),
            ("phone", "VARCHAR(30) NULL"),
            ("email", "VARCHAR(120) NULL"),
            ("applicant_name", "VARCHAR(150) NULL"),
            ("business_sector", "VARCHAR(100) NULL"),
            ("duration_months", "INT DEFAULT 1"),
            ("start_date", "DATETIME NULL"),
            ("pdf_path", "VARCHAR(255) NULL"),
            ("qr_code_path", "VARCHAR(255) NULL"),
            ("active_version", "INT DEFAULT 1")
        ]

        for col_name, col_def in additional_permit_columns:
            try:
                conn.execute(text(f"ALTER TABLE permits ADD COLUMN {col_name} {col_def}"))
                print(f"   -> Kolom '{col_name}' berhasil ditambahkan ke 'permits'.")
            except Exception as e:
                # Kolom mungkin sudah ada
                print(f"   -> Kolom '{col_name}' sudah ada di 'permits' (dilewati).")

        # 2. Buat tabel permit_renewals
        print("\n2. Membuat tabel 'permit_renewals'...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS permit_renewals (
                id VARCHAR(36) PRIMARY KEY,
                permit_id VARCHAR(36) NOT NULL,
                renewal_number VARCHAR(100) UNIQUE NOT NULL,
                duration_months INT NOT NULL DEFAULT 1,
                previous_expired_at DATETIME NULL,
                new_expired_at DATETIME NULL,
                status VARCHAR(50) DEFAULT 'PENDING_PAYMENT',
                processed_by VARCHAR(36) NULL,
                notes TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_permit_id (permit_id),
                INDEX idx_status (status),
                CONSTRAINT fk_renewal_permit FOREIGN KEY (permit_id) REFERENCES permits(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        """))
        print("   -> Tabel 'permit_renewals' siap.")

        # 3. Buat tabel invoices
        print("\n3. Membuat tabel 'invoices'...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS invoices (
                id VARCHAR(36) PRIMARY KEY,
                invoice_number VARCHAR(100) UNIQUE NOT NULL,
                renewal_id VARCHAR(36) NULL,
                permit_id VARCHAR(36) NOT NULL,
                user_id VARCHAR(36) NOT NULL,
                subtotal DECIMAL(12,2) DEFAULT 0,
                total_amount DECIMAL(12,2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'UNPAID',
                due_date DATETIME NULL,
                paid_at DATETIME NULL,
                qris_url TEXT NULL,
                snap_token VARCHAR(255) NULL,
                snap_redirect_url VARCHAR(255) NULL,
                payment_method VARCHAR(50) NULL,
                pdf_path VARCHAR(255) NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_invoice_permit (permit_id),
                INDEX idx_invoice_user (user_id),
                INDEX idx_invoice_status (status),
                CONSTRAINT fk_invoice_permit FOREIGN KEY (permit_id) REFERENCES permits(id) ON DELETE CASCADE,
                CONSTRAINT fk_invoice_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        """))
        print("   -> Tabel 'invoices' siap.")

        # 4. Buat tabel invoice_items
        print("\n4. Membuat tabel 'invoice_items'...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS invoice_items (
                id VARCHAR(36) PRIMARY KEY,
                invoice_id VARCHAR(36) NOT NULL,
                item_name VARCHAR(150) NOT NULL,
                quantity INT DEFAULT 1,
                unit_price DECIMAL(12,2) DEFAULT 0,
                subtotal DECIMAL(12,2) DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_item_invoice (invoice_id),
                CONSTRAINT fk_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        """))
        print("   -> Tabel 'invoice_items' siap.")

        # 5. Buat tabel payments
        print("\n5. Membuat tabel 'payments'...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS payments (
                id VARCHAR(36) PRIMARY KEY,
                order_id VARCHAR(100) UNIQUE NOT NULL,
                invoice_id VARCHAR(36) NOT NULL,
                transaction_id VARCHAR(100) NULL,
                payment_type VARCHAR(50) DEFAULT 'qris',
                gross_amount DECIMAL(12,2) NOT NULL,
                transaction_status VARCHAR(50) DEFAULT 'pending',
                fraud_status VARCHAR(50) NULL,
                transaction_time DATETIME NULL,
                settlement_time DATETIME NULL,
                signature_key VARCHAR(255) NULL,
                raw_response TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_payment_invoice (invoice_id),
                INDEX idx_payment_order (order_id),
                INDEX idx_payment_status (transaction_status),
                CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        """))
        print("   -> Tabel 'payments' siap.")

        # 6. Buat tabel email_logs
        print("\n6. Membuat tabel 'email_logs'...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS email_logs (
                id VARCHAR(36) PRIMARY KEY,
                email_type VARCHAR(50) NOT NULL,
                recipient_email VARCHAR(120) NOT NULL,
                recipient_name VARCHAR(150) NULL,
                subject VARCHAR(255) NOT NULL,
                reference_id VARCHAR(100) NULL,
                status VARCHAR(50) DEFAULT 'SENT',
                error_message TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email_ref (reference_id),
                INDEX idx_email_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        """))
        print("   -> Tabel 'email_logs' siap.")

        conn.commit()
    print("\n=== MIGRASI DATABASE BERHASIL 100% ===")

if __name__ == '__main__':
    run_migration()
