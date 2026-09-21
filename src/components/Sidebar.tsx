import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { section: 'CORE PLATFORM' },
  { path: '/app/dashboard', label: 'Dashboard' },
  { path: '/app/profile', label: 'Student Profile' },
  { path: '/app/subjects', label: 'Subjects & Curriculum' },
  { path: '/app/practice', label: 'Practice Lab' },
  { path: '/app/skills', label: 'Skills Inventory' },

  { section: 'AI & LEARNING' },
  { path: '/app/ai-advisor', label: 'AI Learning Tutor' },
  { path: '/app/onboarding', label: 'Academic Setup' },

  { section: 'CAREER & GAP ANALYSIS' },
  { path: '/app/careers', label: 'Career Explorer' },
  { path: '/app/market-intelligence', label: 'Market Intelligence' },
  { path: '/app/skill-gap', label: 'Skill Gap Analysis' },
  { path: '/app/career-readiness', label: 'Career Readiness' },
  { path: '/app/job-readiness', label: 'ML Benchmark' },

  { section: 'FUTURE & ROADMAP' },
  { path: '/app/career-forecast', label: 'Career Forecasting' },
  { path: '/app/career-transition', label: 'Career Transition' },
  { path: '/app/trajectory', label: 'Trajectory Forecaster' },
  { path: '/app/roadmap', label: 'Personalized Roadmap' },

  { section: 'VERIFICATION & WORK' },
  { path: '/app/evidence', label: 'Learning Evidence' },
  { path: '/app/learning-intelligence', label: 'Learning Intelligence' },
  { path: '/app/assessments', label: 'Skill Assessments' },
  { path: '/app/portfolio', label: 'Projects & Certs' },
  { path: '/app/ml-models', label: 'ML Model Registry' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        background: '#e9edf2',
        borderRight: '1px solid #cbd5e1',
        padding: '16px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        minHeight: 'calc(100vh - 56px)',
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
                color: '#64748b',
                letterSpacing: '0.06em',
                padding: '14px 10px 4px',
                marginTop: idx > 0 ? '4px' : '0',
              }}
            >
              {item.section}
            </div>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path!}
            style={({ isActive }) => ({
              display: 'block',
              padding: '7px 10px',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#1e3a8a' : '#334155',
              background: isActive ? '#dbeafe' : 'transparent',
              border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
            })}
          >
            {item.label}
          </NavLink>
        );
      })}
    </aside>
  );
};
