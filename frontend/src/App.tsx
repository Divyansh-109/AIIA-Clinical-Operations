import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api, setAuthToken } from './services/api';
import { HomePage } from './pages/HomePage';
import { LoginPage, getRoleDashboardPath } from './pages/LoginPage';
import { AppLayout } from './components/AppLayout';
import { PIDashboard } from './pages/PIDashboard';
import { SafetyDashboard } from './pages/SafetyDashboard';
import { CoordinatorDashboard } from './pages/CoordinatorDashboard';
import { MonitorDashboard } from './pages/MonitorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudyOverviewPage } from './pages/StudyOverviewPage';
import { PatientsPage } from './pages/PatientsPage';
import { SafetyPage } from './pages/SafetyPage';
import { ProtocolPage } from './pages/ProtocolPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { SitesPage } from './pages/SitesPage';
import { AuditPage } from './pages/AuditPage';
import { ExportPage } from './pages/ExportPage';

export function App() {
  const [currentUser, setCurrentUser] = useState<any>({
    full_name: 'Prof. (Dr.) Tanuja Manoj Nesari',
    email: 'pi@aiia.gov.in',
    role: 'PI'
  });
  const [currentRole, setCurrentRole] = useState<string>('PI');
  const [flagshipStudy, setFlagshipStudy] = useState<any>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Initialize session and study context on load
  useEffect(() => {
    const initApp = async () => {
      try {
        setInitializing(true);
        // Default login as PI to bootstrap demo session
        const loginData = await api.login('pi@aiia.gov.in', 'password123');
        setCurrentRole(loginData.role);
        setCurrentUser({
          id: loginData.user_id,
          full_name: loginData.full_name || 'Prof. (Dr.) Tanuja Manoj Nesari',
          email: loginData.email,
          role: loginData.role
        });

        // Load studies
        const sList = await api.getStudies();
        const flagship = sList.find((s: any) => s.study_code === 'AIIA-PCOS-001') || sList[0];
        setFlagshipStudy(flagship);
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setInitializing(false);
      }
    };
    initApp();
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setCurrentRole(userData.role);
    setCurrentUser({
      id: userData.user_id,
      full_name: userData.full_name,
      email: userData.email,
      role: userData.role
    });
  };

  const handleSwitchRole = async (targetRole: string, targetEmail: string) => {
    try {
      const loginData = await api.login(targetEmail, 'password123');
      setCurrentRole(loginData.role);
      setCurrentUser({
        id: loginData.user_id,
        full_name: loginData.full_name,
        email: loginData.email,
        role: loginData.role
      });
    } catch (err) {
      console.error('Switch role failed:', err);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setCurrentRole('');
  };

  if (initializing) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        color: 'var(--text-primary)'
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: 'var(--ayush-teal-dark)' }}>
          All India Institute of Ayurveda
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Loading clinical trial operations workspace...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Landing / Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* 2. Dedicated Login Portal */}
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />

        {/* 3. Logged-In Application Layout & Inner Pages (Top Header Navigation) */}
        <Route
          path="/app/*"
          element={
            <AppLayout
              currentUser={currentUser}
              currentRole={currentRole}
              flagshipStudy={flagshipStudy}
              onLogout={handleLogout}
              onSwitchRole={handleSwitchRole}
            >
              <Routes>
                {/* Dedicated Role-Specific Landing Dashboards */}
                <Route
                  path="pi-dashboard"
                  element={<PIDashboard flagshipStudy={flagshipStudy} currentRole={currentRole} />}
                />
                <Route
                  path="safety-dashboard"
                  element={<SafetyDashboard flagshipStudy={flagshipStudy} currentRole={currentRole} />}
                />
                <Route
                  path="coordinator-dashboard"
                  element={<CoordinatorDashboard flagshipStudy={flagshipStudy} currentRole={currentRole} />}
                />
                <Route
                  path="monitor-dashboard"
                  element={<MonitorDashboard flagshipStudy={flagshipStudy} currentRole={currentRole} />}
                />
                <Route
                  path="admin-dashboard"
                  element={<AdminDashboard flagshipStudy={flagshipStudy} currentRole={currentRole} />}
                />

                {/* Specific Clinical Operations Pages */}
                <Route
                  path="study"
                  element={<StudyOverviewPage flagshipStudy={flagshipStudy} currentRole={currentRole} />}
                />
                <Route
                  path="patients"
                  element={<PatientsPage flagshipStudy={flagshipStudy} currentRole={currentRole} />}
                />
                <Route
                  path="safety"
                  element={<SafetyPage flagshipStudy={flagshipStudy} currentRole={currentRole} />}
                />
                <Route
                  path="protocol"
                  element={<ProtocolPage flagshipStudy={flagshipStudy} />}
                />
                <Route
                  path="quality"
                  element={<DataQualityPage flagshipStudy={flagshipStudy} currentRole={currentRole} />}
                />
                <Route
                  path="sites"
                  element={<SitesPage flagshipStudy={flagshipStudy} />}
                />
                <Route
                  path="audit"
                  element={<AuditPage flagshipStudy={flagshipStudy} />}
                />
                <Route
                  path="export"
                  element={<ExportPage flagshipStudy={flagshipStudy} />}
                />

                {/* Catch-all for /app/ redirects dynamically to the current user's role dashboard */}
                <Route
                  path="*"
                  element={<Navigate to={getRoleDashboardPath(currentRole)} replace />}
                />
              </Routes>
            </AppLayout>
          }
        />

        {/* Default Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
