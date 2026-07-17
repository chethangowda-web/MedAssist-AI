import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { EmptyState } from '@components/ui/EmptyState';
import { patientApi } from '@services/api';
import { useDebounce } from '@hooks/useDebounce';
import { formatDate, getInitials, getRiskBadgeColor, truncate } from '@utils/helpers';
import {
  Plus, Search, UserPlus, Mic, Activity, AlertTriangle,
  Mail, Phone, MapPin, Calendar, Droplets, Heart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Patient } from '@typings/index';

function PatientRegistrationForm({ onSuccess, onCancel }: { onSuccess: (id?: string) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: '', age: '', dateOfBirth: '', gender: 'male', phone: '',
    alternatePhone: '', email: '', aadharNumber: '', bloodGroup: '',
    emergencyContact: '', notes: '', languagePreference: 'en',
    addressStreet: '', addressCity: '', addressState: '', addressPincode: '', addressVillage: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        date_of_birth: form.dateOfBirth || undefined,
        gender: form.gender,
        phone: form.phone,
        alternate_phone: form.alternatePhone || undefined,
        email: form.email || undefined,
        aadhar_number: form.aadharNumber || undefined,
        blood_group: form.bloodGroup || undefined,
        emergency_contact: form.emergencyContact || undefined,
        notes: form.notes || undefined,
        language_preference: form.languagePreference,
        address: {
          street: form.addressStreet,
          city: form.addressCity,
          state: form.addressState,
          pincode: form.addressPincode,
          village: form.addressVillage,
        },
      };
      const res = await patientApi.register(payload);
      const patientId = res.data?.patientId || res.data?.patient_id || res.data?.id;
      toast.success('Patient registered successfully!');
      onSuccess(patientId);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Full Name *</label>
          <input className={inputClass} value={form.name} onChange={handleChange('name')} placeholder="Patient's full name" required />
        </div>
        <div>
          <label className={labelClass}>Age</label>
          <input className={inputClass} type="number" value={form.age} onChange={handleChange('age')} placeholder="Age" min="0" max="200" />
        </div>
        <div>
          <label className={labelClass}>Date of Birth</label>
          <input className={inputClass} type="date" value={form.dateOfBirth} onChange={handleChange('dateOfBirth')} />
        </div>
        <div>
          <label className={labelClass}>Gender *</label>
          <select className={inputClass} value={form.gender} onChange={handleChange('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Phone *</label>
          <input className={inputClass} value={form.phone} onChange={handleChange('phone')} placeholder="10-digit phone number" required />
        </div>
        <div>
          <label className={labelClass}>Alternate Phone</label>
          <input className={inputClass} value={form.alternatePhone} onChange={handleChange('alternatePhone')} placeholder="Alternate contact" />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input className={inputClass} type="email" value={form.email} onChange={handleChange('email')} placeholder="email@example.com" />
        </div>
        <div>
          <label className={labelClass}>Aadhar Number</label>
          <input className={inputClass} value={form.aadharNumber} onChange={handleChange('aadharNumber')} placeholder="12-digit Aadhar" />
        </div>
        <div>
          <label className={labelClass}>Blood Group</label>
          <select className={inputClass} value={form.bloodGroup} onChange={handleChange('bloodGroup')}>
            <option value="">Select</option>
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Emergency Contact</label>
          <input className={inputClass} value={form.emergencyContact} onChange={handleChange('emergencyContact')} placeholder="Emergency phone" />
        </div>
        <div>
          <label className={labelClass}>Language Preference</label>
          <select className={inputClass} value={form.languagePreference} onChange={handleChange('languagePreference')}>
            <option value="en">English</option><option value="hi">Hindi</option>
            <option value="bn">Bengali</option><option value="te">Telugu</option>
            <option value="ta">Tamil</option><option value="mr">Marathi</option>
            <option value="gu">Gujarati</option><option value="kn">Kannada</option>
            <option value="ml">Malayalam</option><option value="pa">Punjabi</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className={inputClass} value={form.addressStreet} onChange={handleChange('addressStreet')} placeholder="Street" />
          <input className={inputClass} value={form.addressCity} onChange={handleChange('addressCity')} placeholder="City" />
          <input className={inputClass} value={form.addressState} onChange={handleChange('addressState')} placeholder="State" />
          <input className={inputClass} value={form.addressPincode} onChange={handleChange('addressPincode')} placeholder="Pincode" />
          <input className={inputClass} value={form.addressVillage} onChange={handleChange('addressVillage')} placeholder="Village" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea className={inputClass + " min-h-[60px]"} value={form.notes} onChange={handleChange('notes')} placeholder="Additional notes" />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-surface-200 dark:border-surface-700">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>Register Patient</Button>
      </div>
    </form>
  );
}

export function Patients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', debouncedSearch],
    queryFn: () => patientApi.list({ search: debouncedSearch || undefined, page_size: 50 }).then(r => r.data),
  });

  const voiceRegistrationMutation = useMutation({
    mutationFn: (text: string) => patientApi.registerFromText(text),
    onSuccess: (res) => {
      toast.success('Patient registered from voice/text!');
      setShowVoiceModal(false);
      setVoiceText('');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      const pid = res.data?.patientId || res.data?.patient_id;
      if (pid) navigate(`/patients/${pid}`);
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Registration failed'),
  });

  return (
    <div>
      <Header title="Patients" subtitle="Manage patient records" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or ID..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="secondary" onClick={() => setShowVoiceModal(true)} className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Voice Register</span>
            </Button>
            <Button onClick={() => setShowRegisterModal(true)} className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>Add Patient</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : !data?.patients?.length ? (
          <EmptyState
            icon={<UserPlus className="w-8 h-8 text-surface-400" />}
            title="No patients found"
            description={search ? 'Try a different search term' : 'Register your first patient to get started'}
            action={
              <Button onClick={() => setShowRegisterModal(true)}>Register First Patient</Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.patients.map((patient: Patient, index: number) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => navigate(`/patients/${patient.id}`)}
                className="glass-card p-5 cursor-pointer group hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(patient.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors">
                        {patient.name}
                      </h3>
                      <p className="text-xs text-surface-500">{patient.patientId}</p>
                    </div>
                  </div>
                  <Badge variant={getRiskBadgeColor(patient.riskLevel) as any}>
                    {patient.riskLevel || 'Unknown'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-surface-500">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{patient.age || '?'}y / {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : 'O'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-surface-500">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{patient.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-surface-500 col-span-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {patient.address?.village || patient.address?.city || 'No address'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-surface-200/50 dark:border-surface-700/50">
                  <div className="flex items-center gap-1 text-xs text-surface-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(patient.registeredAt)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-surface-500 ml-auto">
                    <Activity className="w-3 h-3" />
                    {patient.medicalHistory?.conditions?.length || 0} conditions
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showVoiceModal} onClose={() => setShowVoiceModal(false)} title="Voice / Text Registration" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-surface-500">
            Describe the patient's details in natural language. Example: "Register Ram Kumar, 45 years old male from 
            village Sundarpur, complaining of fever and headache since 3 days."
          </p>
          <textarea
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            placeholder="Type or paste patient details here..."
            className="input-field min-h-[150px] resize-none"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowVoiceModal(false)}>Cancel</Button>
            <Button
              onClick={() => voiceRegistrationMutation.mutate(voiceText)}
              isLoading={voiceRegistrationMutation.isPending}
              disabled={!voiceText.trim()}
            >
              Register Patient
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register New Patient" size="xl">
        <PatientRegistrationForm
          onSuccess={(patientId) => {
            setShowRegisterModal(false);
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            if (patientId) navigate(`/patients/${patientId}`);
          }}
          onCancel={() => setShowRegisterModal(false)}
        />
      </Modal>
    </div>
  );
}
