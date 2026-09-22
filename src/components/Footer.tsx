import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Lock, CheckCircle2
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '52px 24px 32px',
        color: '#475569',
        fontSize: '0.85rem',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Top Credentials & Institutional Seal Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="/logo.png"
              alt="Skill2Career Logo"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                objectFit: 'contain',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Skill2Career
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  SkillBridge
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px' }}>
                  Official
                </span>
              </div>
              <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>
                University Competency Architecture, Predictive Job-Readiness & Placement Platform
              </div>
            </div>
          </div>

          {/* Live Node Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-pulse-dot" />
              <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#0f172a' }}>
                Placement Network Operational
              </span>
            </div>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              99.98% Uptime · 2026 Cycle
            </span>
          </div>
        </div>

        {/* 4 Official Navigation Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          
          {/* Col 1: Platform Engines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Competency Engines
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem' }}>
              <Link to="/app/skill-gap" style={{ color: '#475569', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#1e40af')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}>
                Skill Gap Matrix
              </Link>
              <Link to="/app/skill-gap" style={{ color: '#475569', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#1e40af')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}>
                Job Description Matcher (SkillBridge)
              </Link>
              <Link to="/app/trajectory" style={{ color: '#475569', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#1e40af')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}>
                Predictive Readiness Forecasting
              </Link>
              <Link to="/app/compiler" style={{ color: '#475569', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#1e40af')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}>
                Branch Compilers & Labs
              </Link>
              <Link to="/app/resume-ai" style={{ color: '#475569', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#1e40af')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}>
                Resume ATS AI Analyzer
              </Link>
            </div>
          </div>

          {/* Col 2: Institutional Diagnostics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Diagnostic Assessments
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem' }}>
              <Link to="/app/assessments" style={{ color: '#475569' }}>
                Foundation Diagnostic Tests
              </Link>
              <Link to="/app/assessments" style={{ color: '#475569' }}>
                Course Awareness Mock Test
              </Link>
              <Link to="/app/careers" style={{ color: '#475569' }}>
                Role Competency Standards
              </Link>
              <Link to="/app/curriculum" style={{ color: '#475569' }}>
                12-Week Specialized Branch Curriculum
              </Link>
              <Link to="/app/job-readiness" style={{ color: '#475569' }}>
                Placement Eligibility Clearance
              </Link>
            </div>
          </div>

          {/* Col 3: Official Governance & Legal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Official Governance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem' }}>
              <Link to="/privacy" style={{ color: '#1d4ed8', fontWeight: 700 }}>
                Official Privacy Policy →
              </Link>
              <span style={{ color: '#475569' }}>
                Placement Cell Code of Conduct
              </span>
              <span style={{ color: '#475569' }}>
                AICTE / UGC Framework Compliance
              </span>
              <span style={{ color: '#475569' }}>
                Student Data Encryption (ISO 27001)
              </span>
              <span style={{ color: '#475569' }}>
                FERPA Academic Privacy Accord
              </span>
            </div>
          </div>

          {/* Col 4: Institutional Verification */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Institutional Accreditation
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 600 }}>
                <ShieldCheck size={16} color="#16a34a" />
                <span>AICTE Approved Framework</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 600 }}>
                <Lock size={16} color="#2563eb" />
                <span>AES-256 Student Data Security</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>NIRF / NAAC Quality Metrics</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                Institutional Key: <strong>SK2C-SYS-2026-NODE</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.775rem',
            color: '#64748b',
          }}
        >
          <div>
            © {new Date().getFullYear()} Skill2Career & SkillBridge Architecture. All institutional rights reserved.
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/privacy" style={{ color: '#475569', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <span style={{ color: '#cbd5e1' }}>·</span>
            <Link to="/login" style={{ color: '#475569', textDecoration: 'none' }}>
              Official Login
            </Link>
            <span style={{ color: '#cbd5e1' }}>·</span>
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
              Student Enrollment
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
