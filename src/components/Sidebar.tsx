import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Compass, GitCommit, Target, Trophy,
  Sparkles, Award, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'SKILL-TO-CAREER',
    items: [
      { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/app/careers', label: 'Career Explorer', icon: Compass },
      { path: '/app/skill-gap', label: 'Skill Gap Engine', icon: Target },
      { path: '/app/trajectory', label: 'Learning Trajectory', icon: GitCommit },
      { path: '/app/job-readiness', label: 'Job Readiness Prediction', icon: Trophy },
    ],
  },
  {
    title: 'AI CAREER ACCELERATOR',
    items: [
      { path: '/app/resume-ai', label: 'Resume AI Studio', icon: Sparkles },
      { path: '/app/skills', label: 'My Skills & Evidence', icon: Award },
    ],
  },
  {
    title: 'STUDENT RECORD',
    items: [
      { path: '/app/profile', label: 'Student Profile', icon: User },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { profile } = useAuth();

  return (
    <aside
      id="app-sidebar"
      style={{
        width: '240px',
        minWidth: '240px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 'calc(100vh - 60px)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {SIDEBAR_SECTIONS.map((sec, secIdx) => (
          <div key={secIdx}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#94a3b8',
                letterSpacing: '0.06em',
                padding: '0 10px',
                marginBottom: '6px',
              }}
            >
              {sec.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    id={`sidebar-link-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#006EFF' : '#475569',
                      background: isActive ? '#eff6ff' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    })}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Trajectory & Engine Status Box */}
      <div
        id="sidebar-status-card"
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Skill2Career Engine</span>
          <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Active</span>
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
          Target: <strong style={{ color: '#006EFF' }}>{profile?.target_career_title || 'Software Engineer'}</strong>
        </div>
        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
          Multi-Agent Feedback Loop Active
        </div>
      </div>
    </aside>
  );
};
