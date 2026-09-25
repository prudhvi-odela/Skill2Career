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
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { Footer } from './components/Footer';
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
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { PlacementOpsPage } from './pages/PlacementOpsPage';
import { ResumeAIPage } from './pages/ResumeAIPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { AICopilotPage } from './pages/AICopilotPage';
import { JobsPage } from './pages/JobsPage';
import { CodingPracticePage } from './pages/CodingPracticePage';
import FacultyDiscoveryDashboard from './components/dashboards/FacultyDiscoveryDashboard';
import { LogoLoader } from './components/LogoLoader';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/60 p-6">
        <LogoLoader
          size="fullscreen"
          text="Authenticating Skill2Career Session..."
          subtext="Verifying university placement credentials & competency architecture"
        />
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
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />
            <Route path="/auth/github/callback" element={<OAuthCallbackPage />} />
            <Route path="/auth/google/callback" element={<OAuthCallbackPage />} />
            <Route path="/auth/linkedin/callback" element={<OAuthCallbackPage />} />

            {/* Direct alias redirects for top-level paths */}
            <Route path="/onboard" element={<Navigate to="/onboarding" replace />} />
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/resume-ai" element={<Navigate to="/app/resume-ai" replace />} />
            <Route path="/skills" element={<Navigate to="/app/skills" replace />} />
            <Route path="/curriculum" element={<Navigate to="/app/curriculum" replace />} />
            <Route path="/compiler" element={<Navigate to="/app/practice" replace />} />
            <Route path="/practice" element={<Navigate to="/app/practice" replace />} />
            <Route path="/coding" element={<Navigate to="/app/practice" replace />} />
            <Route path="/skill-gap" element={<Navigate to="/app/skill-gap" replace />} />
            <Route path="/trajectory" element={<Navigate to="/app/trajectory" replace />} />
            <Route path="/job-readiness" element={<Navigate to="/app/job-readiness" replace />} />
            <Route path="/careers" element={<Navigate to="/app/careers" replace />} />
            <Route path="/assessments" element={<Navigate to="/app/assessments" replace />} />
            <Route path="/ai-copilot" element={<Navigate to="/app/ai-copilot" replace />} />
            <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
            <Route path="/placement-ops" element={<Navigate to="/app/placement-ops" replace />} />
            <Route path="/agent-13" element={<Navigate to="/app/agent-13" replace />} />
            <Route path="/jobs" element={<Navigate to="/app/jobs" replace />} />

            {/* Protected Student Portal & Placement Operations Suite */}
            <Route path="/app" element={<ProtectedLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="practice" element={<CodingPracticePage />} />
              <Route path="coding" element={<CodingPracticePage />} />
              <Route path="careers" element={<CareerExplorerPage />} />
              <Route path="careers/:careerId" element={<CareerDetailPage />} />
              <Route path="skill-gap" element={<SkillGapPage />} />
              <Route path="trajectory" element={<TrajectoryPage />} />
              <Route path="job-readiness" element={<JobReadinessPage />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route path="curriculum" element={<BranchCurriculumPage />} />
              <Route path="compiler" element={<CodingPracticePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="onboarding" element={<OnboardingPage />} />

              {/* Placement Ops AI & Diagnostic Suite */}
              <Route path="ai-copilot" element={<AICopilotPage />} />
              <Route path="chat" element={<AICopilotPage />} />
              <Route path="assessments" element={<AssessmentsPage />} />
              <Route path="placement-ops" element={<PlacementOpsPage />} />
              <Route path="resume-ai" element={<ResumeAIPage />} />
              <Route path="agent-13" element={<FacultyDiscoveryDashboard />} />

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Global 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
