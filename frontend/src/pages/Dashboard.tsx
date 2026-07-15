import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@components/layout/Header';
import { StatsCard } from '@components/dashboard/StatsCard';
import { ActivityFeed } from '@components/dashboard/ActivityFeed';
import { AgentStatus } from '@components/dashboard/AgentStatus';
import { RiskChart } from '@components/dashboard/RiskChart';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { dashboardApi } from '@services/api';
import { useAppStore } from '@store/appStore';
import {
  Users, Stethoscope, Bell, AlertTriangle, Activity, FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DashboardStats } from '@types/index';

export function Dashboard() {
  const navigate = useNavigate();
  const { setDashboardStats, setActivities } = useAppStore();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats().then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: activityData } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardApi.getActivity().then(r => r.data),
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (statsData) setDashboardStats(statsData);
    if (activityData) setActivities(activityData.activities);
  }, [statsData, activityData, setDashboardStats, setActivities]);

  if (statsLoading) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Overview of your healthcare activities" />
        <div className="p-6">
          <LoadingSpinner size="lg" className="py-20" />
        </div>
      </div>
    );
  }

  const stats = statsData as DashboardStats;

  return (
    <div>
      <Header title="Dashboard" subtitle="Overview of your healthcare activities" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Patients"
            value={stats?.totalPatients || 0}
            icon={Users}
            color="from-blue-400 to-blue-600"
            onClick={() => navigate('/patients')}
          />
          <StatsCard
            title="Total Visits"
            value={stats?.totalVisits || 0}
            icon={Stethoscope}
            color="from-emerald-400 to-emerald-600"
            onClick={() => navigate('/visits')}
          />
          <StatsCard
            title="Pending Reminders"
            value={stats?.pendingReminders || 0}
            icon={Bell}
            color="from-amber-400 to-amber-600"
            onClick={() => navigate('/reminders')}
          />
          <StatsCard
            title="Emergency Cases"
            value={stats?.emergencyCases || 0}
            icon={AlertTriangle}
            color="from-red-400 to-red-600"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>AI Agents</CardTitle>
              <span className="text-xs text-accent-500 font-medium">All systems operational</span>
            </CardHeader>
            <AgentStatus />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <RiskChart
              highRisk={stats?.highRiskPatients || 0}
              mediumRisk={0}
              lowRisk={0}
              criticalRisk={stats?.criticalRiskPatients || 0}
            />
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-surface-200/50 dark:border-surface-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{stats?.highRiskPatients || 0}</p>
                <p className="text-xs text-surface-500">High Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{stats?.criticalRiskPatients || 0}</p>
                <p className="text-xs text-surface-500">Critical</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <ActivityFeed activities={activityData?.activities || []} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {stats?.recentPatients?.map((patient: any) => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {patient.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{patient.name}</p>
                    <p className="text-xs text-surface-500">{patient.patientId} · {patient.gender}</p>
                  </div>
                  <span className="text-xs text-surface-400">{patient.age}y</span>
                </div>
              ))}
              {(!stats?.recentPatients || stats.recentPatients.length === 0) && (
                <p className="text-sm text-surface-500 text-center py-4">No patients registered yet</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-500" />
                  <span className="text-sm text-surface-600 dark:text-surface-400">Reports</span>
                </div>
                <span className="text-lg font-bold text-surface-900 dark:text-white">{stats?.totalReports || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-accent-500" />
                  <span className="text-sm text-surface-600 dark:text-surface-400">Active Schemes</span>
                </div>
                <span className="text-lg font-bold text-surface-900 dark:text-white">{stats?.totalSchemes || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-surface-600 dark:text-surface-400">Emergency</span>
                </div>
                <span className="text-lg font-bold text-red-500">{stats?.emergencyCases || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
