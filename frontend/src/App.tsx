import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@components/layout/Layout';
import { ProtectedRoute } from '@components/common/ProtectedRoute';
import { PageLoader } from '@components/ui/LoadingSpinner';
import { Landing } from '@pages/Landing';
import { FeaturesPage } from '@pages/FeaturesPage';
import { DocsPage } from '@pages/DocsPage';
import { PublicAgentsPage } from '@pages/PublicAgentsPage';
import { Login } from '@pages/Login';
import { Register } from '@pages/Register';
import { Dashboard } from '@pages/Dashboard';
import { Patients } from '@pages/Patients';
import { PatientDetail } from '@pages/PatientDetail';
import { Visits } from '@pages/Visits';
import { Agents } from '@pages/Agents';
import { Reminders } from '@pages/Reminders';
import { Reports } from '@pages/Reports';
import { Schemes } from '@pages/Schemes';
import { EmergencyPage } from '@pages/EmergencyPage';
import { VoicePage } from '@pages/VoicePage';
import { OcrPage } from '@pages/OcrPage';
import { MedicinePage } from '@pages/MedicinePage';
import { Analytics } from '@pages/Analytics';
import { Settings } from '@pages/Settings';
import { Profile } from '@pages/Profile';
import { NotFound } from '@pages/NotFound';
import { useAuthStore } from '@store/authStore';
import { useThemeStore } from '@store/themeStore';
import { useAuth } from '@hooks/useAuth';

function AppContent() {
  useAuth();
  const { isLoading } = useAuthStore();
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/agents" element={<PublicAgentsPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/visits" element={<Visits />} />
        <Route path="/app/agents" element={<Agents />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/voice" element={<VoicePage />} />
        <Route path="/ocr" element={<OcrPage />} />
        <Route path="/medicine" element={<MedicinePage />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return <AppContent />;
}

export default App;
