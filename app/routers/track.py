from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.permit import Permit
from app.models.complaint import Complaint

router = APIRouter(prefix="/api/v1/track", tags=["Tracking"])

@router.get("/{ticket_number}")
def track_status(ticket_number: str, db: Session = Depends(get_db)):
    ticket_clean = ticket_number.strip()

    # 1. Cari di tabel Permit berdasarkan permit_number
    permit = db.query(Permit).filter(Permit.permit_number == ticket_clean).first()

    if permit:
        
        applicant_name = "-"
        if permit.applicant and hasattr(permit.applicant, "full_name") and permit.applicant.full_name:
            applicant_name = permit.applicant.full_name
        else:
            applicant_name = permit.business_name

        date_str = permit.submission_date.strftime("%d %B %Y") if permit.submission_date else "-"
        current_status = permit.status

        # Pemetaan status Enum Permit ('Draft', 'Submitted', 'Under Verification', 'Revision Required', 'Approved', 'Rejected')
        is_submitted = current_status in ['Submitted', 'Under Verification', 'Revision Required', 'Approved', 'Rejected']
        is_verifying = current_status in ['Under Verification', 'Revision Required']
        is_approved = current_status == 'Approved'

        return {
            "code": permit.permit_number,
            "type": f"Perizinan Usaha ({permit.type})",
            "applicant": applicant_name,
            "business_name": permit.business_name,
            "date": date_str,
            "status": current_status,
            "steps": [
                {
                    "title": "Pengajuan Diterima",
                    "desc": "Berkas masuk ke sistem SIPEDI",
                    "done": is_submitted,
                    "active": current_status == 'Submitted'
                },
                {
                    "title": "Verifikasi Dokumen",
                    "desc": "Pengecekan berkas oleh petugas",
                    "done": is_approved,
                    "active": is_verifying
                },
                {
                    "title": "Penerbitan Izin",
                    "desc": "NIB / Surat Izin diterbitkan",
                    "done": is_approved,
                    "active": False
                }
            ]
        }

    # 2. Cari di tabel Complaint berdasarkan complaint_number
    complaint = db.query(Complaint).filter(Complaint.complaint_number == ticket_clean).first()

    if complaint:
        
        reporter_name = "-"
        if complaint.reporter and hasattr(complaint.reporter, "full_name") and complaint.reporter.full_name:
            reporter_name = complaint.reporter.full_name

        date_str = complaint.date.strftime("%d %B %Y") if complaint.date else "-"
        current_status = complaint.status

        # Pemetaan status Enum Complaint ('Baru', 'Verifikasi', 'Diteruskan', 'Dalam Penanganan', 'Selesai')
        is_received = current_status in ['Baru', 'Verifikasi', 'Diteruskan', 'Dalam Penanganan', 'Selesai']
        is_in_progress = current_status in ['Verifikasi', 'Diteruskan', 'Dalam Penanganan']
        is_done = current_status == 'Selesai'

        return {
            "code": complaint.complaint_number,
            "type": f"Pengaduan ({complaint.category})",
            "applicant": reporter_name,
            "date": date_str,
            "status": current_status,
            "steps": [
                {
                    "title": "Laporan Diterima",
                    "desc": "Laporan masuk ke sistem SIPEDI",
                    "done": is_received,
                    "active": current_status == 'Baru'
                },
                {
                    "title": "Proses Lapangan",
                    "desc": "Petugas memverifikasi & menangani laporan",
                    "done": is_done,
                    "active": is_in_progress
                },
                {
                    "title": "Selesai",
                    "desc": "Pengaduan telah ditindaklanjuti",
                    "done": is_done,
                    "active": False
                }
            ]
        }

    raise HTTPException(status_code=404, detail="Nomor resi tidak ditemukan")