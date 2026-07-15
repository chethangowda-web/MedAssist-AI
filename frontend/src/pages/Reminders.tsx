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
import { agentApi } from '@services/api';
import { formatDate, getInitials } from '@utils/helpers';
import { REMINDER_TYPES } from '@utils/constants';
import {
  Bell, Plus, Search, Calendar, Clock, CheckCircle2,
  XCircle, AlertCircle, Syringe, Pill, Heart, Baby,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as Icons from 'lucide-react';
import type { Reminder } from '@types/index';

const typeIcons: Record<string, any> = {
  Syringe: Icons.Syringe, Pill: Icons.Pill, CalendarCheck: Icons.CalendarCheck,
  Baby: Icons.Baby, Heart: Icons.Heart, Bell: Icons.Bell,
};

export function Reminders() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '', title: '', description: '', reminder_type: 'vaccination',
    scheduled_date: '', scheduled_time: '', priority: 'medium',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['reminders', filter],
    queryFn: () => agentApi.manageReminders({ action: 'get_pending', status: filter, limit: 50 }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => agentApi.manageReminders({ action: 'create', ...formData }),
    onSuccess: () => {
      toast.success('Reminder created');
      setShowCreateModal(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => agentApi.manageReminders({ action: 'complete', reminder_id: id }),
    onSuccess: () => {
      toast.success('Reminder completed');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const resetForm = () => setFormData({ patient_id: '', title: '', description: '', reminder_type: 'vaccination', scheduled_date: '', scheduled_time: '', priority: 'medium' });

  if (isLoading) return <div className="p-6"><LoadingSpinner size="lg" className="py-20" /></div>;

  return (
    <div>
      <Header title="Reminders" subtitle="Vaccination, medicine, and follow-up schedules" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            {['pending', 'completed', 'all'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'btn-ghost'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Reminder
          </Button>
        </div>

        {!data?.reminders?.length ? (
          <EmptyState
            icon={<Bell className="w-8 h-8 text-surface-400" />}
            title="No reminders"
            description={filter === 'pending' ? 'No pending reminders' : 'No reminders found'}
            action={<Button onClick={() => setShowCreateModal(true)}>Create Reminder</Button>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.reminders.map((reminder: Reminder, index: number) => {
              const reminderType = REMINDER_TYPES.find(r => r.value === reminder.reminderType);
              const Icon = reminderType ? typeIcons[reminderType.icon] || Bell : Bell;
              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`glass-card p-5 ${reminder.status === 'completed' ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                      reminder.priority === 'high' ? 'from-red-400 to-red-600' :
                      reminder.priority === 'medium' ? 'from-amber-400 to-amber-600' :
                      'from-blue-400 to-blue-600'
                    } flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant={reminder.status === 'completed' ? 'success' : reminder.priority === 'high' ? 'danger' : 'warning'}>
                      {reminder.status === 'completed' ? 'Done' : reminder.priority}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-surface-900 dark:text-white mb-1">{reminder.title}</h3>
                  <p className="text-sm text-surface-500 mb-3">{reminder.description}</p>

                  <div className="space-y-1.5 text-xs text-surface-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> {reminder.scheduledDate}
                    </div>
                    {reminder.scheduledTime && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {reminder.scheduledTime}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-surface-400" /> {reminder.patientName || 'Unknown'}
                    </div>
                  </div>

                  {reminder.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => completeMutation.mutate(reminder.id)}
                      className="w-full mt-3"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Complete
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create Reminder" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field" placeholder="e.g. Polio Vaccination Dose 2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Type</label>
              <select value={formData.reminder_type} onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value })} className="input-field">
                {REMINDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Date</label>
              <input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Time</label>
              <input type="time" value={formData.scheduled_time} onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field min-h-[80px] resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); }}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} isLoading={createMutation.isPending} disabled={!formData.title}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
