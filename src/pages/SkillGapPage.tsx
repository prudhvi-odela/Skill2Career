import React, { useState, useEffect } from 'react';
import { analysisApi, careersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  GitPullRequest,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Filter,
  TrendingUp,
  Target,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { SkeletonLoader, EmptyState, ErrorState, IncompleteProfileBanner } from '../components/StateFeedback';

export const SkillGapPage: React.FC = () => {
  const { profile } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');
  const [gapData, setGapData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  useEffect(() => {
    loadCareersAndGap();
  }, [profile?.target_career_id]);

  const loadCareersAndGap = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await careersApi.getCareers();
      setCareers(res.data);
      const initialId = profile?.target_career_id || (res.data.length > 0 ? res.data[0].id : '');
      setSelectedCareerId(initialId);
      if (initialId) {
        const gapRes = await analysisApi.getSkillGap(initialId);
        setGapData(gapRes.data);
      }
    } catch (err: any) {
      console.error('Error loading skill gap:', err);
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
  const highCount = gapData?.gaps?.filter((g: any) => g.priority === 'High').length || 0;

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <IncompleteProfileBanner />

      {/* Header & Career Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Skill Gap Analysis Engine</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Vectorized comparison of your verified & self-reported skill proficiency against target industry requirements.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Target Role:</span>
          <select
            className="input-field"
            style={{ width: '280px' }}
            value={selectedCareerId}
            onChange={handleCareerChange}
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

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
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
            }}
          >
            <KPICard
              title="Skill Coverage"
              value={`${gapData.coverage_percentage}%`}
              subtitle={`Against ${gapData.total_skills_required} Required Competencies`}
              icon={<Target size={20} />}
              badge={{
                text: gapData.coverage_percentage >= 70 ? 'High Alignment' : 'Gap Detected',
                variant: gapData.coverage_percentage >= 70 ? 'emerald' : 'amber'
              }}
            />

            <KPICard
              title="Critical Gaps"
              value={`${criticalCount} Skills`}
              subtitle="Requires immediate remediation focus"
              icon={<AlertTriangle size={20} />}
              badge={{
                text: criticalCount === 0 ? 'Optimal' : 'Needs Action',
                variant: criticalCount === 0 ? 'emerald' : 'rose'
              }}
            />

            <KPICard
              title="Proficient / Mastered"
              value={`${gapData.proficient_count} Skills`}
              subtitle="Meet or exceed role target"
              icon={<CheckCircle2 size={20} />}
              badge={{
                text: 'Validated',
                variant: 'emerald'
              }}
            />

            <KPICard
              title="Remediation Effort"
              value={`~${gapData.estimated_remediation_hours} Hours`}
              subtitle="Estimated total guided study time"
              icon={<Clock size={20} />}
              badge={{
                text: `${gapData.gaps.length} Target Skills`,
                variant: 'indigo'
              }}
            />
          </div>

          {/* Action Callout & Filter Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Filter size={16} color="#9ca3af" />
              {['All', 'Critical', 'High', 'Medium', 'Mastered'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  style={{
                    background: priorityFilter === p ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                    color: priorityFilter === p ? '#ffffff' : '#9ca3af',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <Link to="/app/roadmap" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Sparkles size={14} />
              <span>Generate Step-by-Step Remediation Roadmap</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Granular Gap Matrix */}
          <div className="glass-card" style={{ overflowX: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Skill Name</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Domain Category</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Current vs Required</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Gap Delta</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Priority Level</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Estimated Remediation</th>
                </tr>
              </thead>
              <tbody>
                {filteredGaps.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                      No skills found matching priority filter "{priorityFilter}".
                    </td>
                  </tr>
                ) : (
                  filteredGaps.map((g: any) => {
                    let badgeClass = 'badge-indigo';
                    if (g.priority === 'Critical') badgeClass = 'badge-rose';
                    else if (g.priority === 'High') badgeClass = 'badge-amber';
                    else if (g.priority === 'Mastered') badgeClass = 'badge-emerald';

                    const pct = Math.min(100, Math.round((g.current_level / (g.required_level || 1)) * 100));

                    return (
                      <tr
                        key={g.skill_id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: '#ffffff' }}>
                          {g.skill_name}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#9ca3af', fontSize: '0.875rem' }}>
                          {g.category}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#d1d5db', width: '56px' }}>
                              {g.current_level} / {g.required_level}
                            </span>
                            <div style={{ flex: 1, maxWidth: '140px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px' }}>
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  background: g.current_level >= g.required_level ? '#10b981' : (g.current_level > 0 ? '#f59e0b' : '#f43f5e'),
                                  borderRadius: '3px',
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 700, color: g.gap > 0 ? '#b91c1c' : '#15803d' }}>
                          {g.gap > 0 ? `-${g.gap.toFixed(1)}` : '[Met]'}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span className={`badge ${badgeClass}`}>{g.priority}</span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#9ca3af', fontSize: '0.875rem' }}>
                          {g.estimated_hours > 0 ? `~${g.estimated_hours} hrs` : '0 hrs (Ready)'}
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
