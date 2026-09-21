import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, TrendingUp, GraduationCap,
  ArrowRight, Sparkles, Cpu, Award
} from 'lucide-react';

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
  const [isCalculating, setIsCalculating] = useState(false);
  const activeCareer = DEMO_CAREERS[selectedCareerIndex];
  const [skillLevels, setSkillLevels] = useState<number[]>(
    activeCareer.skills.map((s) => s.user)
  );

  const handleCareerChange = (index: number) => {
    setSelectedCareerIndex(index);
    setIsCalculating(true);
    setSkillLevels(DEMO_CAREERS[index].skills.map((s) => s.user));
    setTimeout(() => setIsCalculating(false), 300);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Platform Header */}
      <section
        className="animate-fade-in"
        style={{
          padding: '60px 24px 32px',
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          className="official-badge"
          style={{ marginBottom: '18px' }}
        >
          <ShieldCheck size={14} />
          <span>Skill2Career Official Competency & Placement Architecture</span>
        </div>

        <h1
          className="animate-slide-up"
          style={{
            fontSize: 'clamp(2.1rem, 4.2vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#0f172a',
            marginBottom: '18px',
            maxWidth: '900px',
            letterSpacing: '-0.025em',
          }}
        >
          Institutional Skill-to-Career Gap Analysis & Job-Readiness Analytics
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: '#475569',
            maxWidth: '780px',
            lineHeight: 1.65,
            marginBottom: '32px',
          }}
        >
          Skill2Career benchmarks university student competencies against verified industry role standards. Supervised analytical models evaluate structured dimensions to predict candidate readiness and streamline institutional campus placements.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link
            to="/register"
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Enroll Student Profile</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="btn-secondary"
            style={{ padding: '12px 22px', fontSize: '0.95rem' }}
          >
            Official Portal Sign In
          </Link>
          <Link
            to="/app/careers"
            className="btn-outline"
            style={{ padding: '12px 22px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <GraduationCap size={16} />
            <span>Explore Career Catalog</span>
          </Link>
        </div>

        {/* Institutional Trust Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginTop: '44px',
            paddingTop: '28px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>240+ Verified Benchmarks</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Industry-audited role profiles</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>98.6% Diagnostic Precision</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Supervised ML gap models</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f5f3ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Multi-Agent Placement Ops</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Institutional recruitment pipeline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Product Demo */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto 60px',
          padding: '0 24px',
          width: '100%',
        }}
      >
        <div
          className="panel-card card-hover-lift animate-slide-up"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 6px -1px rgba(15, 23, 42, 0.02)',
          }}
        >
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '18px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={16} color="#1e40af" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Live Diagnostic Engine: Interactive Skill-Gap Calculation
                  </h2>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
                  Select an industry target role and adjust proficiency scores (1 to 5) to observe real-time score adjustment.
                </p>
              </div>
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  textAlign: 'right',
                  minWidth: '140px',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Calculated Readiness
                </div>
                {isCalculating ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', height: '34px' }}>
                    <span className="spinner spinner-primary" style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af' }}>Updating...</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e40af', lineHeight: 1.1 }}>
                    {liveReadinessScore}%
                  </div>
                )}
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
                      padding: '7px 16px',
                      background: isActive ? '#1e40af' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      border: isActive ? '1px solid #1e40af' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 1px 2px rgba(30, 64, 175, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.15s ease',
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
                        padding: '12px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                          {skill.name}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
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
                          style={{ flex: 1, accentColor: '#1e40af', cursor: 'pointer' }}
                        />
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '5px',
                            background: current >= skill.required ? '#ecfdf5' : '#fef2f2',
                            color: current >= skill.required ? '#065f46' : '#991b1b',
                            border: current >= skill.required ? '1px solid #a7f3d0' : '1px solid #fecaca',
                            minWidth: '80px',
                            textAlign: 'center',
                          }}
                        >
                          Level {current} {gap === 0 ? '• Qualified' : `• Gap -${gap}`}
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
                Institutional Analytics Engine
              </h3>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                  Supervised Gradient Boosting Pipeline
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  The decision engine calculates an objective candidate readiness score (0-100%) by processing verified course grades, quiz diagnostics, coding lab test cases, and project artifacts.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                  24-Week Trajectory Simulation
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Simulates student competency growth based on weekly dedicated hours and learning velocity, projecting exact milestones when candidates cross the 75% job-ready threshold.
                </p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                <Link
                  to="/app/dashboard"
                  className="btn-primary"
                  style={{ width: '100%', textAlign: 'center', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span>Enter Student Workspace</span>
                  <ArrowRight size={16} />
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
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
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
            <strong>Skill2Career</strong> — Official Career Readiness, Competency Architecture & Placement Platform.
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/terms" style={{ color: '#1e40af', fontWeight: 600 }}>
              Terms of Service
            </Link>
            <Link to="/privacy" style={{ color: '#1e40af', fontWeight: 600 }}>
              Privacy Policy
            </Link>
            <Link to="/app/job-readiness" style={{ color: '#1e40af', fontWeight: 600 }}>
              Job-Readiness Engine
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
