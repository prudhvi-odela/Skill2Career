import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ENGINEERING_CATEGORIES,
  ALL_BRANCHES,
  type BranchDefinition,
  getBranchByCode
} from '../data/engineeringBranches';
import { BranchCompilerLab } from '../components/branch/BranchCompilerLab';
import {
  BookOpen, Calendar, Terminal, Award, Search,
  CheckCircle2, ArrowRight, Bookmark
} from 'lucide-react';

export const BranchCurriculumPage: React.FC = () => {
  const { profile } = useAuth();

  // Selected Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Branch (defaults to student's profile branch or CSE)
  const [currentBranchCode, setCurrentBranchCode] = useState<string>(() => {
    if (profile?.branch) {
      const match = ALL_BRANCHES.find(
        b => b.code.toLowerCase() === profile.branch?.toLowerCase() ||
             b.name.toLowerCase().includes(profile.branch?.toLowerCase() || '')
      );
      if (match) return match.code;
    }
    return 'CSE';
  });

  const [activeTab, setActiveTab] = useState<'subjects' | 'schedule' | 'compiler' | 'challenges'>('subjects');
  const [completedOutcomes, setCompletedOutcomes] = useState<Record<string, boolean>>({});

  // Sync if profile loads later
  useEffect(() => {
    if (profile?.branch) {
      const match = ALL_BRANCHES.find(
        b => b.code.toLowerCase() === profile.branch?.toLowerCase() ||
             b.name.toLowerCase().includes(profile.branch?.toLowerCase() || '')
      );
      if (match) {
        setCurrentBranchCode(match.code);
      }
    }
  }, [profile?.branch]);

  const activeBranch: BranchDefinition = useMemo(() => {
    return getBranchByCode(currentBranchCode) || ALL_BRANCHES[0];
  }, [currentBranchCode]);

  // Filtered branch list for search and category
  const filteredBranches = useMemo(() => {
    return ALL_BRANCHES.filter((b) => {
      const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.toolsAndTech.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleOutcome = (key: string) => {
    setCompletedOutcomes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px', minHeight: '100vh' }}>
      {/* Top Breadcrumb & Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
          <span>Skill2Career Official Portal</span>
          <span>/</span>
          <span style={{ color: '#006EFF', fontWeight: 600 }}>Branch Curricula & Practice Labs</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Branch-Specific Curricula, Schedules & Interactive Compilers
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '750px' }}>
              Tailored academic roadmaps, industry subjects, weekly milestones, and specialized engineering simulation workflows customized for every engineering branch.
            </p>
          </div>

          {profile?.branch && (
            <button
              type="button"
              onClick={() => {
                const match = ALL_BRANCHES.find(
                  b => b.code.toLowerCase() === profile.branch?.toLowerCase() ||
                       b.name.toLowerCase().includes(profile.branch?.toLowerCase() || '')
                );
                if (match) setCurrentBranchCode(match.code);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Bookmark size={14} />
              <span>Switch to My Branch: <strong>{profile.branch}</strong></span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Search */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by branch code, title, or tool (e.g., ECE, VLSI, Civil, Python, ANSYS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Quick Select:</span>
            <select
              value={currentBranchCode}
              onChange={(e) => setCurrentBranchCode(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              {ENGINEERING_CATEGORIES.map((cat) => (
                <optgroup key={cat.name} label={`${cat.emoji} ${cat.name}`}>
                  {cat.branches.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: selectedCategory === 'All' ? 700 : 500,
              border: '1px solid',
              borderColor: selectedCategory === 'All' ? '#006EFF' : '#e2e8f0',
              background: selectedCategory === 'All' ? '#eff6ff' : '#ffffff',
              color: selectedCategory === 'All' ? '#006EFF' : '#64748b',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            All Disciplines ({ALL_BRANCHES.length})
          </button>
          {ENGINEERING_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: selectedCategory === cat.name ? 700 : 500,
                border: '1px solid',
                borderColor: selectedCategory === cat.name ? '#006EFF' : '#e2e8f0',
                background: selectedCategory === cat.name ? '#eff6ff' : '#ffffff',
                color: selectedCategory === cat.name ? '#006EFF' : '#64748b',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.emoji} {cat.name} ({cat.branches.length})
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE BRANCH BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px' }}>{activeBranch.categoryEmoji}</span>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#006EFF' }}>
                  {activeBranch.category}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {activeBranch.name}
                </h2>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.5, maxWidth: '800px' }}>
              {activeBranch.description}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Target Career Outcomes:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {activeBranch.targetRoles.map((role) => (
                <span
                  key={role}
                  style={{
                    fontSize: '11px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#1e293b',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Active Branch */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'subjects', label: 'Subjects & What You Must Learn', icon: BookOpen, count: activeBranch.subjects.length },
            { id: 'schedule', label: '12-Week Branch Schedule', icon: Calendar, count: activeBranch.schedule.length },
            { id: 'compiler', label: 'Specialized Practice Lab & Compiler', icon: Terminal },
            { id: 'challenges', label: 'Practice Challenges', icon: Award, count: activeBranch.challenges.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  border: '1px solid',
                  borderColor: isActive ? '#006EFF' : '#cbd5e1',
                  background: isActive ? '#006EFF' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#64748b',
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: SUBJECTS & WHAT YOU MUST LEARN */}
      {activeTab === 'subjects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Career Goal Specific Recommendation Banner */}
          <div
            style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🎯</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0369a1' }}>
                    Recommended Subjects by Career Goal ({activeBranch.shortName})
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#0284c7' }}>
                    Select a target career role to filter and prioritize the core academic subjects required by industry.
                  </p>
                </div>
              </div>
            </div>

            {/* Career Goals Pill Selector */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {activeBranch.targetRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSearchQuery(searchQuery === role ? '' : role)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: searchQuery === role ? 700 : 600,
                    background: searchQuery === role ? '#0284c7' : '#ffffff',
                    color: searchQuery === role ? '#ffffff' : '#0369a1',
                    border: '1px solid #7dd3fc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{role}</span>
                  {searchQuery === role && <span style={{ fontSize: '10px' }}>&bull; Active Filter</span>}
                </button>
              ))}
              {searchQuery !== '' && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Curated Academic Subjects for {activeBranch.shortName}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Total Subjects: {activeBranch.subjects.length} • Check off completed competencies
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {activeBranch.subjects.map((sub) => (
              <div
                key={sub.code}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 800, color: '#006EFF', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                        {sub.code}
                      </span>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>
                        {sub.name}
                      </h4>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                      Sem {sub.semester} • {sub.credits} Credits
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, marginBottom: '12px' }}>
                    {sub.description}
                  </p>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Key Learning Outcomes:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {sub.learningOutcomes.map((outcome, idx) => {
                        const key = `${sub.code}_outcome_${idx}`;
                        const isDone = !!completedOutcomes[key];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleOutcome(key)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                              color: isDone ? '#059669' : '#334155',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '4px',
                              background: isDone ? '#ecfdf5' : 'transparent',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <CheckCircle2 size={14} color={isDone ? '#10b981' : '#cbd5e1'} />
                            <span style={{ textDecoration: isDone ? 'line-through' : 'none' }}>{outcome}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                    Recommended Tools & Compilers:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {sub.recommendedTools.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '10px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: 12-WEEK BRANCH SCHEDULE */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              12-Week Intensive Learning Schedule for {activeBranch.shortName}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Paced with hands-on lab workflows and verifiable deliverables
            </span>
          </div>

          {activeBranch.schedule.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeBranch.schedule.map((item) => (
                <div
                  key={item.week}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '18px 20px',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 200px',
                    gap: '16px',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>WEEK</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#006EFF' }}>{item.week}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{item.hoursNeeded} Hours</div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                      {item.theme}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
                      <strong>Theory:</strong> {item.theoryTopics.join(' • ')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#006EFF' }}>
                      <strong>Lab Workflow:</strong> {item.labWorkflow}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>
                      Required Deliverable:
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                      {item.deliverable}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '32px', textAlign: 'center' }}>
              <Calendar size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                Semester Roadmap Active
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Refer to the Subjects tab for the comprehensive semester breakdown of {activeBranch.name}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INTERACTIVE PRACTICE LAB & COMPILER */}
      {activeTab === 'compiler' && (
        <BranchCompilerLab branch={activeBranch} />
      )}

      {/* TAB 4: PRACTICE CHALLENGES */}
      {activeTab === 'challenges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Practical Coding & Calculation Challenges ({activeBranch.challenges.length})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Test your engineering implementations against automated verification test cases
            </span>
          </div>

          {activeBranch.challenges.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeBranch.challenges.map((ch) => (
                <div
                  key={ch.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {ch.title}
                    </h4>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        background: ch.difficulty === 'Easy' ? '#ecfdf5' : ch.difficulty === 'Medium' ? '#eff6ff' : '#fef2f2',
                        color: ch.difficulty === 'Easy' ? '#047857' : ch.difficulty === 'Medium' ? '#1d4ed8' : '#b91c1c',
                        border: '1px solid',
                        borderColor: ch.difficulty === 'Easy' ? '#a7f3d0' : ch.difficulty === 'Medium' ? '#bfdbfe' : '#fecaca',
                      }}
                    >
                      {ch.difficulty}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '14px' }}>
                    {ch.description}
                  </p>

                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '12px' }}>
                    <div style={{ color: '#64748b', marginBottom: '4px' }}><strong>Sample Input:</strong> {ch.testInput}</div>
                    <div style={{ color: '#0f172a' }}><strong>Expected Output:</strong> {ch.expectedOutput}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('compiler');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#006EFF',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <span>Open in {activeBranch.shortName} Compiler</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '32px', textAlign: 'center' }}>
              <Award size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                Open Practice Lab Ready
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                Jump directly into the interactive {activeBranch.shortName} practice lab and compiler.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('compiler')}
                style={{
                  background: '#006EFF',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Launch Compiler Lab
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
