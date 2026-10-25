from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any
import datetime
import re

from app.core.database import get_db
from app.models.permit import Permit
from app.models.complaint import Complaint

router = APIRouter(tags=['Dashboard'])

def parse_month_from_any_format(val):
    """Mengekstrak angka bulan (1-12) dari berbagai format string/datetime"""
    if not val:
        return None
    s = str(val).lower()

    # 1. Jika mengandung nama bulan bahasa Indonesia/Inggris
    if "okt" in s or "oct" in s: return 10
    if "sep" in s: return 9
    if "agu" in s or "aug" in s: return 8
    if "jul" in s: return 7
    if "jun" in s: return 6
    if "mei" in s or "may" in s: return 5
    if "apr" in s: return 4
    if "mar" in s: return 3
    if "feb" in s: return 2
    if "jan" in s: return 1
    if "nov" in s: return 11
    if "des" in s or "dec" in s: return 12

    # 2. Pola YYYY-MM-DD 
    match = re.search(r'20\d\d[-/](\d{1,2})', s)
    if match:
        return int(match.group(1))

    # 3. Pola DD-MM-YYYY
    match_alt = re.search(r'[-/](\d{1,2})[-/]20\d\d', s)
    if match_alt:
        return int(match_alt.group(1))

    return None

@router.get('/api/v1/admin/stats')
@router.get('/admin/stats')
def get_admin_dashboard_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    try:
        # 1. Total & Stat Cards
        total_permits = db.query(Permit).count()
        pending_permits = db.query(Permit).filter(Permit.status == 'Submitted').count()
        new_complaints = db.query(Complaint).filter(Complaint.status == 'Baru').count()
        resolved_complaints = db.query(Complaint).filter(Complaint.status == 'Selesai').count()
        total_complaints = db.query(Complaint).count()

        resolution_rate = "0%"
        if total_complaints > 0:
            rate = round((resolved_complaints / total_complaints) * 100)
            resolution_rate = f"{rate}%"

        # 2. Kategori Pengaduan
        category_distribution = []
        try:
            res_cat = db.execute(
                text("SELECT category, COUNT(id) as count FROM complaints GROUP BY category")
            ).mappings().all()

            for r in res_cat:
                cat_name = r.get("category") or "Lainnya"
                category_distribution.append({
                    "category": str(cat_name),
                    "count": int(r.get("count", 0))
                })
        except Exception as ex:
            print("[WARN] Gagal query kategori pengaduan:", str(ex))

        # 3. Tren Bulanan Realtime
        month_labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
        comp_counts = {}
        perm_counts = {}

        now = datetime.datetime.now()
        current_month = now.month 

        # Hitung Bulan Perizinan
        try:
            all_permits = db.query(Permit).all()
            for p in all_permits:
                tgl_val = getattr(p, 'created_at', getattr(p, 'submitted_at', None))
                m_num = parse_month_from_any_format(tgl_val)
                if not m_num:
                    m_num = current_month 
                perm_counts[m_num] = perm_counts.get(m_num, 0) + 1
        except Exception as ex:
            print("[WARN] Gagal hitung perizinan:", str(ex))

        # Hitung Bulan Pengaduan
        try:
            all_complaints = db.query(Complaint).all()
            for c in all_complaints:
                tgl_val = getattr(c, 'created_at', getattr(c, 'submitted_at', None))
                m_num = parse_month_from_any_format(tgl_val)
                if not m_num:
                    m_num = current_month
                comp_counts[m_num] = comp_counts.get(m_num, 0) + 1
        except Exception as ex:
            print("[WARN] Gagal hitung pengaduan:", str(ex))

        # Susun Tren 6 Bulan Terakhir
        monthly_trends = []
        for offset in range(5, -1, -1):
            target_month = (current_month - offset - 1) % 12 + 1
            m_label = month_labels[target_month - 1]

            monthly_trends.append({
                "month": m_label,
                "pengaduan": comp_counts.get(target_month, 0),
                "perizinan": perm_counts.get(target_month, 0)
            })

        # 4. Aktivitas Terbaru
        recent_activities = []
        try:
            recent_permits = db.query(Permit).order_by(Permit.id.desc()).limit(5).all()
            for p in recent_permits:
                user_name = "Pemohon"
                if hasattr(p, 'applicant') and p.applicant:
                    user_name = getattr(p.applicant, 'name', getattr(p.applicant, 'email', 'Pemohon'))

                service_type = getattr(p, 'permit_type', getattr(p, 'title', 'Permohonan Perizinan'))
                short_id = str(p.id)[:8].upper()
                ref_no = f"PRM-{short_id}"

                recent_activities.append({
                    "id": str(p.id),
                    "userName": user_name,
                    "activity": str(service_type),
                    "referenceNo": ref_no,
                    "status": getattr(p, 'status', 'Submitted'),
                    "timeAgo": "Baru saja"
                })
        except Exception as ex:
            print("[WARN] Gagal query aktivitas terbaru:", str(ex))

        return {
            "stats": {
                "totalPermits": total_permits,
                "pendingPermits": pending_permits,
                "newComplaints": new_complaints,
                "resolvedComplaints": resolved_complaints,
                "resolutionRate": resolution_rate
            },
            "monthlyTrends": monthly_trends,
            "categoryDistribution": category_distribution,
            "recentActivities": recent_activities
        }

    except Exception as e:
        print("\n[ERROR DASHBOARD ROUTE]:", str(e), "\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )