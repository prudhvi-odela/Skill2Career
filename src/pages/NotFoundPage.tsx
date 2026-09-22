import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Home, LayoutDashboard, User, ArrowLeft, Search, BookOpen, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)',
      }}
    >
      <div
        className="panel-card animate-slide-up"
        style={{
          maxWidth: '620px',
          width: '100%',
          padding: '48px 36px',
          borderRadius: '24px',
          background: '#ffffff',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
      >
        {/* Visual Badge / Error Code */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: '#eff6ff',
            color: '#2563eb',
            fontWeight: 700,
            fontSize: '0.85rem',
            marginBottom: '20px',
            border: '1px solid #dbeafe',
          }}
        >
          <Compass size={16} className="animate-spin" style={{ animationDuration: '8s' }} />
          404 &bull; Page Not Found
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            color: '#0f172a',
            margin: '0 0 12px',
            letterSpacing: '-0.03em',
          }}
        >
          Lost in Career Space?
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: '#64748b',
            lineHeight: 1.6,
            maxWidth: '480px',
            margin: '0 auto 32px',
          }}
        >
          The page or skill milestone you requested couldn&apos;t be found. It may have been moved, renamed, or is currently undergoing synchronization.
        </p>

        {/* Quick Navigation Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '32px',
            textAlign: 'left',
          }}
        >
          <Link
            to={isAuthenticated ? '/app/dashboard' : '/'}
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              textDecoration: 'none',
              color: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            className="hover:border-blue-500 hover:bg-blue-50/50"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem' }}>
              <LayoutDashboard size={18} />
              {isAuthenticated ? 'Dashboard' : 'Home'}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {isAuthenticated ? 'Student insights & stats' : 'Platform homepage'}
            </span>
          </Link>

          <Link
            to={isAuthenticated ? '/app/profile' : '/login'}
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              textDecoration: 'none',
              color: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            className="hover:border-blue-500 hover:bg-blue-50/50"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 700, fontSize: '0.9rem' }}>
              <User size={18} />
              {isAuthenticated ? 'My Profile' : 'Sign In'}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {isAuthenticated ? 'Competency & resume' : 'Access your account'}
            </span>
          </Link>

          <Link
            to={isAuthenticated ? '/app/careers' : '/register'}
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              textDecoration: 'none',
              color: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            className="hover:border-blue-500 hover:bg-blue-50/50"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', fontWeight: 700, fontSize: '0.9rem' }}>
              <Briefcase size={18} />
              {isAuthenticated ? 'Career Roles' : 'Sign Up'}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {isAuthenticated ? '320+ verified roles' : 'Get started free'}
            </span>
          </Link>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <Link
            to={isAuthenticated ? '/app/dashboard' : '/'}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            }}
          >
            <Home size={16} />
            Return to Safety
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
