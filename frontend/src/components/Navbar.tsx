import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  LogOut,
  User,
  Sparkles,
  Target,
  BarChart3,
  Cpu
} from 'lucide-react';

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
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
          }}
        >
          <Compass size={22} color="#ffffff" />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Skill<span className="gradient-text">2Career</span>
          </span>
          <span
            style={{
              marginLeft: '8px',
              fontSize: '0.65rem',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 700,
            }}
          >
            AI/ML
          </span>
        </div>
      </Link>

      {/* Target Career Badge & User Menu */}
      {isAuthenticated && user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {profile?.target_career_title && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.825rem',
              }}
            >
              <Target size={14} color="#6366f1" />
              <span style={{ color: '#9ca3af' }}>Target:</span>
              <strong style={{ color: '#e0e7ff' }}>{profile.target_career_title}</strong>
            </div>
          )}

          <Link
            to="/app/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <BarChart3 size={16} />
            Dashboard
          </Link>

          <Link
            to="/app/ml-models"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#a5b4fc',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <Cpu size={16} />
            ML Engine
          </Link>

          {/* User Profile avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/app/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '6px 12px',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.full_name}</span>
            </Link>

            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
};
