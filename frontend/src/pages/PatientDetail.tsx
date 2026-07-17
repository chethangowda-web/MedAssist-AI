import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { Modal } from '@components/ui/Modal';
import { patientApi, visitApi, agentApi, reportApi } from '@services/api';
import { formatDate, getRiskBadgeColor, getInitials } from '@utils/helpers';
import {
  ArrowLeft, Phone, Mail, MapPin, Droplets, Heart, Ruler,
  Activity, AlertTriangle, FileText, Calendar, Stethoscope,
  ShieldCheck, User, Baby, Syringe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Patient, Visit, RiskAssessment } from '@typings/index';

export function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskResult, setRiskResult] = useState<RiskAssessment | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientApi.getById(id!).then(r => r.data),
    enabled: !!id,
  });

  const { data: visitsData } = useQuery({
    queryKey: ['patient-visits', id],
    queryFn: () => visitApi.list({ patient_id: id, page_size: 10 }).then(r => r.data),
    enabled: !!id,
  });

  const riskMutation = useMutation({
    mutationFn: () => patientApi.assessRisk(id!),
    onSuccess: (res) => {
      setRiskResult(res.data);
      setShowRiskModal(true);
      toast.success('Risk assessment completed');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Assessment failed'),
  });

  const [selectedReportType, setSelectedReportType] = useState('patient_summary');
  const reportMutation = useMutation({
    mutationFn: (reportType: string) => reportApi.generate({ patient_id: id, report_type: reportType, format: 'json' }),
    onSuccess: () => {
      toast.success('Report generated');
      setShowReportModal(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Report generation failed'),
  });

  if (isLoading) return <div className="p-6"><LoadingSpinner size="lg" className="py-20" /></div>;
  if (!patient) return <div className="p-6 text-center text-surface-500">Patient not found</div>;

  const p = patient as Patient;

  return (
    <div>
      <Header title={p.name} subtitle={`${p.patientId} · ${formatDate(p.registeredAt)}`} />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/patients')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(p.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-surface-900 dark:text-white">{p.name}</h2>
                  <Badge variant={getRiskBadgeColor(p.riskLevel) as any}>{p.riskLevel || 'Unknown'}</Badge>
                </div>
                <p className="text-sm text-surface-500">{p.patientId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { icon: User, label: 'Age/Gender', value: `${p.age || '?'}y / ${p.gender}` },
                { icon: Droplets, label: 'Blood Group', value: p.bloodGroup || 'N/A' },
                { icon: Phone, label: 'Phone', value: p.phone },
                { icon: Mail, label: 'Email', value: p.email || 'N/A' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <div className="flex items-center gap-2 text-surface-500 text-xs mb-1">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-surface-900 dark:text-white">Address</h3>
              <div className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  {p.address?.street}, {p.address?.village}, {p.address?.city}, {p.address?.state} - {p.address?.pincode}
                </span>
              </div>
            </div>

            {p.medicalHistory?.conditions?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-3">Medical Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {p.medicalHistory.conditions.map((c: string, i: number) => (
                    <Badge key={i} variant="warning">{c}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <Button onClick={() => riskMutation.mutate()} isLoading={riskMutation.isPending} className="w-full flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Assess Risk
                </Button>
                <Button variant="secondary" onClick={() => setShowReportModal(true)} className="w-full flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Generate Report
                </Button>
                <Button variant="secondary" className="w-full flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Check Schemes
                </Button>
                <Button variant="secondary" className="w-full flex items-center gap-2">
                  <Syringe className="w-4 h-4" /> Schedule Reminder
                </Button>
              </div>
            </Card>

            {p.vitalSigns && (
              <Card>
                <CardHeader>
                  <CardTitle>Vital Signs</CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  {[
                    { label: 'Blood Pressure', value: p.vitalSigns?.bloodPressureSystolic ? `${p.vitalSigns.bloodPressureSystolic}/${p.vitalSigns.bloodPressureDiastolic}` : 'N/A', icon: Activity },
                    { label: 'Heart Rate', value: p.vitalSigns?.heartRate ? `${p.vitalSigns.heartRate} bpm` : 'N/A', icon: Heart },
                    { label: 'Temperature', value: p.vitalSigns?.temperature ? `${p.vitalSigns.temperature}°F` : 'N/A', icon: Activity },
                    { label: 'Blood Sugar', value: p.vitalSigns?.bloodSugar ? `${p.vitalSigns.bloodSugar} mg/dL` : 'N/A', icon: Droplets },
                    { label: 'BMI', value: p.vitalSigns?.bmi || 'N/A', icon: Ruler },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-surface-500">{item.label}</span>
                      <span className="font-medium text-surface-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visit History</CardTitle>
          </CardHeader>
          {visitsData?.visits?.length > 0 ? (
            <div className="space-y-3">
              {visitsData.visits.map((visit: Visit) => (
                <div key={visit.id} className="flex items-start gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-surface-900 dark:text-white capitalize">{visit.visitType}</span>
                      <Badge variant={visit.isEmergency ? 'danger' : 'default'} size="sm">
                        {visit.isEmergency ? 'Emergency' : 'Routine'}
                      </Badge>
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400">{visit.chiefComplaint || 'No complaint'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                      <span>{formatDate(visit.visitDate)}</span>
                      <span>Risk: {visit.riskLevel || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-500 text-center py-4">No visits recorded</p>
          )}
        </Card>
      </div>

      <Modal isOpen={showRiskModal} onClose={() => setShowRiskModal(false)} title="Risk Assessment Results" size="lg">
        {riskResult && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${riskResult.emergencyWarning ? 'bg-red-500/10 border border-red-500/20' : 'bg-accent-500/10 border border-accent-500/20'}`}>
              <div className="flex items-center gap-2 mb-1">
                {riskResult.emergencyWarning ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Activity className="w-5 h-5 text-accent-500" />}
                <span className="font-bold text-lg">
                  Risk Score: {(riskResult.overallRiskScore * 100).toFixed(0)}%
                </span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getRiskBadgeColor(riskResult.riskLevel)}`}>
                {riskResult.riskLevel?.toUpperCase()}
              </span>
            </div>

            {riskResult.assessments?.map((a: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-surface-900 dark:text-white">{a.condition}</h4>
                  <Badge variant={a.riskScore > 0.5 ? 'danger' : a.riskScore > 0.2 ? 'warning' : 'success'}>
                    {(a.riskScore * 100).toFixed(0)}%
                  </Badge>
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">{a.reasoning}</p>
                {a.recommendations?.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-surface-500">
                    {a.recommendations.map((r: string, j: number) => (
                      <li key={j}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {riskResult.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-surface-900 dark:text-white mb-2">Recommendations</h4>
                <ul className="list-disc list-inside text-sm text-surface-600 dark:text-surface-400 space-y-1">
                  {riskResult.recommendations.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Generate Report" size="md">
        <div className="space-y-4">
          <p className="text-sm text-surface-500">Select report type to generate</p>
          {['patient_summary', 'medical_report', 'referral_letter', 'visit_report'].map((type) => (
            <button
              key={type}
              onClick={() => reportMutation.mutate(type)}
              className="w-full text-left p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
            >
              <p className="font-medium text-surface-900 dark:text-white capitalize">{type.replace(/_/g, ' ')}</p>
              <p className="text-sm text-surface-500">Generate comprehensive {type.replace(/_/g, ' ')}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
