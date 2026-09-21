import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { careersApi, studentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SkeletonLoader, ErrorState } from '../components/StateFeedback';

export const CareerDetailPage: React.FC = () => {
  const { careerId } = useParams<{ careerId: string }>();
  const { profile, refreshProfile } = useAuth();
  const [career, setCareer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingTarget, setSettingTarget] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (careerId) {
      loadCareer(careerId);
    }
  }, [careerId]);

  const loadCareer = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await careersApi.getCareerDetail(id);
      setCareer(res.data);
    } catch (err: any) {
      console.error('Failed to load career details:', err);
      setError(err.response?.data?.detail || 'Failed to load career role details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetTarget = async () => {
    if (!careerId) return;
    setSettingTarget(true);
    try {
      await studentApi.updateProfile({ target_career_id: careerId });
      await refreshProfile();
      navigate('/app/skill-gap');
    } catch (err: any) {
      console.error('Failed to set target career:', err);
    } finally {
      setSettingTarget(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        <SkeletonLoader rows={5} type="cards" />
      </div>
    );
  }

  if (error || !career) {
    return (
      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        <ErrorState message={error || 'Career role not found'} onRetry={() => careerId && loadCareer(careerId)} />
      </div>
    );
  }

  const isCurrentTarget = profile?.target_career_id === career.id;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Link to="/app/careers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', fontSize: '0.85rem', fontWeight: 600 }}>
        ← Back to Career Explorer
      </Link>

      {/* Hero Panel */}
      <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <span className="badge badge-neutral" style={{ marginBottom: '6px' }}>{career.domain}</span>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>{career.title}</h1>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSetTarget}
              disabled={settingTarget}
              className={isCurrentTarget ? 'btn-secondary' : 'btn-primary'}
              style={{ padding: '8px 16px' }}
            >
              {isCurrentTarget ? '[ACTIVE TARGET ROLE]' : 'Set as My Target Role'}
            </button>
            <Link to="/app/skill-gap" className="btn-secondary" style={{ padding: '8px 14px' }}>
              Analyze Skill Gap →
            </Link>
          </div>
        </div>

        <p style={{ color: '#334155', fontSize: '0.925rem', lineHeight: 1.6 }}>
          {career.description}
        </p>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '14px', borderTop: '1px solid #cbd5e1' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Market Salary Benchmark
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
              ${career.avg_salary_usd.toLocaleString()} / year
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Experience Requirement
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {career.min_exp_years === 0 ? 'Entry Level (0 Years)' : `${career.min_exp_years}+ Years`}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Core Required Competencies
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
              {career.required_skills?.length || 0} Skills
            </div>
          </div>
        </div>
      </div>

      {/* Required Skills Breakdown */}
      <div className="panel-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '14px' }}>
          Required Technical Competencies & Proficiency Benchmarks
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {career.required_skills?.map((rs: any) => (
            <div
              key={rs.skill_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#f8f9fa',
                borderRadius: '3px',
                border: '1px solid #cbd5e1',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{rs.skill_name}</div>
                <span className="badge badge-neutral" style={{ marginTop: '2px', fontSize: '0.675rem' }}>
                  {rs.category}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Benchmark Level</div>
                  <strong style={{ color: '#1e3a8a' }}>Level {rs.required_level}.0 / 5.0</strong>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Role Weight</div>
                  <strong style={{ color: '#15803d' }}>{(rs.importance_weight * 100).toFixed(0)}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
