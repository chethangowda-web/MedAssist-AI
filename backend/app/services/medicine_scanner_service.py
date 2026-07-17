import logging
from typing import Dict, Any, List, Optional
import re

logger = logging.getLogger(__name__)


class MedicineScannerService:
    def __init__(self):
        self.common_medicines = {
            "paracetamol": {
                "generic_name": "Paracetamol",
                "brand_names": ["Crocin", "Calpol", "Tylenol", "PCM", "Dolo"],
                "category": "analgesic_antipyretic",
                "uses": ["Fever", "Mild to moderate pain", "Headache", "Body ache"],
                "common_dosage": "500-650mg every 4-6 hours",
                "max_daily": "3000mg",
                "side_effects": ["Nausea", "Rash", "Liver damage (overdose)"],
                "contraindications": ["Liver disease", "Alcoholism"],
                "storage": "Store below 30°C, protect from light",
            },
            "amlodipine": {
                "generic_name": "Amlodipine",
                "brand_names": ["Amlodac", "Amlopres", "Norvasc"],
                "category": "calcium_channel_blocker",
                "uses": ["High blood pressure", "Angina", "Coronary artery disease"],
                "common_dosage": "2.5-10mg once daily",
                "max_daily": "10mg",
                "side_effects": ["Ankle swelling", "Headache", "Dizziness", "Flushing"],
                "contraindications": ["Severe hypotension", "Aortic stenosis"],
                "storage": "Store at room temperature, protect from light",
            },
            "metformin": {
                "generic_name": "Metformin",
                "brand_names": ["Glycomet", "Glucophage", "Riomet"],
                "category": "antidiabetic",
                "uses": ["Type 2 diabetes mellitus", "PCOS", "Prediabetes"],
                "common_dosage": "500-2000mg daily in divided doses",
                "max_daily": "2550mg",
                "side_effects": ["Nausea", "Diarrhea", "Metallic taste", "Vitamin B12 deficiency"],
                "contraindications": ["Renal failure", "Liver disease", "Alcoholism"],
                "storage": "Store below 25°C",
            },
            "atenolol": {
                "generic_name": "Atenolol",
                "brand_names": ["Aten", "Tenormin", "Betaplan"],
                "category": "beta_blocker",
                "uses": ["Hypertension", "Angina", "Arrhythmia", "Migraine prevention"],
                "common_dosage": "25-100mg once daily",
                "max_daily": "100mg",
                "side_effects": ["Fatigue", "Cold extremities", "Bradycardia", "Sleep disturbances"],
                "contraindications": ["Asthma", "Heart block", "Severe bradycardia"],
                "storage": "Store at room temperature",
            },
            "omeprazole": {
                "generic_name": "Omeprazole",
                "brand_names": ["Omez", "Prilosec", "Losec"],
                "category": "proton_pump_inhibitor",
                "uses": ["GERD", "Gastric ulcer", "Duodenal ulcer", "Zollinger-Ellison syndrome"],
                "common_dosage": "20-40mg once daily before food",
                "max_daily": "40mg",
                "side_effects": ["Headache", "Nausea", "Vitamin B12 deficiency", "Bone fracture risk"],
                "contraindications": ["Long-term use without monitoring"],
                "storage": "Store below 25°C",
            },
            "azithromycin": {
                "generic_name": "Azithromycin",
                "brand_names": ["Azithral", "Zithromax", "Azee"],
                "category": "antibiotic_macrolide",
                "uses": ["Respiratory infections", "Skin infections", "STDs", "Typhoid"],
                "common_dosage": "500mg once daily for 3-5 days",
                "max_daily": "500mg",
                "side_effects": ["Nausea", "Diarrhea", "Abdominal pain", "QT prolongation"],
                "contraindications": ["QT prolongation", "Severe liver disease"],
                "storage": "Store at room temperature",
            },
            "ibuprofen": {
                "generic_name": "Ibuprofen",
                "brand_names": ["Brufen", "Advil", "Motrin", "Ibujesic"],
                "category": "nsaid",
                "uses": ["Pain", "Inflammation", "Fever", "Arthritis", "Menstrual cramps"],
                "common_dosage": "200-400mg every 6-8 hours",
                "max_daily": "1200mg (OTC), 3200mg (Prescription)",
                "side_effects": ["Gastric irritation", "Heartburn", "GI bleeding", "Kidney damage"],
                "contraindications": ["Peptic ulcer", "Severe kidney disease", "Third trimester pregnancy"],
                "storage": "Store below 30°C",
            },
        }

        self.barcode_prefixes = {
            "890": "India",
            "8901": "India - medicine",
        }

    async def search_by_barcode(self, barcode: str) -> Optional[Dict[str, Any]]:
        try:
            import aiohttp

            url = f"https://world.openfoodfacts.org/api/v3/product/{barcode}.json"
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get("status") == 1:
                            product = data["product"]
                            return {
                                "barcode": barcode,
                                "product_name": product.get("product_name", ""),
                                "brand": product.get("brands", ""),
                                "category": product.get("categories", ""),
                                "ingredients": product.get("ingredients_text", ""),
                                "nutriments": product.get("nutriments", {}),
                            }

        except ImportError:
            logger.warning("aiohttp not available for barcode lookup")
        except Exception as e:
            logger.error(f"Barcode lookup error: {e}")

        return None

    def identify_medicine(self, text: str) -> List[Dict[str, Any]]:
        identified = []
        text_lower = text.lower()

        for generic_name, info in self.common_medicines.items():
            if generic_name in text_lower:
                identified.append({
                    "medicine": info,
                    "matched_by": "generic_name",
                    "confidence": 0.95,
                })
                continue

            for brand in info["brand_names"]:
                if brand.lower() in text_lower:
                    identified.append({
                        "medicine": info,
                        "matched_by": f"brand_name: {brand}",
                        "confidence": 0.9,
                    })
                    break

        dosage_pattern = r"(\d+)\s*(mg|ml|mcg|g)\b"
        for match in re.finditer(dosage_pattern, text, re.IGNORECASE):
            for item in identified:
                if "dosage_info" not in item:
                    item["dosage_info"] = []
                item["dosage_info"].append(f"{match.group(1)}{match.group(2)}")

        return identified

    def get_medicine_info(self, name: str) -> Optional[Dict[str, Any]]:
        name_lower = name.lower()

        for generic_name, info in self.common_medicines.items():
            if generic_name == name_lower:
                return info
            for brand in info["brand_names"]:
                if brand.lower() == name_lower:
                    return info

        return None

    def check_drug_interaction(self, medicines: List[str]) -> Dict[str, Any]:
        known_interactions = [
            {
                "medicines": ["amlodipine", "atenolol"],
                "severity": "moderate",
                "effect": "Additive hypotensive effect - monitor blood pressure",
                "recommendation": "Monitor BP regularly, may need dose adjustment",
            },
            {
                "medicines": ["ibuprofen", "aspirin"],
                "severity": "high",
                "effect": "Increased risk of GI bleeding",
                "recommendation": "Avoid concurrent use, use alternative painkiller",
            },
            {
                "medicines": ["metformin", "atenolol"],
                "severity": "moderate",
                "effect": "Beta-blockers may mask hypoglycemia symptoms",
                "recommendation": "Monitor blood sugar regularly",
            },
            {
                "medicines": ["ibuprofen", "metformin"],
                "severity": "moderate",
                "effect": "NSAIDs may reduce metformin effectiveness",
                "recommendation": "Monitor blood glucose levels",
            },
            {
                "medicines": ["omeprazole", "metformin"],
                "severity": "minor",
                "effect": "PPI may slightly reduce metformin absorption",
                "recommendation": "Generally safe, monitor if symptoms occur",
            },
        ]

        results = []
        meds_lower = [m.lower() for m in medicines]

        for interaction in known_interactions:
            matched = all(m in meds_lower for m in interaction["medicines"])
            if matched:
                results.append(interaction)

        return {
            "medicines": medicines,
            "interactions_found": len(results),
            "interactions": results,
            "safe": len(results) == 0,
        }


medicine_scanner_service = MedicineScannerService()
