import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AIChatbox } from './components/AIChatbox';

// Core Skill2Career Pages
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
import { OnboardingPage } from './pages/OnboardingPage';
import { BranchCurriculumPage } from './pages/BranchCurriculumPage';

// Placement-Ops-AI Reference Pages
import { PlacementOpsPage } from './pages/PlacementOpsPage';
import { ResumeAIPage } from './pages/ResumeAIPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { AICopilotPage } from './pages/AICopilotPage';
import FacultyDiscoveryDashboard from './components/dashboards/FacultyDiscoveryDashboard';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div className="spinner spinner-primary" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
        <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }} className="animate-pulse-subtle">
          Authenticating official Skill2Career session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', background: '#f8fafc' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <Outlet />
      </main>
      <AIChatbox />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Direct alias redirects for top-level paths */}
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/resume-ai" element={<Navigate to="/app/resume-ai" replace />} />
            <Route path="/skills" element={<Navigate to="/app/skills" replace />} />
            <Route path="/curriculum" element={<Navigate to="/app/curriculum" replace />} />
            <Route path="/compiler" element={<Navigate to="/app/compiler" replace />} />
            <Route path="/skill-gap" element={<Navigate to="/app/skill-gap" replace />} />
            <Route path="/trajectory" element={<Navigate to="/app/trajectory" replace />} />
            <Route path="/job-readiness" element={<Navigate to="/app/job-readiness" replace />} />
            <Route path="/careers" element={<Navigate to="/app/careers" replace />} />
            <Route path="/assessments" element={<Navigate to="/app/assessments" replace />} />
            <Route path="/ai-copilot" element={<Navigate to="/app/ai-copilot" replace />} />
            <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
            <Route path="/placement-ops" element={<Navigate to="/app/placement-ops" replace />} />
            <Route path="/agent-13" element={<Navigate to="/app/agent-13" replace />} />

            {/* Protected Student Portal & Placement Operations Suite */}
            <Route path="/app" element={<ProtectedLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="careers" element={<CareerExplorerPage />} />
              <Route path="careers/:careerId" element={<CareerDetailPage />} />
              <Route path="skill-gap" element={<SkillGapPage />} />
              <Route path="trajectory" element={<TrajectoryPage />} />
              <Route path="job-readiness" element={<JobReadinessPage />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route path="curriculum" element={<BranchCurriculumPage />} />
              <Route path="compiler" element={<BranchCurriculumPage />} />
              <Route path="profile" element={<ProfilePage />} />

              {/* Placement Ops AI & Diagnostic Suite */}
              <Route path="ai-copilot" element={<AICopilotPage />} />
              <Route path="chat" element={<AICopilotPage />} />
              <Route path="assessments" element={<AssessmentsPage />} />
              <Route path="placement-ops" element={<PlacementOpsPage />} />
              <Route path="resume-ai" element={<ResumeAIPage />} />
              <Route path="agent-13" element={<FacultyDiscoveryDashboard />} />

              <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
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
