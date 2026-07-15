import { Menu, Bell, Search } from 'lucide-react';
import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';
import { cn, getInitials } from '@utils/helpers';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { user } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 glass border-b border-surface-200/50 dark:border-surface-700/50">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost p-2 -ml-2"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-surface-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-xs text-surface-500 -mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="btn-ghost p-2 relative"
          >
            <Search className="w-5 h-5" />
            <kbd className="hidden lg:inline absolute -bottom-0.5 -right-0.5 text-[9px] bg-surface-200 dark:bg-surface-700 px-1 rounded text-surface-500">
              /
            </kbd>
          </button>

          <button className="btn-ghost p-2 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-surface-200 dark:border-surface-700">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-surface-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-surface-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
              {getInitials(user?.name || 'U')}
            </div>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="px-4 lg:px-6 pb-3 animate-slide-down">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search patients, visits, agents..."
              className="input-field pl-10"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchOpen(false);
                if (e.key === 'Enter') setSearchOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
