import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@store/authStore';
import { cn } from '@utils/helpers';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'glass border-b border-surface-200/50 dark:border-surface-700/50'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold gradient-text">MedAssist</span>
              <span className="text-lg font-bold text-surface-900 dark:text-white ml-1">AI</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="nav-link text-sm">Home</Link>
            <Link to="/features" className="nav-link text-sm">Features</Link>
            <Link to="/agents" className="nav-link text-sm">Agents</Link>
            <Link to="/docs" className="nav-link text-sm">Docs</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm !px-5 !py-2.5">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm !px-5 !py-2.5">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-surface-200 dark:border-surface-700 glass"
          >
            <div className="px-4 py-4 space-y-2">
              <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/features" className="nav-link" onClick={() => setMobileOpen(false)}>Features</Link>
              <Link to="/agents" className="nav-link" onClick={() => setMobileOpen(false)}>Agents</Link>
              <Link to="/docs" className="nav-link" onClick={() => setMobileOpen(false)}>Docs</Link>
              <div className="pt-2 border-t border-surface-200 dark:border-surface-700">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-primary w-full text-center" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="btn-secondary flex-1 text-center" onClick={() => setMobileOpen(false)}>Sign In</Link>
                    <Link to="/register" className="btn-primary flex-1 text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
