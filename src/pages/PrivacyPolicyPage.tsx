import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, CheckCircle, Mail, Phone, Building } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Navigation & Header */}
        <div>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#2563eb',
              marginBottom: '16px',
            }}
          >
            <ArrowLeft size={16} /> Return to Homepage
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Official Institutional Document
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Effective Date: Academic Year 2026-2027 · ISO 27001 Certified
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 8px 0', letterSpacing: '-0.02em' }}>
            Official Privacy & Data Protection Policy
          </h1>
          <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, lineHeight: 1.55 }}>
            Skill2Career and SkillBridge operate in full compliance with National Institutional Accreditation, AICTE Technical Education Frameworks, FERPA Student Privacy Standards, and International ISO/IEC 27001 Information Security Guidelines.
          </p>
        </div>

        {/* Core Principles Callout */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <Lock size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Zero Data Monetization</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                Student profiles, resumes, and test scores are never sold to data brokers or advertising networks.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <ShieldCheck size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>AES-256 Encryption</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                All skill diagnostics, compiler outputs, and academic transcripts are encrypted at rest and in transit.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <CheckCircle size={22} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Placement Consent</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                Recruiter access requires explicit student authorization on a per-job application basis.
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            lineHeight: 1.6,
            color: '#334155',
            fontSize: '0.9rem',
          }}
        >
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              1. Information We Collect
            </h2>
            <p style={{ margin: '0 0 10px 0' }}>
              We collect information necessary to deliver authentic skill-to-career gap analytics, predictive readiness forecasting, and institutional campus placement coordination:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Academic Profile Data:</strong> Student full name, institutional email, university roll number, engineering branch, semester level, and cumulative GPA.</li>
              <li><strong>Skill Assessments & Diagnostic Data:</strong> Self-reported competency ratings, Course Awareness Mock Test responses, verified assessment scores, and compiler lab outputs.</li>
              <li><strong>Placement Preferences:</strong> Target career paths, desired employment locations, salary expectations, and uploaded resume files.</li>
              <li><strong>Platform Telemetry:</strong> Logins, simulated study hours per week, and milestone completion progress.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              2. How Student Data Is Utilized
            </h2>
            <p style={{ margin: '0 0 10px 0' }}>
              Information collected is used strictly for institutional educational and career enablement objectives:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Computing explainable readiness indices against real job descriptions and industry benchmarks.</li>
              <li>Generating personalized 4-phase milestone learning paths to remediate identified competency deficits.</li>
              <li>Equipping University Faculty and Placement Officers with anonymized cohort analytics to improve curriculum relevancy.</li>
              <li>Verifying candidate eligibility for on-campus drives and corporate partner interview shortlists.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              3. Recruiter Sharing & Student Consent
            </h2>
            <p style={{ margin: 0 }}>
              Corporate recruiters and hiring partners cannot browse private student profiles without prior academic authorization. When a student chooses to apply for an active placement opening or campus drive, their verified skill badge, Course Awareness rating, and sanitized resume are shared solely with that verified hiring organization.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              4. Data Retention & Student Rights
            </h2>
            <p style={{ margin: 0 }}>
              Students retain full ownership of their data. You have the right to inspect your competency record, request modifications to inaccurate entries, export your diagnostic transcript, or permanently delete your account upon graduation.
            </p>
          </section>

          <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              5. Official Institutional Contacts
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="#2563eb" />
                <span>dpo-compliance@skill2career.ac.in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={16} color="#2563eb" />
                <span>Placement Operations Directorate, Tech Campus Node</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="#2563eb" />
                <span>Toll-Free Verification: +1 (800) 555-SKILL</span>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
