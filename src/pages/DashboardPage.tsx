import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  analysisApi,
  careersApi,
  studentApi,
  curriculumApi,
  learningIntelligenceApi
} from '../api/client';
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
  Briefcase,
  GraduationCap,
  Code2,
  Plus
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [readinessData, setReadinessData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [gapData, setGapData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [learningOverview, setLearningOverview] = useState<any>(null);
  const [learningProfile, setLearningProfile] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Study Session Log Modal
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [logTopic, setLogTopic] = useState<string>('');
  const [logDuration, setLogDuration] = useState<number>(45);
  const [logNotes, setLogNotes] = useState<string>('');
  const [loggingSession, setLoggingSession] = useState<boolean>(false);

  useEffect(() => {
    checkOnboardingAndLoadDashboard();
  }, [profile?.target_career_id]);

  const checkOnboardingAndLoadDashboard = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Check onboarding status
      const onbStatus = await curriculumApi.getOnboardingStatus().catch(() => ({ data: null }));
      if (onbStatus?.data && !onbStatus.data.is_onboarding_completed && !profile?.major_or_branch) {
        navigate('/app/onboarding');
        return;
      }

      const promises: Promise<any>[] = [
        careersApi.getRecommendations().catch(() => ({ data: [] })),
        studentApi.getActivities().catch(() => ({ data: [] })),
        learningIntelligenceApi.getOverview().catch(() => ({ data: null })),
        curriculumApi.getLearningProfile().catch(() => ({ data: null })),
        curriculumApi.getPersonalizedLearningPath().catch(() => ({ data: null }))
      ];

      if (profile?.target_career_id) {
        promises.push(analysisApi.predictReadiness(profile.target_career_id).catch(() => ({ data: null })));
        promises.push(analysisApi.getSkillGap(profile.target_career_id).catch(() => ({ data: null })));
      }

      const results = await Promise.allSettled(promises);
      const recRes = results[0];
      const actRes = results[1];
      const intelRes = results[2];
      const learnProfRes = results[3];
      const learnPathRes = results[4];
      const readyRes = profile?.target_career_id ? results[5] : null;
      const gapRes = profile?.target_career_id ? results[6] : null;

      if (recRes && recRes.status === 'fulfilled') setRecommendations(recRes.value.data || []);
      if (actRes && actRes.status === 'fulfilled') setActivities(actRes.value.data || []);
      if (intelRes && intelRes.status === 'fulfilled') setLearningOverview(intelRes.value.data);
      if (learnProfRes && learnProfRes.status === 'fulfilled') setLearningProfile(learnProfRes.value.data);
      if (learnPathRes && learnPathRes.status === 'fulfilled') setLearningPath(learnPathRes.value.data);
      if (readyRes && readyRes.status === 'fulfilled') setReadinessData(readyRes.value.data);
      if (gapRes && gapRes.status === 'fulfilled') setGapData(gapRes.value.data);
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setErrorMsg('Failed to load career intelligence telemetry from backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogSession = async () => {
    if (!logTopic.trim()) return;
    try {
      setLoggingSession(true);
      await learningIntelligenceApi.logSession({
        topic: logTopic,
        duration_minutes: logDuration,
        activity_type: 'SELF_STUDY',
        confidence_level: 4,
        notes: logNotes || undefined,
        skills: profile?.skills?.slice(0, 1).map((s: any) => s.skill_id) || []
      });
      setShowLogModal(false);
      setLogTopic('');
      setLogNotes('');
      checkOnboardingAndLoadDashboard();
      refreshProfile();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to log study session.');
    } finally {
      setLoggingSession(false);
    }
  };

  const verifiedSkillsCount = profile?.skills?.filter((s: any) => s.is_verified).length || 0;
  const criticalGaps = gapData?.gaps?.filter((g: any) => g.priority === 'Critical' || g.priority === 'High') || [];
  const nextActions = criticalGaps.slice(0, 3);

  const streakDays = learningOverview?.consistency?.current_streak_days ?? (activities.length > 0 ? 1 : 0);
  const weeklyHours = profile?.weekly_study_hours || 0;
  const readinessScore = readinessData?.readiness_score ? `${readinessData.readiness_score.toFixed(1)}%` : 'Not Evaluated';

  return (
    <div style={{ padding: '28px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Academic Profile & Daily Greeting Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
          padding: '24px 28px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Welcome back, {user?.full_name || 'Student'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', color: '#475569', fontSize: '0.88rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', fontWeight: 600 }}>
              {profile?.degree || 'B.Tech'} {profile?.major_or_branch || 'CSE'} - Year {profile?.academic_year || 3}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Target Role: <strong style={{ color: '#0f172a' }}>{profile?.target_career_title || 'Software Engineer'}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowLogModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={15} /> Log Learning Session
          </button>
          <Link
            to="/app/ai-advisor"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <Sparkles size={15} /> Ask AI Tutor
          </Link>
        </div>
      </div>

      {/* 2. Top Metric KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <KPICard
          title="ML JOB READINESS"
          value={readinessScore}
          subtitle={readinessData?.readiness_tier ? `${readinessData.readiness_tier} Tier` : 'Set career target to evaluate'}
          icon={<Award size={18} color={readinessData?.readiness_score >= 70 ? '#34d399' : '#60a5fa'} />}
        />
        <KPICard
          title="LEARNING THIS WEEK"
          value={weeklyHours > 0 ? `${weeklyHours} hrs` : 'Not set'}
          subtitle={weeklyHours > 0 ? 'Active commitment' : 'Set weekly study pace'}
          icon={<Clock size={18} color="#38bdf8" />}
        />
        <KPICard
          title="LEARNING STREAK"
          value={streakDays > 0 ? `${streakDays} Days` : '0 Days'}
          subtitle={streakDays > 0 ? 'Consistent momentum' : 'Start learning to build streak'}
          icon={<Zap size={18} color="#fbbf24" />}
        />
        <KPICard
          title="VERIFIED SKILLS"
          value={`${verifiedSkillsCount} / ${profile?.skills?.length || 0}`}
          subtitle="Proven by assessments/evidence"
          icon={<CheckCircle2 size={18} color="#a78bfa" />}
        />
      </div>

      {/* 3. Main Dashboard Grid (Learning Path, Today's Learning, Skill Progress, Gaps, and Next Actions) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Personalized Learning Path & Skill Progression */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Personalized Learning Path Preview */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass color="#60a5fa" size={18} /> Your Learning Path
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Curriculum milestones connected to branch subjects and career skill gaps
                </span>
              </div>
              <Link to="/app/roadmap" style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Full Roadmap <ArrowRight size={13} />
              </Link>
            </div>

            {learningPath?.milestones?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {learningPath.milestones.slice(0, 4).map((m: any) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: m.status === 'COMPLETED' ? 'rgba(52, 211, 153, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      border: m.status === 'COMPLETED' ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(255, 255, 255, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: m.status === 'COMPLETED' ? '#34d399' : 'rgba(255,255,255,0.1)',
                          color: m.status === 'COMPLETED' ? '#0f172a' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {m.status === 'COMPLETED' ? 'Done' : m.step_number}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.88rem' }}>{m.skill_name}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Phase: {m.phase} • Action: {m.action_type}</div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: m.status === 'COMPLETED' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: m.status === 'COMPLETED' ? '#34d399' : '#60a5fa'
                      }}
                    >
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '20px', textAlign: 'center' }}>
                Complete your subject baseline in Onboarding to construct your custom trajectory path.
              </div>
            )}
          </div>

          {/* Skill Progression & Breakdown */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers color="#60a5fa" size={18} /> Skill Progress
              </h3>
              <Link to="/app/skills" style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All Skills <ArrowRight size={13} />
              </Link>
            </div>

            {profile?.skills && profile.skills.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profile.skills.slice(0, 5).map((s: any) => {
                  const pct = Math.min(100, Math.round((s.proficiency_level / 5.0) * 100));
                  return (
                    <div key={s.skill_id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {s.skill_name || s.name}
                          {s.is_verified && (
                            <span style={{ fontSize: '0.65rem', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                              VERIFIED
                            </span>
                          )}
                        </span>
                        <span style={{ color: '#94a3b8' }}>{s.proficiency_level} / 5.0</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: s.is_verified ? '#34d399' : '#3b82f6', borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '20px', textAlign: 'center' }}>
                No skills added yet. Rate your subjects or take an assessment quiz to build your profile.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Today's Learning, Top Gaps & Next Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Next Recommended Action */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(15, 23, 42, 0.9))',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '14px',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
              <Zap size={14} /> NEXT RECOMMENDED ACTION
            </div>
            {nextActions.length > 0 ? (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px 0' }}>
                  {nextActions[0].skill_name} Fundamentals
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 14px 0' }}>
                  Reason: Required by {profile?.target_career_title || 'target role'} and carries high gap penalty.
                </p>
                <Link
                  to="/app/practice"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#2563eb',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Code2 size={13} /> Solve Practice Challenge
                </Link>
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                Set a target career to receive personalized high-ROI study recommendations.
              </p>
            )}
          </div>

          {/* Top Gaps */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GitPullRequest color="#f87171" size={16} /> Top Critical Gaps
              </h3>
              <Link to="/app/skill-gap" style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                View All
              </Link>
            </div>

            {criticalGaps.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {criticalGaps.slice(0, 3).map((g: any) => (
                  <div
                    key={g.skill_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      borderRadius: '6px'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: '#fca5a5', fontWeight: 600 }}>{g.skill_name}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {g.current_level} → {g.required_level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                No critical gaps detected for your current career target!
              </div>
            )}
          </div>

          {/* Today's Learning Activity */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity color="#60a5fa" size={16} /> Recent Activity
              </h3>
            </div>

            {activities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activities.slice(0, 3).map((act: any, idx: number) => (
                  <div
                    key={act.id || idx}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.04)'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.82rem' }}>{act.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '2px' }}>
                      {new Date(act.completed_at || act.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                No learning activities logged today. Click "Log Learning Session" to record your study progress!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Study Session Modal */}
      {showLogModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Log Learning Session
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  TOPIC / SUBJECT STUDIED
                </label>
                <input
                  type="text"
                  placeholder="e.g. Binary Search Trees, SQL Joins, Docker"
                  value={logTopic}
                  onChange={e => setLogTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  STUDY DURATION: {logDuration} MINUTES
                </label>
                <input
                  type="range"
                  min="15"
                  max="240"
                  step="15"
                  value={logDuration}
                  onChange={e => setLogDuration(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  NOTES (OPTIONAL)
                </label>
                <textarea
                  placeholder="Briefly summarize key concepts or equations..."
                  value={logNotes}
                  onChange={e => setLogNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => setShowLogModal(false)}
                style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={loggingSession || !logTopic.trim()}
                onClick={handleQuickLogSession}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: loggingSession || !logTopic.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {loggingSession ? 'Logging...' : 'Save Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
