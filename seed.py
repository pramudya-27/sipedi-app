import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.permit import Permit
from app.models.complaint import Complaint
from app.core.security import get_password_hash

def seed_data():
    db = SessionLocal()
    
    if db.query(User).count() == 0:
        print("Seeding users...")
        users = [
            User(email="admin@sipedi.go.id", name="Admin Pusat", role="ADMIN", hashed_password=get_password_hash("admin123")),
            User(email="petugas@sipedi.go.id", name="Petugas Budi", role="OFFICER", hashed_password=get_password_hash("petugas123")),
            User(email="andi@gmail.com", name="Andi Pratama", role="CITIZEN", hashed_password=get_password_hash("warga123")),
            User(email="siti@gmail.com", name="Siti Rahma", role="CITIZEN", hashed_password=get_password_hash("warga123"))
        ]
        db.add_all(users)
        db.commit()
        
        andi = db.query(User).filter(User.email == "andi@gmail.com").first()
        siti = db.query(User).filter(User.email == "siti@gmail.com").first()
        
        print("Seeding permits...")
        permits = [
            Permit(permit_number="PRM-202601010001", type="Izin Usaha Mikro", business_name="Warung Nasi Andi", applicant_id=andi.id, status="Submitted"),
            Permit(permit_number="PRM-202601020002", type="Izin Reklame", business_name="Toko Elektronik Siti", applicant_id=siti.id, status="Approved")
        ]
        db.add_all(permits)
        
        print("Seeding complaints...")
        complaints = [
            Complaint(complaint_number="CMP-202601010001", category="Fasilitas Umum", location="Jalan Sudirman No 1", description="Lampu jalan mati", reporter_id=andi.id, status="Baru", priority="Sedang"),
            Complaint(complaint_number="CMP-202601020002", category="Ketertiban", location="Pasar Induk", description="Parkir liar menutupi jalan", reporter_id=siti.id, status="Dalam Penanganan", priority="Tinggi")
        ]
        db.add_all(complaints)
        db.commit()
        
        print("Database seeded successfully!")
    else:
        print("Database already contains data. Skipping seed.")
        
    db.close()

if __name__ == "__main__":
    seed_data()
