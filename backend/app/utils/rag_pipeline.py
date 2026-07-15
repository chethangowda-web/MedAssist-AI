from app.core.qdrant import ensure_collection_exists, index_document
from typing import List, Dict, Any
import json
import os

MEDICAL_GUIDELINES = [
    {
        "id": "who_hypertension_001",
        "category": "who_guidelines",
        "source": "WHO Hypertension Guidelines",
        "text": """WHO guidelines for hypertension management recommend maintaining blood pressure below 140/90 mmHg 
for most adults. Lifestyle modifications include reducing salt intake to less than 5g per day, maintaining regular 
physical activity of at least 150 minutes per week, maintaining healthy body weight, limiting alcohol consumption, 
and quitting tobacco use. Pharmacological treatment should be initiated for persistent BP ≥140/90 mmHg.""",
    },
    {
        "id": "who_diabetes_001",
        "category": "who_guidelines",
        "source": "WHO Diabetes Guidelines",
        "text": """WHO guidelines for diabetes management recommend maintaining fasting blood glucose below 126 mg/dL 
and HbA1c below 7%. Regular screening is recommended for adults over 40 years and those with BMI >25 with additional 
risk factors. Management includes dietary modification, regular physical activity, glucose monitoring, and 
pharmacological intervention when needed.""",
    },
    {
        "id": "who_maternal_001",
        "category": "who_guidelines",
        "source": "WHO Maternal Health Guidelines",
        "text": """WHO recommends at least 8 antenatal care contacts throughout pregnancy. First trimester contact should 
occur by 12 weeks. Essential interventions include iron and folic acid supplementation, tetanus toxoid vaccination, 
blood pressure monitoring, urine testing for protein, and syphilis screening. Skilled birth attendance is crucial 
for safe delivery.""",
    },
    {
        "id": "who_malnutrition_001",
        "category": "who_guidelines",
        "source": "WHO Malnutrition Guidelines",
        "text": """WHO defines malnutrition as BMI <18.5 in adults. Severe acute malnutrition (SAM) is defined by 
MUAC <115mm or weight-for-height Z-score <-3. Management includes therapeutic feeding programs, micronutrient 
supplementation, treatment of underlying infections, and nutritional counseling. Ready-to-use therapeutic foods 
(RUTF) are recommended for community-based management of SAM.""",
    },
    {
        "id": "who_child_immunization_001",
        "category": "who_guidelines",
        "source": "WHO Immunization Guidelines",
        "text": """WHO Expanded Programme on Immunization (EPI) recommends: BCG at birth, OPV at birth/6/10/14 weeks, 
Pentavalent (DPT-HepB-Hib) at 6/10/14 weeks, Rotavirus at 6/10/14 weeks, PCV at 6/10/14 weeks, IPV at 14 weeks, 
Measles-Rubella at 9-12 months and 16-24 months, JE in endemic areas, Vitamin A at 9-12 months and 16-24 months.""",
    },
    {
        "id": "who_tb_001",
        "category": "who_guidelines",
        "source": "WHO Tuberculosis Guidelines",
        "text": """WHO guidelines for tuberculosis management recommend DOTS strategy. Standard treatment regimen: 
2 months of Isoniazid, Rifampicin, Pyrazinamide, Ethambutol followed by 4 months of Isoniazid and Rifampicin. 
For MDR-TB, longer treatment regimens of 18-20 months are recommended. Contact screening is essential.""",
    },
    {
        "id": "ayushman_bharat_details_001",
        "category": "government_scheme",
        "source": "Ayushman Bharat PM-JAY",
        "text": """Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) is the world's largest health insurance 
scheme providing coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization. 
It covers 1,949 procedures including 27 specialties. Eligible families are identified based on SECC 2011 database. 
It provides cashless treatment across empaneled hospitals nationwide. Beneficiaries can call helpline 14555.""",
    },
    {
        "id": "pm_matru_vandana_details_001",
        "category": "government_scheme",
        "source": "Pradhan Mantri Matru Vandana Yojana",
        "text": """Pradhan Mantri Matru Vandana Yojana (PMMVY) is a cash transfer scheme for pregnant and lactating 
women aged 19 years and above for their first living child. The scheme provides ₹5,000 in three installments: 
₹1,000 at early pregnancy registration, ₹2,000 at 6 months of pregnancy, and ₹2,000 after childbirth registration. 
The scheme aims to compensate for wage loss and improve health-seeking behavior.""",
    },
    {
        "id": "who_emergency_triage_001",
        "category": "who_guidelines",
        "source": "WHO Emergency Triage",
        "text": """WHO Emergency Triage Assessment and Treatment (ETAT) guidelines recommend immediate assessment of 
airway, breathing, circulation, consciousness, and dehydration (ABCD). Emergency signs include: obstructed breathing, 
severe respiratory distress, signs of shock, unconsciousness, convulsions, and severe dehydration. Patients with 
any emergency sign require immediate life-saving treatment and referral to higher care facility.""",
    },
    {
        "id": "icds_details_001",
        "category": "government_scheme",
        "source": "Integrated Child Development Services",
        "text": """Integrated Child Development Services (ICDS) is India's flagship nutrition program providing 
supplementary nutrition, immunization, health check-ups, referral services, pre-school education, and nutrition 
education. Services are provided through Anganwadi Centers for children under 6 years, pregnant women, lactating 
mothers, and adolescent girls. Take-home rations are provided for children under 3 years.""",
    },
]

def seed_medical_knowledge():
    ensure_collection_exists()
    count = 0
    for doc in MEDICAL_GUIDELINES:
        try:
            index_document(
                doc_id=doc["id"],
                text=doc["text"],
                metadata={
                    "category": doc["category"],
                    "source": doc["source"],
                    "doc_id": doc["id"],
                },
            )
            count += 1
        except Exception as e:
            print(f"Error indexing {doc['id']}: {e}")
    return {"indexed": count, "total": len(MEDICAL_GUIDELINES)}

if __name__ == "__main__":
    result = seed_medical_knowledge()
    print(f"Seeded {result['indexed']}/{result['total']} documents to Qdrant")
