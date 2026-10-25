import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.core.config import settings
import re
import io

# Initialize Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def extract_public_id(url_or_id: str) -> str:
    """
    Ekstrak public_id dari Cloudinary URL lengkap (misal: 'SIPEDI/profile-pictures/user_123').
    Jika sudah berupa public_id, kembalikan apa adanya.
    """
    if not url_or_id:
        return ""
    if not url_or_id.startswith("http://") and not url_or_id.startswith("https://"):
        return url_or_id

    try:
        # Menangkap path setelah /upload/(v\d+/)? sampai sebelum ekstensi file
        match = re.search(r'/upload/(?:v\d+/)?(.+?)(?:\.[a-zA-Z0-9]+)?$', url_or_id)
        if match:
            return match.group(1)
    except Exception:
        pass
    return url_or_id

def upload_file_to_cloudinary(file, folder_name: str, public_id: str = None) -> str:
    """
    Uploads a file object (FastAPI UploadFile, BytesIO, or file-like object)
    to Cloudinary and returns the secure HTTPS URL.
    
    :param file: The UploadFile or file-like object
    :param folder_name: Target folder in Cloudinary (e.g. 'SIPEDI/profile-pictures', 'SIPEDI/perizinan', 'SIPEDI/pengaduan')
    :param public_id: Optional custom public_id
    :return: The secure HTTPS URL of the uploaded asset
    """
    try:
        options = {
            "folder": folder_name,
            "resource_type": "auto"
        }
        
        if public_id:
            options["public_id"] = public_id

        # Pastikan pointer file berada di posisi awal (0)
        file_obj = file
        if hasattr(file, 'file'):
            file_obj = file.file
            if hasattr(file_obj, 'seek'):
                file_obj.seek(0)
        elif hasattr(file, 'seek'):
            file.seek(0)
        elif isinstance(file, bytes):
            file_obj = io.BytesIO(file)
            
        result = cloudinary.uploader.upload(file_obj, **options)
        return result.get("secure_url")
    except Exception as e:
        print(f"Error uploading to cloudinary ({folder_name}): {str(e)}")
        raise e

def delete_file_from_cloudinary(url_or_id: str):
    """
    Deletes a file from Cloudinary using either its public_id or full URL.
    """
    try:
        target_id = extract_public_id(url_or_id)
        if target_id:
            cloudinary.uploader.destroy(target_id)
    except Exception as e:
        print(f"Error deleting from cloudinary ({url_or_id}): {str(e)}")
        raise e
