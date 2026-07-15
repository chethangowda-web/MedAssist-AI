export const ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'healthcare_worker', label: 'Healthcare Worker' },
  { value: 'asha_worker', label: 'ASHA Worker' },
] as const;

export const REMINDER_TYPES = [
  { value: 'vaccination', label: 'Vaccination', icon: 'Syringe' },
  { value: 'medicine', label: 'Medicine', icon: 'Pill' },
  { value: 'follow_up', label: 'Follow-up Visit', icon: 'CalendarCheck' },
  { value: 'pregnancy_checkup', label: 'Pregnancy Checkup', icon: 'Baby' },
  { value: 'child_health', label: 'Child Health Visit', icon: 'Heart' },
  { value: 'general', label: 'General', icon: 'Bell' },
] as const;

export const VISIT_TYPES = [
  { value: 'general', label: 'General Checkup' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'prenatal', label: 'Prenatal' },
  { value: 'postnatal', label: 'Postnatal' },
  { value: 'child_health', label: 'Child Health' },
] as const;

export const REPORT_TYPES = [
  { value: 'patient_summary', label: 'Patient Summary' },
  { value: 'medical_report', label: 'Medical Report' },
  { value: 'referral_letter', label: 'Referral Letter' },
  { value: 'visit_report', label: 'Visit Report' },
] as const;

export const RISK_CONDITIONS = [
  { id: 'hypertension', label: 'High Blood Pressure' },
  { id: 'diabetes', label: 'Diabetes Risk' },
  { id: 'pregnancy', label: 'Pregnancy Risk' },
  { id: 'malnutrition', label: 'Malnutrition' },
  { id: 'emergency', label: 'Emergency Conditions' },
] as const;

export const AGENTS = [
  {
    id: 'patient_registration',
    name: 'Patient Registration',
    description: 'Registers patients from natural language or structured data',
    icon: 'UserPlus',
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'risk_assessment',
    name: 'Risk Assessment',
    description: 'Analyzes medical risks using Gemini AI',
    icon: 'AlertTriangle',
    color: 'from-red-400 to-red-600',
  },
  {
    id: 'knowledge',
    name: 'Medical Knowledge',
    description: 'Searches WHO guidelines & medical documents via RAG',
    icon: 'BookOpen',
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 'reminder',
    name: 'Reminder Scheduler',
    description: 'Manages vaccination & follow-up schedules',
    icon: 'Bell',
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 'report',
    name: 'Report Generator',
    description: 'Creates PDF reports & referral letters',
    icon: 'FileText',
    color: 'from-amber-400 to-amber-600',
  },
  {
    id: 'government_scheme',
    name: 'Scheme Advisor',
    description: 'Recommends Ayushman Bharat & other schemes',
    icon: 'ShieldCheck',
    color: 'from-cyan-400 to-cyan-600',
  },
] as const;

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/patients', label: 'Patients', icon: 'Users' },
  { path: '/visits', label: 'Visits', icon: 'Stethoscope' },
  { path: '/agents', label: 'AI Agents', icon: 'Brain' },
  { path: '/reminders', label: 'Reminders', icon: 'Bell' },
  { path: '/reports', label: 'Reports', icon: 'FileText' },
  { path: '/schemes', label: 'Schemes', icon: 'ShieldCheck' },
  { path: '/emergency', label: 'Emergency', icon: 'AlertTriangle' },
  { path: '/voice', label: 'Voice', icon: 'Mic' },
  { path: '/ocr', label: 'OCR Scan', icon: 'ScanLine' },
  { path: '/medicine', label: 'Medicine', icon: 'Pill' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
] as const;
