import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { EmptyState } from '@components/ui/EmptyState';
import { visitApi, patientApi } from '@services/api';
import { formatDate, getInitials } from '@utils/helpers';
import {
  Stethoscope, Plus, Search, AlertTriangle, Calendar,
  Activity, User, FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Visit } from '@typings/index';

export function Visits() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [visitType, setVisitType] = useState('general');

  const { data, isLoading } = useQuery({
    queryKey: ['visits'],
    queryFn: () => visitApi.list({ pageSize: 50 }).then(r => r.data),
  });

  const { data: patientsData } = useQuery({
    queryKey: ['patients-list'],
    queryFn: () => patientApi.list({ pageSize: 100 }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => visitApi.create({
      patient_id: selectedPatient,
      chief_complaint: chiefComplaint,
      visit_type: visitType,
    }),
    onSuccess: () => {
      toast.success('Visit recorded');
      setShowCreateModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to create visit'),
  });

  const resetForm = () => {
    setSelectedPatient('');
    setChiefComplaint('');
    setVisitType('general');
  };

  if (isLoading) return <div className="p-6"><LoadingSpinner size="lg" className="py-20" /></div>;

  return (
    <div>
      <Header title="Visits" subtitle="Patient visit records" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search visits..."
              className="input-field pl-10"
            />
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Visit
          </Button>
        </div>

        {!data?.visits?.length ? (
          <EmptyState
            icon={<Stethoscope className="w-8 h-8 text-surface-400" />}
            title="No visits recorded"
            description="Record your first patient visit"
            action={<Button onClick={() => setShowCreateModal(true)}>Record Visit</Button>}
          />
        ) : (
          <div className="space-y-3">
            {data.visits.map((visit: Visit, index: number) => (
              <motion.div
                key={visit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => navigate(`/patients/${visit.patientId}`)}
                className="glass-card p-5 cursor-pointer group hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${visit.isEmergency ? 'from-red-400 to-red-600' : 'from-blue-400 to-blue-600'} flex items-center justify-center shrink-0`}>
                    {visit.isEmergency ? <AlertTriangle className="w-6 h-6 text-white" /> : <Stethoscope className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-surface-900 dark:text-white">{visit.patientName}</h3>
                      <Badge variant={visit.isEmergency ? 'danger' : 'default'} size="sm">
                        {visit.isEmergency ? 'Emergency' : visit.visitType}
                      </Badge>
                      {visit.riskLevel && (
                        <Badge variant={visit.riskLevel === 'high' || visit.riskLevel === 'critical' ? 'warning' : 'success'} size="sm">
                          {visit.riskLevel}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400 truncate">
                      {visit.chiefComplaint || 'No complaint recorded'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(visit.visitDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" /> {visit.diagnosis?.length || 0} diagnoses
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {visit.prescriptions?.length || 0} prescriptions
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Record New Visit" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Patient</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="input-field"
            >
              <option value="">Select patient...</option>
              {patientsData?.patients?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Visit Type</label>
            <select value={visitType} onChange={(e) => setVisitType(e.target.value)} className="input-field">
              {['general', 'emergency', 'follow_up', 'vaccination', 'prenatal', 'postnatal', 'child_health'].map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Chief Complaint</label>
            <textarea
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="input-field min-h-[100px] resize-none"
              placeholder="Describe the patient's main complaint..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); }}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} isLoading={createMutation.isPending} disabled={!selectedPatient}>
              Save Visit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
