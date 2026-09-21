import React, { useState, useEffect } from 'react';
import { analysisApi, careersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { TrajectoryChart } from '../components/TrajectoryChart';
import { KPICard } from '../components/KPICard';
import { SkeletonLoader, EmptyState, ErrorState } from '../components/StateFeedback';

export const TrajectoryPage: React.FC = () => {
  const { profile } = useAuth();
  const [weeklyHours, setWeeklyHours] = useState<number>(profile?.weekly_study_hours || 15);
  const [consistency, setConsistency] = useState<number>(1.0);
  const [forecastData, setForecastData] = useState<any>(null);
  const [gapData, setGapData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const targetCareerId = profile?.target_career_id || 'CR004';

  useEffect(() => {
    runForecast();
  }, [weeklyHours, consistency, targetCareerId]);

  const runForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trajRes, gapRes] = await Promise.all([
        analysisApi.forecastTrajectory(weeklyHours, consistency, targetCareerId),
        analysisApi.getSkillGap(targetCareerId).catch(() => ({ data: null }))
      ]);
      setForecastData(trajRes.data);
      setGapData(gapRes.data);
    } catch (err: any) {
      console.error('Trajectory forecast error:', err);
      setError(err.response?.data?.detail || 'Failed to forecast career readiness trajectory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-primary">SKILL2CAREER ENGINE</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Evolving Learning Trajectory Tracking</span>
        </div>
        <h1 style={{ fontSize: '1.45rem', color: '#0f172a', marginBottom: '4px' }}>
          Readiness Trajectory & Growth Simulator
        </h1>
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>
          Track and project your evolving learning trajectory across 24 weeks. Adjust study velocity and dedication to predict future job-readiness.
        </p>
      </div>

      {/* Interactive Velocity Simulator & Forecast Outcome */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px',
        }}
      >
        {/* Simulation Controls Card */}
        <div className="panel-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>Learning Velocity Controls</h3>
            <span className="badge badge-neutral">Interactive Simulator</span>
          </div>

          {/* Weekly Hours */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>
                Weekly Dedicated Study Time
              </label>
              <strong style={{ color: '#1e3a8a', fontSize: '1rem' }}>{weeklyHours} Hours / Week</strong>
            </div>
            <input
              type="range"
              min="4"
              max="40"
              step="1"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#1e3a8a', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              <span>4 hrs (Part-time)</span>
              <span>15 hrs (Recommended)</span>
              <span>40 hrs (Full-time)</span>
            </div>
          </div>

          {/* Retention & Velocity Multiplier */}
          <div>
            <label className="input-label">Pace & Retention Multiplier</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[
                { label: 'Steady (1.0x)', val: 1.0 },
                { label: 'Focused (1.2x)', val: 1.2 },
                { label: 'Intensive (1.4x)', val: 1.4 },
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setConsistency(m.val)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '3px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: consistency === m.val ? '#1e3a8a' : '#e2e8f0',
                    color: consistency === m.val ? '#f8f9fa' : '#334155',
                    border: consistency === m.val ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Forecast Outcome Card */}
        <div
          className="panel-card"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span className="badge badge-success">Forecast Outcome</span>
              <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                Target: {gapData?.career_title || 'Software Engineer'}
              </span>
            </div>

            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#14532d', marginBottom: '6px' }}>
              {forecastData?.weeks_to_readiness
                ? `Job-Ready in ~${forecastData.weeks_to_readiness} Weeks`
                : 'Projected in ~8-12 Weeks'}
            </div>

            <p style={{ color: '#166534', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
              Committing <strong>{weeklyHours} hrs/week</strong> with a <strong>{consistency}x</strong> consistency multiplier will generate{' '}
              <strong>{weeklyHours * 24} cumulative study hours</strong> over the 24-week evaluation horizon.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #bbf7d0', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: '#166534' }}>Current Baseline: </span>
              <strong>{forecastData?.current_readiness ?? 65}%</strong>
            </div>
            <div>
              <span style={{ color: '#166534' }}>Projected 24-Wk: </span>
              <strong>{forecastData?.trajectory_points?.slice(-1)[0]?.predicted_readiness ?? 92}%</strong>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader rows={4} type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={runForecast} />
      ) : !forecastData ? (
        <EmptyState
          title="No Forecast Available"
          message="Complete your target role selection to forecast your career readiness trajectory."
        />
      ) : (
        <>
          {/* Trajectory Growth Curve Chart */}
          <div className="panel-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>24-Week Evolving Trajectory Curve</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Regression model forecasting readiness as missing skills are incrementally acquired
                </span>
              </div>
              <span className="badge badge-success">85% Job-Readiness Threshold</span>
            </div>

            {forecastData?.trajectory_points && forecastData.trajectory_points.length > 0 ? (
              <TrajectoryChart points={forecastData.trajectory_points} />
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                Trajectory curve generated.
              </div>
            )}
          </div>

          {/* Milestone Schedule Cards */}
          <div className="panel-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '14px' }}>
              Horizon Progression Milestones (24 Weeks)
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >
              {forecastData?.trajectory_points?.map((pt: any) => (
                <div
                  key={pt.week}
                  style={{
                    background: pt.is_job_ready ? '#f0fdf4' : '#f8f9fa',
                    border: pt.is_job_ready ? '1px solid #86efac' : '1px solid #cbd5e1',
                    padding: '14px',
                    borderRadius: '3px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {pt.week === 0 ? 'Current Baseline' : `Week ${pt.week} (Month ${pt.month})`}
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: pt.is_job_ready ? '#15803d' : '#1e3a8a' }}>
                    {pt.predicted_readiness}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                    {pt.cumulative_hours} hrs accumulated
                  </div>
                  <span className={pt.is_job_ready ? 'badge badge-success' : 'badge badge-neutral'} style={{ marginTop: '2px', alignSelf: 'flex-start' }}>
                    {pt.is_job_ready ? 'Job-Ready' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
