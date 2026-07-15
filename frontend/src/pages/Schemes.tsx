import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Modal } from '@components/ui/Modal';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { agentApi, patientApi } from '@services/api';
import {
  ShieldCheck, Search, User, ExternalLink, Phone,
  IndianRupee, Sparkles, Heart, Baby, Shield, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { SchemeRecommendation } from '@types/index';

const categoryIcons: Record<string, any> = {
  health_insurance: Shield,
  maternal: Heart,
  child: Baby,
  child_nutrition: Baby,
  primary_care: Users,
  health: ShieldCheck,
  insurance: Shield,
  financial: IndianRupee,
  default: ShieldCheck,
};

const categoryColors: Record<string, string> = {
  health_insurance: 'from-blue-400 to-blue-600',
  maternal: 'from-pink-400 to-pink-600',
  child: 'from-green-400 to-green-600',
  child_nutrition: 'from-emerald-400 to-emerald-600',
  primary_care: 'from-cyan-400 to-cyan-600',
  health: 'from-teal-400 to-teal-600',
  insurance: 'from-purple-400 to-purple-600',
  financial: 'from-amber-400 to-amber-600',
  default: 'from-surface-400 to-surface-600',
};

const schemes = [
  {
    schemeId: 'ayushman_bharat', name: 'Ayushman Bharat PM-JAY', category: 'health_insurance',
    description: "World's largest health insurance scheme providing coverage up to ₹5 lakh per family per year",
    eligibility: ['Below poverty line families', 'SECC 2011 database identified'],
    benefits: ['Cashless treatment', 'Coverage up to ₹5 lakh', 'Pre-existing diseases covered'],
    coverageAmount: '₹5,00,000', helpline: '14555',
  },
  {
    schemeId: 'pm_matru_vandana', name: 'Pradhan Mantri Matru Vandana Yojana', category: 'maternal',
    description: 'Maternity benefit program providing cash incentives to pregnant and lactating women',
    eligibility: ['Pregnant women 19+ years', 'First living child'],
    benefits: ['₹5,000 cash benefit in 3 installments', 'Compensation for wage loss'],
    coverageAmount: '₹5,000', helpline: '011-23382281',
  },
  {
    schemeId: 'janani_suraksha', name: 'Janani Suraksha Yojana', category: 'maternal',
    description: 'Safe motherhood intervention under National Rural Health Mission',
    eligibility: ['BPL pregnant women', 'Women 19+ years'],
    benefits: ['₹1,400 in rural areas', '₹1,000 in urban areas', 'Free delivery'],
    coverageAmount: '₹1,400', helpline: '1800-180-4242',
  },
  {
    schemeId: 'mission_indradhanush', name: 'Mission Indradhanush', category: 'child',
    description: 'Universal immunization program covering all vaccines under UIP',
    eligibility: ['Children under 2 years', 'Pregnant women'],
    benefits: ['Free vaccination against 12 diseases'],
    coverageAmount: 'Free', helpline: '1800-180-4242',
  },
  {
    schemeId: 'pm_jeevan_jyoti', name: 'PM Jeevan Jyoti Bima Yojana', category: 'insurance',
    description: 'Life insurance scheme for citizens aged 18-50',
    eligibility: ['Age 18-50 years', 'Savings bank account'],
    benefits: ['Life coverage of ₹2 lakh', 'Annual premium ₹436'],
    coverageAmount: '₹2,00,000', helpline: '1800-180-4242',
  },
  {
    schemeId: 'pm_suraksha_bima', name: 'PM Suraksha Bima Yojana', category: 'insurance',
    description: 'Accident insurance scheme for all citizens aged 18-70',
    eligibility: ['Age 18-70 years', 'Savings bank account'],
    benefits: ['Accident coverage ₹2 lakh', 'Annual premium ₹20'],
    coverageAmount: '₹2,00,000', helpline: '1800-180-4242',
  },
];

export function Schemes() {
  const [search, setSearch] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [recommendations, setRecommendations] = useState<any>(null);

  const { data: patientsData } = useQuery({
    queryKey: ['patients-list'],
    queryFn: () => patientApi.list({ pageSize: 100 }).then(r => r.data),
  });

  const recommendMutation = useMutation({
    mutationFn: () => agentApi.recommendSchemes(patientId),
    onSuccess: (res) => {
      setRecommendations(res.data);
      toast.success('Recommendations generated!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed'),
  });

  const filtered = schemes.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header title="Government Schemes" subtitle="Healthcare schemes and benefits for patients" />

      <div className="p-4 lg:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Scheme Advisor</CardTitle>
            <Button variant="secondary" size="sm" onClick={() => setShowRecommendModal(true)}>
              Get Recommendations
            </Button>
          </CardHeader>
          <p className="text-sm text-surface-500">
            The Government Scheme Agent analyzes patient profiles and recommends the most suitable schemes
          </p>
        </Card>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes..." className="input-field pl-10" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((scheme, index) => {
            const Icon = categoryIcons[scheme.category] || ShieldCheck;
            const color = categoryColors[scheme.category] || categoryColors.default;
            return (
              <motion.div
                key={scheme.schemeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedScheme(scheme)}
                className="glass-card p-5 cursor-pointer group hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <Badge variant="info" size="sm">{scheme.category.replace(/_/g, ' ')}</Badge>
                </div>

                <h3 className="font-semibold text-surface-900 dark:text-white mb-1 group-hover:text-primary-500 transition-colors">
                  {scheme.name}
                </h3>
                <p className="text-sm text-surface-500 mb-3 line-clamp-2">{scheme.description}</p>

                <div className="flex items-center justify-between text-xs text-surface-500">
                  <span className="font-semibold text-accent-500">{scheme.coverageAmount}</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {scheme.helpline || 'N/A'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={!!selectedScheme} onClose={() => setSelectedScheme(null)} title={selectedScheme?.name} size="lg">
        {selectedScheme && (
          <div className="space-y-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[selectedScheme.category] || categoryColors.default} flex items-center justify-center`}>
              {React.createElement(categoryIcons[selectedScheme.category] || ShieldCheck, { className: 'w-6 h-6 text-white' })}
            </div>
            <p className="text-sm text-surface-600 dark:text-surface-400">{selectedScheme.description}</p>

            <div>
              <h4 className="font-semibold text-surface-900 dark:text-white mb-2">Eligibility</h4>
              <ul className="list-disc list-inside text-sm text-surface-600 dark:text-surface-400 space-y-1">
                {selectedScheme.eligibility?.map((e: string, i: number) => <li key={i}>{e}</li>)}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-surface-900 dark:text-white mb-2">Benefits</h4>
              <ul className="list-disc list-inside text-sm text-surface-600 dark:text-surface-400 space-y-1">
                {selectedScheme.benefits?.map((b: string, i: number) => <li key={i}>{b}</li>)}
              </ul>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-accent-500" />
                <span className="text-sm font-medium text-surface-900 dark:text-white">{selectedScheme.coverageAmount}</span>
              </div>
              {selectedScheme.helpline && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-surface-600 dark:text-surface-400">{selectedScheme.helpline}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showRecommendModal} onClose={() => setShowRecommendModal(false)} title="AI Scheme Recommendations" size="xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Select Patient</label>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input-field">
              <option value="">Select patient...</option>
              {patientsData?.patients?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>
              ))}
            </select>
          </div>
          <Button onClick={() => recommendMutation.mutate()} isLoading={recommendMutation.isPending} disabled={!patientId} className="w-full">
            <Sparkles className="w-4 h-4 mr-2" /> Get Recommendations
          </Button>

          {recommendations && (
            <div className="space-y-3 mt-4">
              <h4 className="font-semibold text-surface-900 dark:text-white">Recommended Schemes</h4>
              {recommendations.recommended_schemes?.map((r: SchemeRecommendation, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-surface-900 dark:text-white">{r.schemeName}</h5>
                    <Badge variant={r.matchScore > 0.7 ? 'success' : r.matchScore > 0.4 ? 'warning' : 'default'}>
                      {(r.matchScore * 100).toFixed(0)}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-surface-500 mb-2">{r.eligibilityReason}</p>
                  <ul className="list-disc list-inside text-xs text-surface-500">
                    {r.benefits?.map((b: string, j: number) => <li key={j}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

import React from 'react';
