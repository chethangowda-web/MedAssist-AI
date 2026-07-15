import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@store/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; role: string }) =>
    api.post('/auth/register', data),
  firebaseAuth: (idToken: string) =>
    api.post('/auth/firebase', { id_token: idToken }),
  getProfile: () =>
    api.get('/auth/profile'),
};

export const patientApi = {
  register: (data: any) =>
    api.post('/patients/register', data),
  registerFromText: (text: string) =>
    api.post('/patients/register-from-text', { text }),
  getById: (id: string) =>
    api.get(`/patients/${id}`),
  update: (id: string, data: any) =>
    api.put(`/patients/${id}`, data),
  list: (params?: { page?: number; pageSize?: number; search?: string }) =>
    api.get('/patients/', { params }),
  delete: (id: string) =>
    api.delete(`/patients/${id}`),
  assessRisk: (id: string) =>
    api.post(`/patients/${id}/assess-risk`),
};

export const visitApi = {
  create: (data: any) =>
    api.post('/visits/', data),
  getById: (id: string) =>
    api.get(`/visits/${id}`),
  list: (params?: { patientId?: string; page?: number; pageSize?: number }) =>
    api.get('/visits/', { params }),
};

export const agentApi = {
  assessRisk: (data: any) =>
    api.post('/agents/assess-risk', data),
  searchKnowledge: (query: string, topK?: number) =>
    api.post('/agents/search-knowledge', { query, top_k: topK || 5 }),
  recommendSchemes: (patientId: string, profile?: any) =>
    api.post('/agents/recommend-schemes', { patient_id: patientId, patient_profile: profile }),
  manageReminders: (data: any) =>
    api.post('/agents/reminders', data),
  generateReport: (data: any) =>
    api.post('/agents/generate-report', data),
  runCoordinator: (task: string, patientId?: string, data?: any) =>
    api.post('/agents/coordinator', { task, patient_id: patientId, data }),
};

export const reportApi = {
  generate: (data: any) =>
    api.post('/reports/generate', data),
  getById: (id: string) =>
    api.get(`/reports/${id}`),
  list: (params?: { patientId?: string }) =>
    api.get('/reports/', { params }),
  downloadPdf: (id: string) =>
    api.get(`/reports/${id}/pdf`, { responseType: 'blob' }),
};

export const voiceApi = {
  speechToText: (audio: Blob, language = 'en') => {
    const formData = new FormData();
    formData.append('audio', audio, 'recording.webm');
    formData.append('language', language);
    return api.post('/voice/speech-to-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  textToSpeech: (text: string, language = 'en') =>
    api.post('/voice/text-to-speech', { text, language }, { responseType: 'blob' }),
  getLanguages: () =>
    api.get('/voice/languages'),
};

export const ocrApi = {
  extractText: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ocr/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  extractPrescription: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ocr/prescription', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadDocument: (file: File, patientId: string, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', patientId);
    formData.append('document_type', documentType);
    return api.post('/ocr/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const emergencyApi = {
  getContacts: () =>
    api.get('/emergency/contacts'),
  getProtocol: (situation: string) =>
    api.get(`/emergency/protocol/${situation}`),
  getNearbyHospitals: (lat: number, lng: number, radius = 5000) =>
    api.get(`/emergency/nearby-hospitals?latitude=${lat}&longitude=${lng}&radius=${radius}`),
  triage: (symptoms: string[], vitalSigns: any) =>
    api.post('/emergency/triage', { symptoms, vital_signs: vitalSigns }),
  sendAlert: (data: any) =>
    api.post('/emergency/alert', data),
  listProtocols: () =>
    api.get('/emergency/protocols'),
};

export const medicineApi = {
  search: (name: string) =>
    api.get(`/medicine/search?name=${encodeURIComponent(name)}`),
  identify: (text: string) =>
    api.post('/medicine/identify', { text }),
  checkInteractions: (medicines: string[]) =>
    api.post('/medicine/check-interactions', { medicines }),
  lookupBarcode: (barcode: string) =>
    api.get(`/medicine/barcode/${barcode}`),
  listCommon: () =>
    api.get('/medicine/common'),
};

export const dashboardApi = {
  getStats: () =>
    api.get('/dashboard/stats'),
  getActivity: () =>
    api.get('/dashboard/activity'),
};

export default api;
