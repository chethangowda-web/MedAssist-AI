import { Header } from '@components/layout/Header';
import { Card, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { useAuthStore } from '@store/authStore';
import { useAuth } from '@hooks/useAuth';
import { getInitials } from '@utils/helpers';
import { Mail, Phone, Shield, Calendar, LogOut } from 'lucide-react';

export function Profile() {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <div>
      <Header title="Profile" subtitle="Your account information" />

      <div className="p-4 lg:p-6 max-w-2xl space-y-6">
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(user?.name || 'U')}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">{user?.name || 'User'}</h2>
              <p className="text-sm text-surface-500 capitalize">{user?.role?.replace(/_/g, ' ') || 'Healthcare Worker'}</p>
            </div>
            <div className="sm:ml-auto">
              <Button variant="secondary" size="sm">Edit Profile</Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <Mail className="w-5 h-5 text-surface-400" />
              <div className="flex-1">
                <p className="text-xs text-surface-500">Email</p>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{user?.email || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <Phone className="w-5 h-5 text-surface-400" />
              <div className="flex-1">
                <p className="text-xs text-surface-500">Phone</p>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{user?.phone || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <Shield className="w-5 h-5 text-surface-400" />
              <div className="flex-1">
                <p className="text-xs text-surface-500">Role</p>
                <p className="text-sm font-medium text-surface-900 dark:text-white capitalize">{user?.role?.replace(/_/g, ' ') || 'Healthcare Worker'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <Calendar className="w-5 h-5 text-surface-400" />
              <div className="flex-1">
                <p className="text-xs text-surface-500">Member Since</p>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{user?.createdAt || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start" onClick={() => {}}>
              Change Password
            </Button>
            <Button
              variant="danger"
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
