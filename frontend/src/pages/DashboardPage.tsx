import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analysisApi, careersApi, studentApi } from '../api/client';
import { ScoreGauge } from '../components/ScoreGauge';
import { RadarChart } from '../components/RadarChart';
import { KPICard } from '../components/KPICard';
import { SkeletonLoader, ErrorState, IncompleteProfileBanner, EmptyState } from '../components/StateFeedback';
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
  AlertTriangle,
  Zap,
  BookOpen,
  Activity,
  Briefcase
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [readinessData, setReadinessData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [gapData, setGapData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [profile?.target_career_id]);

  const loadDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);
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

      if (readyRes.status === 'rejected' && readyRes.reason?.response?.data?.detail) {
        setErrorMsg(readyRes.reason.response.data.detail);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setErrorMsg('Failed to load career intelligence telemetry from backend.');
    } finally {
      setLoading(false);
    }
  };

  const isProfileIncomplete = !profile?.gpa || !profile?.target_career_id;

  // Radar data
  const radarLabels = gapData?.gaps?.slice(0, 7).map((g: any) => g.skill_name) || [];
  const radarStudent = gapData?.gaps?.slice(0, 7).map((g: any) => g.current_level) || [];
  const radarRequired = gapData?.gaps?.slice(0, 7).map((g: any) => g.required_level) || [];

  const verifiedSkillsCount = profile?.skills?.filter((s: any) => s.is_verified).length || 0;
  const criticalGapsCount = gapData?.gaps?.filter((g: any) => g.priority === 'Critical' || g.priority === 'High').length || 0;
  const coveragePercentage = gapData?.coverage_percentage ?? (readinessData?.readiness_score ? Math.round(readinessData.readiness_score * 0.9) : 0);

  // High-value next actions
  const nextActions = gapData?.gaps
    ?.filter((g: any) => g.priority === 'Critical' || g.priority === 'High')
    ?.slice(0, 3) || [];

  return (
    <div style={{ padding: '28px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
              Student Career Intelligence Dashboard
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>
            Welcome back, <span className="gradient-text">{user?.full_name || 'Student'}</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Real-time readiness and gap analysis for{' '}
            <strong style={{ color: '#e0e7ff' }}>
              {readinessData?.career_title || profile?.target_career_title || 'Software Engineering'}
            </strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/app/skill-gap" className="btn-secondary" style={{ padding: '10px 18px' }}>
            <GitPullRequest size={16} />
            <span>Skill Gaps ({criticalGapsCount})</span>
          </Link>
          <Link to="/app/roadmap" className="btn-primary" style={{ padding: '10px 20px' }}>
            <span>Open Roadmap</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {isProfileIncomplete && (
        <IncompleteProfileBanner
          missingFields={[
            !profile?.gpa ? 'GPA' : '',
            !profile?.target_career_id ? 'Target Career' : '',
          ].filter(Boolean)}
        />
      )}

      {errorMsg && (
        <ErrorState
          title="Telemetry Load Issue"
          message={errorMsg}
          onRetry={loadDashboardData}
        />
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <SkeletonLoader height="120px" count={6} />
        </div>
      ) : (
        <>
          {/* 6 Core KPI Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '18px',
            }}
          >
            <KPICard
              icon={<CheckCircle2 size={20} color="#34d399" />}
              label="Job Readiness"
              value={readinessData?.readiness_score ? `${readinessData.readiness_score}%` : '0%'}
              badge={readinessData?.readiness_tier || 'Evaluating'}
              badgeColor={readinessData?.is_job_ready ? 'emerald' : 'amber'}
            />

            <KPICard
              icon={<Target size={20} color="#60a5fa" />}
              label="Skill Coverage"
              value={`${coveragePercentage}%`}
              badge={coveragePercentage >= 70 ? 'High' : 'Developing'}
              badgeColor={coveragePercentage >= 70 ? 'emerald' : 'indigo'}
            />

            <KPICard
              icon={<AlertTriangle size={20} color="#fb7185" />}
              label="Critical Gaps"
              value={criticalGapsCount}
              subValue="remediable"
              badge={criticalGapsCount === 0 ? 'Clear' : 'Needs Action'}
              badgeColor={criticalGapsCount === 0 ? 'emerald' : 'rose'}
            />

            <KPICard
              icon={<Layers size={20} color="#22d3ee" />}
              label="Skills Tracked"
              value={profile?.skills?.length || 0}
              subValue={`(${verifiedSkillsCount} verified)`}
              badge="Inventory"
              badgeColor="cyan"
            />

            <KPICard
              icon={<Award size={20} color="#a78bfa" />}
              label="Projects & Certs"
              value={(profile?.projects_count || 0) + (profile?.certifications_count || 0)}
              subValue={`${profile?.projects_count || 0} proj, ${profile?.certifications_count || 0} cert`}
              badge="Portfolio"
              badgeColor="indigo"
            />

            <KPICard
              icon={<Clock size={20} color="#f59e0b" />}
              label="Study Pace"
              value={`${profile?.weekly_study_hours || 12} hrs`}
              subValue={`vel: ${profile?.learning_velocity_index || 1.0}x`}
              badge="Pace"
              badgeColor="amber"
            />
          </div>

          {/* Center Section: Readiness Hero + Radar Chart */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px',
            }}
          >
            {/* ML Readiness Gauge & AI Feedback */}
            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Machine Learning Readiness</h3>
                <span className="badge badge-indigo">
                  Model {readinessData?.model_version || 'v1.0.0'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
                <ScoreGauge
                  score={readinessData?.readiness_score || 0}
                  size={190}
                  label="Job Readiness"
                  sublabel={readinessData?.readiness_tier}
                />
              </div>

              {readinessData?.confidence_margin && (
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
                  Empirical Margin: ±{readinessData.confidence_margin}% • Evaluated on 13 features
                </div>
              )}

              {/* AI Coaching Narrative */}
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
                    <span>AI Career Coaching Insight</span>
                  </div>
                  <p style={{ whiteSpace: 'pre-line' }}>{readinessData.ai_explanation}</p>
                </div>
              )}
            </div>

            {/* Competency Gap Radar vs Target Role */}
            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Competency Radar</h3>
                <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>1-5 Proficiency Scale</span>
              </div>

              {radarLabels.length > 0 ? (
                <RadarChart labels={radarLabels} studentLevels={radarStudent} requiredLevels={radarRequired} />
              ) : (
                <EmptyState
                  icon={<Layers size={36} color="#818cf8" />}
                  title="No Skills Logged"
                  description="Add skills to your profile to render your competency radar comparison."
                  actionText="Add Skills"
                  actionHref="/app/skills"
                />
              )}
            </div>
          </div>

          {/* Bottom Section: Matched Careers & Next High-Value Actions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Top Matched Career Roles from Backend */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Career Compatibility Matches</h3>
                <Link to="/app/careers" style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
                  Explore All &rarr;
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendations.slice(0, 4).map((c) => (
                  <div
                    key={c.career_id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '14px 18px',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.925rem', color: '#ffffff' }}>{c.career_title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{c.domain} • ${c.avg_salary_usd?.toLocaleString()}/yr</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: c.match_percentage >= 70 ? '#34d399' : (c.match_percentage >= 50 ? '#fbbf24' : '#f87171'),
                        }}
                      >
                        {c.match_percentage}% Match
                      </span>
                      <div style={{ width: '70px', height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', marginTop: '4px' }}>
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

            {/* Top Recommended Remediation Actions */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Priority Growth Actions</h3>
                <Link to="/app/skill-gap" style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
                  All Gaps ({gapData?.gaps?.length || 0}) &rarr;
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {nextActions.length > 0 ? (
                  nextActions.map((g: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f3f4f6' }}>{g.skill_name}</span>
                          <span className={`badge ${g.priority === 'Critical' ? 'badge-rose' : 'badge-amber'}`}>
                            {g.priority}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.775rem', color: '#9ca3af', marginTop: '2px' }}>
                          Current: Level {g.current_level} &rarr; Target: Level {g.required_level}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>
                          ~{g.estimated_hours}h remediation
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={<CheckCircle2 size={32} color="#34d399" />}
                    title="No Critical Skill Gaps"
                    description="Your current skills match the target career requirements."
                    actionText="View Roadmap"
                    actionHref="/app/roadmap"
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
