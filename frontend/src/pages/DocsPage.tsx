import { Link } from 'react-router-dom';
import { Navbar } from '@components/landing/Navbar';
import { Footer } from '@components/landing/Footer';
import { motion } from 'framer-motion';
import {
  BookOpen, FileText, Settings, UserPlus, ShieldCheck,
  AlertTriangle, Bell, Mic, Image, Brain, ArrowRight,
} from 'lucide-react';

const docSections = [
  {
    title: 'Getting Started',
    description: 'Learn how to set up your account, register patients, and navigate the dashboard.',
    icon: UserPlus,
    color: 'from-blue-400 to-blue-600',
    items: ['Account creation & login', 'Dashboard overview', 'Patient registration', 'Navigation guide'],
  },
  {
    title: 'AI Agents',
    description: 'Understand each AI agent and how to use them effectively in your workflow.',
    icon: Brain,
    color: 'from-purple-400 to-purple-600',
    items: ['Patient Registration Agent', 'Risk Assessment Agent', 'Medical Knowledge Agent', 'Reminder Scheduler', 'Report Generator', 'Scheme Advisor'],
  },
  {
    title: 'Clinical Features',
    description: 'Detailed guides for clinical tools and emergency response features.',
    icon: AlertTriangle,
    color: 'from-red-400 to-red-600',
    items: ['Risk assessment', 'Emergency response', 'Medicine scanner', 'Voice assistant'],
  },
  {
    title: 'Voice & OCR',
    description: 'Use voice commands and OCR scanning for faster data entry and analysis.',
    icon: Mic,
    color: 'from-emerald-400 to-emerald-600',
    items: ['Speech-to-text registration', 'Text-to-speech', 'Prescription OCR', 'Document scanning'],
  },
  {
    title: 'Reports & Analytics',
    description: 'Generate reports and analyze healthcare trends in your community.',
    icon: FileText,
    color: 'from-amber-400 to-amber-600',
    items: ['PDF report generation', 'Visit reports', 'Analytics dashboard', 'Data export'],
  },
  {
    title: 'Government Schemes',
    description: 'Help patients find and apply for applicable government healthcare schemes.',
    icon: ShieldCheck,
    color: 'from-cyan-400 to-cyan-600',
    items: ['Scheme recommendations', 'Eligibility checking', 'Application process', 'Ayushman Bharat'],
  },
];

export function DocsPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
              <BookOpen className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-400">Documentation</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">
              How to Use MedAssist AI
            </h1>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              Comprehensive guides to help healthcare workers make the most of every feature
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4`}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">{section.title}</h3>
                <p className="text-sm text-surface-500 mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 group">
              Get Started with MedAssist AI
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
