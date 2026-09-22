import React, { useState, useEffect } from 'react';
import { analysisApi, careersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { KPICard } from '../components/KPICard';
import { SkeletonLoader, EmptyState, ErrorState } from '../components/StateFeedback';
import { BranchCareerGoalNavigator } from '../components/BranchCareerGoalNavigator';
import { getCareersForBranch } from '../data/branchCareerRoles';
import { JobDescriptionMatcher } from '../components/skillbridge/JobDescriptionMatcher';
import { InteractiveLearningPath } from '../components/skillbridge/InteractiveLearningPath';
import {
  Target, FileText, Sparkles, ChevronRight, Zap
} from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  const { profile } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');
  const [gapData, setGapData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'matrix' | 'jd-matcher' | 'roadmap'>('matrix');

  const userBranch = profile?.branch || profile?.major_or_branch;

  useEffect(() => {
    loadCareersAndGap();
  }, [profile?.target_career_id, userBranch]);

  const loadCareersAndGap = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await careersApi.getCareers(undefined, userBranch);
      let list = res.data;
      if (!list || list.length === 0) {
        list = getCareersForBranch(userBranch).map(c => ({
          career_id: c.career_id,
          career_title: c.career_title,
          domain: c.domain,
        }));
      }
      setCareers(list);
      const initialId = profile?.target_career_id || (list.length > 0 ? (list[0].career_id || list[0].id) : '');
      setSelectedCareerId(initialId);
      if (initialId) {
        const gapRes = await analysisApi.getSkillGap(initialId);
        setGapData(gapRes.data);
      }
    } catch (err: any) {
      console.error('Error loading skill gap:', err);
      const localCareers = getCareersForBranch(userBranch).map(c => ({
        career_id: c.career_id,
        career_title: c.career_title,
        domain: c.domain,
      }));
      setCareers(localCareers);
      if (localCareers.length > 0) {
        setSelectedCareerId(localCareers[0].career_id);
      }
      setError(err.response?.data?.detail || 'Failed to compute skill gap analysis.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGap = async (careerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await analysisApi.getSkillGap(careerId);
      setGapData(res.data);
    } catch (err: any) {
      console.error('Error fetching gap:', err);
      setError(err.response?.data?.detail || 'Failed to compute skill gap analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleCareerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedCareerId(newId);
    fetchGap(newId);
  };

  const filteredGaps = gapData?.gaps?.filter((g: any) => {
    if (priorityFilter === 'All') return true;
    return g.priority === priorityFilter;
  }) || [];

  const criticalCount = gapData?.gaps?.filter((g: any) => g.priority === 'Critical').length || 0;
  const currentCareer = careers.find(c => (c.career_id || c.id) === selectedCareerId);
  const currentCareerTitle = currentCareer?.career_title || currentCareer?.title || 'Target Role';

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* SkillBridge Header */}
      <div
        className="skillbridge-card"
        style={{
          padding: '24px 28px',
          background: 'radial-gradient(ellipse at 80% 20%, #eff6ff 0%, #ffffff 80%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', background: '#dbeafe', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              SkillBridge Engine
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Competency Diagnosis · Explainable Readiness · Learning Milestones
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 6px 0', letterSpacing: '-0.02em' }}>
            Skill Gap & Learning Path Architecture
          </h1>
          <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0, maxWidth: '820px' }}>
            Transforming broad career aspirations into concrete competency roadmaps. Measure your deficit deltas against hiring benchmarks, test job descriptions, and unlock tailored remediation milestones.
          </p>
        </div>

        {/* Global Action & Career Picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Target Benchmark Role:
          </label>
          <select
            className="select-field"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.85rem' }}
            value={selectedCareerId}
            onChange={handleCareerChange}
          >
            {careers.map((c) => {
              const cid = c.career_id || c.id;
              const cname = c.career_title || c.title;
              return (
                <option key={cid} value={cid}>
                  {cname} ({c.domain})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main SkillBridge Tabs (Functional Segmented Control) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('matrix')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: activeTab === 'matrix' ? '#1e40af' : 'transparent',
            color: activeTab === 'matrix' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'matrix' ? '0 2px 6px rgba(30, 64, 175, 0.2)' : 'none',
          }}
        >
          <Target size={16} /> Skill Gap Matrix
        </button>

        <button
          onClick={() => setActiveTab('jd-matcher')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: activeTab === 'jd-matcher' ? '#1e40af' : 'transparent',
            color: activeTab === 'jd-matcher' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'jd-matcher' ? '0 2px 6px rgba(30, 64, 175, 0.2)' : 'none',
          }}
        >
          <FileText size={16} /> Job Description Matcher
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: activeTab === 'roadmap' ? '#1e40af' : 'transparent',
            color: activeTab === 'roadmap' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'roadmap' ? '0 2px 6px rgba(30, 64, 175, 0.2)' : 'none',
          }}
        >
          <Sparkles size={16} /> Learning Path Milestones
        </button>
      </div>

      {/* Tab 2: Job Description Matcher */}
      {activeTab === 'jd-matcher' && (
        <JobDescriptionMatcher
          userSkills={profile?.skills || []}
          onApplyLearningPlan={(planTitle) => {
            setActiveTab('roadmap');
          }}
        />
      )}

      {/* Tab 3: Interactive Learning Path */}
      {activeTab === 'roadmap' && (
        <InteractiveLearningPath targetRole={currentCareerTitle} />
      )}

      {/* Tab 1: Detailed Skill Gap Matrix */}
      {activeTab === 'matrix' && (
        <>
          {/* Interactive Branch -> Career Goal -> Required Skills Hierarchy */}
          <BranchCareerGoalNavigator
            initialBranchCode={profile?.branch || profile?.major_or_branch}
            onSelectCareer={(id) => {
              setSelectedCareerId(id);
              fetchGap(id);
            }}
          />

          {loading ? (
            <SkeletonLoader rows={5} type="cards" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => fetchGap(selectedCareerId)} />
          ) : !gapData ? (
            <EmptyState
              title="No Gap Analysis Available"
              message="Select a career or complete your skills profile to generate gap calculations."
              actionText="Explore Careers"
              actionLink="/app/careers"
            />
          ) : (
            <>
              {/* Summary Metric KPI Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                }}
              >
                <KPICard
                  title="SKILL COVERAGE"
                  value={`${gapData.coverage_percentage}%`}
                  subtitle={`Matching ${gapData.total_skills_required} role competencies`}
                />

                <KPICard
                  title="CRITICAL DEFICITS"
                  value={`${criticalCount} Skills`}
                  subtitle="Highest impact gaps to bridge"
                />

                <KPICard
                  title="MASTERED SKILLS"
                  value={`${gapData.proficient_count} Skills`}
                  subtitle="Meets or exceeds requirements"
                />

                <KPICard
                  title="ESTIMATED REMEDIATION"
                  value={`~${gapData.estimated_remediation_hours} Hours`}
                  subtitle="Guided learning time needed"
                />
              </div>

              {/* Action Callout & Filter Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>Filter Priority:</span>
                  {['All', 'Critical', 'High', 'Medium', 'Mastered'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriorityFilter(p)}
                      style={{
                        background: priorityFilter === p ? '#1e3a8a' : '#f1f5f9',
                        color: priorityFilter === p ? '#ffffff' : '#475569',
                        border: priorityFilter === p ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.825rem' }}
                  >
                    <Zap size={14} /> View Step-by-Step Learning Bridge
                  </button>
                  <Link to="/app/trajectory" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.825rem' }}>
                    Simulate Trajectory →
                  </Link>
                </div>
              </div>

              {/* Granular Gap Matrix */}
              <div className="panel-card" style={{ overflowX: 'auto', padding: '0' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Required Skill Name</th>
                      <th>Domain Category</th>
                      <th>Current vs Benchmark</th>
                      <th>Deficit Delta</th>
                      <th>Priority Level</th>
                      <th>Remediation Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGaps.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                          No skills found matching priority filter "{priorityFilter}".
                        </td>
                      </tr>
                    ) : (
                      filteredGaps.map((g: any) => {
                        const isMet = g.current_level >= g.required_level;
                        const pct = Math.min(100, Math.round((g.current_level / (g.required_level || 1)) * 100));

                        return (
                          <tr key={g.skill_id}>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>
                              {g.skill_name}
                            </td>
                            <td style={{ color: '#475569' }}>
                              {g.category}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#0f172a', width: '56px', fontWeight: 600 }}>
                                  {g.current_level}.0 / {g.required_level}.0
                                </span>
                                <div style={{ width: '90px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${pct}%`,
                                      height: '100%',
                                      background: isMet ? '#10b981' : g.current_level > 0 ? '#f59e0b' : '#ef4444',
                                      borderRadius: '3px',
                                      transition: 'width 0.4s ease',
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td style={{ fontWeight: 800, color: g.gap > 0 ? '#dc2626' : '#16a34a' }}>
                              {g.gap > 0 ? `-${g.gap.toFixed(1)}` : 'On Target'}
                            </td>
                            <td>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: g.priority === 'Critical' ? '#fef2f2' : g.priority === 'High' ? '#fffbeb' : '#f0fdf4',
                                  color: g.priority === 'Critical' ? '#b91c1c' : g.priority === 'High' ? '#b45309' : '#15803d',
                                  border: g.priority === 'Critical' ? '1px solid #fee2e2' : g.priority === 'High' ? '1px solid #fef3c7' : '1px solid #dcfce7',
                                }}
                              >
                                {g.priority}
                              </span>
                            </td>
                            <td style={{ color: '#475569' }}>
                              {g.estimated_hours > 0 ? `~${g.estimated_hours} hrs` : '0 hrs (Acquired)'}
                            </td>
                            <td>
                              <Link
                                to="/app/compiler"
                                style={{
                                  fontSize: '0.775rem',
                                  fontWeight: 700,
                                  color: '#2563eb',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                Practice in Lab <ChevronRight size={12} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
