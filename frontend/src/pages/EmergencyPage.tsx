import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { emergencyApi } from '@services/api';
import { AlertTriangle, Phone, Hospital, Shield, MapPin, ChevronRight, Heart, Activity, Thermometer, Droplets, Ambulance } from 'lucide-react';
import toast from 'react-hot-toast';
import type { EmergencyProtocol } from '@typings/index';

export function EmergencyPage() {
  const [showTriage, setShowTriage] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [vitalSigns, setVitalSigns] = useState({ bp: '', hr: '', temp: '', o2: '' });
  const [triageResult, setTriageResult] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['emergency-contacts'],
    queryFn: () => emergencyApi.getContacts().then(r => r.data),
  });

  const { data: protocolsData } = useQuery({
    queryKey: ['emergency-protocols'],
    queryFn: () => emergencyApi.listProtocols().then(r => r.data),
  });

  const { data: hospitalsData, isLoading: hospitalsLoading } = useQuery({
    queryKey: ['nearby-hospitals', location],
    queryFn: () => emergencyApi.getNearbyHospitals(location!.lat, location!.lng).then(r => r.data),
    enabled: !!location,
  });

  const triageMutation = useMutation({
    mutationFn: () => emergencyApi.triage(
      symptoms.split(',').map(s => s.trim()).filter(Boolean),
      {
        blood_pressure_systolic: parseInt(vitalSigns.bp.split('/')[0]) || 0,
        blood_pressure_diastolic: parseInt(vitalSigns.bp.split('/')[1]) || 0,
        heart_rate: parseInt(vitalSigns.hr) || 0,
        temperature: parseFloat(vitalSigns.temp) || 0,
        oxygen_saturation: parseInt(vitalSigns.o2) || 0,
      }
    ),
    onSuccess: (res) => {
      setTriageResult(res.data);
      toast.success('Triage assessment completed');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Triage failed'),
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error('Could not get location'),
      { enableHighAccuracy: true }
    );
  }, []);

  if (contactsLoading) return <div className="p-6"><LoadingSpinner size="lg" className="py-20" /></div>;

  const contacts = contactsData?.hotlines || {};

  return (
    <div>
      <Header title="Emergency" subtitle="Emergency response and triage system" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">Emergency Mode</h2>
              <p className="text-sm text-surface-500">Quick access to emergency services and triage</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-red-500" />
                <CardTitle>Emergency Hotlines</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-2">
              {Object.entries(contacts).map(([name, number]) => (
                <a
                  key={name}
                  href={`tel:${String(number)}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white capitalize">
                        {name.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-surface-500">{String(number)}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-400" />
                </a>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                <CardTitle>Emergency Protocols</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-2">
              {protocolsData?.protocols?.map((protocol: string) => (
                <motion.button
                  key={protocol}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium text-surface-900 dark:text-white capitalize">
                    {protocol.replace(/_/g, ' ')}
                  </span>
                </motion.button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Hospital className="w-5 h-5 text-emerald-500" />
                <CardTitle>Nearby Hospitals</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-4">
              <Button onClick={getLocation} className="w-full" variant="secondary">
                <MapPin className="w-4 h-4 mr-2" />
                Find Nearby Hospitals
              </Button>
              {hospitalsLoading && <LoadingSpinner size="sm" className="py-4" />}
              {hospitalsData?.hospitals?.slice(0, 3).map((h: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Hospital className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{h.name}</p>
                    <p className="text-xs text-surface-500 truncate">{h.address}</p>
                    {h.rating > 0 && (
                      <p className="text-xs text-amber-500">{'★'.repeat(Math.round(h.rating))}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <CardTitle>Triage Assessment</CardTitle>
            </div>
            <Badge variant="danger">Emergency Tool</Badge>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Symptoms (comma separated)
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. chest pain, difficulty breathing, severe headache"
                className="input-field min-h-[80px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  value={vitalSigns.bp}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, bp: e.target.value })}
                  placeholder="e.g. 140/90"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={vitalSigns.hr}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, hr: e.target.value })}
                  placeholder="e.g. 80"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={vitalSigns.temp}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, temp: e.target.value })}
                  placeholder="e.g. 98.6"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  O2 Saturation (%)
                </label>
                <input
                  type="number"
                  value={vitalSigns.o2}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, o2: e.target.value })}
                  placeholder="e.g. 98"
                  className="input-field"
                />
              </div>
            </div>
            <Button
              onClick={() => triageMutation.mutate()}
              isLoading={triageMutation.isPending}
              className="w-full"
              variant="danger"
            >
              <Ambulance className="w-4 h-4 mr-2" />
              Run Triage Assessment
            </Button>
          </div>
        </Card>

        {triageResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-6 ${
              triageResult.severity_score >= 50 ? 'border-red-500/50' :
              triageResult.severity_score >= 25 ? 'border-amber-500/50' :
              'border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-surface-900 dark:text-white">Triage Result</h3>
              <Badge variant={triageResult.severity_score >= 50 ? 'danger' : triageResult.severity_score >= 25 ? 'warning' : 'success'}>
                {triageResult.triage_level}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex-1 h-3 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden`}>
                <div
                  className={`h-full rounded-full transition-all ${
                    triageResult.severity_score >= 50 ? 'bg-red-500' :
                    triageResult.severity_score >= 25 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(triageResult.severity_score, 100)}%` }}
                />
              </div>
              <span className="text-lg font-bold text-surface-900 dark:text-white">{triageResult.severity_score}</span>
            </div>
            {triageResult.alerts?.map((alert: string, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 mb-1 rounded-lg bg-red-500/5 text-sm text-red-500">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {alert}
              </div>
            ))}
            <p className="text-sm text-surface-500 mt-3">{triageResult.recommendation}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
