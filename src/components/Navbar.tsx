import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/app/dashboard', label: 'Dashboard' },
    { to: '/app/careers', label: 'Career Matches' },
    { to: '/app/skill-gap', label: 'Skill Gap Analysis' },
    { to: '/app/trajectory', label: 'Learning Trajectory' },
    { to: '/app/job-readiness', label: 'Job Readiness' },
    { to: '/app/skills', label: 'My Skills' },
  ];

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#f8f9fa',
        borderBottom: '1px solid #cbd5e1',
        padding: '0 20px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span
            style={{
              padding: '3px 7px',
              borderRadius: '3px',
              background: '#1e3a8a',
              color: '#f8f9fa',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
            }}
          >
            ED-05
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Skill2Career
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              background: '#e2e8f0',
              color: '#475569',
              padding: '2px 5px',
              borderRadius: '2px',
              fontWeight: 700,
            }}
          >
            MAPPING ENGINE
          </span>
        </Link>

        {/* Required Navigation Links for Authenticated Students */}
        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '12px' }}>
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  padding: '6px 12px',
                  borderRadius: '3px',
                  fontSize: '0.825rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#1e3a8a' : '#475569',
                  background: isActive ? '#e0e7ff' : 'transparent',
                  border: isActive ? '1px solid #c7d2fe' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'background-color 0.15s ease',
                  whiteSpace: 'nowrap',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      {isAuthenticated && user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {profile?.target_career_title && (
            <Link
              to="/app/skill-gap"
              title="Click to view target career skill gaps"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#eef2f6',
                border: '1px solid #cbd5e1',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '0.78rem',
                textDecoration: 'none',
              }}
            >
              <span style={{ color: '#64748b' }}>Target:</span>
              <strong style={{ color: '#1e3a8a' }}>{profile.target_career_title}</strong>
            </Link>
          )}

          {/* Student Profile */}
          <Link
            to="/app/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#e2e8f0',
              padding: '4px 8px',
              borderRadius: '3px',
              border: '1px solid #cbd5e1',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '2px',
                background: '#1e3a8a',
                color: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              {user.full_name?.charAt(0) || 'S'}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
              {user.full_name || 'Student'}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: '3px',
              padding: '4px 9px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/terms"
            style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none' }}
          >
            Terms
          </Link>
          <Link
            to="/privacy"
            style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none', marginRight: '6px' }}
          >
            Privacy
          </Link>
          <Link
            to="/login"
            className="btn-secondary"
            style={{ padding: '5px 12px', fontSize: '0.8rem' }}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="btn-primary"
            style={{ padding: '5px 12px', fontSize: '0.8rem' }}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};
