import React, { useState, useEffect } from 'react';
import { analysisApi, careersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { KPICard } from '../components/KPICard';
import { SkeletonLoader, EmptyState, ErrorState } from '../components/StateFeedback';
import { BranchCareerGoalNavigator } from '../components/BranchCareerGoalNavigator';
import { getCareersForBranch } from '../data/branchCareerRoles';

export const SkillGapPage: React.FC = () => {
  const { profile } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');
  const [gapData, setGapData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

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
      // Fallback to local branch careers
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

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Career Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">SKILL2CAREER ENGINE</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Missing Skills & Gap Analysis</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', color: '#0f172a', marginBottom: '4px' }}>
            Skill Gap to Career Engine
          </h1>
          <p style={{ color: '#475569', fontSize: '0.85rem' }}>
            Rigorous comparison of your current competencies against required industry benchmarks to pinpoint exactly what you need to learn.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Evaluate Against Role:</span>
          <select
            className="select-field"
            style={{ width: '280px' }}
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
                    background: priorityFilter === p ? '#1e3a8a' : '#e2e8f0',
                    color: priorityFilter === p ? '#f8f9fa' : '#334155',
                    border: priorityFilter === p ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
                    padding: '5px 11px',
                    borderRadius: '3px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <Link to="/app/trajectory" className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.825rem' }}>
              Simulate Learning Trajectory →
            </Link>
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
                </tr>
              </thead>
              <tbody>
                {filteredGaps.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No skills found matching priority filter "{priorityFilter}".
                    </td>
                  </tr>
                ) : (
                  filteredGaps.map((g: any) => {
                    let badgeClass = 'badge-primary';
                    if (g.priority === 'Critical') badgeClass = 'badge-danger';
                    else if (g.priority === 'High') badgeClass = 'badge-warning';
                    else if (g.priority === 'Mastered') badgeClass = 'badge-success';

                    const pct = Math.min(100, Math.round((g.current_level / (g.required_level || 1)) * 100));

                    return (
                      <tr key={g.skill_id}>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>
                          {g.skill_name}
                        </td>
                        <td style={{ color: '#475569' }}>
                          {g.category}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#0f172a', width: '52px', fontWeight: 600 }}>
                              {g.current_level}.0 / {g.required_level}.0
                            </span>
                            <div className="progress-bar-container" style={{ width: '80px' }}>
                              <div
                                className={g.current_level >= g.required_level ? 'progress-bar-fill-emerald' : (g.current_level > 0 ? 'progress-bar-fill-amber' : 'progress-bar-fill-rose')}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: g.gap > 0 ? '#b91c1c' : '#15803d' }}>
                          {g.gap > 0 ? `-${g.gap.toFixed(1)}` : '[MET]'}
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`}>{g.priority}</span>
                        </td>
                        <td style={{ color: '#475569' }}>
                          {g.estimated_hours > 0 ? `~${g.estimated_hours} hrs` : '0 hrs (Acquired)'}
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
    </div>
  );
};
