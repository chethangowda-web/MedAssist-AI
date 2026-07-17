from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Optional
from app.services.voice_service import voice_service
from app.core.security import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice", tags=["Voice"])


@router.post("/speech-to-text")
async def speech_to_text(
    audio: UploadFile = File(...),
    language: str = Form("en"),
    current_user: dict = Depends(get_current_user),
):
    if not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file provided")

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")

    text = voice_service.speech_to_text(audio_bytes, language)
    return {
        "status": "success" if text else "no_speech_detected",
        "text": text,
        "language": language,
        "detected_language": language,
    }


@router.post("/text-to-speech")
async def text_to_speech(
    request: dict,
    current_user: dict = Depends(get_current_user),
):
    text = request.get("text", "")
    language = request.get("language", "en")
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    audio_bytes = voice_service.text_to_speech(text, language)
    if not audio_bytes:
        raise HTTPException(status_code=500, detail="Text-to-speech conversion failed")

    from fastapi.responses import Response
    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f"attachment; filename=speech.mp3",
            "Content-Length": str(len(audio_bytes)),
        },
    )


@router.get("/languages")
async def get_supported_languages(current_user: dict = Depends(get_current_user)):
    return {
        "languages": voice_service.get_supported_languages(),
    }
