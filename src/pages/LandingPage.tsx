import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DEMO_CAREERS = [
  {
    id: 'c1',
    title: 'Machine Learning Engineer',
    skills: [
      { name: 'Python Programming', required: 5, user: 3, weight: 1.0 },
      { name: 'Machine Learning Foundations', required: 4, user: 2, weight: 0.9 },
      { name: 'Deep Learning & Neural Networks', required: 4, user: 1, weight: 0.8 },
      { name: 'SQL & Data Engineering', required: 3, user: 3, weight: 0.6 },
    ],
  },
  {
    id: 'c2',
    title: 'Full Stack Web Developer',
    skills: [
      { name: 'JavaScript & TypeScript', required: 5, user: 4, weight: 1.0 },
      { name: 'React Frontend Architecture', required: 4, user: 3, weight: 0.9 },
      { name: 'Node.js Backend APIs', required: 4, user: 2, weight: 0.8 },
      { name: 'Relational Database Design', required: 3, user: 3, weight: 0.7 },
    ],
  },
  {
    id: 'c3',
    title: 'Cloud DevOps Specialist',
    skills: [
      { name: 'Docker & Containerization', required: 5, user: 2, weight: 1.0 },
      { name: 'Kubernetes Cluster Ops', required: 4, user: 1, weight: 0.9 },
      { name: 'Linux System Administration', required: 4, user: 3, weight: 0.8 },
      { name: 'CI/CD Pipeline Automation', required: 4, user: 2, weight: 0.7 },
    ],
  },
];

export const LandingPage: React.FC = () => {
  const [selectedCareerIndex, setSelectedCareerIndex] = useState(0);
  const activeCareer = DEMO_CAREERS[selectedCareerIndex];
  const [skillLevels, setSkillLevels] = useState<number[]>(
    activeCareer.skills.map((s) => s.user)
  );

  const handleCareerChange = (index: number) => {
    setSelectedCareerIndex(index);
    setSkillLevels(DEMO_CAREERS[index].skills.map((s) => s.user));
  };

  const handleLevelChange = (skillIdx: number, newLevel: number) => {
    const updated = [...skillLevels];
    updated[skillIdx] = newLevel;
    setSkillLevels(updated);
  };

  // Real-time calculation of weighted readiness
  const totalWeight = activeCareer.skills.reduce((acc, s) => acc + s.weight, 0);
  const weightedScore = activeCareer.skills.reduce((acc, s, idx) => {
    const userVal = skillLevels[idx] || 0;
    const ratio = Math.min(1, userVal / s.required);
    return acc + ratio * s.weight;
  }, 0);
  const liveReadinessScore = Math.round((weightedScore / totalWeight) * 100);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f2f5' }}>
      {/* Platform Header */}
      <section
        style={{
          padding: '60px 24px 40px',
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            background: '#e2e8f0',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#1e3a8a',
            marginBottom: '16px',
            letterSpacing: '0.04em',
          }}
        >
          SUPERVISED ML & TRAJECTORY FORECASTING
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#0f172a',
            marginBottom: '16px',
            maxWidth: '850px',
          }}
        >
          Skill-to-Career Gap Analysis and Job-Readiness Prediction
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            color: '#475569',
            maxWidth: '740px',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          Skill2Career benchmarks student competency matrices against verified industry roles. Supervised machine learning models evaluate 12 structured academic dimensions to calculate candidate readiness and forecast future career milestones.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            to="/register"
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.95rem' }}
          >
            Create Student Account
          </Link>
          <Link
            to="/login"
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.95rem' }}
          >
            Access Demo Workspace
          </Link>
          <Link
            to="/app/careers"
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.95rem' }}
          >
            Explore Career Matches
          </Link>
        </div>
      </section>

      {/* Interactive Live Product Demo (Two-column layout, not 3 cards in a row) */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto 60px',
          padding: '0 24px',
          width: '100%',
        }}
      >
        <div
          style={{
            background: '#f8f9fa',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            padding: '24px',
          }}
        >
          <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Live Diagnostic Demo: Interactive Skill-Gap Calculation
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                  Select a target role below and adjust proficiency levels (1 to 5) to observe real-time score adjustment.
                </p>
              </div>
              <div
                style={{
                  background: '#e0e7ff',
                  border: '1px solid #c7d2fe',
                  borderRadius: '4px',
                  padding: '6px 14px',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>
                  Calculated Readiness
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e3a8a', lineHeight: 1.1 }}>
                  {liveReadinessScore}%
                </div>
              </div>
            </div>

            {/* Career Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              {DEMO_CAREERS.map((c, idx) => {
                const isActive = idx === selectedCareerIndex;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleCareerChange(idx)}
                    style={{
                      padding: '6px 14px',
                      background: isActive ? '#1e3a8a' : '#e2e8f0',
                      color: isActive ? '#f8f9fa' : '#334155',
                      border: isActive ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Column Specification & Matrix Breakdown */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Left Column: Skill sliders */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                Competency Assessment Vectors
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeCareer.skills.map((skill, idx) => {
                  const current = skillLevels[idx] || 0;
                  const gap = Math.max(0, skill.required - current);
                  return (
                    <div
                      key={skill.name}
                      style={{
                        padding: '12px',
                        background: '#f1f4f8',
                        border: '1px solid #d9dfe7',
                        borderRadius: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                          {skill.name}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                          Target Benchmark: Level {skill.required}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={current}
                          onChange={(e) => handleLevelChange(idx, parseInt(e.target.value))}
                          style={{ flex: 1, accentColor: '#1e3a8a', cursor: 'pointer' }}
                        />
                        <span
                          style={{
                            fontSize: '0.825rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '3px',
                            background: current >= skill.required ? '#dcfce7' : '#fee2e2',
                            color: current >= skill.required ? '#14532d' : '#7f1d1d',
                            border: current >= skill.required ? '1px solid #bbf7d0' : '1px solid #fecaca',
                            minWidth: '68px',
                            textAlign: 'center',
                          }}
                        >
                          Level {current} {gap === 0 ? '[Met]' : `(-${gap})`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Grounded ML Architecture Specifications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>
                Grounded ML Architecture
              </h3>

              <div style={{ background: '#f1f4f8', border: '1px solid #d9dfe7', borderRadius: '4px', padding: '14px' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>
                  Supervised Gradient Boosting Pipeline
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  The decision engine calculates an objective candidate readiness score (0-100%) by processing verified course grades, quiz diagnostics, coding lab test cases, and project artifacts.
                </p>
              </div>

              <div style={{ background: '#f1f4f8', border: '1px solid #d9dfe7', borderRadius: '4px', padding: '14px' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>
                  24-Week Trajectory Simulation
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  Simulates student competency growth based on weekly dedicated hours and learning velocity, projecting exact milestones when candidates cross the 75% job-ready threshold.
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                <Link
                  to="/app/dashboard"
                  className="btn-primary"
                  style={{ width: '100%', textAlign: 'center', padding: '10px' }}
                >
                  Enter Verified Student Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Policy Footer */}
      <footer
        style={{
          marginTop: 'auto',
          background: '#e6e9ee',
          borderTop: '1px solid #cbd5e1',
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.85rem',
            color: '#475569',
          }}
        >
          <div>
            <strong>Skill2Career</strong> - Academic Competency and Career Readiness Platform.
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/terms" style={{ color: '#1e3a8a', fontWeight: 600 }}>
              Terms of Service
            </Link>
            <Link to="/privacy" style={{ color: '#1e3a8a', fontWeight: 600 }}>
              Privacy Policy
            </Link>
            <Link to="/app/job-readiness" style={{ color: '#1e3a8a', fontWeight: 600 }}>
              Job-Readiness Engine
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
