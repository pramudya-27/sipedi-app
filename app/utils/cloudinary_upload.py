import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.core.config import settings
import os
import shutil

# Initialize Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_file_to_cloudinary(file, folder_name: str, public_id: str = None) -> str:
    """
    Uploads a file object (FastAPI UploadFile) to Cloudinary and returns the secure URL.
    
    :param file: The UploadFile object from FastAPI
    :param folder_name: The target folder in Cloudinary (e.g., 'SIPEDI/profile-pictures')
    :param public_id: Optional specific name for the file
    :return: The secure URL of the uploaded image
    """
    
    # We need to read the file into memory or save it temporarily
    # Cloudinary upload can take a file-like object directly
    try:
        options = {
            "folder": folder_name,
            "resource_type": "auto" # Auto detects if it's image, video, pdf, etc.
        }
        
        if public_id:
            options["public_id"] = public_id
            
        result = cloudinary.uploader.upload(file.file, **options)
        return result.get("secure_url")
    except Exception as e:
        print(f"Error uploading to cloudinary: {str(e)}")
        raise e

def delete_file_from_cloudinary(public_id: str):
    """
    Deletes a file from Cloudinary using its public_id.
    """
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception as e:
        print(f"Error deleting from cloudinary: {str(e)}")
        raise e
