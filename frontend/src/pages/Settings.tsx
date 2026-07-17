import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { useThemeStore } from '@store/themeStore';
import { useAuthStore } from '@store/authStore';
import { Sun, Moon, Bell, Shield, Globe } from 'lucide-react';

export function Settings() {
  const { isDark, toggle } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <div>
      <Header title="Settings" subtitle="Manage your preferences" />

      <div className="p-4 lg:p-6 max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-primary-500" />}
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-surface-500">Toggle dark mode for the interface</p>
                </div>
              </div>
              <button
                onClick={toggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-primary-500' : 'bg-surface-300'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {[
              { label: 'Reminder Alerts', description: 'Get notified about patient reminders' },
              { label: 'Emergency Alerts', description: 'Receive emergency case notifications' },
              { label: 'Report Ready', description: 'Get notified when reports are generated' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-surface-400" />
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-surface-500">{item.description}</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-surface-300 text-primary-500 focus:ring-primary-500" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-surface-400" />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">Email</p>
                  <p className="text-xs text-surface-500">{user?.email || 'Not set'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-surface-400" />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">Language</p>
                  <p className="text-xs text-surface-500">English (India)</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Change</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
