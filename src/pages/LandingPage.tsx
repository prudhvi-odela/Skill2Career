import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ArrowRight, Sparkles, Zap,
  Layers, Terminal
} from 'lucide-react';
import { Footer } from '../components/Footer';

const DEMO_CAREERS = [
  {
    id: 'c1',
    title: 'Full Stack Software Engineer',
    domain: 'Computer Science & Software',
    salary: '$135k - $185k',
    skills: [
      { name: 'TypeScript & React', required: 5, user: 4, weight: 1.0 },
      { name: 'Node.js & Backend APIs', required: 4, user: 2, weight: 0.9 },
      { name: 'PostgreSQL Relational DB', required: 4, user: 3, weight: 0.8 },
      { name: 'Docker & Containerization', required: 3, user: 1, weight: 0.7 },
      { name: 'System Design & Scalability', required: 4, user: 2, weight: 0.85 },
    ],
  },
  {
    id: 'c2',
    title: 'Frontier AI & Machine Learning',
    domain: 'Frontier AI & Data Science',
    salary: '$150k - $210k',
    skills: [
      { name: 'Python & PyTorch', required: 5, user: 4, weight: 1.0 },
      { name: 'Deep Learning & LLM Fine-Tuning', required: 4, user: 2, weight: 0.95 },
      { name: 'Vector DBs & RAG Architecture', required: 4, user: 1, weight: 0.85 },
      { name: 'Data Engineering & SQL', required: 4, user: 3, weight: 0.75 },
      { name: 'MLOps Pipeline Deployment', required: 3, user: 1, weight: 0.7 },
    ],
  },
  {
    id: 'c3',
    title: 'Cloud DevOps & SRE Architect',
    domain: 'Infrastructure & Cloud Systems',
    salary: '$140k - $190k',
    skills: [
      { name: 'Kubernetes & Docker', required: 5, user: 3, weight: 1.0 },
      { name: 'CI/CD Automated Pipelines', required: 4, user: 2, weight: 0.9 },
      { name: 'Terraform & Infrastructure-as-Code', required: 4, user: 1, weight: 0.85 },
      { name: 'Linux Kernel & Networking', required: 4, user: 4, weight: 0.8 },
      { name: 'Observability & Monitoring', required: 3, user: 2, weight: 0.7 },
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

  const matchedSkillsCount = activeCareer.skills.filter((s, idx) => (skillLevels[idx] || 0) >= s.required).length;
  const criticalGapsCount = activeCareer.skills.filter((s, idx) => (skillLevels[idx] || 0) < s.required - 1).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Live Animated Ticker Bar */}
      <div
        style={{
          background: '#0f172a',
          color: '#e2e8f0',
          padding: '8px 0',
          fontSize: '0.75rem',
          fontWeight: 600,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div className="ticker-marquee">
          <div style={{ display: 'flex', gap: '36px', alignItems: 'center', paddingRight: '36px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-pulse-dot" />
              <span>Live Campus Node: <strong>48,000+ Skills Mapped</strong></span>
            </span>
            <span>⚡ <strong>Priya S.</strong> achieved 96% match fit for Full Stack Engineer</span>
            <span>🎯 <strong>Rahul M.</strong> completed Phase 2 Microservices Project</span>
            <span>📊 <strong>Campus Placement Rate:</strong> 94.2% Verified Accuracy</span>
            <span>🚀 <strong>1,420+</strong> Technical Interviews Scheduled for 2026</span>
            <span>🏆 Official AICTE & National Institutional Competency Standard</span>
          </div>

          <div style={{ display: 'flex', gap: '36px', alignItems: 'center', paddingRight: '36px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-pulse-dot" />
              <span>Live Campus Node: <strong>48,000+ Skills Mapped</strong></span>
            </span>
            <span>⚡ <strong>Priya S.</strong> achieved 96% match fit for Full Stack Engineer</span>
            <span>🎯 <strong>Rahul M.</strong> completed Phase 2 Microservices Project</span>
            <span>📊 <strong>Campus Placement Rate:</strong> 94.2% Verified Accuracy</span>
            <span>🚀 <strong>1,420+</strong> Technical Interviews Scheduled for 2026</span>
            <span>🏆 Official AICTE & National Institutional Competency Standard</span>
          </div>
        </div>
      </div>

      {/* Hero Section with Ambient Glow Effect */}
      <section
        style={{
          position: 'relative',
          padding: '64px 24px 48px',
          background: 'radial-gradient(ellipse at 50% -10%, #dbeafe 0%, #f8fafc 70%)',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Ambient Floating Glow Orbs */}
        <div
          className="animate-float-orbs"
          style={{
            position: 'absolute',
            top: '-60px',
            right: '8%',
            width: '380px',
            height: '380px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px', position: 'relative', zIndex: 1 }}>
          
          {/* Top Institutional Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="Skill2Career Logo"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                objectFit: 'contain',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
                SkillBridge Official Architecture
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Institutional Competency Diagnostics & Placement Engineering
              </span>
            </div>
          </div>

          {/* Hero Headlines */}
          <div style={{ maxWidth: '940px' }}>
            <h1
              className="animate-slide-up"
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                fontWeight: 900,
                lineHeight: 1.12,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                marginBottom: '18px',
              }}
            >
              Bridge Academic Skills to <span className="skillbridge-gradient-text">High-Impact Tech Careers</span>
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: '#475569',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '820px',
              }}
            >
              Compare your current engineering competencies directly against verified industry hiring benchmarks. Identify critical gaps, test live job descriptions, and clear placement diagnostics with structured milestone paths.
            </p>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              to="/register"
              className="btn-primary"
              style={{ padding: '12px 26px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Enroll Student Account Free</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/login"
              className="btn-secondary"
              style={{ padding: '12px 22px', fontSize: '0.95rem' }}
            >
              Official Sign In
            </Link>
          </div>

          {/* Live Interactive SkillBridge Simulator */}
          <div
            className="skillbridge-card animate-fade-in"
            style={{
              padding: '28px',
              background: '#ffffff',
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 2px 10px rgba(15, 23, 42, 0.04)',
              border: '1px solid #cbd5e1',
            }}
          >
            {/* Simulator Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    Live SkillBridge Gap Simulator
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Test live candidate fit against real benchmarks</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Role Benchmark: {activeCareer.title}
                </h3>
              </div>

              {/* Role Toggle Tabs */}
              <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                {DEMO_CAREERS.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => handleCareerChange(i)}
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: selectedCareerIndex === i ? '#ffffff' : 'transparent',
                      color: selectedCareerIndex === i ? '#0f172a' : '#64748b',
                      boxShadow: selectedCareerIndex === i ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {c.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'center' }}>
              
              {/* Left Column: Interactive Skill Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeCareer.skills.map((skill, idx) => {
                  const currentLevel = skillLevels[idx] || 0;
                  const isMet = currentLevel >= skill.required;

                  return (
                    <div key={skill.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                          {skill.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.775rem', color: isMet ? '#15803d' : '#b45309', fontWeight: 600 }}>
                            Level {currentLevel} / {skill.required} {isMet ? '✓ Met' : `(-${skill.required - currentLevel} gap)`}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="1"
                          value={currentLevel}
                          onChange={(e) => handleLevelChange(idx, parseInt(e.target.value))}
                          className="skill-range"
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', width: '24px', textAlign: 'center' }}>
                          {currentLevel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Live Readiness Dial & Gap Summary */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '18px',
                  textAlign: 'center',
                }}
              >
                {/* Dial SVG */}
                <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3.2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={liveReadinessScore >= 80 ? '#10b981' : liveReadinessScore >= 60 ? '#3b82f6' : '#f59e0b'}
                      strokeWidth="3.2"
                      strokeDasharray={`${liveReadinessScore}, 100`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.4s ease' }}
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                      {liveReadinessScore}%
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>
                      Readiness
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {liveReadinessScore >= 80 ? 'Placement Interview Ready' : liveReadinessScore >= 60 ? 'Competitive with Moderate Deficits' : 'Deficit Remediation Required'}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#475569', margin: '4px 0 0 0', maxWidth: '300px' }}>
                    {matchedSkillsCount} skills meet industry standards. {criticalGapsCount} critical deficit{criticalGapsCount === 1 ? '' : 's'} require targeted roadmap practice.
                  </p>
                </div>

                {/* Direct CTA to portal */}
                <Link
                  to="/app/skill-gap"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Zap size={15} />
                  <span>Open Full SkillBridge Engine</span>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Core Competency Pillars */}
      <section style={{ padding: '60px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
            Built for Academic-to-Corporate Success
          </span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', marginTop: '8px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Everything You Need to Clear Placement Interviews
          </h2>
          <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Directly bridge theoretical university engineering education into verified production job readiness.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          
          <div className="skillbridge-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Layers size={22} color="#1d4ed8" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Job Description Matcher
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
              Paste any software, AI, or cloud engineering job description. Our parser extracts required competencies and calculates your exact fit delta.
            </p>
          </div>

          <div className="skillbridge-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Sparkles size={22} color="#059669" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Milestone Learning Paths
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
              Structured 4-phase sequence: Core Foundations, Production Projects, Systems Scaling, and Mock Interview Clearance with interactive tracking.
            </p>
          </div>

          <div className="skillbridge-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <TrendingUp size={22} color="#b45309" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Predictive Trajectory
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
              Simulate weekly study hours and practice consistency to forecast the exact calendar date you achieve 85%+ placement interview clearance.
            </p>
          </div>

          <div className="skillbridge-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Terminal size={22} color="#6d28d9" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Branch Sandboxes & Labs
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
              Real-world compiler sandboxes for 12+ engineering disciplines, from modern Web & Cloud to Embedded Systems and Hardware Design.
            </p>
          </div>

        </div>
      </section>

      {/* Official Bottom Navigation Bar & Footer */}
      <Footer />

    </div>
  );
};
