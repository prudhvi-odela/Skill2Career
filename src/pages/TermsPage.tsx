import React from 'react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  return (
    <div style={{ padding: '40px 24px', maxWidth: '840px', margin: '0 auto', color: '#0f172a' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ fontSize: '0.875rem', color: '#1d4ed8', fontWeight: 600 }}>
          Back to Home
        </Link>
      </div>

      <div style={{ background: '#f8f9fa', border: '1px solid #cbd5e1', padding: '32px', borderRadius: '4px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
          Last updated: September 20, 2026. Effective immediately.
        </p>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            1. Educational Platform Scope
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            Skill2Career provides academic analytics, skill-gap calculations, and machine learning career trajectory simulations for educational and self-assessment purposes. Prediction metrics and job-readiness scores are statistical estimations grounded in verified curriculum benchmarks.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            2. User Accounts and Academic Records
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            Students retain ownership of their academic coursework, diagnostic quiz submissions, and project evidence. Users are responsible for providing authentic self-ratings and maintaining the confidentiality of their credentials.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            3. Machine Learning and AI Modeling
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            The supervised gradient boosting and random forest models deployed within this platform evaluate structured student dimensions (including practical lab scores, coursework GPA, and project deliverables). These models serve as diagnostic guidance tools and do not represent formal guarantees of employment.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            4. Acceptable Conduct
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            Users agree not to submit fraudulent academic evidence, interfere with system APIs, or attempt unauthorized access to model registries. Any misuse will result in immediate termination of access.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
            5. Contact and Administration
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6 }}>
            Questions regarding academic terms or algorithmic transparency can be directed to the platform administrators at compliance@skill2career.internal.
          </p>
        </section>
      </div>
    </div>
  );
};
