import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  path?: string;
  label?: string;
  section?: string;
}

const REQUIRED_NAV_ITEMS: NavItem[] = [
  { section: 'ED-05 ENGINE' },
  { path: '/app/dashboard', label: 'Dashboard Overview' },
  { path: '/app/careers', label: 'Career Matching' },
  { path: '/app/skill-gap', label: 'Skill Gap Analysis' },
  { path: '/app/trajectory', label: 'Learning Trajectory' },
  { path: '/app/job-readiness', label: 'Job-Readiness Prediction' },

  { section: 'STUDENT INVENTORY' },
  { path: '/app/skills', label: 'Skills & Competencies' },
  { path: '/app/profile', label: 'Student Profile' },
];

export const Sidebar: React.FC = () => {
  const { profile } = useAuth();

  return (
    <aside
      style={{
        width: '230px',
        minWidth: '230px',
        background: '#e9edf2',
        borderRight: '1px solid #cbd5e1',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 'calc(100vh - 56px)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {REQUIRED_NAV_ITEMS.map((item, idx) => {
          if (item.section) {
            return (
              <div
                key={idx}
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  padding: '12px 8px 4px',
                  marginTop: idx > 0 ? '6px' : '0',
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
                borderRadius: '3px',
                fontSize: '0.84rem',
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
      </div>

      {/* ED-05 Engine Status Footnote */}
      <div
        style={{
          background: '#f8f9fa',
          border: '1px solid #cbd5e1',
          borderRadius: '3px',
          padding: '10px',
          fontSize: '0.75rem',
          color: '#475569',
        }}
      >
        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
          ED-05 Mapping Engine
        </div>
        <div style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.4 }}>
          Target: <strong>{profile?.target_career_title || 'Software Engineer'}</strong>
        </div>
        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#15803d',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600 }}>
            Dynamic Tracking Active
          </span>
        </div>
      </div>
    </aside>
  );
};
