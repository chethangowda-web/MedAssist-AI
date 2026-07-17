import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Modal } from '@components/ui/Modal';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { agentApi } from '@services/api';
import { AGENTS } from '@utils/constants';
import * as Icons from 'lucide-react';
import {
  Brain, Search, AlertTriangle, ShieldCheck, Bell, FileText, UserPlus,
  Activity, Sparkles, ArrowRight, MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RiskAssessment, KnowledgeResult, SchemeRecommendation } from '@typings/index';

const agentIcons: Record<string, any> = {
  UserPlus: Icons.UserPlus,
  AlertTriangle: Icons.AlertTriangle,
  BookOpen: Icons.BookOpen,
  Bell: Icons.Bell,
  FileText: Icons.FileText,
  ShieldCheck: Icons.ShieldCheck,
};

export function Agents() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [patientId, setPatientId] = useState('');
  const [result, setResult] = useState<any>(null);

  const riskMutation = useMutation({
    mutationFn: (data: any) => agentApi.assessRisk(data),
    onSuccess: (res) => setResult(res.data),
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Assessment failed'),
  });

  const knowledgeMutation = useMutation({
    mutationFn: (q: string) => agentApi.searchKnowledge(q),
    onSuccess: (res) => setResult(res.data),
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Search failed'),
  });

  const schemeMutation = useMutation({
    mutationFn: (id: string) => agentApi.recommendSchemes(id),
    onSuccess: (res) => setResult(res.data),
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Scheme lookup failed'),
  });

  const coordinatorMutation = useMutation({
    mutationFn: () => agentApi.runCoordinator('full_assessment', patientId, { text: query, mode: 'natural_language' }),
    onSuccess: (res) => {
      setResult(res.data);
      toast.success('Full assessment completed!');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Assessment failed'),
  });

  const handleAgentAction = (agentId: string) => {
    setSelectedAgent(agentId);
    setResult(null);
    setQuery('');
    setPatientId('');
  };

  const runAgent = () => {
    switch (selectedAgent) {
      case 'patient_registration':
        if (query) {
          agentApi.manageReminders({ action: 'create', title: query }).then(r => setResult(r.data));
        }
        break;
      case 'risk_assessment':
        riskMutation.mutate({ patient_id: patientId, symptoms: query.split(',').map(s => s.trim()) });
        break;
      case 'knowledge':
        if (query) knowledgeMutation.mutate(query);
        break;
      case 'reminder':
        // handled inline
        break;
      case 'report':
        coordinatorMutation.mutate();
        break;
      case 'government_scheme':
        if (patientId) schemeMutation.mutate(patientId);
        break;
    }
  };

  return (
    <div>
      <Header title="AI Agents" subtitle="Multi-Agent Orchestration Platform" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {AGENTS.map((agent, index) => {
            const Icon = agentIcons[agent.icon] || Activity;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => handleAgentAction(agent.id)}
                className={`agent-card text-center ${selectedAgent === agent.id ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-surface-900 dark:text-white">{agent.name}</h3>
                <p className="text-xs text-surface-500 mt-1 leading-relaxed">{agent.description}</p>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                  <span className="text-[10px] text-accent-500">Active</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AGENTS.find(a => a.id === selectedAgent)?.color || 'from-blue-400 to-blue-600'} flex items-center justify-center`}>
                {React.createElement(agentIcons[AGENTS.find(a => a.id === selectedAgent)?.icon || 'Activity'] || Activity, { className: 'w-5 h-5 text-white' })}
              </div>
              <div>
                <h3 className="font-bold text-surface-900 dark:text-white">
                  {AGENTS.find(a => a.id === selectedAgent)?.name}
                </h3>
                <p className="text-xs text-surface-500">Interact with this agent</p>
              </div>
            </div>

            <div className="space-y-4">
              {(selectedAgent === 'risk_assessment' || selectedAgent === 'government_scheme') && (
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="Enter patient ID..."
                    className="input-field"
                  />
                </div>
              )}

              {selectedAgent !== 'risk_assessment' && selectedAgent !== 'government_scheme' && (
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                    {selectedAgent === 'knowledge' ? 'Medical Query' : 'Input'}
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      selectedAgent === 'knowledge' ? 'Ask about WHO guidelines, treatments, symptoms...' :
                      selectedAgent === 'patient_registration' ? 'Describe patient details naturally...' :
                      'Enter input...'
                    }
                    className="input-field min-h-[100px] resize-none"
                  />
                </div>
              )}

              <Button onClick={runAgent} isLoading={riskMutation.isPending || knowledgeMutation.isPending} className="w-full">
                Run {AGENTS.find(a => a.id === selectedAgent)?.name || 'Agent'}
              </Button>
            </div>

            {result && (
              <div className="mt-6 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-surface-900 dark:text-white">Result</span>
                </div>
                <pre className="text-sm text-surface-600 dark:text-surface-400 whitespace-pre-wrap overflow-auto max-h-60">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Multi-Agent Orchestration</CardTitle>
            <Badge variant="success">Workflow Ready</Badge>
          </CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            {['Patient Registration', 'Risk Assessment', 'Knowledge Search', 'Reminder', 'Report', 'Scheme'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-500 text-xs font-medium">
                  {step}
                </div>
                {i < 5 && <ArrowRight className="w-4 h-4 text-surface-400" />}
              </div>
            ))}
          </div>
          <p className="text-sm text-surface-500 mt-3">
            Run the coordinator agent to execute the full workflow across all agents
          </p>
          <Button
            variant="secondary"
            onClick={() => coordinatorMutation.mutate()}
            isLoading={coordinatorMutation.isPending}
            className="mt-3"
          >
            Run Full Workflow
          </Button>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
