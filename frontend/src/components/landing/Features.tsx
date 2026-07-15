import { motion } from 'framer-motion';
import {
  UserPlus, AlertTriangle, BookOpen, Bell, FileText, ShieldCheck,
  Mic, Image, MapPin, Activity, Smartphone, Cloud,
} from 'lucide-react';
import { AGENTS } from '@utils/constants';
import * as Icons from 'lucide-react';

const features = [
  {
    title: '6 AI Agents Working Together',
    description: 'Multi-agent orchestration for patient registration, risk assessment, knowledge search, reminders, reports, and scheme recommendations.',
    icon: Activity,
    color: 'from-blue-400 to-blue-600',
  },
  {
    title: 'Natural Language Registration',
    description: 'Register patients by typing or speaking natural language. AI extracts all relevant medical information automatically.',
    icon: Mic,
    color: 'from-purple-400 to-purple-600',
  },
  {
    title: 'Medical Risk Assessment',
    description: 'Gemini-powered risk detection for hypertension, diabetes, pregnancy complications, malnutrition, and emergencies.',
    icon: AlertTriangle,
    color: 'from-red-400 to-red-600',
  },
  {
    title: 'RAG-Powered Medical Knowledge',
    description: 'Semantic search across WHO guidelines, government schemes, and medical documents using Qdrant vector database.',
    icon: BookOpen,
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    title: 'Smart Reminders & Scheduling',
    description: 'Automated vaccination schedules, medicine reminders, follow-ups, pregnancy checkups, and child health visits.',
    icon: Bell,
    color: 'from-amber-400 to-amber-600',
  },
  {
    title: 'PDF Report Generation',
    description: 'Generate patient summaries, medical reports, referral letters, and visit reports with one click.',
    icon: FileText,
    color: 'from-rose-400 to-rose-600',
  },
  {
    title: 'Government Scheme Advisor',
    description: 'AI recommends Ayushman Bharat, maternal schemes, child schemes, and insurance based on patient profile.',
    icon: ShieldCheck,
    color: 'from-cyan-400 to-cyan-600',
  },
  {
    title: 'Voice & Image Support',
    description: 'Voice input for registration, OCR for medical reports, medicine scanner, and image upload for analysis.',
    icon: Image,
    color: 'from-indigo-400 to-indigo-600',
  },
  {
    title: 'Emergency Response',
    description: 'One-tap emergency button with risk alerts, nearby hospital locator, and instant referral coordination.',
    icon: MapPin,
    color: 'from-orange-400 to-orange-600',
  },
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-surface-900 dark:text-white mb-4">
            Everything a Rural Healthcare Worker Needs
          </h2>
          <p className="text-lg text-surface-500 max-w-2xl mx-auto">
            Six specialized AI agents working together to provide comprehensive healthcare assistance
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card p-6 group hover:shadow-2xl transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
