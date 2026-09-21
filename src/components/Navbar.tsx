import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles, LogOut, Compass,
  LayoutDashboard, Menu, X, GraduationCap, Target, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, profile, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(true);
    const timer = setTimeout(() => setNavigating(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Student-first navigation modules
  const requiredNav = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/careers', label: 'Career Explorer', icon: Compass },
    { to: '/app/skill-gap', label: 'Skill Gap Engine', icon: Target },
    { to: '/app/resume-ai', label: 'Resume AI Studio', icon: Sparkles },
    { to: '/app/profile', label: 'Student Profile', icon: UserCheck },
  ];

  return (
    <>
      {(navigating || isLoading) && (
        <div
          id="global-top-loader"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            zIndex: 9999,
            background: 'linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa, #1e40af)',
            backgroundSize: '200% 100%',
            animation: 'shimmerLoader 1s infinite linear',
          }}
        />
      )}
      <nav
        id="main-navbar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          height: '62px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
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
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(30, 64, 175, 0.25)',
            }}
          >
            <GraduationCap size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Skill2Career
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  background: '#eff6ff',
                  color: '#1e40af',
                  border: '1px solid #bfdbfe',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Official
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '-2px' }}>
              Career Readiness & Placement Architecture
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
            className="btn-secondary"
            style={{
              padding: '7px 16px',
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            id="nav-register-link"
            className="btn-primary"
            style={{
              padding: '7px 18px',
              fontSize: '13px',
              textDecoration: 'none',
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
                  color: isActive ? '#1e40af' : '#475569',
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
    </>
  );
};
