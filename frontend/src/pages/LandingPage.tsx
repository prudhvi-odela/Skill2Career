import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  GitPullRequest,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
  BarChart2,
  Code
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '90px 24px 70px',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#a5b4fc',
            marginBottom: '28px',
          }}
        >
          <Sparkles size={16} />
          <span>Real Supervised ML & Trajectory Forecasting</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '24px',
            maxWidth: '900px',
          }}
        >
          Bridge Your <span className="gradient-text">Skill Gaps</span>. Predict Your{' '}
          <span className="gradient-text">Career Readiness</span>.
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: '#9ca3af',
            maxWidth: '720px',
            lineHeight: 1.6,
            marginBottom: '40px',
          }}
        >
          Skill2Career analyzes your student skill profile against industry standards, executes verified ML models to evaluate job-readiness, and forecasts your future career trajectory.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/register"
            className="btn-primary"
            style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: '12px' }}
          >
            <span>Analyze Your Profile Now</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: '12px' }}
          >
            Sign In with Demo Account
          </Link>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 24px 90px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          width: '100%',
        }}
      >
        <div className="glass-card glass-card-interactive" style={{ padding: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              color: '#818cf8',
            }}
          >
            <GitPullRequest size={24} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '12px' }}>Vectorized Skill Gap Analysis</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Calculates exact proficiency deltas against 10+ real-world tech career roles with weighted importance and required competence levels.
          </p>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              color: '#34d399',
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '12px' }}>Supervised Job-Readiness ML</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Trained Gradient Boosting model evaluates 12 structured student dimensions to provide a verifiable job-readiness score (0–100%).
          </p>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              color: '#22d3ee',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '12px' }}>Future Trajectory Forecaster</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Simulate your growth over 24 weeks. Adjust study hours and learning velocity to visualize when you reach candidate readiness.
          </p>
        </div>
      </section>
    </div>
  );
};
