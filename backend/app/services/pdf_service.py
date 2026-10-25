import os
import io
import qrcode
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether, HRFlowable
)
from app.core.config import settings

UPLOADS_PERMITS_DIR = os.path.join(settings.UPLOAD_DIR, 'permits')
UPLOADS_INVOICES_DIR = os.path.join(settings.UPLOAD_DIR, 'invoices')

os.makedirs(UPLOADS_PERMITS_DIR, exist_ok=True)
os.makedirs(UPLOADS_INVOICES_DIR, exist_ok=True)

def create_qr_flowable(data_url: str, size: float = 75) -> RLImage:
    """Membuat QR code flowable Image untuk disematkan dalam dokumen PDF."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=1,
    )
    qr.add_data(data_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    img_buffer = io.BytesIO()
    img.save(img_buffer, format="PNG")
    img_buffer.seek(0)
    return RLImage(img_buffer, width=size, height=size)

def generate_permit_pdf(permit, applicant_user=None) -> tuple[str, bytes]:
    """
    Menghasilkan Surat Izin Resmi SIPEDI dalam format PDF A4.
    Mengembalikan (file_path, pdf_bytes).
    """
    permit_num = getattr(permit, 'permit_number', f"PRM-{permit.id}")
    version = getattr(permit, 'active_version', 1) or 1
    filename = f"SURAT_IZIN_{permit_num.replace('/', '_')}_v{version}.pdf"
    file_path = os.path.join(UPLOADS_PERMITS_DIR, filename)

    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        leftMargin=2.0 * cm,
        rightMargin=2.0 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    style_instansi = ParagraphStyle(
        'InstansiHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=14,
        alignment=1, # Center
        textColor=colors.HexColor('#0f172a')
    )
    style_sub_instansi = ParagraphStyle(
        'SubInstansiHeader',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        alignment=1,
        textColor=colors.HexColor('#334155')
    )
    style_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        alignment=1,
        textColor=colors.HexColor('#1e3a8a')
    )
    style_nomor = ParagraphStyle(
        'DocNumber',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        alignment=1,
        textColor=colors.HexColor('#475569')
    )
    style_body = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        alignment=4, # Justify
        textColor=colors.HexColor('#1e293b')
    )
    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0f172a')
    )
    style_table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0f172a')
    )

    story = []

    # 1. KOP SURAT RESMI
    story.append(Paragraph("PEMERINTAH REPUBLIK INDONESIA", style_instansi))
    story.append(Paragraph("DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU", style_instansi))
    story.append(Paragraph("SISTEM PERIZINAN DIGITAL & KETERTIBAN UMUM (SIPEDI)", style_sub_instansi))
    story.append(Paragraph("Gedung Pelayanan Publik Terpadu, Jl. Merdeka No. 45 • Website: sipedi.go.id", style_sub_instansi))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0f172a'), spaceBefore=2, spaceAfter=1))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#0f172a'), spaceBefore=0, spaceAfter=10))

    # 2. JUDUL DOKUMEN & NOMOR SURAT
    story.append(Paragraph("SURAT KETETAPAN PERIZINAN USAHA & KEGIATAN", style_title))
    story.append(Paragraph(f"Nomor Dokumen: <b>{permit_num}</b>", style_nomor))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "Berdasarkan hasil pemeriksaan administratif dan verifikasi teknis permohonan yang diajukan melalui "
        "Sistem Informasi Perizinan Digital (SIPEDI), Pemerintah Daerah dengan ini memberikan Izin Resmi kepada:",
        style_body
    ))
    story.append(Spacer(1, 8))

    # 3. DATA PEMOHON
    app_name = getattr(permit, 'applicant_name', '') or (applicant_user.name if applicant_user else 'Pemohon')
    nik = getattr(permit, 'nik', '') or (getattr(applicant_user, 'nik', '-') if applicant_user else '-')
    phone = getattr(permit, 'phone', '') or (getattr(applicant_user, 'phone', '-') if applicant_user else '-')
    email = getattr(permit, 'email', '') or (getattr(applicant_user, 'email', '-') if applicant_user else '-')
    address = getattr(permit, 'business_address', '-') or '-'

    data_pemohon = [
        [Paragraph("Nama Lengkap Pemohon", style_table_cell), Paragraph(":", style_table_cell), Paragraph(f"<b>{app_name}</b>", style_table_cell_bold)],
        [Paragraph("Nomor Induk Kependudukan (NIK)", style_table_cell), Paragraph(":", style_table_cell), Paragraph(nik, style_table_cell)],
        [Paragraph("Nomor Telepon / WhatsApp", style_table_cell), Paragraph(":", style_table_cell), Paragraph(phone, style_table_cell)],
        [Paragraph("Alamat Surel (Email)", style_table_cell), Paragraph(":", style_table_cell), Paragraph(email, style_table_cell)],
    ]
    t_pemohon = Table(data_pemohon, colWidths=[5.0 * cm, 0.4 * cm, 11.6 * cm])
    t_pemohon.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(t_pemohon)
    story.append(Spacer(1, 8))

    # 4. DATA USAHA & PERIZINAN
    biz_name = getattr(permit, 'business_name', '-') or '-'
    permit_type = getattr(permit, 'type', 'Izin Layanan Usaha') or 'Izin Layanan Usaha'
    sector = getattr(permit, 'business_sector', 'Perdagangan & Jasa') or 'Perdagangan & Jasa'
    duration = getattr(permit, 'duration_months', 1) or 1

    start_dt = getattr(permit, 'start_date', None) or getattr(permit, 'approved_at', None) or datetime.utcnow()
    exp_dt = getattr(permit, 'expired_at', None) or datetime.utcnow()

    start_str = start_dt.strftime("%d %B %Y")
    exp_str = exp_dt.strftime("%d %B %Y")

    story.append(Paragraph("Untuk menjalankan kegiatan usaha / operasional dengan rincian:", style_body))
    story.append(Spacer(1, 6))

    data_usaha = [
        [Paragraph("Nama Usaha / Merek Dagang", style_table_cell), Paragraph(":", style_table_cell), Paragraph(f"<b>{biz_name}</b>", style_table_cell_bold)],
        [Paragraph("Jenis Perizinan", style_table_cell), Paragraph(":", style_table_cell), Paragraph(permit_type, style_table_cell)],
        [Paragraph("Sektor / Bidang Usaha", style_table_cell), Paragraph(":", style_table_cell), Paragraph(sector, style_table_cell)],
        [Paragraph("Alamat Lokasi Usaha", style_table_cell), Paragraph(":", style_table_cell), Paragraph(address, style_table_cell)],
        [Paragraph("Durasi Izin Disetujui", style_table_cell), Paragraph(":", style_table_cell), Paragraph(f"<b>{duration} Bulan</b>", style_table_cell_bold)],
        [Paragraph("Mulai Berlaku", style_table_cell), Paragraph(":", style_table_cell), Paragraph(start_str, style_table_cell)],
        [Paragraph("Masa Berlaku Berakhir", style_table_cell), Paragraph(":", style_table_cell), Paragraph(f"<b>{exp_str}</b>", style_table_cell_bold)],
        [Paragraph("Status Izin", style_table_cell), Paragraph(":", style_table_cell), Paragraph("<b>AKTIF & SAH SECARA HUKUM</b>", ParagraphStyle('GreenSt', parent=style_table_cell_bold, textColor=colors.HexColor('#166534')))],
    ]
    t_usaha = Table(data_usaha, colWidths=[5.0 * cm, 0.4 * cm, 11.6 * cm])
    t_usaha.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(t_usaha)
    story.append(Spacer(1, 8))

    # 5. KETENTUAN & KEWAJIBAN PEMEGANG IZIN
    story.append(Paragraph("<b>Ketentuan dan Kewajiban Pemegang Izin:</b>", style_table_cell_bold))
    story.append(Spacer(1, 3))
    ketentuan_text = (
        "1. Wajib menjaga ketertiban umum, kebersihan, dan keselamatan lingkungan di sekitar lokasi usaha.<br/>"
        "2. Wajib mematuhi peraturan daerah yang berlaku serta tidak menyalahgunakan izin untuk kegiatan melanggar hukum.<br/>"
        "3. Surat izin ini wajib diperpanjang sebelum masa berlaku berakhir melalui portal SIPEDI.<br/>"
        "4. Izin ini dapat dicabut sewaktu-waktu apabila pemegang izin terbukti melanggar ketentuan yang telah ditetapkan."
    )
    story.append(Paragraph(ketentuan_text, style_body))
    story.append(Spacer(1, 10))

    # 6. TANDA TANGAN DIGITAL & QR VERIFIKASI
    tracking_url = f"{settings.FRONTEND_URL}/track/{permit_num}"
    qr_img = create_qr_flowable(tracking_url, size=75)

    today_str = datetime.now().strftime("%d %B %Y")

    ttd_left = [
        [qr_img],
        [Paragraph("<b>Verifikasi Keaslian Dokumen:</b>", ParagraphStyle('QRTiny', parent=style_body, fontSize=7, leading=9, alignment=1))],
        [Paragraph("Pindai QR Code di atas untuk memvalidasi keaslian surat melalui SIPEDI Tracking.", ParagraphStyle('QRTiny2', parent=style_body, fontSize=6.5, leading=8, alignment=1, textColor=colors.HexColor('#64748b')))],
    ]
    t_ttd_left = Table(ttd_left, colWidths=[7.5 * cm])
    t_ttd_left.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('TOPPADDING', (0,0), (-1,-1), 1),
    ]))

    ttd_right = [
        [Paragraph(f"Ditetapkan di Jakarta, {today_str}", ParagraphStyle('Rgt', parent=style_body, fontSize=8.5, alignment=1))],
        [Paragraph("<b>a.n. BUPATI / WALIKOTA</b><br/>Kepala Dinas Penanaman Modal & PTSP", ParagraphStyle('Rgt2', parent=style_body, fontSize=8.5, leading=11, alignment=1))],
        [Spacer(1, 35)], # Ruang tanda tangan digital / cap
        [Paragraph("<b>Drs. H. PRAYITNO, M.Si.</b>", ParagraphStyle('Rgt3', parent=style_body, fontSize=9, alignment=1))],
        [Paragraph("Pembina Utama Madya • NIP. 19740512 199903 1 002", ParagraphStyle('Rgt4', parent=style_body, fontSize=7.5, leading=9, alignment=1, textColor=colors.HexColor('#64748b')))],
        [Paragraph("<i>Dokumen ini telah ditandatangani secara elektronik (BSrE - SIPEDI)</i>", ParagraphStyle('Rgt5', parent=style_body, fontSize=6.5, leading=8, alignment=1, textColor=colors.HexColor('#2563eb')))],
    ]
    t_ttd_right = Table(ttd_right, colWidths=[9.5 * cm])
    t_ttd_right.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('TOPPADDING', (0,0), (-1,-1), 1),
    ]))

    footer_table = Table([[t_ttd_left, t_ttd_right]], colWidths=[7.5 * cm, 9.5 * cm])
    footer_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))

    story.append(KeepTogether([footer_table]))

    doc.build(story)
    pdf_bytes = pdf_buffer.getvalue()
    pdf_buffer.close()

    # Simpan file ke disk lokal
    with open(file_path, 'wb') as f:
        f.write(pdf_bytes)

    rel_path = f"/uploads/permits/{filename}"
    return rel_path, pdf_bytes

def generate_invoice_pdf(invoice, permit, applicant_user=None) -> tuple[str, bytes]:
    """
    Menghasilkan Invoice Tagihan Perpanjangan Perizinan dalam format PDF A4.
    Mengembalikan (file_path, pdf_bytes).
    """
    inv_num = getattr(invoice, 'invoice_number', f"INV-{invoice.id}")
    filename = f"TAGIHAN_{inv_num.replace('/', '_')}.pdf"
    file_path = os.path.join(UPLOADS_INVOICES_DIR, filename)

    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        leftMargin=2.0 * cm,
        rightMargin=2.0 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm
    )

    styles = getSampleStyleSheet()

    style_header = ParagraphStyle('InvHead', fontName='Helvetica-Bold', fontSize=14, leading=16, textColor=colors.HexColor('#0f172a'))
    style_sub = ParagraphStyle('InvSub', fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor('#64748b'))
    style_table_header = ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=9, leading=11, textColor=colors.white)
    style_table_body = ParagraphStyle('TB', fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor('#1e293b'))
    style_table_bold = ParagraphStyle('TBB', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.HexColor('#0f172a'))

    story = []

    is_renewal = bool(getattr(invoice, 'renewal_id', None))
    if is_renewal:
        inv_title = "INVOICE TAGIHAN PERPANJANGAN IZIN"
        service_type = "Perpanjangan Izin Usaha (1 Bulan)"
        step5_text = "5. Izin akan diperpanjang secara otomatis (+1 Bulan) begitu pembayaran terverifikasi oleh sistem."
    else:
        dur = getattr(permit, 'duration_months', 1) or 1
        inv_title = "INVOICE RETRIBUSI PERIZINAN BARU"
        service_type = f"Pendaftaran Izin Baru ({dur} Bulan)"
        step5_text = "5. Permohonan izin Anda akan otomatis masuk ke antrean Admin untuk diverifikasi dan diterbitkan surat resmi begitu pembayaran terverifikasi."

    # Header Invoice
    story.append(Paragraph("SIPEDI • SISTEM PERIZINAN DIGITAL", style_sub))
    story.append(Paragraph(inv_title, style_header))
    story.append(Paragraph("Dinas Penanaman Modal & Pelayanan Terpadu Satu Pintu", style_sub))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceBefore=2, spaceAfter=12))

    # Meta Tagihan & Pemohon
    app_name = getattr(permit, 'applicant_name', '') or (applicant_user.name if applicant_user else 'Pemohon')
    permit_num = getattr(permit, 'permit_number', f"PRM-{permit.id}")
    created_str = invoice.created_at.strftime("%d %B %Y") if getattr(invoice, 'created_at', None) else datetime.now().strftime("%d %B %Y")
    due_str = invoice.due_date.strftime("%d %B %Y") if getattr(invoice, 'due_date', None) else "-"
    status_str = getattr(invoice, 'status', 'UNPAID')

    meta_left = [
        [Paragraph("Nomor Tagihan", style_table_body), Paragraph(f": <b>{inv_num}</b>", style_table_bold)],
        [Paragraph("Tanggal Terbit", style_table_body), Paragraph(f": {created_str}", style_table_body)],
        [Paragraph("Jatuh Tempo", style_table_body), Paragraph(f": <b>{due_str}</b>", style_table_bold)],
        [Paragraph("Status Pembayaran", style_table_body), Paragraph(f": <b>{status_str}</b>", style_table_bold)],
    ]
    t_meta_left = Table(meta_left, colWidths=[3.2 * cm, 4.8 * cm])
    t_meta_left.setStyle(TableStyle([('BOTTOMPADDING', (0,0), (-1,-1), 2), ('TOPPADDING', (0,0), (-1,-1), 2)]))

    meta_right = [
        [Paragraph("ID Perizinan", style_table_body), Paragraph(f": <b>{permit_num}</b>", style_table_bold)],
        [Paragraph("Nama Pemohon", style_table_body), Paragraph(f": {app_name}", style_table_body)],
        [Paragraph("Nama Usaha", style_table_body), Paragraph(f": {getattr(permit, 'business_name', '-')}", style_table_body)],
        [Paragraph("Jenis Layanan", style_table_body), Paragraph(f": {service_type}", style_table_body)],
    ]
    t_meta_right = Table(meta_right, colWidths=[3.0 * cm, 6.0 * cm])
    t_meta_right.setStyle(TableStyle([('BOTTOMPADDING', (0,0), (-1,-1), 2), ('TOPPADDING', (0,0), (-1,-1), 2)]))

    story.append(Table([[t_meta_left, t_meta_right]], colWidths=[8.5 * cm, 8.5 * cm]))
    story.append(Spacer(1, 15))

    # Tabel Rincian Biaya
    items_data = [
        [
            Paragraph("No", style_table_header),
            Paragraph("Komponen Biaya / Retribusi", style_table_header),
            Paragraph("Jumlah", style_table_header),
            Paragraph("Biaya Satuan", style_table_header),
            Paragraph("Subtotal", style_table_header)
        ]
    ]

    items = getattr(invoice, 'items', []) or []
    if not items:
        # Fallback default items jika belum tersimpan di objek
        default_items = [
            ("Iuran Kebersihan Lingkungan Usaha", 1, 50000, 50000),
            ("Iuran Ketertiban & Keamanan Publik", 1, 50000, 50000)
        ]
        for idx, (name, qty, price, sub) in enumerate(default_items, 1):
            items_data.append([
                Paragraph(str(idx), style_table_body),
                Paragraph(name, style_table_body),
                Paragraph(f"{qty}x", style_table_body),
                Paragraph(f"Rp{price:,.0f}".replace(',', '.'), style_table_body),
                Paragraph(f"Rp{sub:,.0f}".replace(',', '.'), style_table_bold),
            ])
    else:
        for idx, it in enumerate(items, 1):
            qty = getattr(it, 'quantity', 1) or 1
            price = float(getattr(it, 'unit_price', 0) or 0)
            sub = float(getattr(it, 'subtotal', 0) or 0)
            items_data.append([
                Paragraph(str(idx), style_table_body),
                Paragraph(getattr(it, 'item_name', 'Biaya Layanan'), style_table_body),
                Paragraph(f"{qty}x", style_table_body),
                Paragraph(f"Rp{price:,.0f}".replace(',', '.'), style_table_body),
                Paragraph(f"Rp{sub:,.0f}".replace(',', '.'), style_table_bold),
            ])

    total_amt = float(getattr(invoice, 'total_amount', 100000) or 100000)
    items_data.append([
        Paragraph("", style_table_body),
        Paragraph("<b>TOTAL TAGIHAN RESMI</b>", style_table_bold),
        Paragraph("", style_table_body),
        Paragraph("", style_table_body),
        Paragraph(f"<b>Rp{total_amt:,.0f}</b>".replace(',', '.'), ParagraphStyle('Tot', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#2563eb'))),
    ])

    t_items = Table(items_data, colWidths=[1.0 * cm, 7.5 * cm, 2.0 * cm, 3.2 * cm, 3.3 * cm])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
        ('ALIGN', (2,0), (2,-1), 'CENTER'),
        ('ALIGN', (3,0), (-1,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-2), 0.5, colors.HexColor('#e2e8f0')),
        ('LINEBELOW', (0,-1), (-1,-1), 1.5, colors.HexColor('#2563eb')),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#f8fafc')),
    ]))
    story.append(t_items)
    story.append(Spacer(1, 15))

    # Petunjuk Pembayaran & QRIS
    qris_url = getattr(invoice, 'qris_url', None) or f"{settings.FRONTEND_URL}/citizen/permits/pay/{inv_num}"
    qr_img = create_qr_flowable(qris_url, size=80)

    instruction_text = (
        "<b>Instruksi Pembayaran QRIS:</b><br/>"
        "1. Buka aplikasi BCA Mobile, Livin Mandiri, GoPay, OVO, Dana, ShopeePay, atau m-Banking Anda.<br/>"
        "2. Pindai kode QRIS di samping.<br/>"
        "3. Pastikan nama penerima: <b>SIPEDI KAS DAERAH PEMERINTAH</b>.<br/>"
        "4. Konfirmasi pembayaran dan simpan bukti transaksi.<br/>"
        f"{step5_text}"
    )

    t_pay = Table([
        [Paragraph(instruction_text, ParagraphStyle('PayIns', fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor('#334155'))), qr_img]
    ], colWidths=[13.0 * cm, 4.0 * cm])
    t_pay.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_pay)

    doc.build(story)
    pdf_bytes = pdf_buffer.getvalue()
    pdf_buffer.close()

    with open(file_path, 'wb') as f:
        f.write(pdf_bytes)

    rel_path = f"/uploads/invoices/{filename}"
    return rel_path, pdf_bytes
