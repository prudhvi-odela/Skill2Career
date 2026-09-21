import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, Sparkles, User, LogOut, Shield, Compass,
  LayoutDashboard, Menu, X, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Student' | 'TPO Cell' | 'Faculty'>('Student');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Only the strictly required navigation modules
  const requiredNav = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/careers', label: 'Career Engine', icon: Compass },
    { to: '/app/placement-ops', label: 'Placement Ops', icon: Briefcase },
    { to: '/app/resume-ai', label: 'Resume AI', icon: Sparkles },
    { to: '/app/agent-13', label: 'Agent 13', icon: Users },
  ];

  return (
    <nav
      id="main-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link
          to="/"
          id="nav-brand-logo"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#006EFF',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '-0.02em',
              boxShadow: '0 2px 8px rgba(0, 110, 255, 0.25)',
            }}
          >
            ED
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Placement Ops AI
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                ED-05
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '-2px' }}>
              Skill-to-Career & Multi-Agent Operations
            </span>
          </div>
        </Link>

        {/* Required Navigation Links */}
        {isAuthenticated && (
          <div
            className="hidden md:flex"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '20px' }}
          >
            {requiredNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#006EFF' : '#475569',
                    background: isActive ? '#eff6ff' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Controls */}
      {isAuthenticated && user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Active Workspace / Role Switcher */}
          <div
            id="nav-role-switcher"
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f1f5f9',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid #e2e8f0',
            }}
          >
            {(['Student', 'TPO Cell', 'Faculty'] as const).map((role) => (
              <button
                key={role}
                id={`role-btn-${role.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedRole(role)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: selectedRole === role ? 700 : 500,
                  color: selectedRole === role ? '#006EFF' : '#64748b',
                  background: selectedRole === role ? '#ffffff' : 'transparent',
                  boxShadow: selectedRole === role ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Student Target Career Pill */}
          {profile?.target_career_title && (
            <Link
              to="/app/skill-gap"
              id="nav-target-career-pill"
              title="Target Career Focus"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                textDecoration: 'none',
              }}
            >
              <span style={{ color: '#64748b', fontSize: '11px' }}>Target:</span>
              <strong style={{ color: '#006EFF', fontWeight: 700 }}>{profile.target_career_title}</strong>
            </Link>
          )}

          {/* Profile link */}
          <Link
            to="/app/profile"
            id="nav-profile-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#006EFF',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {user.full_name?.charAt(0) || 'A'}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
              {user.full_name || 'Aditya'}
            </span>
          </Link>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            id="nav-logout-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#dc2626',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            id="nav-mobile-toggle"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/login"
            id="nav-signin-link"
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            id="nav-register-link"
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              background: '#006EFF',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(0, 110, 255, 0.2)',
            }}
          >
            Get Started
          </Link>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileOpen && isAuthenticated && (
        <div
          id="nav-mobile-dropdown"
          style={{
            position: 'absolute',
            top: '60px',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 49,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}
        >
          {requiredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#006EFF' : '#475569',
                  background: isActive ? '#eff6ff' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </nav>
  );
};
