import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { careersApi, studentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  DollarSign,
  Briefcase,
  Target,
  ArrowLeft,
  GitPullRequest,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CareerDetailPage: React.FC = () => {
  const { careerId } = useParams<{ careerId: string }>();
  const { profile, refreshProfile } = useAuth();
  const [career, setCareer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (careerId) {
      careersApi.getCareerDetail(careerId)
        .then((res) => setCareer(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [careerId]);

  const handleSetTarget = async () => {
    if (!careerId) return;
    await studentApi.updateProfile({ target_career_id: careerId });
    await refreshProfile();
    navigate('/app/skill-gap');
  };

  if (loading || !career) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
        Loading career role details...
      </div>
    );
  }

  const isCurrentTarget = profile?.target_career_id === career.id;

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Link to="/app/careers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontSize: '0.875rem', fontWeight: 600 }}>
        <ArrowLeft size={16} />
        <span>Back to Career Explorer</span>
      </Link>

      {/* Hero Card */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>{career.domain}</span>
            <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>{career.title}</h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSetTarget}
              className={isCurrentTarget ? 'btn-secondary' : 'btn-primary'}
              style={{ padding: '10px 20px' }}
            >
              <Target size={16} />
              <span>{isCurrentTarget ? 'Active Target Role' : 'Set as My Target Role'}</span>
            </button>
            <Link to="/app/skill-gap" className="btn-secondary" style={{ padding: '10px 18px' }}>
              <GitPullRequest size={16} />
              <span>Analyze Gap</span>
            </Link>
          </div>
        </div>

        <p style={{ color: '#d1d5db', fontSize: '1rem', lineHeight: 1.6 }}>
          {career.description}
        </p>

        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
              Average Market Salary
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
              ${career.avg_salary_usd.toLocaleString()} / year
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
              Minimum Experience
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              {career.min_exp_years === 0 ? '0 (Entry Level / Fresh Grad)' : `${career.min_exp_years} Years`}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
              Core Competencies
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>
              {career.required_skills.length} Required Skills
            </div>
          </div>
        </div>
      </div>

      {/* Required Skills Breakdown */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '20px' }}>Required Technical & Soft Skills</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {career.required_skills.map((rs: any) => (
            <div
              key={rs.skill_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>{rs.skill_name}</div>
                <span className="badge badge-indigo" style={{ marginTop: '4px', fontSize: '0.7rem' }}>
                  {rs.category}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.825rem', color: '#9ca3af' }}>Required Proficiency</div>
                  <strong style={{ color: '#818cf8' }}>Level {rs.required_level} / 5.0</strong>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.825rem', color: '#9ca3af' }}>Importance Weight</div>
                  <strong style={{ color: '#34d399' }}>{(rs.importance_weight * 100).toFixed(0)}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
