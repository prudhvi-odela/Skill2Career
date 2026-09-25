import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analysisApi, careersApi } from '../api/client';
import { ScoreGauge } from '../components/ScoreGauge';
import { KPICard } from '../components/KPICard';
import { ALL_BRANCHES } from '../data/engineeringBranches';
import { getCareersForBranch } from '../data/branchCareerRoles';
import { Terminal, BookOpen, ArrowRight, Code2, Clock, Play } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [readinessData, setReadinessData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [gapData, setGapData] = useState<any>(null);
  const [trajectoryData, setTrajectoryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetCareerId = profile?.target_career_id || 'CG_CSE_1_software_engineer';
  const userBranch = profile?.branch || profile?.major_or_branch || 'CSE';

  useEffect(() => {
    loadDashboardData();
  }, [profile?.target_career_id, profile?.skills, profile?.branch]);

  const loadDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [recsRes, readyRes, gapRes, trajRes] = await Promise.all([
        careersApi.getRecommendations(userBranch).catch(() => ({ data: [] })),
        analysisApi.predictReadiness(targetCareerId).catch(() => ({ data: null })),
        analysisApi.getSkillGap(targetCareerId).catch(() => ({ data: null })),
        analysisApi.forecastTrajectory(profile?.weekly_study_hours || 15, 0.9, targetCareerId).catch(() => ({ data: null }))
      ]);

      let finalRecs = recsRes.data || [];
      if (finalRecs.length === 0) {
        // Fallback to branch-specific career definitions
        finalRecs = getCareersForBranch(userBranch).map(c => ({
          career_id: c.career_id,
          career_title: c.career_title,
          domain: c.domain,
          match_score: 75,
          readiness_score: 70,
          avg_salary: c.avg_salary_usd
        }));
      }

      setRecommendations(finalRecs);
      setReadinessData(readyRes.data);
      setGapData(gapRes.data);
      setTrajectoryData(trajRes.data);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setErrorMsg('Failed to load skill-to-career analysis data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetTargetCareer = async (careerId: string) => {
    try {
      await updateProfile({ target_career_id: careerId });
      loadDashboardData();
    } catch (err) {
      console.error('Failed to update target career:', err);
    }
  };

  const readinessScore = readinessData?.predicted_readiness_score ?? gapData?.readiness_score ?? 0;
  const criticalGapsCount = gapData?.critical_gaps?.length ?? 0;
  const matchPercentage = gapData?.match_percentage ?? 0;
  const estWeeks = trajectoryData?.estimated_weeks_to_ready ?? 8;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Problem Statement Mission Header */}
      <div
        className="panel-card"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px 26px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">SKILL2CAREER ENGINE</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Official Skill-to-Career Mapping & Trajectory System</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', color: '#0f172a', margin: '4px 0' }}>
            Welcome, {user?.full_name || 'Student'}
          </h1>
          <p style={{ color: '#475569', fontSize: '0.85rem', maxWidth: '800px', margin: 0 }}>
            Analyzing your evolving learning trajectory, identifying missing skills, recommending suitable career paths, and predicting future job-readiness.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            to="/app/practice"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0f172a',
              color: '#38bdf8',
              border: '1px solid #334155',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
            }}
          >
            <Clock size={15} style={{ color: '#10b981' }} />
            <span>Coding Practice & Stopwatch</span>
          </Link>
          <Link to="/app/skills" className="btn-secondary">
            Update My Skills
          </Link>
          <Link to="/app/trajectory" className="btn-primary">
            Simulate Trajectory
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '4px', fontSize: '0.85rem' }}>
          {errorMsg}
        </div>
      )}

      {/* 4 Primary Skill2Career Metric KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <KPICard
          title="JOB READINESS PREDICTION"
          value={`${readinessScore.toFixed(1)}%`}
          subtitle={readinessScore >= 80 ? 'Job-Ready Benchmark Met' : 'Approaching Benchmark (85% Target)'}
        />
        <KPICard
          title="TARGET ROLE MATCH"
          value={`${matchPercentage}%`}
          subtitle={gapData?.career_title ? `Fit for ${gapData.career_title}` : 'Select target role'}
        />
        <KPICard
          title="CRITICAL SKILL GAPS"
          value={`${criticalGapsCount} Missing`}
          subtitle="High-priority requirements to acquire"
        />
        <KPICard
          title="ESTIMATED TIME TO READY"
          value={`${estWeeks} Weeks`}
          subtitle={`At current pace (${profile?.weekly_study_hours || 15} hrs/wk)`}
        />
      </div>

      {/* Branch-Specific Learning Roadmap & Specialized Practice Section */}
      {(() => {
        const userBranch = profile?.branch || profile?.major_or_branch || 'CSE';
        const branchInfo = ALL_BRANCHES.find(
          b => b.code.toLowerCase() === userBranch.toLowerCase() ||
               b.name.toLowerCase().includes(userBranch.toLowerCase())
        ) || ALL_BRANCHES[0];

        return (
          <div
            className="panel-card"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{branchInfo.categoryEmoji}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#006EFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {branchInfo.category}
                    </span>
                    <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      ACTIVE DISCIPLINE
                    </span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                    {branchInfo.name}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to="/app/curriculum"
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                >
                  <BookOpen size={14} />
                  <span>Curriculum & Schedule</span>
                </Link>
                <Link
                  to="/app/curriculum"
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                >
                  <Terminal size={14} />
                  <span>Launch Practice Lab</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Quick Preview of What They Have to Learn in This Branch */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Core Required Subjects ({branchInfo.subjects.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {branchInfo.subjects.slice(0, 3).map((sub) => (
                    <div key={sub.code} style={{ fontSize: '12px', color: '#1e293b', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>{sub.code}: {sub.name}</span>
                      <span style={{ color: '#64748b' }}>Sem {sub.semester}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Weekly Lab Workflow & Compiler Focus
                </div>
                {branchInfo.schedule.length > 0 ? (
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    <div style={{ fontWeight: 700, color: '#006EFF', marginBottom: '2px' }}>
                      Week {branchInfo.schedule[0].week}: {branchInfo.schedule[0].theme}
                    </div>
                    <div style={{ color: '#64748b', lineHeight: 1.4 }}>
                      {branchInfo.schedule[0].labWorkflow}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Full 12-week schedule with automated deliverables configured.
                  </div>
                )}
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Tailored Compilers & Tooling
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {branchInfo.toolsAndTech.slice(0, 5).map((t) => (
                    <span key={t} style={{ fontSize: '10px', background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: '#006EFF', fontWeight: 600 }}>
                  Primary Sandbox: {branchInfo.compilerType.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
        {/* Left Column: Recommendations & Identified Missing Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Suitable Career Path Recommendations */}
          <div className="panel-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '2px' }}>
                  Suitable Career Path Recommendations
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                  Ranked by compatibility with your current skill profile
                </p>
              </div>
              <Link to="/app/careers" style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 600 }}>
                View All Careers →
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                Analyzing career matches...
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Career Role</th>
                    <th>Domain</th>
                    <th>Match Fit</th>
                    <th>Readiness</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.slice(0, 5).map((rec: any, idx: number) => {
                    const isTarget = rec.career_id === targetCareerId;
                    return (
                      <tr key={`${rec.career_id}_${idx}`} style={{ background: isTarget ? '#eff6ff' : undefined }}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{rec.career_title}</div>
                          {isTarget && <span className="badge badge-primary" style={{ marginTop: '2px' }}>Active Target</span>}
                        </td>
                        <td style={{ color: '#475569' }}>{rec.domain}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-bar-container" style={{ width: '60px' }}>
                              <div
                                className={rec.match_score >= 70 ? 'progress-bar-fill-emerald' : 'progress-bar-fill'}
                                style={{ width: `${rec.match_score}%` }}
                              />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{rec.match_score}%</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, color: rec.readiness_score >= 80 ? '#15803d' : '#1e3a8a' }}>
                          {rec.readiness_score}%
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {isTarget ? (
                            <Link
                              to={`/app/skill-gap?target_career_id=${rec.career_id}`}
                              className="btn-secondary"
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            >
                              View Gap
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleSetTargetCareer(rec.career_id)}
                              className="btn-secondary"
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                            >
                              Set Target
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Section 2: Identified Missing Skills for Target Role */}
          <div className="panel-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '2px' }}>
                  Missing Skills Analysis ({gapData?.career_title || 'Target Role'})
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                  Deficits identified between your current profile and industry requirements
                </p>
              </div>
              <Link to="/app/skill-gap" style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 600 }}>
                Full Gap Matrix →
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                Calculating skill deficits...
              </div>
            ) : gapData?.missing_skills?.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#15803d', fontSize: '0.85rem' }}>
                All required skills for this role are currently covered!
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Skill Name</th>
                    <th>Required Benchmark</th>
                    <th>Current Level</th>
                    <th>Deficit</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {gapData?.missing_skills?.slice(0, 6).map((sk: any) => (
                    <tr key={sk.skill_id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{sk.skill_name}</td>
                      <td>Level {sk.required_level}.0</td>
                      <td>{sk.current_level > 0 ? `Level ${sk.current_level}.0` : '0.0 (Unacquired)'}</td>
                      <td style={{ color: '#b91c1c', fontWeight: 700 }}>
                        -{sk.gap.toFixed(1)}
                      </td>
                      <td>
                        <span className={sk.priority === 'Critical' ? 'badge badge-danger' : 'badge badge-warning'}>
                          {sk.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Readiness Prediction & Trajectory Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Job-Readiness Prediction Engine */}
          <div className="panel-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#0f172a', alignSelf: 'flex-start', marginBottom: '4px' }}>
              Job-Readiness Prediction
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.78rem', alignSelf: 'flex-start', marginBottom: '14px' }}>
              Supervised model evaluating competency vs target role
            </p>

            <ScoreGauge score={readinessScore} size={150} />

            <div style={{ width: '100%', marginTop: '16px', borderTop: '1px solid #cbd5e1', paddingTop: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Contributing Model Factors:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Skill Coverage</span>
                  <span style={{ fontWeight: 600 }}>{matchPercentage}% weight</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Academic Foundations</span>
                  <span style={{ fontWeight: 600 }}>GPA {profile?.gpa || 8.0} / 10</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Learning Velocity</span>
                  <span style={{ fontWeight: 600 }}>{profile?.weekly_study_hours || 15} hrs/wk</span>
                </div>
              </div>
            </div>

            <Link
              to="/app/job-readiness"
              className="btn-secondary"
              style={{ width: '100%', marginTop: '14px', textAlign: 'center' }}
            >
              Detailed Factor Breakdown →
            </Link>
          </div>

          {/* SkillBridge Active Learning Path Widget */}
          <div className="skillbridge-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  SkillBridge Roadmap
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                Phase 1 Active
              </span>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Foundations & Deficit Resolution
            </h3>
            <p style={{ fontSize: '0.775rem', color: '#475569', margin: '0 0 12px 0' }}>
              Targeting high-severity deficits in core syntax, asynchronous operations, and data pipelines.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                <span>Milestone Progress</span>
                <span style={{ color: '#2563eb' }}>50% Complete</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '50%', height: '100%', background: '#2563eb', borderRadius: '3px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                to="/app/skill-gap"
                className="btn-primary"
                style={{ flex: 1, padding: '7px 12px', fontSize: '0.775rem', textAlign: 'center' }}
              >
                Track Milestones →
              </Link>
              <Link
                to="/app/compiler"
                className="btn-secondary"
                style={{ padding: '7px 12px', fontSize: '0.775rem' }}
              >
                Code in Lab
              </Link>
            </div>
          </div>

          {/* Evolving Learning Trajectory Summary */}
          <div className="panel-card" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '4px' }}>
              Evolving Learning Trajectory
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '12px' }}>
              Simulated readiness curve across 12-24 weeks
            </p>

            <div style={{ background: '#e2e8f0', padding: '12px', borderRadius: '3px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: '#475569' }}>Current Readiness:</span>
                <strong>{readinessScore.toFixed(1)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: '#475569' }}>Job-Ready Threshold:</span>
                <strong style={{ color: '#15803d' }}>85.0%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#475569' }}>Projected Weeks:</span>
                <strong style={{ color: '#1e3a8a' }}>{estWeeks} Weeks</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '14px', lineHeight: 1.4 }}>
              By dedicating <strong>{profile?.weekly_study_hours || 15} hrs/week</strong> with consistent practice, you are on track to bridge your critical skill gaps in {estWeeks} weeks.
            </div>

            <Link
              to="/app/trajectory"
              className="btn-primary"
              style={{ width: '100%', textAlign: 'center' }}
            >
              Open Trajectory Simulator →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
