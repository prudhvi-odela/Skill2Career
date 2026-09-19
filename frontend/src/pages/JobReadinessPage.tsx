import React, { useState, useEffect } from 'react';
import { analysisApi, careersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ScoreGauge } from '../components/ScoreGauge';
import {
  CheckCircle2,
  Sparkles,
  Cpu,
  TrendingUp,
  History,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const JobReadinessPage: React.FC = () => {
  const { profile } = useAuth();
  const [readinessData, setReadinessData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReadiness();
  }, [profile?.target_career_id]);

  const loadReadiness = async () => {
    setLoading(true);
    try {
      const [readyRes, histRes] = await Promise.all([
        analysisApi.predictReadiness(),
        analysisApi.getPredictionHistory(),
      ]);
      setReadinessData(readyRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error('Failed to load readiness:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Current Job-Readiness Prediction</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
          Real-time inference using trained Supervised Machine Learning models on your student profile features.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
          Running ML feature extraction and inference pipeline...
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
            }}
          >
            {/* Score Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ScoreGauge
                score={readinessData.readiness_score}
                size={220}
                label="Readiness Score"
                sublabel={readinessData.readiness_tier}
              />
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <span className="badge badge-indigo">
                  <Cpu size={12} />
                  <span>{readinessData.model_algorithm}</span>
                </span>
                <span className="badge badge-cyan">
                  <span>Version: {readinessData.model_version}</span>
                </span>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#818cf8', fontWeight: 600 }}>
                    <Sparkles size={16} />
                    <span>AI Career Coach Explanation</span>
                  </div>
                  <p style={{ whiteSpace: 'pre-line' }}>{readinessData.ai_explanation}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <Link to="/app/trajectory" className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.875rem' }}>
                  <TrendingUp size={16} />
                  <span>Forecast Future Trajectory</span>
                </Link>
                <Link to="/app/roadmap" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.875rem' }}>
                  <span>Learning Roadmap</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Feature Contribution Breakdown */}
          <div className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Feature Contribution Breakdown</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '20px' }}>
              Transparent mathematical attribution of factors driving your readiness score.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              <h3 style={{ fontSize: '1.25rem' }}>Historical Prediction Audit Trail</h3>
            </div>

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
                  {history.map((h: any) => (
                    <tr key={h.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#d1d5db' }}>
                        {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>{h.career_title}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: h.readiness_score >= 75 ? '#34d399' : '#fbbf24' }}>
                        {h.readiness_score}%
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#9ca3af' }}>{h.readiness_tier}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#818cf8' }}>{h.model_version_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
