from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.services.ocr_service import ocr_service
from app.core.security import get_current_user
from app.core.firebase import get_bucket
from app.services.firestore_service import firestore_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ocr", tags=["OCR"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/tiff",
    "application/pdf",
}

MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/extract")
async def extract_text(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    text = ocr_service.extract_text_from_image(image_bytes, file.filename)
    parsed = ocr_service.parse_medical_report(text)

    return {
        "status": "success" if text else "no_text_detected",
        "filename": file.filename,
        "content_type": file.content_type,
        "extracted_text": text,
        "parsed": parsed,
        "char_count": len(text),
    }


@router.post("/prescription")
async def extract_prescription(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    result = ocr_service.extract_prescription(image_bytes)

    return {
        "status": "success",
        "filename": file.filename,
        "result": result,
    }


@router.post("/upload")
async def upload_medical_document(
    file: UploadFile = File(...),
    patient_id: str = "",
    document_type: str = "general",
    current_user: dict = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    try:
        text = ocr_service.extract_text_from_image(image_bytes, file.filename)
        parsed = ocr_service.parse_medical_report(text)

        file_url = ""
        bucket = get_bucket()
        if bucket:
            blob = bucket.blob(f"medical-documents/{patient_id}/{file.filename}")
            blob.upload_from_string(image_bytes, content_type=file.content_type)
            blob.make_public()
            file_url = blob.public_url

        doc = {
            "patient_id": patient_id,
            "document_type": document_type,
            "filename": file.filename,
            "file_url": file_url,
            "extracted_text": text,
            "parsed_data": parsed,
            "uploaded_by": current_user.get("user_id", "unknown"),
        }
        firestore_service.create_document("medical_documents", file.filename, doc)

        return {
            "status": "success",
            "filename": file.filename,
            "file_url": file_url,
            "extracted_text": text,
            "parsed_data": parsed,
        }

    except Exception as e:
        logger.error(f"Document upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
