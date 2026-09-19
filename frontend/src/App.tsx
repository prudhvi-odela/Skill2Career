import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SkillsPage } from './pages/SkillsPage';
import { CareerExplorerPage } from './pages/CareerExplorerPage';
import { CareerDetailPage } from './pages/CareerDetailPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { JobReadinessPage } from './pages/JobReadinessPage';
import { TrajectoryPage } from './pages/TrajectoryPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ModelVersionsPage } from './pages/ModelVersionsPage';
import { CareerAIPage } from './pages/CareerAIPage';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
        Verifying secure session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Student Portal */}
            <Route path="/app" element={<ProtectedLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="ai-advisor" element={<CareerAIPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route path="careers" element={<CareerExplorerPage />} />
              <Route path="careers/:careerId" element={<CareerDetailPage />} />
              <Route path="skill-gap" element={<SkillGapPage />} />
              <Route path="job-readiness" element={<JobReadinessPage />} />
              <Route path="trajectory" element={<TrajectoryPage />} />
              <Route path="roadmap" element={<RoadmapPage />} />
              <Route path="assessments" element={<AssessmentsPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="ml-models" element={<ModelVersionsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
