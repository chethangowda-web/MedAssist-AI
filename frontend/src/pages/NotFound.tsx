import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center max-w-md"
      >
        <div className="glass-card p-8">
          <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-6">
            <Activity className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-6xl font-extrabold gradient-text mb-2">404</h1>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Page Not Found</h2>
          <p className="text-surface-500 mb-6">
            The page you are looking for does not exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary inline-flex items-center gap-2 justify-center">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary inline-flex items-center gap-2 justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
