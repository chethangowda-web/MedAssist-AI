import { motion } from 'framer-motion';
import { cn } from '@utils/helpers';
import { AGENTS } from '@utils/constants';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AgentStatus() {
  const navigate = useNavigate();

  const getIcon = (name: string) => {
    const iconMap: Record<string, any> = {
      UserPlus: Icons.UserPlus,
      AlertTriangle: Icons.AlertTriangle,
      BookOpen: Icons.BookOpen,
      Bell: Icons.Bell,
      FileText: Icons.FileText,
      ShieldCheck: Icons.ShieldCheck,
    };
    return iconMap[name] || Icons.Activity;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {AGENTS.map((agent, index) => {
        const Icon = getIcon(agent.icon);
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            onClick={() => navigate('/agents')}
            className="glass-card p-4 text-center cursor-pointer group"
          >
            <div className={cn('w-10 h-10 mx-auto rounded-xl bg-gradient-to-br flex items-center justify-center mb-2 group-hover:scale-110 transition-transform', agent.color)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-medium text-surface-900 dark:text-white truncate">{agent.name.split(' ')[0]}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
              <span className="text-[10px] text-accent-500 font-medium">Active</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
