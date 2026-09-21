import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
  return (
    <div style={{ padding: '40px 24px', maxWidth: '840px', margin: '0 auto', color: '#0f172a' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ fontSize: '0.875rem', color: '#1d4ed8', fontWeight: 600 }}>
          Back to Home
        </Link>
      </div>

      <div style={{ background: '#f8f9fa', border: '1px solid #cbd5e1', padding: '32px', borderRadius: '4px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
          Last updated: September 20, 2026. Compliant with student data protection principles.
        </p>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            1. Information We Collect
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            Skill2Career processes student-provided academic attributes strictly for the purpose of skill-gap evaluation and readiness forecasting. This includes degree major, semester year, self-reported and verified skill proficiency ratings, diagnostic assessment scores, and completed lab projects.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            2. How We Use Student Data
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            Student data is evaluated through vectorized distance metrics against career requirement vectors, and normalized as feature inputs to our local supervised ML pipelines. We do not sell, license, or monetize student records to external recruiters or advertising third parties.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            3. AI Advisory and Large Language Model Processing
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            When using the AI Learning Tutor, learning queries are processed through server-side authenticated endpoints. Student personal identifiers (such as full names and email addresses) are stripped before context prompts are evaluated.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            4. Data Retention and Deletion
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            Users may request full deletion of their student profile, practice submissions, and learning evidence records at any time directly through their Profile settings or by contacting privacy@skill2career.internal.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            5. Security Standards
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            All API sessions utilize standard token authentication and industry-standard transport security. Access controls restrict assessment answers and student portfolios to verified account holders.
          </p>
        </section>
      </div>
    </div>
  );
};
