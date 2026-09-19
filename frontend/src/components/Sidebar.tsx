import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Sliders,
  Compass,
  GitPullRequest,
  CheckCircle2,
  TrendingUp,
  Map,
  BookOpenCheck,
  FolderGit2,
  Cpu,
  Sparkles,
  Globe2
} from 'lucide-react';

const NAV_ITEMS = [
  { section: 'CORE PLATFORM' },
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/profile', label: 'Student Profile', icon: User },
  { path: '/app/skills', label: 'Skills Inventory', icon: Sliders },

  { section: 'AI & INTELLIGENCE' },
  { path: '/app/ai-advisor', label: 'AI Career Advisor', icon: Sparkles },

  { section: 'CAREER & GAP ANALYSIS' },
  { path: '/app/careers', label: 'Career Explorer', icon: Compass },
  { path: '/app/market-intelligence', label: 'Market Intelligence', icon: Globe2 },
  { path: '/app/skill-gap', label: 'Skill Gap Analysis', icon: GitPullRequest },
  { path: '/app/job-readiness', label: 'Job Readiness', icon: CheckCircle2 },

  { section: 'FUTURE & ROADMAP' },
  { path: '/app/trajectory', label: 'Trajectory Forecaster', icon: TrendingUp },
  { path: '/app/roadmap', label: 'Personalized Roadmap', icon: Map },

  { section: 'VERIFICATION & WORK' },
  { path: '/app/assessments', label: 'Skill Assessments', icon: BookOpenCheck },
  { path: '/app/portfolio', label: 'Projects & Certs', icon: FolderGit2 },
  { path: '/app/ml-models', label: 'ML Model Registry', icon: Cpu },
];

export const Sidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      {NAV_ITEMS.map((item, idx) => {
        if (item.section) {
          return (
            <div
              key={idx}
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#6b7280',
                letterSpacing: '0.06em',
                padding: '16px 12px 6px',
                marginTop: idx > 0 ? '4px' : '0',
              }}
            >
              {item.section}
            </div>
          );
        }

        const Icon = item.icon!;
        return (
          <NavLink
            key={item.path}
            to={item.path!}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#ffffff' : '#9ca3af',
              background: isActive
                ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)'
                : 'transparent',
              borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};
