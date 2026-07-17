import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@store/authStore';
import { useAppStore } from '@store/appStore';
import { cn } from '@utils/helpers';
import { motion } from 'framer-motion';

export function Layout() {
  const { isAuthenticated } = useAuthStore();
  const { sidebarOpen } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-0'
        )}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
