import { motion } from 'framer-motion';
import { cn } from '@utils/helpers';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: { value: number; isUp: boolean };
  onClick?: () => void;
}

export function StatsCard({ title, value, icon: Icon, color, trend, onClick }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={onClick}
      className={cn('stat-card cursor-pointer group', onClick && 'cursor-pointer')}
    >
      <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-500 font-medium">{title}</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
          {trend && (
            <span className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              trend.isUp ? 'text-accent-500' : 'text-red-500'
            )}>
              {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
