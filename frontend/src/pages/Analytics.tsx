import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { dashboardApi } from '@services/api';
import {
  TrendingUp, Users, Activity, Calendar, ArrowUp, ArrowDown,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, Legend,
} from 'recharts';

const weeklyData = [
  { day: 'Mon', visits: 12, patients: 8, emergencies: 2 },
  { day: 'Tue', visits: 18, patients: 11, emergencies: 1 },
  { day: 'Wed', visits: 15, patients: 9, emergencies: 3 },
  { day: 'Thu', visits: 22, patients: 14, emergencies: 0 },
  { day: 'Fri', visits: 20, patients: 12, emergencies: 2 },
  { day: 'Sat', visits: 10, patients: 6, emergencies: 1 },
  { day: 'Sun', visits: 8, patients: 4, emergencies: 0 },
];

const monthlyData = [
  { month: 'Jan', patients: 45, visits: 89, schemes: 12 },
  { month: 'Feb', patients: 52, visits: 102, schemes: 15 },
  { month: 'Mar', patients: 61, visits: 118, schemes: 18 },
  { month: 'Apr', patients: 48, visits: 95, schemes: 14 },
  { month: 'May', patients: 72, visits: 145, schemes: 22 },
  { month: 'Jun', patients: 68, visits: 135, schemes: 20 },
];

const riskDistribution = [
  { name: 'Low Risk', value: 45, color: '#10b981' },
  { name: 'Medium', value: 28, color: '#f59e0b' },
  { name: 'High Risk', value: 18, color: '#f97316' },
  { name: 'Critical', value: 9, color: '#ef4444' },
];

const visitTypeData = [
  { type: 'General', count: 120 },
  { type: 'Emergency', count: 35 },
  { type: 'Follow-up', count: 85 },
  { type: 'Vaccination', count: 60 },
  { type: 'Prenatal', count: 40 },
];

const ageGroupData = [
  { group: '0-5', count: 25 },
  { group: '6-18', count: 35 },
  { group: '19-30', count: 55 },
  { group: '31-50', count: 70 },
  { group: '51-70', count: 45 },
  { group: '70+', count: 20 },
];

const TOOLTIP_STYLE = {
  background: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(100, 116, 139, 0.3)',
  borderRadius: '12px',
  backdropFilter: 'blur(12px)',
  color: '#f8fafc',
  fontSize: '12px',
};

export function Analytics() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => dashboardApi.getStats().then(r => r.data),
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Analytics" subtitle="Insights and trends" />
        <div className="p-6"><LoadingSpinner size="lg" className="py-20" /></div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Analytics" subtitle="Comprehensive analytics and trends" />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Patients', value: statsData?.totalPatients || 0, icon: Users, change: '+12%', color: 'from-blue-400 to-blue-600', up: true },
            { label: 'Total Visits', value: statsData?.totalVisits || 0, icon: Activity, change: '+23%', color: 'from-emerald-400 to-emerald-600', up: true },
            { label: 'Reports Generated', value: statsData?.totalReports || 0, icon: BarChart3, change: '+8%', color: 'from-amber-400 to-amber-600', up: true },
            { label: 'Active Schemes', value: statsData?.totalSchemes || 0, icon: PieChartIcon, change: '+5%', color: 'from-purple-400 to-purple-600', up: true },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs ${item.up ? 'text-emerald-500' : 'text-red-500'}`}>
                  {item.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {item.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{item.value.toLocaleString()}</p>
              <p className="text-xs text-surface-500">{item.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-primary-500" />
                <CardTitle>Weekly Trends</CardTitle>
              </div>
            </CardHeader>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="visits" stroke="#0EA5E9" fill="url(#visitsGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="patients" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent-500" />
                <CardTitle>Monthly Performance</CardTitle>
              </div>
            </CardHeader>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="patients" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="visits" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary-500" />
                <CardTitle>Risk Distribution</CardTitle>
              </div>
            </CardHeader>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-500" />
                <CardTitle>Visit Types</CardTitle>
              </div>
            </CardHeader>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={visitTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis dataKey="type" type="category" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                <CardTitle>Age Distribution</CardTitle>
              </div>
            </CardHeader>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ageGroupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                <XAxis dataKey="group" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {ageGroupData.map((_, index) => (
                    <Cell key={index} fill={['#10b981', '#34d399', '#0EA5E9', '#6366F1', '#f59e0b', '#ef4444'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
