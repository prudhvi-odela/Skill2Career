import React, { useState, useEffect } from 'react';
import { analysisApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ScoreGauge } from '../components/ScoreGauge';
import { SkeletonLoader, ErrorState, IncompleteProfileBanner, EmptyState } from '../components/StateFeedback';
import { Link } from 'react-router-dom';

export const JobReadinessPage: React.FC = () => {
  const { profile } = useAuth();
  const [readinessData, setReadinessData] = useState<any>(null);
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
        setErrorMsg(readyRes.reason?.response?.data?.detail || 'Failed to calculate readiness.');
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
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-primary">ED-05 ENGINE</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Future Job-Readiness Prediction</span>
        </div>
        <h1 style={{ fontSize: '1.45rem', color: '#0f172a', marginBottom: '4px' }}>
          Job-Readiness Predictive Engine
        </h1>
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>
          Supervised machine learning evaluation predicting your readiness score against your target role requirements based on skills, academic foundations, and learning velocity.
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SkeletonLoader height="240px" count={1} />
          <SkeletonLoader height="160px" count={2} />
        </div>
      ) : readinessData ? (
        <>
          {/* Main Evaluation Card */}
          <div
            className="panel-card"
            style={{
              padding: '28px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '28px',
              alignItems: 'center',
            }}
          >
            {/* Score Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ScoreGauge
                score={readinessData.readiness_score}
                size={200}
                label="Job Readiness"
                sublabel={readinessData.readiness_tier}
              />
              <div style={{ marginTop: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span className="badge badge-primary">
                  {readinessData.model_algorithm || 'Random Forest Regressor'}
                </span>
                <span className="badge badge-neutral">
                  Version: {readinessData.model_version || 'v1.0'}
                </span>
                {readinessData.confidence_margin && (
                  <span className="badge badge-warning">
                    Margin: ±{readinessData.confidence_margin}%
                  </span>
                )}
              </div>
            </div>

            {/* Target Role & Analysis Brief */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Evaluated Target Role
                </span>
                <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginTop: '2px' }}>
                  {readinessData.career_title}
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 600 }}>
                  Domain: {readinessData.career?.domain || 'Software Engineering'}
                </span>
              </div>

              {readinessData.ai_explanation && (
                <div
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '16px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: '#334155',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                    Engine Analysis Summary:
                  </div>
                  <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{readinessData.ai_explanation}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                <Link to="/app/trajectory" className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.825rem' }}>
                  Simulate Trajectory →
                </Link>
                <Link to="/app/skill-gap" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.825rem' }}>
                  View Skill Gaps →
                </Link>
              </div>
            </div>
          </div>

          {/* Strengths vs Gaps Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Top Strengths */}
            <div className="panel-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '14px' }}>
                Competencies Supporting Your Readiness Score
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topStrengths.length > 0 ? (
                  topStrengths.map((s: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '3px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.875rem', color: '#14532d' }}>{s.skill_name}</strong>
                        <span className="badge badge-success">Level {s.current_level}.0 / {s.required_level}.0</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#166534', margin: '4px 0 0 0' }}>
                        Meets industry benchmark. Contributes positively to overall readiness score.
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    No strength competencies recorded. Update your skills to evaluate strengths.
                  </p>
                )}
              </div>
            </div>

            {/* Top Gaps */}
            <div className="panel-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '14px' }}>
                Critical Missing Skills Impacting Score
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topGaps.length > 0 ? (
                  topGaps.map((g: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '3px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.875rem', color: '#991b1b' }}>{g.skill_name}</strong>
                        <span className="badge badge-danger">Deficit -{g.gap ? g.gap.toFixed(1) : '1.0'}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#7f1d1d', margin: '4px 0 0 0' }}>
                        Priority: {g.priority || 'Critical'} • Recommended target: Level {g.required_level || 3}.0
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#15803d', fontSize: '0.85rem' }}>
                    No major skill deficits detected for this target career!
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No Prediction Available"
          message="Select a target role and complete your skills inventory to predict job-readiness."
        />
      )}
    </div>
  );
};
