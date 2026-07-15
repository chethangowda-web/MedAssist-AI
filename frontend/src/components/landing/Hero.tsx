import { motion } from 'framer-motion';
import { ArrowRight, Activity, Shield, Brain, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

export function Hero() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-surface-50 dark:to-surface-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/5 via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-400">AI-Powered Healthcare for Rural India</span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="gradient-text">AI Copilot</span>
              <br />
              <span className="text-surface-900 dark:text-white">for Rural Healthcare</span>
            </h1>

            <p className="text-lg lg:text-xl text-surface-600 dark:text-surface-400 mb-8 max-w-xl leading-relaxed">
              Empower ASHA workers, nurses, and rural clinics with multi-agent AI that registers patients, 
              assesses risks, searches medical knowledge, and generates reports — all in one platform.
            </p>

            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 group">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-primary inline-flex items-center gap-2 group">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/register" className="btn-secondary inline-flex items-center gap-2">
                    Create Account
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-surface-200 dark:border-surface-800">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 border-2 border-white dark:border-surface-900 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700 border-2 border-white dark:border-surface-900 flex items-center justify-center text-surface-500 text-xs font-bold">
                  +2k
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900 dark:text-white">Trusted by 2,000+</p>
                <p className="text-xs text-surface-500">Healthcare workers across India</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-accent-500/20 rounded-3xl blur-2xl" />
              <div className="relative glass-card p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-surface-200/50 dark:border-surface-700/50">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 dark:text-white">MedAssist AI</h3>
                    <p className="text-xs text-surface-500">Healthcare Assistant</p>
                  </div>
                </div>

                {[
                  { icon: Brain, text: 'Patient registration from natural language', color: 'from-blue-400 to-blue-600' },
                  { icon: Shield, text: 'AI risk assessment with Gemini', color: 'from-red-400 to-red-600' },
                  { icon: Activity, text: 'Real-time health monitoring & alerts', color: 'from-emerald-400 to-emerald-600' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{item.text}</p>
                      <p className="text-xs text-surface-500">Powered by Google Gemini AI</p>
                    </div>
                  </motion.div>
                ))}

                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-surface-500 mb-2">
                    <span>Agent Status</span>
                    <span className="text-accent-500">All active</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex-1 h-1.5 rounded-full bg-accent-500/50" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
