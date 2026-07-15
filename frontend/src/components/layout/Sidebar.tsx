import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Stethoscope, Brain, Bell,
  FileText, ShieldCheck, LogOut, X, Menu,
  Activity, AlertTriangle, Mic, ScanLine, Pill, BarChart3,
} from 'lucide-react';
import { cn } from '@utils/helpers';
import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';
import { useThemeStore } from '@store/themeStore';
import { useAuth } from '@hooks/useAuth';
import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/visits', label: 'Visits', icon: Stethoscope },
  { path: '/agents', label: 'AI Agents', icon: Brain },
  { path: '/reminders', label: 'Reminders', icon: Bell },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/schemes', label: 'Schemes', icon: ShieldCheck },
  { path: '/emergency', label: 'Emergency', icon: AlertTriangle },
  { path: '/voice', label: 'Voice', icon: Mic },
  { path: '/ocr', label: 'OCR Scan', icon: ScanLine },
  { path: '/medicine', label: 'Medicine', icon: Pill },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { user } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 w-[260px]',
          'glass border-r border-surface-200/50 dark:border-surface-700/50',
          'flex flex-col'
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-200/50 dark:border-surface-700/50">
          <NavLink to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">MedAssist</h1>
              <p className="text-[10px] text-surface-500 -mt-1">AI Healthcare</p>
            </div>
          </NavLink>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn('nav-link group', isActive && 'active')
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
              {location.pathname === item.path && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-primary-500/10 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-200/50 dark:border-surface-700/50 space-y-2">
          <button onClick={toggle} className="nav-link w-full">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-100/50 dark:bg-surface-800/50">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-surface-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
