from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, inch
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from typing import Dict, Any, List
from datetime import datetime
import os

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()

    def setup_custom_styles(self):
        self.styles.add(ParagraphStyle(
            name="Title_MedAssist",
            fontName="Helvetica-Bold",
            fontSize=22,
            textColor=HexColor("#0EA5E9"),
            alignment=TA_CENTER,
            spaceAfter=6,
        ))
        self.styles.add(ParagraphStyle(
            name="SubTitle",
            fontName="Helvetica",
            fontSize=10,
            textColor=HexColor("#64748B"),
            alignment=TA_CENTER,
            spaceAfter=20,
        ))
        self.styles.add(ParagraphStyle(
            name="SectionHeader",
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=HexColor("#1E293B"),
            spaceBefore=15,
            spaceAfter=8,
            borderPadding=(0, 0, 4, 0),
        ))
        self.styles.add(ParagraphStyle(
            name="FieldLabel",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=HexColor("#475569"),
        ))
        self.styles.add(ParagraphStyle(
            name="FieldValue",
            fontName="Helvetica",
            fontSize=9,
            textColor=HexColor("#1E293B"),
            spaceAfter=4,
        ))
        self.styles.add(ParagraphStyle(
            name="Footer",
            fontName="Helvetica",
            fontSize=7,
            textColor=HexColor("#94A3B8"),
            alignment=TA_CENTER,
        ))

    def _build_header(self, title: str) -> List:
        elements = []
        elements.append(Paragraph("MedAssist AI", self.styles["Title_MedAssist"]))
        elements.append(Paragraph("AI-Powered Healthcare Assistant for Rural India", self.styles["SubTitle"]))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"<b>{title}</b>", ParagraphStyle(
            "ReportTitle", parent=self.styles["Normal"],
            fontSize=16, alignment=TA_CENTER,
            textColor=HexColor("#0F172A"), spaceAfter=15,
        )))
        elements.append(Spacer(1, 5))
        return elements

    def _build_patient_info_table(self, patient: Dict[str, Any]) -> Table:
        fields = [
            ("Patient ID", patient.get("patient_id", "N/A")),
            ("Name", patient.get("name", "N/A")),
            ("Age / DOB", f"{patient.get('age', 'N/A')} / {patient.get('date_of_birth', 'N/A')}"),
            ("Gender", patient.get("gender", "N/A")),
            ("Phone", patient.get("phone", "N/A")),
            ("Blood Group", patient.get("blood_group", "N/A")),
            ("Address", f"{patient.get('address', {}).get('village', '')}, {patient.get('address', {}).get('city', '')}"),
        ]
        data = []
        row = []
        for i, (label, value) in enumerate(fields):
            row.append(f"<b>{label}:</b> {value}")
            if (i + 1) % 2 == 0:
                data.append(row)
                row = []
        if row:
            data.append(row)

        col_widths = [260, 260]
        table = Table(data, colWidths=col_widths)
        table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("TEXTCOLOR", (0, 0), (-1, -1), HexColor("#1E293B")),
            ("BACKGROUND", (0, 0), (-1, -1), HexColor("#F8FAFC")),
            ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ]))
        return table

    def _build_vitals_table(self, vitals: Dict[str, Any]) -> Table:
        vital_fields = [
            ("BP Systolic", str(vitals.get("blood_pressure_systolic", "N/A")), "mmHg"),
            ("BP Diastolic", str(vitals.get("blood_pressure_diastolic", "N/A")), "mmHg"),
            ("Heart Rate", str(vitals.get("heart_rate", "N/A")), "bpm"),
            ("Temperature", str(vitals.get("temperature", "N/A")), "°F"),
            ("O₂ Saturation", str(vitals.get("oxygen_saturation", "N/A")), "%"),
            ("Blood Sugar", str(vitals.get("blood_sugar", "N/A")), "mg/dL"),
            ("Weight", str(vitals.get("weight", "N/A")), "kg"),
            ("Height", str(vitals.get("height", "N/A")), "cm"),
            ("BMI", str(vitals.get("bmi", "N/A")), ""),
        ]
        header = ["Vital Sign", "Value", "Unit"]
        data = [header]
        for name, value, unit in vital_fields:
            data.append([name, value, unit])

        table = Table(data, colWidths=[140, 100, 100])
        table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#0EA5E9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), white),
            ("TEXTCOLOR", (0, 1), (-1, -1), HexColor("#1E293B")),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#FFFFFF"), HexColor("#F8FAFC")]),
        ]))
        return table

    def _build_medical_history_table(self, history: Dict[str, Any]) -> Table:
        sections = []
        if history.get("conditions"):
            sections.append([Paragraph("<b>Medical Conditions</b>", self.styles["FieldLabel"]),
                             Paragraph(", ".join(history["conditions"]), self.styles["FieldValue"])])
        if history.get("allergies"):
            sections.append([Paragraph("<b>Allergies</b>", self.styles["FieldLabel"]),
                             Paragraph(", ".join(history["allergies"]), self.styles["FieldValue"])])
        if history.get("medications"):
            sections.append([Paragraph("<b>Medications</b>", self.styles["FieldLabel"]),
                             Paragraph(", ".join(history["medications"]), self.styles["FieldValue"])])
        if history.get("surgeries"):
            sections.append([Paragraph("<b>Surgeries</b>", self.styles["FieldLabel"]),
                             Paragraph(", ".join(history["surgeries"]), self.styles["FieldValue"])])

        if not sections:
            sections.append([Paragraph("No significant medical history recorded.", self.styles["FieldValue"]), ""])

        table = Table(sections, colWidths=[120, 220])
        table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        return table

    def _build_diagnosis_table(self, diagnoses: List[Dict[str, Any]]) -> Table:
        header = ["Condition", "ICD Code", "Confidence", "Notes"]
        data = [header]
        for d in diagnoses:
            data.append([
                d.get("condition", ""),
                d.get("icd_code", ""),
                f"{d.get('confidence', 0) * 100:.0f}%",
                d.get("notes", ""),
            ])
        table = Table(data, colWidths=[120, 80, 70, 170])
        table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#0EA5E9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), white),
            ("ALIGN", (2, 0), (2, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        return table

    def _build_prescription_table(self, prescriptions: List[Dict[str, Any]]) -> Table:
        header = ["Medicine", "Dosage", "Frequency", "Duration", "Notes"]
        data = [header]
        for p in prescriptions:
            data.append([
                p.get("medicine_name", ""),
                p.get("dosage", ""),
                p.get("frequency", ""),
                p.get("duration", ""),
                p.get("notes", ""),
            ])
        table = Table(data, colWidths=[90, 70, 80, 70, 130])
        table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#0EA5E9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), white),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#FFFFFF"), HexColor("#F8FAFC")]),
        ]))
        return table

    def _build_referral_letter(self, data: Dict[str, Any]) -> List:
        elements = []
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("<b>REFERRAL LETTER</b>", ParagraphStyle(
            "RefTitle", parent=self.styles["Normal"],
            fontSize=14, alignment=TA_CENTER,
            textColor=HexColor("#0EA5E9"), spaceAfter=15,
        )))
        elements.append(Spacer(1, 10))

        date_str = datetime.now().strftime("%d %B %Y")
        elements.append(Paragraph(f"Date: {date_str}", self.styles["FieldValue"]))
        elements.append(Paragraph(f"Referred To: {data.get('referred_to', 'N/A')}", self.styles["FieldValue"]))
        elements.append(Paragraph(f"Referred By: {data.get('conducted_by', 'N/A')}", self.styles["FieldValue"]))
        elements.append(Spacer(1, 10))

        elements.append(Paragraph("Reason for Referral:", self.styles["SectionHeader"]))
        elements.append(Paragraph(data.get("chief_complaint", "N/A"), self.styles["FieldValue"]))
        elements.append(Spacer(1, 10))

        if data.get("diagnosis"):
            elements.append(Paragraph("Diagnosis:", self.styles["SectionHeader"]))
            elements.append(self._build_diagnosis_table(data["diagnosis"]))

        elements.append(Paragraph("Clinical Notes:", self.styles["SectionHeader"]))
        elements.append(Paragraph(data.get("notes", "N/A"), self.styles["FieldValue"]))

        return elements

    def generate_patient_summary(self, patient: Dict[str, Any], visits: List[Dict[str, Any]] = None) -> bytes:
        from io import BytesIO
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=20*mm,
            bottomMargin=20*mm,
            leftMargin=20*mm,
            rightMargin=20*mm,
        )

        elements = []
        elements.extend(self._build_header("Patient Summary Report"))
        elements.append(self._build_patient_info_table(patient))
        elements.append(Spacer(1, 10))

        if patient.get("vital_signs"):
            elements.append(Paragraph("Vital Signs", self.styles["SectionHeader"]))
            elements.append(self._build_vitals_table(patient["vital_signs"]))
            elements.append(Spacer(1, 10))

        if patient.get("medical_history"):
            elements.append(Paragraph("Medical History", self.styles["SectionHeader"]))
            elements.append(self._build_medical_history_table(patient["medical_history"]))
            elements.append(Spacer(1, 10))

        if visits:
            elements.append(PageBreak())
            elements.append(Paragraph("Visit History", self.styles["SectionHeader"]))
            for i, visit in enumerate(visits[:5], 1):
                elements.append(Paragraph(f"Visit #{i} - {visit.get('visit_date', 'N/A')}", ParagraphStyle(
                    "VisitTitle", parent=self.styles["Normal"],
                    fontSize=10, textColor=HexColor("#0EA5E9"),
                    spaceBefore=8, spaceAfter=4,
                )))
                elements.append(Paragraph(f"<b>Complaint:</b> {visit.get('chief_complaint', 'N/A')}", self.styles["FieldValue"]))
                if visit.get("diagnosis"):
                    for d in visit["diagnosis"]:
                        elements.append(Paragraph(f"• {d.get('condition', '')} ({d.get('icd_code', '')})", self.styles["FieldValue"]))

        elements.append(Spacer(1, 30))
        elements.append(Paragraph(f"Generated by MedAssist AI • {datetime.now().strftime('%d %B %Y %H:%M')}", self.styles["Footer"]))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_referral_letter(self, data: Dict[str, Any]) -> bytes:
        from io import BytesIO
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4,
            topMargin=20*mm, bottomMargin=20*mm,
            leftMargin=25*mm, rightMargin=25*mm,
        )
        elements = []
        elements.extend(self._build_header("Medical Referral Letter"))
        elements.extend(self._build_referral_letter(data))
        elements.append(Spacer(1, 30))
        elements.append(Paragraph(f"Generated by MedAssist AI • {datetime.now().strftime('%d %B %Y %H:%M')}", self.styles["Footer"]))
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_medical_report(self, report_type: str, data: Dict[str, Any]) -> bytes:
        if report_type == "patient_summary":
            return self.generate_patient_summary(data)
        elif report_type == "referral_letter":
            return self.generate_referral_letter(data)
        else:
            return self.generate_patient_summary(data)

pdf_generator = PDFGenerator()
