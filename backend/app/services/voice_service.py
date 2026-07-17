import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class VoiceService:
    def __init__(self):
        self.supported_languages = {
            "hi": "Hindi",
            "en": "English",
            "bn": "Bengali",
            "te": "Telugu",
            "ta": "Tamil",
            "mr": "Marathi",
            "gu": "Gujarati",
            "kn": "Kannada",
            "ml": "Malayalam",
            "pa": "Punjabi",
        }

    def speech_to_text(self, audio_bytes: bytes, language: str = "en") -> str:
        try:
            import speech_recognition as sr
            import tempfile
            import os

            recognizer = sr.Recognizer()
            suffix = ".wav"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            try:
                with sr.AudioFile(tmp_path) as source:
                    audio = recognizer.record(source)
            finally:
                try:
                    os.unlink(tmp_path)
                except:
                    pass

            lang_map = {
                "hi": "hi-IN", "en": "en-US", "bn": "bn-IN",
                "te": "te-IN", "ta": "ta-IN", "mr": "mr-IN",
                "gu": "gu-IN", "kn": "kn-IN", "ml": "ml-IN",
                "pa": "pa-IN",
            }
            lang_code = lang_map.get(language, "en-US")

            try:
                text = recognizer.recognize_google(audio, language=lang_code)
                return text
            except sr.UnknownValueError:
                logger.warning("Speech recognition could not understand audio")
                return ""
            except sr.RequestError as e:
                logger.error(f"Speech recognition service error: {e}")
                return ""

        except ImportError:
            logger.warning("speech_recognition not installed, using placeholder")
            return ""
        except Exception as e:
            logger.error(f"Speech-to-text error: {e}")
            return ""

    def text_to_speech(self, text: str, language: str = "en") -> Optional[bytes]:
        try:
            from gtts import gTTS
            import io

            lang_code = language if language in self.supported_languages else "en"
            tts = gTTS(text=text, lang=lang_code, slow=False)
            buffer = io.BytesIO()
            tts.write_to_fp(buffer)
            buffer.seek(0)
            return buffer.getvalue()

        except ImportError:
            logger.warning("gTTS not installed, returning None")
            return None
        except Exception as e:
            logger.error(f"Text-to-speech error: {e}")
            return None

    def get_supported_languages(self) -> dict:
        return self.supported_languages


voice_service = VoiceService()
