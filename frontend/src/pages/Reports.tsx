import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Modal } from '@components/ui/Modal';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { EmptyState } from '@components/ui/EmptyState';
import { reportApi, patientApi } from '@services/api';
import { formatDate, getInitials } from '@utils/helpers';
import { REPORT_TYPES } from '@utils/constants';
import {
  FileText, Plus, Search, Download, Calendar, User,
  FileDown, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Report } from '@typings/index';

export function Reports() {
  const queryClient = useQueryClient();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reportType, setReportType] = useState('patient_summary');

  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportApi.list().then(r => r.data),
  });

  const { data: patientsData } = useQuery({
    queryKey: ['patients-list'],
    queryFn: () => patientApi.list({ page_size: 100 }).then(r => r.data),
  });

  const generateMutation = useMutation({
    mutationFn: () => reportApi.generate({ patient_id: selectedPatient, report_type: reportType, format: 'pdf' }),
    onSuccess: () => {
      toast.success('Report generated successfully!');
      setShowGenerateModal(false);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Generation failed'),
  });

  const downloadMutation = useMutation({
    mutationFn: (id: string) => reportApi.downloadPdf(id),
    onSuccess: (res, id) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    },
  });

  if (isLoading) return <div className="p-6"><LoadingSpinner size="lg" className="py-20" /></div>;

  return (
    <div>
      <Header title="Reports" subtitle="Generated medical reports and documents" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" placeholder="Search reports..." className="input-field pl-10" />
          </div>
          <Button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2 ml-4">
            <Plus className="w-4 h-4" /> Generate Report
          </Button>
        </div>

        {!data?.reports?.length ? (
          <EmptyState
            icon={<FileText className="w-8 h-8 text-surface-400" />}
            title="No reports generated"
            description="Generate your first patient report"
            action={<Button onClick={() => setShowGenerateModal(true)}>Generate Report</Button>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.reports.map((report: Report, index: number) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <Badge variant={report.status === 'generated' ? 'success' : 'default'}>
                    {report.status}
                  </Badge>
                </div>

                <h3 className="font-semibold text-surface-900 dark:text-white mb-1">{report.title}</h3>
                <p className="text-sm text-surface-500 mb-3 line-clamp-2">{report.summary}</p>

                <div className="space-y-1.5 text-xs text-surface-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3" /> {report.patientName}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> {formatDate(report.generatedAt)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> {report.reportType.replace(/_/g, ' ')}
                  </div>
                </div>

                {report.fileUrl && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => downloadMutation.mutate(report.id)}
                    className="w-full mt-3"
                  >
                    <FileDown className="w-4 h-4 mr-1" /> Download PDF
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Report" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Patient</label>
            <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="input-field">
              <option value="">Select patient...</option>
              {patientsData?.patients?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-field">
              {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-surface-900 dark:text-white">AI-Powered Generation</span>
            </div>
            <p className="text-xs text-surface-500">
              Reports are generated by the Report Generator Agent using Gemini AI, incorporating patient data,
              medical history, vitals, and visit records into professional PDF documents.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
            <Button onClick={() => generateMutation.mutate()} isLoading={generateMutation.isPending} disabled={!selectedPatient}>
              Generate Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
