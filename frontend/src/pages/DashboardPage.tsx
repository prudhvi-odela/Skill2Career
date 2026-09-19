import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analysisApi, careersApi, studentApi } from '../api/client';
import { ScoreGauge } from '../components/ScoreGauge';
import { RadarChart } from '../components/RadarChart';
import {
  Sparkles,
  TrendingUp,
  GitPullRequest,
  Target,
  ArrowRight,
  Award,
  Layers,
  CheckCircle2,
  Clock,
  Compass,
  AlertTriangle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [readinessData, setReadinessData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [gapData, setGapData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, [profile?.target_career_id]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [recRes, readyRes, gapRes, actRes] = await Promise.allSettled([
        careersApi.getRecommendations(),
        analysisApi.predictReadiness(),
        analysisApi.getSkillGap(),
        studentApi.getActivities(),
      ]);

      if (recRes.status === 'fulfilled') setRecommendations(recRes.value.data);
      if (readyRes.status === 'fulfilled') setReadinessData(readyRes.value.data);
      if (gapRes.status === 'fulfilled') setGapData(gapRes.value.data);
      if (actRes.status === 'fulfilled') setActivities(actRes.value.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare radar chart data
  const radarLabels = gapData?.gaps?.slice(0, 7).map((g: any) => g.skill_name) || [];
  const radarStudent = gapData?.gaps?.slice(0, 7).map((g: any) => g.current_level) || [];
  const radarRequired = gapData?.gaps?.slice(0, 7).map((g: any) => g.required_level) || [];

  const verifiedSkillsCount = profile?.skills?.filter((s: any) => s.is_verified).length || 0;

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(17, 24, 39, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={18} color="#818cf8" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase' }}>
              Student Learning Command Center
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>
            Welcome back, <span className="gradient-text">{user?.full_name || 'Student'}</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Tracking career trajectory for{' '}
            <strong style={{ color: '#e0e7ff' }}>
              {readinessData?.career_title || profile?.target_career_title || 'Software Engineering'}
            </strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/app/skill-gap" className="btn-secondary" style={{ padding: '10px 18px' }}>
            <GitPullRequest size={16} />
            <span>View Skill Gaps</span>
          </Link>
          <Link to="/app/roadmap" className="btn-primary" style={{ padding: '10px 20px' }}>
            <span>Open Roadmap</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Readiness Metric */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <CheckCircle2 size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>
              Readiness Score
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              {readinessData?.readiness_score ? `${readinessData.readiness_score}%` : 'Evaluating...'}
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: readinessData?.is_job_ready ? '#34d399' : '#fbbf24',
                fontWeight: 600,
              }}
            >
              {readinessData?.readiness_tier || 'In Training'}
            </span>
          </div>
        </div>

        {/* Skills Inventory */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22d3ee',
            }}
          >
            <Layers size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>
              Skills Tracked
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              {profile?.skills?.length || 0} Skills
            </div>
            <span style={{ fontSize: '0.75rem', color: '#67e8f9', fontWeight: 600 }}>
              {verifiedSkillsCount} Verified by Quiz
            </span>
          </div>
        </div>

        {/* Portfolio & Projects */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
            }}
          >
            <Award size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>
              Portfolio Depth
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              {profile?.projects_count || 0} Projects
            </div>
            <span style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: 600 }}>
              {profile?.certifications_count || 0} Certifications
            </span>
          </div>
        </div>

        {/* Study Velocity */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
            }}
          >
            <Clock size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>
              Study Pace
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              {profile?.weekly_study_hours || 12} hrs/wk
            </div>
            <span style={{ fontSize: '0.75rem', color: '#fde68a', fontWeight: 600 }}>
              Velocity Index: {profile?.learning_velocity_index || 1.0}x
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Readiness Gauge + Radar Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '24px',
        }}
      >
        {/* ML Readiness Gauge & AI Evaluation */}
        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem' }}>ML Job-Readiness Evaluation</h3>
            <span className="badge badge-indigo">
              Model {readinessData?.model_version || 'v1.0.0'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <ScoreGauge
              score={readinessData?.readiness_score || 0}
              size={190}
              label="Job Readiness"
              sublabel={readinessData?.readiness_tier}
            />
          </div>

          {/* AI Narrative Brief */}
          {readinessData?.ai_explanation && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: '#d1d5db',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#818cf8', fontWeight: 600 }}>
                <Sparkles size={16} />
                <span>AI Career Advisor Insight</span>
              </div>
              <p style={{ whiteSpace: 'pre-line' }}>{readinessData.ai_explanation}</p>
            </div>
          )}
        </div>

        {/* Competency Radar vs Target Career */}
        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Competency Gap Radar</h3>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>1-5 Proficiency Scale</span>
          </div>

          {radarLabels.length > 0 ? (
            <RadarChart labels={radarLabels} studentLevels={radarStudent} requiredLevels={radarRequired} />
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              Add skills to your profile to render the competency radar.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Matched Careers & Recent Learning Activities */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Top Matched Career Roles */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Top Matched Career Roles</h3>
            <Link to="/app/careers" style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
              Explore All Careers &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recommendations.slice(0, 4).map((c, idx) => (
              <div
                key={c.career_id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '16px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>{c.career_title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{c.domain} • ${c.avg_salary_usd?.toLocaleString()}/yr</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: c.match_percentage >= 70 ? '#34d399' : (c.match_percentage >= 50 ? '#fbbf24' : '#f87171'),
                    }}
                  >
                    {c.match_percentage}% Match
                  </span>
                  <div style={{ width: '80px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', marginTop: '4px' }}>
                    <div
                      style={{
                        width: `${c.match_percentage}%`,
                        height: '100%',
                        background: c.match_percentage >= 70 ? '#10b981' : (c.match_percentage >= 50 ? '#f59e0b' : '#f43f5e'),
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Learning Activities */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Recent Learning Momentum</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activities.length > 0 ? (
              activities.slice(0, 4).map((a, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#818cf8',
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f3f4f6' }}>{a.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{a.hours_spent} hrs invested</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: '0.9rem' }}>
                Complete skill assessments or projects to log learning momentum.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
