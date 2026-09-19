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
  Filter
} from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  const { profile } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');
  const [gapData, setGapData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  useEffect(() => {
    careersApi.getCareers().then((res) => {
      setCareers(res.data);
      const initialId = profile?.target_career_id || (res.data.length > 0 ? res.data[0].id : '');
      setSelectedCareerId(initialId);
      if (initialId) {
        fetchGap(initialId);
      }
    });
  }, [profile?.target_career_id]);

  const fetchGap = async (careerId: string) => {
    setLoading(true);
    try {
      const res = await analysisApi.getSkillGap(careerId);
      setGapData(res.data);
    } catch (err) {
      console.error('Error fetching gap:', err);
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

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Career Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Skill Gap Analysis Engine</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Vectorized comparison of your skill proficiency against target industry requirements.
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
        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
          Computing vectorized skill gaps...
        </div>
      ) : gapData ? (
        <>
          {/* Summary KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            <div className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>
                Skill Coverage
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: gapData.coverage_percentage >= 70 ? '#34d399' : '#fbbf24' }}>
                {gapData.coverage_percentage}%
              </div>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Against {gapData.total_skills_required} Required Competencies</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>
                Critical Gaps
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>
                {gapData.gaps.filter((g: any) => g.priority === 'Critical').length} Skills
              </div>
              <span style={{ fontSize: '0.75rem', color: '#fca5a5' }}>Immediate Learning Priority</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>
                Proficient / Mastered
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
                {gapData.proficient_count} Skills
              </div>
              <span style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>Meet or Exceed Target</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>
                Remediation Effort
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8' }}>
                ~{gapData.estimated_remediation_hours} Hours
              </div>
              <span style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>Estimated Study Time</span>
            </div>
          </div>

          {/* Priority Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
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
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <Link to="/app/roadmap" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <span>Generate Remediation Roadmap</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Granular Gap Matrix */}
          <div className="glass-card" style={{ overflowX: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Skill</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Current vs Required</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Gap Delta</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Priority</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Remediation Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredGaps.map((g: any) => {
                  let badgeClass = 'badge-indigo';
                  if (g.priority === 'Critical') badgeClass = 'badge-rose';
                  else if (g.priority === 'High') badgeClass = 'badge-amber';
                  else if (g.priority === 'Mastered') badgeClass = 'badge-emerald';

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
                          <span style={{ fontSize: '0.85rem', color: '#d1d5db', width: '50px' }}>
                            {g.current_level} / {g.required_level}
                          </span>
                          <div style={{ flex: 1, maxWidth: '140px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px' }}>
                            <div
                              style={{
                                width: `${Math.min(100, (g.current_level / g.required_level) * 100)}%`,
                                height: '100%',
                                background: g.current_level >= g.required_level ? '#10b981' : (g.current_level > 0 ? '#f59e0b' : '#f43f5e'),
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: g.gap > 0 ? '#f87171' : '#34d399' }}>
                        {g.gap > 0 ? `-${g.gap}` : '✓ Met'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`badge ${badgeClass}`}>{g.priority}</span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#9ca3af', fontSize: '0.875rem' }}>
                        {g.estimated_hours > 0 ? `~${g.estimated_hours} hrs` : '0 hrs'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
};
