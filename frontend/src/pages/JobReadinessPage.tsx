import React, { useState, useEffect } from 'react';
import { analysisApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ScoreGauge } from '../components/ScoreGauge';
import { SkeletonLoader, ErrorState, IncompleteProfileBanner, EmptyState } from '../components/StateFeedback';
import {
  CheckCircle2,
  Sparkles,
  Cpu,
  TrendingUp,
  History,
  Layers,
  ArrowRight,
  ShieldCheck,
  ThumbsUp,
  AlertTriangle,
  Info,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const JobReadinessPage: React.FC = () => {
  const { profile } = useAuth();
  const [readinessData, setReadinessData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadReadiness();
  }, [profile?.target_career_id]);

  const loadReadiness = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [readyRes, histRes] = await Promise.allSettled([
        analysisApi.predictReadiness(),
        analysisApi.getPredictionHistory(),
      ]);

      if (readyRes.status === 'fulfilled') {
        setReadinessData(readyRes.value.data);
      } else {
        setErrorMsg(readyRes.reason?.response?.data?.detail || 'Failed to calculate ML readiness.');
      }

      if (histRes.status === 'fulfilled') {
        setHistory(histRes.value.data);
      }
    } catch (err: any) {
      console.error('Failed to load readiness:', err);
      setErrorMsg('An unexpected error occurred while fetching readiness prediction.');
    } finally {
      setLoading(false);
    }
  };

  const isProfileIncomplete = !profile?.gpa || !profile?.target_career_id;
  const topStrengths = readinessData?.top_strengths || [];
  const topGaps = readinessData?.top_gaps || [];

  return (
    <div style={{ padding: '28px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Current Job-Readiness Prediction</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
          Real-time supervised machine learning evaluation of your student profile against industry career requirements.
        </p>
      </div>

      {isProfileIncomplete && (
        <IncompleteProfileBanner
          missingFields={[
            !profile?.gpa ? 'GPA' : '',
            !profile?.target_career_id ? 'Target Career Goal' : '',
          ].filter(Boolean)}
        />
      )}

      {errorMsg && (
        <ErrorState
          title="Readiness Inference Error"
          message={errorMsg}
          onRetry={loadReadiness}
        />
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SkeletonLoader height="280px" count={1} />
          <SkeletonLoader height="180px" count={2} />
        </div>
      ) : readinessData ? (
        <>
          {/* Main Evaluation Card */}
          <div
            className="glass-card"
            style={{
              padding: '36px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '36px',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(17, 24, 39, 0.8) 100%)',
            }}
          >
            {/* Score Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ScoreGauge
                score={readinessData.readiness_score}
                size={220}
                label="Job Readiness"
                sublabel={readinessData.readiness_tier}
              />
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span className="badge badge-indigo">
                  <Cpu size={12} />
                  <span>{readinessData.model_algorithm}</span>
                </span>
                <span className="badge badge-cyan">
                  <span>Version: {readinessData.model_version}</span>
                </span>
                {readinessData.confidence_margin && (
                  <span className="badge badge-amber">
                    <span>Margin: ±{readinessData.confidence_margin}%</span>
                  </span>
                )}
              </div>
            </div>

            {/* Target Role & AI Brief */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
                  Target Career Role
                </span>
                <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginTop: '2px' }}>
                  {readinessData.career_title}
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#818cf8' }}>
                  Domain: {readinessData.career?.domain || 'Software Development'}
                </span>
              </div>

              {readinessData.ai_explanation && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '20px',
                    borderRadius: '12px',
                    fontSize: '0.925rem',
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

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                <Link to="/app/trajectory" className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.875rem' }}>
                  <TrendingUp size={16} />
                  <span>Simulate Future Growth</span>
                </Link>
                <Link to="/app/skill-gap" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.875rem' }}>
                  <span>View Skill Gaps</span>
                </Link>
                <Link to="/app/roadmap" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.875rem' }}>
                  <span>Action Plan</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Strengths vs Gaps Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Top Strengths */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <ThumbsUp size={18} color="#34d399" />
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>What Is Helping Your Score</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topStrengths.length > 0 ? (
                  topStrengths.map((s: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        background: 'rgba(16, 185, 129, 0.06)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#f3f4f6', fontSize: '0.925rem' }}>{s.feature}</span>
                        <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
                          +{s.contribution} pts
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{s.description || s.value}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Continue adding verified skills and projects to build strong drivers.
                  </div>
                )}
              </div>
            </div>

            {/* Top Gaps */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <AlertTriangle size={18} color="#f59e0b" />
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Primary Areas Holding Score Back</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topGaps.length > 0 ? (
                  topGaps.map((g: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        background: 'rgba(245, 158, 11, 0.06)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#f3f4f6', fontSize: '0.925rem' }}>{g.feature}</span>
                        <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>
                          {g.contribution} pts
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{g.description || g.value}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    No significant penalties detected in your current profile.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feature Contribution Breakdown */}
          <div className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Mathematical Feature Attribution</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '20px' }}>
              Transparent breakdown of factors evaluated by the machine learning model.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {readinessData.feature_contributions.map((fc: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '16px 20px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.95rem' }}>{fc.feature}</span>
                      <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
                        Weight: {(fc.weight * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                        {fc.score.toFixed(0)}%
                      </span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{fc.status}</span>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px' }}>
                    <div
                      style={{
                        width: `${Math.min(100, fc.score)}%`,
                        height: '100%',
                        background: fc.score >= 70 ? '#10b981' : (fc.score >= 50 ? '#f59e0b' : '#6366f1'),
                        borderRadius: '3px',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction History Audit */}
          <div className="glass-card" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <History size={18} color="#818cf8" />
              <h3 style={{ fontSize: '1.25rem' }}>Historical Readiness Telemetry</h3>
            </div>

            {history.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Date & Time</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Target Career</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Readiness</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Tier</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Model Version</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#d1d5db' }}>
                          {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>{h.career_title}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: h.readiness_score >= 75 ? '#34d399' : '#fbbf24' }}>
                          {h.readiness_score}%
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#9ca3af' }}>{h.readiness_tier}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#818cf8' }}>{h.model_version || h.model_version_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No previous prediction records found.</div>
            )}
          </div>

          {/* Ethical Disclaimer */}
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.825rem',
              color: '#9ca3af',
            }}
          >
            <Info size={18} color="#818cf8" style={{ flexShrink: 0 }} />
            <span>
              <strong>Note on Readiness Scores:</strong> Readiness estimations represent statistical alignment with market role requirements based on your current profile evidence. Scores are informational coaching benchmarks and do not guarantee hiring outcomes.
            </span>
          </div>
        </>
      ) : (
        <EmptyState
          title="No Readiness Data"
          description="Complete your student profile and declare your target career to calculate your job readiness."
          actionText="Set Up Profile"
          actionHref="/app/profile"
        />
      )}
    </div>
  );
};
