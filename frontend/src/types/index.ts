export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number | null;
  dateOfBirth: string | null;
  gender: string;
  phone: string;
  alternatePhone: string;
  email: string;
  address: Address;
  aadharNumber: string;
  bloodGroup: string;
  medicalHistory: MedicalHistory;
  vitalSigns: VitalSigns;
  registeredBy: string;
  registeredAt: string;
  updatedAt: string;
  isActive: boolean;
  tags: string[];
  notes: string;
  profileImageUrl: string;
  emergencyContact: string;
  languagePreference: string;
  riskScore?: number;
  riskLevel?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  village: string;
}

export interface MedicalHistory {
  conditions: string[];
  surgeries: string[];
  allergies: string[];
  medications: string[];
  familyHistory: string[];
}

export interface VitalSigns {
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  heartRate: number | null;
  temperature: number | null;
  oxygenSaturation: number | null;
  bloodSugar: number | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
}

export interface Visit {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  visitType: string;
  chiefComplaint: string;
  symptoms: Symptom[];
  vitalSigns: Record<string, any>;
  diagnosis: Diagnosis[];
  prescriptions: Prescription[];
  investigations: string[];
  notes: string;
  referredTo: string;
  conductedBy: string;
  visitDate: string;
  createdAt: string;
  followUpDate: string | null;
  isEmergency: boolean;
  riskScore: number | null;
  riskLevel: string;
  status: string;
}

export interface Symptom {
  name: string;
  severity: string;
  duration: string;
  notes: string;
}

export interface Diagnosis {
  condition: string;
  icdCode: string;
  confidence: number;
  notes: string;
}

export interface Prescription {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

export interface Reminder {
  id: string;
  reminderId: string;
  patientId: string;
  patientName: string;
  assignedTo: string;
  reminderType: string;
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  isRecurring: boolean;
  recurringInterval: string;
  status: string;
  priority: string;
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
  channel: string;
}

export interface Report {
  id: string;
  reportId: string;
  patientId: string;
  patientName: string;
  reportType: string;
  title: string;
  content: Record<string, any>;
  summary: string;
  generatedBy: string;
  generatedAt: string;
  format: string;
  fileUrl: string;
  status: string;
}

export interface GovernmentScheme {
  id: string;
  schemeId: string;
  name: string;
  category: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  documentsRequired: string[];
  applicationProcess: string;
  websiteUrl: string;
  helpline: string;
  coverageAmount: string;
  validity: string;
  tags: string[];
  isActive: boolean;
}

export interface DashboardStats {
  totalPatients: number;
  totalVisits: number;
  pendingReminders: number;
  emergencyCases: number;
  highRiskPatients: number;
  criticalRiskPatients: number;
  totalReports: number;
  totalSchemes: number;
  recentPatients: Patient[];
  recentVisits: Visit[];
  today: string;
}

export interface ActivityItem {
  type: string;
  patientName: string;
  patientId: string;
  description: string;
  timestamp: string;
  riskLevel: string;
}

export interface RiskAssessment {
  patientId: string;
  overallRiskScore: number;
  riskLevel: string;
  assessments: RiskAssessmentItem[];
  recommendations: string[];
  emergencyWarning: boolean;
  emergencyReason: string | null;
}

export interface RiskAssessmentItem {
  condition: string;
  riskScore: number;
  riskLevel: string;
  reasoning: string;
  recommendations: string[];
}

export interface KnowledgeResult {
  results: KnowledgeItem[];
  totalFound: number;
}

export interface KnowledgeItem {
  id: string;
  score: number;
  text: string;
  metadata: Record<string, any>;
}

export interface SchemeRecommendation {
  schemeName: string;
  matchScore: number;
  eligibilityReason: string;
  benefits: string[];
  applicationSteps: string;
}

export interface ApiError {
  detail: string;
}

export type AgentStatus = 'idle' | 'processing' | 'success' | 'error';

export interface AgentState {
  name: string;
  status: AgentStatus;
  icon: string;
  description: string;
}

export interface EmergencyProtocol {
  situation: string;
  actions: string[];
  criticalWindow: string;
}

export interface NearbyHospital {
  name: string;
  address: string;
  rating: number;
  openNow: boolean | null;
  location?: { lat: number; lng: number };
  placeId?: string;
  distance?: string;
  emergency?: string;
}

export interface TriageResult {
  severityScore: number;
  triageLevel: string;
  alerts: string[];
  requiredActions: string[];
  recommendation: string;
  timestamp: string;
}

export interface Medicine {
  genericName: string;
  brandNames: string[];
  category: string;
  uses: string[];
  commonDosage: string;
  sideEffects: string[];
  contraindications: string[];
  storage: string;
}

export interface DrugInteraction {
  medicines: string[];
  severity: string;
  effect: string;
  recommendation: string;
}

export interface OcrResult {
  rawText: string;
  testResults: any[];
  medications: any[];
  diagnosis: any[];
  vitalSigns: Record<string, any>;
  patientInfo: Record<string, any>;
  labValues: Record<string, any>;
}

export interface AgentRegistry {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities: string[];
  runtime: string;
  model: string;
}

export interface AnalyticsData {
  totalPatients: number;
  totalVisits: number;
  totalReports: number;
  totalSchemes: number;
  pendingReminders: number;
  emergencyCases: number;
  weeklyTrend: { day: string; visits: number; patients: number }[];
  monthlyTrend: { month: string; patients: number; visits: number }[];
  riskDistribution: { name: string; value: number; color: string }[];
  visitTypeDistribution: { type: string; count: number }[];
  ageDistribution: { group: string; count: number }[];
}
