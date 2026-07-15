import logging
from typing import Dict, Any, Optional, List
import re

logger = logging.getLogger(__name__)


class OCRService:
    def __init__(self):
        self.medical_keywords = {
            "bp": "blood_pressure",
            "sugar": "blood_sugar",
            "hb": "hemoglobin",
            "wbc": "white_blood_cells",
            "rbc": "red_blood_cells",
            "platelets": "platelets",
            "cholesterol": "cholesterol",
            "creatinine": "creatinine",
            "bilirubin": "bilirubin",
            "albumin": "albumin",
        }

    def extract_text_from_image(self, image_bytes: bytes, filename: str = "") -> str:
        try:
            import pytesseract
            from PIL import Image
            import io

            image = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(image, lang="eng+hin")
            return text.strip()

        except ImportError:
            logger.warning("pytesseract not installed, trying easyocr")
            return self._extract_with_easyocr(image_bytes)
        except Exception as e:
            logger.error(f"OCR extraction error: {e}")
            return ""

    def _extract_with_easyocr(self, image_bytes: bytes) -> str:
        try:
            import easyocr
            import numpy as np
            from PIL import Image
            import io

            reader = easyocr.Reader(["en", "hi"])
            image = Image.open(io.BytesIO(image_bytes))
            results = reader.readtext(np.array(image))
            text = " ".join([result[1] for result in results])
            return text.strip()

        except ImportError:
            logger.error("No OCR library available (pytesseract or easyocr)")
            return ""
        except Exception as e:
            logger.error(f"EasyOCR error: {e}")
            return ""

    def parse_medical_report(self, text: str) -> Dict[str, Any]:
        parsed = {
            "raw_text": text,
            "test_results": [],
            "medications": [],
            "diagnosis": [],
            "vital_signs": {},
            "patient_info": {},
            "lab_values": {},
        }

        patterns = {
            "patient_name": r"(?:Patient|Name|Pt\.?)\s*[:\-]?\s*([A-Za-z\s]+?)(?:\n|,|Age|\d)",
            "age": r"(?:Age|aged)\s*[:\-]?\s*(\d+)\s*(?:years|yr|y)",
            "date": r"(?:Date|Dated?)\s*[:\-]?\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
        }

        for key, pattern in patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                parsed["patient_info"][key] = match.group(1).strip()

        vital_patterns = {
            "blood_pressure": r"(?:BP|Blood\s*Pressure)\s*[:\-]?\s*(\d{2,3})\s*[/\\]\s*(\d{2,3})",
            "heart_rate": r"(?:HR|Heart\s*Rate|Pulse)\s*[:\-]?\s*(\d{2,3})",
            "temperature": r"(?:Temp|Temperature)\s*[:\-]?\s*(\d{2,3}\.?\d*)",
            "oxygen_saturation": r"(?:SpO2|O2\s*Sat|Oxygen)\s*[:\-]?\s*(\d{2,3})",
            "blood_sugar": r"(?:Sugar|Blood\s*Sugar|Glucose)\s*[:\-]?\s*(\d{2,3})",
        }

        for key, pattern in vital_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if key == "blood_pressure":
                    parsed["vital_signs"]["systolic"] = int(match.group(1))
                    parsed["vital_signs"]["diastolic"] = int(match.group(2))
                elif key == "temperature":
                    parsed["vital_signs"][key] = float(match.group(1))
                else:
                    parsed["vital_signs"][key] = int(match.group(1))

        lab_patterns = [
            (r"(?:Hb|Hemoglobin)\s*[:\-]?\s*(\d+\.?\d*)", "hemoglobin", "g/dL"),
            (r"(?:WBC|White\s*Blood\s*Cells)\s*[:\-]?\s*(\d+\.?\d*)", "wbc", "cells/mcL"),
            (r"(?:RBC|Red\s*Blood\s*Cells)\s*[:\-]?\s*(\d+\.?\d*)", "rbc", "million/mcL"),
            (r"Platelets?\s*[:\-]?\s*(\d+\.?\d*)", "platelets", "K/mcL"),
            (r"(?:Cholesterol|Total\s*Cholesterol)\s*[:\-]?\s*(\d+)", "cholesterol", "mg/dL"),
            (r"Creatinine\s*[:\-]?\s*(\d+\.?\d*)", "creatinine", "mg/dL"),
            (r"Bilirubin\s*[:\-]?\s*(\d+\.?\d*)", "bilirubin", "mg/dL"),
        ]

        for pattern, key, unit in lab_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                value = float(match.group(1))
                parsed["lab_values"][key] = {"value": value, "unit": unit}

        medicine_pattern = r"(?:Tab|Capsule|Syrup|Injection|Medicine|Drug)\s*[:\-]?\s*([A-Za-z\s]+?)\s*(\d+\s*mg|ml)?"
        for match in re.finditer(medicine_pattern, text, re.IGNORECASE):
            medicine = {"name": match.group(1).strip()}
            if match.group(2):
                medicine["dosage"] = match.group(2).strip()
            parsed["medications"].append(medicine)

        return parsed

    def extract_prescription(self, image_bytes: bytes) -> Dict[str, Any]:
        text = self.extract_text_from_image(image_bytes)
        return self.parse_medical_report(text)


ocr_service = OCRService()
