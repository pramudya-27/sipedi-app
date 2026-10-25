import io
import os
import csv
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.payment import Invoice, InvoiceItem, Payment
from app.models.permit import Permit
from app.models.user import User

router = APIRouter(prefix="/revenue", tags=["Revenue"])

@router.get('/summary')
def get_revenue_summary(db: Session = Depends(get_db)):
    # 1. Total Pemasukan Lunas
    paid_invoices = db.query(Invoice).filter(Invoice.status == 'PAID').all()
    total_revenue = sum([float(inv.total_amount or 0) for inv in paid_invoices])

    # 2. Pemasukan Bulan Ini
    now = datetime.utcnow()
    first_day_month = datetime(now.year, now.month, 1)
    month_invoices = db.query(Invoice).filter(
        Invoice.status == 'PAID',
        Invoice.paid_at >= first_day_month
    ).all()
    month_revenue = sum([float(inv.total_amount or 0) for inv in month_invoices])

    # 3. Transaksi Lunas vs Menunggu Pembayaran
    total_paid_count = len(paid_invoices)
    pending_count = db.query(Invoice).filter(Invoice.status == 'UNPAID').count()

    # 4. Breakdown Komponen (Kebersihan vs Keamanan)
    paid_inv_ids = [inv.id for inv in paid_invoices]
    total_kebersihan = 0.0
    total_keamanan = 0.0

    if paid_inv_ids:
        items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id.in_(paid_inv_ids)).all()
        for it in items:
            name_lower = it.item_name.lower()
            sub = float(it.subtotal or 0)
            if 'kebersihan' in name_lower:
                total_kebersihan += sub
            elif 'keamanan' in name_lower or 'ketertiban' in name_lower:
                total_keamanan += sub
            else:
                total_kebersihan += sub / 2
                total_keamanan += sub / 2

    # 5. Trend Bulanan (6 Bulan Terakhir)
    monthly_trend = []
    for i in range(5, -1, -1):
        m_date = now - timedelta(days=i*30)
        m_start = datetime(m_date.year, m_date.month, 1)
        if m_date.month == 12:
            m_end = datetime(m_date.year + 1, 1, 1)
        else:
            m_end = datetime(m_date.year, m_date.month + 1, 1)

        m_paid = db.query(Invoice).filter(
            Invoice.status == 'PAID',
            Invoice.paid_at >= m_start,
            Invoice.paid_at < m_end
        ).all()
        amt = sum([float(x.total_amount or 0) for x in m_paid])
        monthly_trend.append({
            "month": m_start.strftime("%b %Y"),
            "amount": amt,
            "count": len(m_paid)
        })

    return {
        "total_revenue": total_revenue,
        "this_month_revenue": month_revenue,
        "total_paid_transactions": total_paid_count,
        "total_pending_invoices": pending_count,
        "breakdown": {
            "iuran_kebersihan": total_kebersihan,
            "iuran_keamanan": total_keamanan
        },
        "monthly_trend": monthly_trend
    }

@router.get('/transactions')
def get_revenue_transactions(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Invoice).order_by(Invoice.created_at.desc())

    if status and status.upper() != 'ALL':
        query = query.filter(Invoice.status == status.upper())

    invoices = query.all()
    results = []

    search_clean = search.strip().lower() if search else None

    for inv in invoices:
        permit = inv.permit
        applicant_name = permit.applicant_name if permit else "-"
        biz_name = permit.business_name if permit else "-"
        permit_number = permit.permit_number if permit else "-"
        nik = getattr(permit, 'nik', None) or (permit.applicant.nik if (permit and permit.applicant) else None) or "-"
        phone = getattr(permit, 'phone', None) or (permit.applicant.phone if (permit and permit.applicant) else None) or "-"
        sector = getattr(permit, 'business_sector', None) or "Perdagangan & Jasa"
        duration = getattr(permit, 'duration_months', 1) or 1

        if search_clean:
            match = (
                search_clean in inv.invoice_number.lower() or
                search_clean in permit_number.lower() or
                search_clean in applicant_name.lower() or
                search_clean in biz_name.lower() or
                search_clean in str(nik).lower() or
                search_clean in str(sector).lower()
            )
            if not match:
                continue

        # Hitung item breakdown
        kebersihan_amt = 0.0
        keamanan_amt = 0.0
        for it in inv.items:
            n = it.item_name.lower()
            s = float(it.subtotal or 0)
            if 'kebersihan' in n:
                kebersihan_amt += s
            elif 'keamanan' in n or 'ketertiban' in n:
                keamanan_amt += s
            else:
                kebersihan_amt += s/2
                keamanan_amt += s/2

        results.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "permit_id": inv.permit_id,
            "permit_number": permit_number,
            "applicant_name": applicant_name,
            "nik": nik,
            "phone": phone,
            "business_name": biz_name,
            "business_sector": sector,
            "duration_months": duration,
            "subtotal": float(inv.subtotal or 0),
            "total_amount": float(inv.total_amount or 0),
            "kebersihan_amount": kebersihan_amt,
            "keamanan_amount": keamanan_amt,
            "status": inv.status,
            "payment_method": inv.payment_method or "QRIS",
            "due_date": inv.due_date.strftime("%d %B %Y") if inv.due_date else "-",
            "paid_at": inv.paid_at.strftime("%d %B %Y, %H:%M WIB") if inv.paid_at else None,
            "created_at": inv.created_at.strftime("%d %B %Y, %H:%M WIB") if inv.created_at else "-",
            "pdf_path": inv.pdf_path
        })

    return results

@router.delete('/invoice/{invoice_number}')
def delete_revenue_invoice(invoice_number: str, db: Session = Depends(get_db)):
    """
    Menghapus record invoice dan itemnya dari buku kas.
    Jika perizinan terkait masih berstatus Pending Payment, ikut dibersihkan agar sinkron.
    """
    order_clean = invoice_number.strip()
    inv = db.query(Invoice).filter(
        (Invoice.invoice_number == order_clean) | (Invoice.id == order_clean)
    ).first()

    if not inv:
        raise HTTPException(status_code=404, detail=f"Tagihan {order_clean} tidak ditemukan.")

    permit = inv.permit
    db.query(InvoiceItem).filter(InvoiceItem.invoice_id == inv.id).delete()
    db.query(Payment).filter(Payment.invoice_id == inv.id).delete()

    if permit and permit.status in ['Pending Payment', 'Submitted']:
        # Hapus berkas pendukung dan dokumen jika ada
        from app.models.permit import PermitDocument
        db.query(PermitDocument).filter(PermitDocument.permit_id == permit.id).delete()
        db.delete(permit)

    db.delete(inv)
    db.commit()
    return {"status": "ok", "message": f"Tagihan {order_clean} dan data terkait berhasil dihapus."}

@router.get('/export-excel')
def export_revenue_excel(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Menghasilkan file Excel (.xlsx) Laporan Audit Pemasukan & Pengeluaran/Alokasi Retribusi SIPEDI.
    Memuat data pemohon lengkap: Nama, NIK, No. Telepon, Nama Usaha, Sektor Usaha, Rincian Biaya, dan Status.
    """
    query = db.query(Invoice).order_by(Invoice.created_at.desc())

    if status and status.upper() != 'ALL':
        query = query.filter(Invoice.status == status.upper())

    invoices = query.all()
    search_clean = search.strip().lower() if search else None

    # Filter data jika ada kata kunci pencarian
    matched_invoices = []
    for inv in invoices:
        permit = inv.permit
        applicant_name = permit.applicant_name if permit else "-"
        biz_name = permit.business_name if permit else "-"
        permit_number = permit.permit_number if permit else "-"
        nik = getattr(permit, 'nik', None) or (permit.applicant.nik if (permit and permit.applicant) else None) or "-"
        sector = getattr(permit, 'business_sector', None) or "Perdagangan & Jasa"

        if search_clean:
            match = (
                search_clean in inv.invoice_number.lower() or
                search_clean in permit_number.lower() or
                search_clean in applicant_name.lower() or
                search_clean in biz_name.lower() or
                search_clean in str(nik).lower() or
                search_clean in str(sector).lower()
            )
            if not match:
                continue
        matched_invoices.append(inv)

    # Dynamic import Openpyxl dengan graceful fallback
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        from openpyxl.utils import get_column_letter
        has_openpyxl = True
    except ImportError:
        has_openpyxl = False

    if not has_openpyxl:
        # Fallback Excel-Compatible CSV dengan UTF-8 BOM
        output_csv = io.StringIO()
        output_csv.write('\ufeff')
        writer = csv.writer(output_csv, delimiter=';')
        writer.writerow(["LAPORAN AUDIT PEMASUKAN & PENGELUARAN RETRIBUSI PERIZINAN SIPEDI"])
        writer.writerow(["Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP) • Kas Daerah Digital"])
        writer.writerow([f"Tanggal Ekspor: {datetime.now().strftime('%d %B %Y, %H:%M WIB')} | Filter: {status or 'Semua'} | Pencarian: {search or '-'}"])
        writer.writerow([])
        writer.writerow([
            "No", "No. Invoice", "No. Perizinan", "Nama Pemohon", "NIK Pemohon", "No. Telepon / HP",
            "Nama Usaha", "Sektor Usaha", "Durasi Izin", "Pemasukan Retribusi (Rp)",
            "Alokasi Kebersihan (Rp)", "Alokasi Keamanan (Rp)", "Status Pembayaran",
            "Metode Pembayaran", "Tanggal Invoice", "Tanggal Lunas", "Keterangan Audit"
        ])
        tot_paid = 0.0
        tot_pending = 0.0
        for idx, inv in enumerate(matched_invoices, 1):
            permit = inv.permit
            applicant_name = permit.applicant_name if permit else "-"
            biz_name = permit.business_name if permit else "-"
            permit_number = permit.permit_number if permit else "-"
            nik = getattr(permit, 'nik', None) or (permit.applicant.nik if (permit and permit.applicant) else None) or "-"
            phone = getattr(permit, 'phone', None) or (permit.applicant.phone if (permit and permit.applicant) else None) or "-"
            sector = getattr(permit, 'business_sector', None) or "Perdagangan & Jasa"
            duration_str = f"{getattr(permit, 'duration_months', 1) or 1} Bulan"
            keb_amt = 0.0
            kea_amt = 0.0
            for it in inv.items:
                n = it.item_name.lower()
                s = float(it.subtotal or 0)
                if 'kebersihan' in n: keb_amt += s
                elif 'keamanan' in n or 'ketertiban' in n: kea_amt += s
                else: keb_amt += s/2; kea_amt += s/2
            tot = float(inv.total_amount or 0)
            inv_st = inv.status.upper()
            if inv_st == 'PAID': tot_paid += tot
            elif inv_st == 'UNPAID': tot_pending += tot
            writer.writerow([
                idx, inv.invoice_number, permit_number, applicant_name, str(nik), str(phone),
                biz_name, sector, duration_str, int(tot), int(keb_amt), int(kea_amt),
                "LUNAS" if inv_st == 'PAID' else ("MENUNGGU BAYAR" if inv_st == 'UNPAID' else inv_st),
                inv.payment_method or "QRIS",
                inv.created_at.strftime("%d/%m/%Y %H:%M") if inv.created_at else "-",
                inv.paid_at.strftime("%d/%m/%Y %H:%M") if inv.paid_at else "-",
                "Pemasukan Sah Masuk Kas" if inv_st == 'PAID' else "Piutang Berjalan"
            ])
        writer.writerow([])
        writer.writerow(["TOTAL PEMASUKAN RETRIBUSI LUNAS (KAS DAERAH)", int(tot_paid)])
        writer.writerow(["TOTAL TAGIHAN MENUNGGU BAYAR", int(tot_pending)])
        csv_bytes = output_csv.getvalue().encode('utf-8')
        filename = f"AUDIT_KEUANGAN_SIPEDI_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        return Response(
            content=csv_bytes,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )

    # Inisialisasi Workbook Openpyxl
    wb = openpyxl.Workbook()

    # Styling Palettes
    navy_header_fill = PatternFill(start_color='1E3A8A', end_color='1E3A8A', fill_type='solid')
    light_blue_fill = PatternFill(start_color='EFF6FF', end_color='EFF6FF', fill_type='solid')
    emerald_fill = PatternFill(start_color='ECFDF5', end_color='ECFDF5', fill_type='solid')
    amber_fill = PatternFill(start_color='FFFBEB', end_color='FFFBEB', fill_type='solid')
    subtotal_fill = PatternFill(start_color='F1F5F9', end_color='F1F5F9', fill_type='solid')

    font_title = Font(name='Segoe UI', size=15, bold=True, color='1E3A8A')
    font_subtitle = Font(name='Segoe UI', size=10, italic=True, color='64748B')
    font_meta = Font(name='Segoe UI', size=9, bold=True, color='334155')
    font_header = Font(name='Segoe UI', size=10, bold=True, color='FFFFFF')
    font_body = Font(name='Segoe UI', size=9, color='0F172A')
    font_bold = Font(name='Segoe UI', size=9, bold=True, color='0F172A')
    font_status_paid = Font(name='Segoe UI', size=9, bold=True, color='047857')
    font_status_unpaid = Font(name='Segoe UI', size=9, bold=True, color='B45309')
    font_status_cancel = Font(name='Segoe UI', size=9, bold=True, color='B91C1C')

    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )
    double_bottom_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='double', color='0F172A')
    )

    # =========================================================================
    # SHEET 1: AUDIT & BUKU KAS TRANSAKSI
    # =========================================================================
    ws1 = wb.active
    ws1.title = "Audit & Buku Kas Transaksi"
    ws1.views.sheetView[0].showGridLines = True

    # 1. Judul & Header Dokumen
    ws1.merge_cells('A1:Q1')
    ws1['A1'] = "LAPORAN AUDIT PEMASUKAN & PENGELUARAN RETRIBUSI PERIZINAN SIPEDI"
    ws1['A1'].font = font_title
    ws1['A1'].alignment = Alignment(horizontal='center', vertical='center')

    ws1.merge_cells('A2:Q2')
    ws1['A2'] = "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu (DPMPTSP) • Kas Daerah Digital"
    ws1['A2'].font = font_subtitle
    ws1['A2'].alignment = Alignment(horizontal='center', vertical='center')

    current_time_str = datetime.now().strftime("%d %B %Y, %H:%M WIB")
    ws1.merge_cells('A3:Q3')
    ws1['A3'] = f"Tanggal Ekspor: {current_time_str} | Filter: {status or 'Semua Status'} | Pencarian: {search or '-'}"
    ws1['A3'].font = font_meta
    ws1['A3'].alignment = Alignment(horizontal='center', vertical='center')

    ws1.row_dimensions[1].height = 28
    ws1.row_dimensions[2].height = 18
    ws1.row_dimensions[3].height = 18
    ws1.row_dimensions[4].height = 10

    # 2. Table Headers
    headers = [
        "No",
        "No. Invoice",
        "No. Perizinan",
        "Nama Pemohon",
        "NIK Pemohon",
        "No. Telepon / HP",
        "Nama Usaha",
        "Sektor Usaha",
        "Durasi Izin",
        "Pemasukan Retribusi (Rp)",
        "Alokasi Kebersihan (Rp)",
        "Alokasi Keamanan (Rp)",
        "Status Pembayaran",
        "Metode Pembayaran",
        "Tanggal Invoice",
        "Tanggal Lunas",
        "Keterangan Audit"
    ]

    ws1.row_dimensions[5].height = 26
    for col_idx, h in enumerate(headers, 1):
        cell = ws1.cell(row=5, column=col_idx, value=h)
        cell.fill = navy_header_fill
        cell.font = font_header
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        cell.border = thin_border

    # 3. Baris Data Transaksi
    total_pemasukan_lunas = 0.0
    total_kebersihan_lunas = 0.0
    total_keamanan_lunas = 0.0
    total_pending_amount = 0.0

    current_row = 6
    for idx, inv in enumerate(matched_invoices, 1):
        permit = inv.permit
        applicant_name = permit.applicant_name if permit else "-"
        biz_name = permit.business_name if permit else "-"
        permit_number = permit.permit_number if permit else "-"
        nik = getattr(permit, 'nik', None) or (permit.applicant.nik if (permit and permit.applicant) else None) or "-"
        phone = getattr(permit, 'phone', None) or (permit.applicant.phone if (permit and permit.applicant) else None) or "-"
        sector = getattr(permit, 'business_sector', None) or "Perdagangan & Jasa"
        duration_str = f"{getattr(permit, 'duration_months', 1) or 1} Bulan"

        kebersihan_amt = 0.0
        keamanan_amt = 0.0
        for it in inv.items:
            n = it.item_name.lower()
            s = float(it.subtotal or 0)
            if 'kebersihan' in n:
                kebersihan_amt += s
            elif 'keamanan' in n or 'ketertiban' in n:
                keamanan_amt += s
            else:
                kebersihan_amt += s/2
                keamanan_amt += s/2

        tot = float(inv.total_amount or 0)
        inv_status = inv.status.upper()

        if inv_status == 'PAID':
            total_pemasukan_lunas += tot
            total_kebersihan_lunas += kebersihan_amt
            total_keamanan_lunas += keamanan_amt
            audit_note = "Pemasukan Retribusi Sah & Masuk Kas Daerah"
        elif inv_status == 'UNPAID':
            total_pending_amount += tot
            audit_note = "Piutang Berjalan / Menunggu Bayar"
        else:
            audit_note = "Transaksi Dibatalkan / Kadaluwarsa"

        created_str = inv.created_at.strftime("%d/%m/%Y %H:%M") if inv.created_at else "-"
        paid_str = inv.paid_at.strftime("%d/%m/%Y %H:%M") if inv.paid_at else "-"

        row_values = [
            idx,
            inv.invoice_number,
            permit_number,
            applicant_name,
            str(nik),
            str(phone),
            biz_name,
            sector,
            duration_str,
            tot,
            kebersihan_amt,
            keamanan_amt,
            "LUNAS" if inv_status == 'PAID' else ("MENUNGGU BAYAR" if inv_status == 'UNPAID' else inv_status),
            inv.payment_method or "QRIS",
            created_str,
            paid_str,
            audit_note
        ]

        ws1.row_dimensions[current_row].height = 20
        for col_idx, val in enumerate(row_values, 1):
            cell = ws1.cell(row=current_row, column=col_idx, value=val)
            cell.border = thin_border
            cell.font = font_body

            # Currency columns
            if col_idx in [10, 11, 12]:
                cell.number_format = '#,##0'
                cell.alignment = Alignment(horizontal='right', vertical='center')
            elif col_idx in [1, 2, 3, 5, 6, 9, 13, 14, 15, 16]:
                cell.alignment = Alignment(horizontal='center', vertical='center')
            else:
                cell.alignment = Alignment(horizontal='left', vertical='center')

            # Status styling
            if col_idx == 13:
                if inv_status == 'PAID':
                    cell.font = font_status_paid
                    cell.fill = emerald_fill
                elif inv_status == 'UNPAID':
                    cell.font = font_status_unpaid
                    cell.fill = amber_fill
                else:
                    cell.font = font_status_cancel

        current_row += 1

    # Jika tidak ada data
    if not matched_invoices:
        ws1.merge_cells(f'A{current_row}:Q{current_row}')
        empty_cell = ws1.cell(row=current_row, column=1, value="Tidak ada data transaksi retribusi ditemukan.")
        empty_cell.alignment = Alignment(horizontal='center', vertical='center')
        empty_cell.font = font_subtitle
        current_row += 1

    # 4. Baris Subtotal & Rekapitulasi Kas di Bawah Tabel
    current_row += 1
    ws1.row_dimensions[current_row].height = 22

    # Subtotal Pemasukan Lunas
    ws1.merge_cells(f'A{current_row}:I{current_row}')
    lbl1 = ws1.cell(row=current_row, column=1, value="TOTAL PEMASUKAN RETRIBUSI LUNAS (KAS DAERAH)")
    lbl1.font = font_bold
    lbl1.alignment = Alignment(horizontal='right', vertical='center')
    lbl1.fill = subtotal_fill

    cell_tot = ws1.cell(row=current_row, column=10, value=total_pemasukan_lunas)
    cell_tot.font = font_bold
    cell_tot.number_format = '#,##0'
    cell_tot.alignment = Alignment(horizontal='right', vertical='center')
    cell_tot.fill = emerald_fill
    cell_tot.border = thin_border

    cell_keb = ws1.cell(row=current_row, column=11, value=total_kebersihan_lunas)
    cell_keb.font = font_bold
    cell_keb.number_format = '#,##0'
    cell_keb.alignment = Alignment(horizontal='right', vertical='center')
    cell_keb.fill = subtotal_fill
    cell_keb.border = thin_border

    cell_kea = ws1.cell(row=current_row, column=12, value=total_keamanan_lunas)
    cell_kea.font = font_bold
    cell_kea.number_format = '#,##0'
    cell_kea.alignment = Alignment(horizontal='right', vertical='center')
    cell_kea.fill = subtotal_fill
    cell_kea.border = thin_border

    for c in range(1, 10):
        ws1.cell(row=current_row, column=c).border = thin_border
    for c in range(13, 18):
        ws1.cell(row=current_row, column=c).border = thin_border

    # Subtotal Tagihan Pending (Piutang)
    current_row += 1
    ws1.row_dimensions[current_row].height = 22
    ws1.merge_cells(f'A{current_row}:I{current_row}')
    lbl2 = ws1.cell(row=current_row, column=1, value="TOTAL TAGIHAN BELUM TERBAYAR (MENUNGGU PEMBAYARAN)")
    lbl2.font = font_bold
    lbl2.alignment = Alignment(horizontal='right', vertical='center')
    lbl2.fill = subtotal_fill

    cell_pen = ws1.cell(row=current_row, column=10, value=total_pending_amount)
    cell_pen.font = font_bold
    cell_pen.number_format = '#,##0'
    cell_pen.alignment = Alignment(horizontal='right', vertical='center')
    cell_pen.fill = amber_fill
    cell_pen.border = double_bottom_border

    for c in range(1, 10):
        ws1.cell(row=current_row, column=c).border = double_bottom_border
    for c in range(11, 18):
        ws1.cell(row=current_row, column=c).border = double_bottom_border

    # Auto-adjust Column Widths Sheet 1
    for col in ws1.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            # Skip title row length
            if cell.row in [1, 2, 3]:
                continue
            val_str = str(cell.value or '')
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws1.column_dimensions[col_letter].width = max(max_len + 4, 12)

    # =========================================================================
    # SHEET 2: RINGKASAN ARUS KAS & ALOKASI ANGGARAN (EXECUTIVE SUMMARY)
    # =========================================================================
    ws2 = wb.create_sheet(title="Ringkasan Alokasi Kas")
    ws2.views.sheetView[0].showGridLines = True

    ws2.merge_cells('A1:F1')
    ws2['A1'] = "RINGKASAN ARUS KAS & ALOKASI PENGELUARAN DAERAH"
    ws2['A1'].font = font_title
    ws2['A1'].alignment = Alignment(horizontal='center', vertical='center')

    ws2.merge_cells('A2:F2')
    ws2['A2'] = f"Per tanggal: {current_time_str}"
    ws2['A2'].font = font_subtitle
    ws2['A2'].alignment = Alignment(horizontal='center', vertical='center')

    # KPI Table 1: Pemasukan vs Pengeluaran Alokasi
    kpi_headers = ["Indikator Arus Kas", "Deskripsi / Alokasi Anggaran", "Nilai (Rp)", "Persentase", "Status Audit"]
    ws2.row_dimensions[4].height = 25
    for c_idx, h in enumerate(kpi_headers, 1):
        cell = ws2.cell(row=4, column=c_idx, value=h)
        cell.fill = navy_header_fill
        cell.font = font_header
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = thin_border

    kpi_data = [
        ("PEMASUKAN KAS (INFLOW)", "Penerimaan Retribusi Resmi Pemohon (Lunas)", total_pemasukan_lunas, "100.0%", "Terverifikasi Otomatis"),
        ("ALOKASI PENGELUARAN: KEBERSIHAN", "Sub-Alokasi Pengelolaan Sampah & Lingkungan Hidup", total_kebersihan_lunas, "50.0%", "Teralokasi ke DLH"),
        ("ALOKASI PENGELUARAN: KETERTIBAN", "Sub-Alokasi Monitoring & Keamanan Satpol PP / Trantib", total_keamanan_lunas, "50.0%", "Teralokasi ke Trantib"),
        ("PIUTANG BERJALAN (PENDING)", "Tagihan Aktif Belum Dibayar Pemohon", total_pending_amount, "-", "Menunggu Pelunasan")
    ]

    for r_idx, row_item in enumerate(kpi_data, 5):
        ws2.row_dimensions[r_idx].height = 22
        for c_idx, val in enumerate(row_item, 1):
            cell = ws2.cell(row=r_idx, column=c_idx, value=val)
            cell.border = thin_border
            cell.font = font_body
            if c_idx == 3:
                cell.number_format = '#,##0'
                cell.font = font_bold
                cell.alignment = Alignment(horizontal='right', vertical='center')
            elif c_idx in [1, 4, 5]:
                cell.alignment = Alignment(horizontal='center', vertical='center')
            else:
                cell.alignment = Alignment(horizontal='left', vertical='center')

    # Auto-adjust Column Widths Sheet 2
    for col in ws2.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            if cell.row in [1, 2]:
                continue
            val_str = str(cell.value or '')
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws2.column_dimensions[col_letter].width = max(max_len + 5, 15)

    # Simpan ke buffer memory
    output_stream = io.BytesIO()
    wb.save(output_stream)
    output_stream.seek(0)

    filename = f"AUDIT_KEUANGAN_SIPEDI_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    return Response(
        content=output_stream.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
