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
import type { Patient } from '@types/index';

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
    queryFn: () => patientApi.list({ search: debouncedSearch || undefined, pageSize: 50 }).then(r => r.data),
  });

  const voiceRegistrationMutation = useMutation({
    mutationFn: (text: string) => patientApi.registerFromText(text),
    onSuccess: (res) => {
      toast.success('Patient registered from voice/text!');
      setShowVoiceModal(false);
      setVoiceText('');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      if (res.data?.patient_id) navigate(`/patients/${res.data.patient_id}`);
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
        <div className="text-center py-8">
          <p className="text-surface-500 mb-4">Use voice registration for faster data entry</p>
          <Button onClick={() => { setShowRegisterModal(false); setShowVoiceModal(true); }}>
            Try Voice Registration
          </Button>
        </div>
      </Modal>
    </div>
  );
}
