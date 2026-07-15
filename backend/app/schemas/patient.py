from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class AddressSchema(BaseModel):
    street: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""
    village: str = ""

class MedicalHistorySchema(BaseModel):
    conditions: List[str] = []
    surgeries: List[str] = []
    allergies: List[str] = []
    medications: List[str] = []
    family_history: List[str] = []

class VitalSignsSchema(BaseModel):
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[float] = None
    blood_sugar: Optional[float] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None

class PatientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    age: Optional[int] = Field(None, ge=0, le=200)
    date_of_birth: Optional[str] = None
    gender: str = Field(..., pattern="^(male|female|other)$")
    phone: str = Field(..., min_length=10, max_length=15)
    alternate_phone: Optional[str] = None
    email: Optional[str] = None
    address: AddressSchema = AddressSchema()
    aadhar_number: Optional[str] = None
    blood_group: Optional[str] = None
    medical_history: MedicalHistorySchema = MedicalHistorySchema()
    vital_signs: VitalSignsSchema = VitalSignsSchema()
    notes: str = ""
    emergency_contact: Optional[str] = None
    language_preference: str = "en"

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    date_of_birth: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[AddressSchema] = None
    blood_group: Optional[str] = None
    medical_history: Optional[MedicalHistorySchema] = None
    vital_signs: Optional[VitalSignsSchema] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    emergency_contact: Optional[str] = None
    language_preference: Optional[str] = None

class PatientResponse(BaseModel):
    id: str
    patient_id: str
    name: str
    age: Optional[int]
    date_of_birth: Optional[str]
    gender: str
    phone: str
    alternate_phone: str
    email: str
    address: AddressSchema
    aadhar_number: str
    blood_group: str
    medical_history: MedicalHistorySchema
    vital_signs: VitalSignsSchema
    registered_by: str
    registered_at: str
    updated_at: str
    is_active: bool
    tags: List[str]
    notes: str
    profile_image_url: str
    emergency_contact: str
    language_preference: str

class PatientListResponse(BaseModel):
    patients: List[PatientResponse]
    total: int
    page: int
    page_size: int

class NaturalLanguageRegistration(BaseModel):
    text: str = Field(..., min_length=10)
    registered_by: str = ""
