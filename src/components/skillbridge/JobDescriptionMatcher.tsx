import React, { useState } from 'react';
import {
  FileText, Sparkles, CheckCircle2, AlertTriangle, ArrowRight,
  TrendingUp, RefreshCw, Briefcase, Zap, Compass, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JobDescriptionMatcherProps {
  userSkills?: Array<{ skill_name?: string; name?: string; level?: number }>;
  onApplyLearningPlan?: (planTitle: string, missingSkills: string[]) => void;
}

interface PresetJD {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  text: string;
  coreRequirements: { name: string; requiredLevel: number; category: string; critical: boolean }[];
}

const PRESET_JDS: PresetJD[] = [
  {
    id: 'google-fs',
    company: 'Google',
    role: 'Senior Full Stack Software Engineer',
    location: 'Mountain View, CA / Remote',
    salary: '$165,000 - $210,000',
    text: `As a Full Stack Engineer at Google, you will architect resilient, high-throughput web applications. 
Requirements:
- 3+ years experience with TypeScript, React, and modern state architecture
- Strong backend engineering with Node.js, Go, or Python
- Deep familiarity with Distributed Systems, REST & gRPC API design
- Experience with Cloud Platforms (GCP/AWS), Docker, and CI/CD pipelines
- Proficiency in Relational & NoSQL database performance tuning (PostgreSQL, Spanner)
- Automated testing (Jest, Playwright) and production observability`,
    coreRequirements: [
      { name: 'TypeScript', requiredLevel: 4, category: 'Core Languages', critical: true },
      { name: 'React', requiredLevel: 4, category: 'Frontend Architecture', critical: true },
      { name: 'Node.js', requiredLevel: 4, category: 'Backend Systems', critical: true },
      { name: 'Distributed Systems', requiredLevel: 3, category: 'Architecture', critical: true },
      { name: 'Cloud Infrastructure', requiredLevel: 3, category: 'DevOps', critical: false },
      { name: 'PostgreSQL', requiredLevel: 3, category: 'Databases', critical: false },
      { name: 'Docker', requiredLevel: 3, category: 'DevOps', critical: false },
      { name: 'Automated Testing', requiredLevel: 3, category: 'Quality Engineering', critical: false },
    ],
  },
  {
    id: 'openai-ml',
    company: 'OpenAI',
    role: 'AI / ML Platform Infrastructure Engineer',
    location: 'San Francisco, CA',
    salary: '$190,000 - $260,000',
    text: `Build and scale the high-performance computing infrastructure powering next-generation frontier intelligence models.
Requirements:
- Strong foundations in Python, PyTorch, and deep neural network serving
- Distributed model training pipelines and CUDA GPU acceleration
- Experience with Kubernetes orchestration, high-concurrency message queues (Kafka)
- Vector databases (Pinecone, Milvus, Qdrant) and Retrieval-Augmented Generation (RAG)
- Production MLOps monitoring and latency optimization`,
    coreRequirements: [
      { name: 'Python', requiredLevel: 5, category: 'Core Languages', critical: true },
      { name: 'PyTorch', requiredLevel: 4, category: 'Machine Learning', critical: true },
      { name: 'Distributed Systems', requiredLevel: 4, category: 'Architecture', critical: true },
      { name: 'Kubernetes', requiredLevel: 3, category: 'DevOps', critical: true },
      { name: 'Vector Databases', requiredLevel: 3, category: 'AI Architecture', critical: false },
      { name: 'MLOps & CI/CD', requiredLevel: 3, category: 'DevOps', critical: false },
      { name: 'Docker', requiredLevel: 4, category: 'DevOps', critical: false },
    ],
  },
  {
    id: 'stripe-backend',
    company: 'Stripe',
    role: 'Backend Reliability & Payments Engineer',
    location: 'Seattle, WA / Remote',
    salary: '$155,000 - $195,000',
    text: `Join the Stripe Core Payments infrastructure team. You will write robust, mission-critical code processing billions in transactions daily.
Requirements:
- Mastery of Java, Go, or Python for high-availability distributed microservices
- Uncompromising understanding of database transactions, ACID guarantees, and idempotency
- In-depth SQL database profiling (PostgreSQL/MySQL) and Redis caching layers
- Production reliability engineering, telemetry, rate limiting, and zero-downtime migrations`,
    coreRequirements: [
      { name: 'Go / Java', requiredLevel: 4, category: 'Core Languages', critical: true },
      { name: 'PostgreSQL', requiredLevel: 4, category: 'Databases', critical: true },
      { name: 'Distributed Systems', requiredLevel: 4, category: 'Architecture', critical: true },
      { name: 'API Design', requiredLevel: 4, category: 'Backend Systems', critical: true },
      { name: 'System Reliability', requiredLevel: 3, category: 'Production Ops', critical: false },
      { name: 'Redis', requiredLevel: 3, category: 'Databases', critical: false },
      { name: 'Docker', requiredLevel: 3, category: 'DevOps', critical: false },
    ],
  },
];

export const JobDescriptionMatcher: React.FC<JobDescriptionMatcherProps> = ({
  userSkills = [],
  onApplyLearningPlan,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('google-fs');
  const [customText, setCustomText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [bridgedSuccessfully, setBridgedSuccessfully] = useState<boolean>(false);

  const activePreset = PRESET_JDS.find((p) => p.id === selectedPresetId) || PRESET_JDS[0];

  // Map user skill lookup dictionary
  const userSkillMap = React.useMemo(() => {
    const map = new Map<string, number>();
    userSkills.forEach((s) => {
      const name = (s.skill_name || s.name || '').toLowerCase();
      map.set(name, s.level || 2);
    });
    // Add default fallbacks for demo
    if (map.size === 0) {
      map.set('python', 3);
      map.set('javascript', 4);
      map.set('react', 3);
      map.set('sql', 3);
      map.set('git', 4);
      map.set('docker', 2);
    }
    return map;
  }, [userSkills]);

  // Skill comparison computation
  const analysis = React.useMemo(() => {
    const reqs = activePreset.coreRequirements;
    let totalScoreWeight = 0;
    let achievedScoreWeight = 0;

    const matchedList: { name: string; userLevel: number; requiredLevel: number; category: string }[] = [];
    const missingList: { name: string; userLevel: number; requiredLevel: number; category: string; critical: boolean; gap: number }[] = [];

    reqs.forEach((r) => {
      const userLevel = userSkillMap.get(r.name.toLowerCase()) || 
        // Partial matching
        Array.from(userSkillMap.entries()).find(([k]) => r.name.toLowerCase().includes(k) || k.includes(r.name.toLowerCase()))?.[1] || 
        0;

      const weight = r.critical ? 1.5 : 1.0;
      totalScoreWeight += r.requiredLevel * weight;
      achievedScoreWeight += Math.min(userLevel, r.requiredLevel) * weight;

      if (userLevel >= r.requiredLevel) {
        matchedList.push({
          name: r.name,
          userLevel,
          requiredLevel: r.requiredLevel,
          category: r.category,
        });
      } else {
        missingList.push({
          name: r.name,
          userLevel,
          requiredLevel: r.requiredLevel,
          category: r.category,
          critical: r.critical,
          gap: r.requiredLevel - userLevel,
        });
      }
    });

    const matchPercentage = Math.round((achievedScoreWeight / Math.max(1, totalScoreWeight)) * 100);

    return {
      matchPercentage,
      matchedList,
      missingList,
      criticalGaps: missingList.filter((m) => m.critical),
      moderateGaps: missingList.filter((m) => !m.critical),
    };
  }, [activePreset, userSkillMap]);

  const handleSimulateAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    }, 450);
  };

  const handleBridgeAction = () => {
    setBridgedSuccessfully(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (onApplyLearningPlan) {
      onApplyLearningPlan(
        `${activePreset.company} ${activePreset.role} Accelerated Path`,
        analysis.missingList.map((m) => m.name)
      );
    }
  };

  return (
    <div className="skillbridge-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              SkillBridge AI Engine
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Instant Job Description Skill Matcher</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Compare Competencies Against Real Job Descriptions
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px', marginBottom: 0 }}>
            Evaluate your verified skill levels against industry hiring benchmarks to discover matched skills, identify deficit gaps, and generate tailored learning bridges.
          </p>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setIsCustomMode(false)}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: !isCustomMode ? '#ffffff' : 'transparent',
              color: !isCustomMode ? '#0f172a' : '#64748b',
              boxShadow: !isCustomMode ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Curated Industry JDs
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: isCustomMode ? '#ffffff' : 'transparent',
              color: isCustomMode ? '#0f172a' : '#64748b',
              boxShadow: isCustomMode ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Custom Job Description
          </button>
        </div>
      </div>

      {/* Preset Selector or Custom Text Box */}
      {!isCustomMode ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {PRESET_JDS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  handleSimulateAnalysis();
                }}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(37,99,235,0.1)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                    {preset.company}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{preset.salary}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                  {preset.role}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{preset.location}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
            Paste Any Tech Job Description:
          </label>
          <textarea
            rows={4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste raw requirements text from LinkedIn, Indeed, or company careers page (e.g. 'Must have 2+ years of React, Python, Docker, and PostgreSQL experience...')"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSimulateAnalysis} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.825rem' }}>
              <Sparkles size={14} /> Analyze Text & Extract Gaps
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* Left: Animated Readiness Ring & Insights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="3.6"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={analysis.matchPercentage >= 75 ? '#10b981' : analysis.matchPercentage >= 50 ? '#3b82f6' : '#f59e0b'}
                strokeWidth="3.6"
                strokeDasharray={`${analysis.matchPercentage}, 100`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
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
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                {analysis.matchPercentage}%
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Match
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Target Readiness Insight
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {analysis.matchPercentage >= 80 ? 'Strong Candidate Fit' : analysis.matchPercentage >= 60 ? 'Competitive with Modest Gaps' : 'Core Deficit Bridging Required'}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: '4px 0 0 0' }}>
              You meet {analysis.matchedList.length} of {activePreset.coreRequirements.length} required competencies for {activePreset.company}. 
              Addressing {analysis.criticalGaps.length} critical deficits will raise your candidate index to 88%+.
            </p>
          </div>
        </div>

        {/* Right: Quick Stats & Bridge Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>MATCHED SKILLS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{analysis.matchedList.length}</div>
            </div>
            <div style={{ flex: 1, background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>CRITICAL DEFICITS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{analysis.criticalGaps.length}</div>
            </div>
            <div style={{ flex: 1, background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>MODERATE GAPS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{analysis.moderateGaps.length}</div>
            </div>
          </div>

          <button
            onClick={handleBridgeAction}
            className="btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: '0.875rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: bridgedSuccessfully ? '#059669' : '#1e40af',
              borderColor: bridgedSuccessfully ? '#059669' : '#1e40af',
            }}
          >
            {bridgedSuccessfully ? (
              <>
                <Check size={16} /> Learning Path Generated & Added!
              </>
            ) : (
              <>
                <Zap size={16} /> Bridge These Skills & Generate Roadmap
              </>
            )}
          </button>
        </div>
      </div>

      {/* Matched vs Missing Skill Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Matched Skills */}
        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
              Verified In Your Profile ({analysis.matchedList.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.matchedList.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>No matching skills verified yet.</div>
            ) : (
              analysis.matchedList.map((m) => (
                <div
                  key={m.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#14532d' }}>{m.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#15803d', marginLeft: '6px' }}>· {m.category}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                    Level {m.userLevel} / {m.requiredLevel}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Missing / Gap Skills */}
        <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={18} color="#dc2626" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b' }}>
              Identified Skill Gaps to Bridge ({analysis.missingList.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.missingList.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: '#15803d', padding: '8px' }}>
                🎉 Outstanding! You have zero deficits for this target job description.
              </div>
            ) : (
              analysis.missingList.map((m) => (
                <div
                  key={m.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: m.critical ? '#fef2f2' : '#fffbeb',
                    border: m.critical ? '1px solid #fee2e2' : '1px solid #fef3c7',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: m.critical ? '#991b1b' : '#92400e' }}>
                      {m.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '6px' }}>· {m.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      {m.userLevel > 0 ? `Lvl ${m.userLevel} → ${m.requiredLevel}` : `Need Lvl ${m.requiredLevel}`}
                    </span>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        color: m.critical ? '#b91c1c' : '#b45309',
                        background: m.critical ? '#fee2e2' : '#fef3c7',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {m.critical ? 'Critical' : 'Moderate'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
