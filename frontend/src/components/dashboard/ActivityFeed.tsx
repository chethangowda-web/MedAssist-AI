import { motion } from 'framer-motion';
import { Activity, UserPlus, AlertTriangle, FileText, Bell } from 'lucide-react';
import { formatTimeAgo, getRiskColor } from '@utils/helpers';
import type { ActivityItem } from '@types/index';
import { useNavigate } from 'react-router-dom';

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const typeIcons: Record<string, any> = {
  visit: Activity,
  registration: UserPlus,
  risk_assessment: AlertTriangle,
  report: FileText,
  reminder: Bell,
};

const typeColors: Record<string, string> = {
  visit: 'from-blue-400 to-blue-600',
  registration: 'from-emerald-400 to-emerald-600',
  risk_assessment: 'from-orange-400 to-orange-600',
  report: 'from-purple-400 to-purple-600',
  reminder: 'from-amber-400 to-amber-600',
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const navigate = useNavigate();

  if (!activities?.length) {
    return (
      <div className="text-center py-8 text-surface-500 text-sm">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.slice(0, 10).map((item, index) => {
        const Icon = typeIcons[item.type] || Activity;
        const color = typeColors[item.type] || 'from-surface-400 to-surface-600';
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => {
              if (item.patientId) navigate(`/patients/${item.patientId}`);
            }}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors group"
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0 mt-0.5`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                {item.patientName}
              </p>
              <p className="text-xs text-surface-500 truncate">{item.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-surface-400">{formatTimeAgo(item.timestamp)}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getRiskColor(item.riskLevel)}`}>
                {item.riskLevel}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
