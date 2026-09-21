import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#f8f9fa',
        borderBottom: '1px solid #cbd5e1',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            background: '#1e3a8a',
            color: '#f8f9fa',
            fontWeight: 800,
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
          }}
        >
          S2C
        </div>
        <div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Skill2Career
          </span>
          <span
            style={{
              marginLeft: '8px',
              fontSize: '0.65rem',
              background: '#e2e8f0',
              color: '#334155',
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 700,
            }}
          >
            STUDENT ML PLATFORM
          </span>
        </div>
      </Link>

      {/* Target Career Badge & User Menu */}
      {isAuthenticated && user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {profile?.target_career_title && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#eef2f6',
                border: '1px solid #cbd5e1',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.8rem',
              }}
            >
              <span style={{ color: '#64748b' }}>Target:</span>
              <strong style={{ color: '#1e3a8a' }}>{profile.target_career_title}</strong>
            </div>
          )}

          <Link
            to="/app/dashboard"
            style={{
              color: '#334155',
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: '4px',
            }}
          >
            Dashboard
          </Link>

          <Link
            to="/app/ml-models"
            style={{
              color: '#334155',
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: '4px',
            }}
          >
            ML Engine
          </Link>

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/app/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#e2e8f0',
                padding: '5px 10px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '3px',
                  background: '#1e3a8a',
                  color: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{user.full_name}</span>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/terms"
            style={{ fontSize: '0.825rem', color: '#475569', marginRight: '8px' }}
          >
            Terms
          </Link>
          <Link
            to="/privacy"
            style={{ fontSize: '0.825rem', color: '#475569', marginRight: '14px' }}
          >
            Privacy
          </Link>
          <Link to="/login" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            Create Account
          </Link>
        </div>
      )}
    </nav>
  );
};
