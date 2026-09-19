import React, { useState, useEffect } from 'react';
import { analysisApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { TrajectoryChart } from '../components/TrajectoryChart';
import {
  TrendingUp,
  Clock,
  Zap,
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TrajectoryPage: React.FC = () => {
  const { profile } = useAuth();
  const [weeklyHours, setWeeklyHours] = useState<number>(profile?.weekly_study_hours || 15);
  const [consistency, setConsistency] = useState<number>(1.0);
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    runForecast();
  }, [weeklyHours, consistency, profile?.target_career_id]);

  const runForecast = async () => {
    setLoading(true);
    try {
      const res = await analysisApi.forecastTrajectory(weeklyHours, consistency);
      setForecastData(res.data);
    } catch (err) {
      console.error('Trajectory forecast error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Future Readiness Trajectory Forecaster</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
          Simulate your projected growth curve across 24 weeks based on study commitment and velocity.
        </p>
      </div>

      {/* Interactive Controls & Key Forecast */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Simulation Sliders Card */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Learning Velocity Simulator</h3>

          {/* Hours Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>
                Weekly Study Commitment
              </label>
              <strong style={{ color: '#818cf8', fontSize: '1.1rem' }}>{weeklyHours} Hours / Week</strong>
            </div>
            <input
              type="range"
              min="4"
              max="40"
              step="1"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
              <span>4 hrs (Casual)</span>
              <span>15 hrs (Steady)</span>
              <span>40 hrs (Intensive)</span>
            </div>
          </div>

          {/* Consistency Mode */}
          <div>
            <label className="input-label">Learning Consistency & Retention Pace</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Standard (1.0x)', val: 1.0 },
                { label: 'High Pace (1.2x)', val: 1.2 },
                { label: 'Hyper (1.4x)', val: 1.4 },
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setConsistency(m.val)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: consistency === m.val ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                    color: consistency === m.val ? '#ffffff' : '#9ca3af',
                    border: consistency === m.val ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Forecast Milestone Card */}
        <div
          className="glass-card"
          style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={18} color="#818cf8" />
              <span style={{ fontSize: '0.8rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700 }}>
                Trajectory Prediction Outcome
              </span>
            </div>

            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              {forecastData?.weeks_to_readiness
                ? `Job-Ready in ~${forecastData.weeks_to_readiness} Weeks`
                : 'Accelerate Hours to Reach 75%'}
            </div>

            <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.5 }}>
              At {weeklyHours} hours per week with {consistency}x velocity, you will log approximately{' '}
              <strong style={{ color: '#67e8f9' }}>{weeklyHours * 24} cumulative study hours</strong> over the next 6 months.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Link to="/app/roadmap" className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              <span>View Step-by-Step Roadmap</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Trajectory Growth Curve */}
      <div className="glass-card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>24-Week Projected Growth Curve</h3>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              Model: {forecastData?.model_version || 'v1.0.0-production'}
            </span>
          </div>
          <span className="badge badge-emerald">75% Job-Ready Benchmark</span>
        </div>

        {forecastData?.trajectory_points ? (
          <TrajectoryChart points={forecastData.trajectory_points} />
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Calculating trajectory...</div>
        )}
      </div>

      {/* Progression Milestones Grid */}
      <div className="glass-card" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '18px' }}>Timepoint Milestones</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {forecastData?.trajectory_points?.map((pt: any) => (
            <div
              key={pt.week}
              style={{
                background: pt.is_job_ready ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: pt.is_job_ready ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                padding: '16px',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>
                {pt.week === 0 ? 'Current Baseline' : `Week ${pt.week} (${pt.month} mo)`}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: pt.is_job_ready ? '#34d399' : '#ffffff' }}>
                {pt.predicted_readiness}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#d1d5db' }}>
                {pt.cumulative_hours} hrs invested
              </div>
              {pt.is_job_ready && (
                <span className="badge badge-emerald" style={{ marginTop: '4px', fontSize: '0.65rem' }}>
                  Job Ready Threshold Met
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
