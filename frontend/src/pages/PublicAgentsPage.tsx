import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@components/landing/Navbar';
import { Footer } from '@components/landing/Footer';
import { AGENTS } from '@utils/constants';
import { cn } from '@utils/helpers';
import * as Icons from 'lucide-react';

const agentDetails = [
  {
    ...AGENTS[0],
    capabilities: ['Natural language processing', 'Structured data extraction', 'Duplicate detection', 'Multi-language support'],
  },
  {
    ...AGENTS[1],
    capabilities: ['Vital sign analysis', 'Risk scoring', 'Emergency detection', 'Recommendation generation'],
  },
  {
    ...AGENTS[2],
    capabilities: ['WHO guidelines search', 'Medical document RAG', 'Drug information', 'Treatment protocols'],
  },
  {
    ...AGENTS[3],
    capabilities: ['Vaccination scheduling', 'Medicine reminders', 'Follow-up tracking', 'Multi-channel alerts'],
  },
  {
    ...AGENTS[4],
    capabilities: ['Patient summaries', 'Medical reports', 'Referral letters', 'Visit documentation'],
  },
  {
    ...AGENTS[5],
    capabilities: ['Ayushman Bharat check', 'Scheme matching', 'Eligibility analysis', 'Application guidance'],
  },
];

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

export function PublicAgentsPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
              <Icons.Brain className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-400">Multi-Agent System</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">
              Six Specialized AI Agents
            </h1>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Each agent is designed for a specific healthcare task, working together seamlessly
            </p>
          </motion.div>

          <div className="space-y-8">
            {agentDetails.map((agent, index) => {
              const Icon = getIcon(agent.icon);
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 lg:p-8"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className={cn('w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0', agent.color)}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">{agent.name}</h3>
                      <p className="text-surface-500 mb-4">{agent.description}</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {agent.capabilities.map((cap) => (
                          <div
                            key={cap}
                            className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                            {cap}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-surface-500 mb-4">Ready to try the agents?</p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 group">
              Get Started Free
              <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
