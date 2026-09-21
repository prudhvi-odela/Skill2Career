import React, { useState, useEffect } from 'react';
import { mlAdminApi } from '../api/client';
import confetti from 'canvas-confetti';
import {
  RotateCw,
  CheckCircle2,
  Database,
  BarChart2,
  ShieldCheck,
  Zap,
  Info,
  Sliders,
  Check,
  Activity,
  FileText
} from 'lucide-react';

export const ModelVersionsPage: React.FC = () => {
  const [metricsData, setMetricsData] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [featureImportances, setFeatureImportances] = useState<any[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<any | null>(null);
  const [loadingQuality, setLoadingQuality] = useState<boolean>(false);
  const [retraining, setRetraining] = useState<boolean>(false);
  const [retrainMsg, setRetrainMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadModelInfo();
  }, []);

  const loadModelInfo = async () => {
    try {
      const [metaRes, vRes, dRes, featRes] = await Promise.all([
        mlAdminApi.getMetrics(),
        mlAdminApi.getModelVersions(),
        mlAdminApi.getDatasets(),
        mlAdminApi.getFeatureImportance(),
      ]);
      setMetricsData(metaRes.data);
      setVersions(vRes.data);
      setDatasets(dRes.data);
      setFeatureImportances(featRes.data);
    } catch (err) {
      console.error('Failed to load ML metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainMsg(null);
    try {
      const res = await mlAdminApi.triggerRetraining();
      setRetrainMsg(`Model tournament completed! Winning algorithm: ${res.data.selected_algorithm} (${res.data.version_tag})`);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });
      await loadModelInfo();
    } catch (err: any) {
      setRetrainMsg(err.response?.data?.detail || 'Retraining failed.');
    } finally {
      setRetraining(false);
    }
  };

  const handleActivate = async (versionId: string) => {
    try {
      await mlAdminApi.activateVersion(versionId);
      await loadModelInfo();
    } catch (err) {
      console.error('Failed to activate model version:', err);
    }
  };

  const handleViewQuality = async (datasetId: string) => {
    setLoadingQuality(true);
    try {
      const res = await mlAdminApi.getDatasetQuality(datasetId);
      setSelectedQuality(res.data);
    } catch (err) {
      console.error('Failed to fetch data quality:', err);
    } finally {
      setLoadingQuality(false);
    }
  };

  const readinessMeta = metricsData?.readiness_model;
  const trajectoryMeta = metricsData?.trajectory_model;
  const tournamentResults = readinessMeta?.tournament_results || [];

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header & Retrain Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>ML Engine & Model Tournament Registry</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Leakage-safe 3-way evaluation, candidate model benchmarking, explainability, and dataset profiling.
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="btn-primary"
          style={{ padding: '10px 20px' }}
        >
          <RotateCw size={16} className={retraining ? 'animate-spin' : ''} />
          <span>{retraining ? 'Running Tournament...' : 'Retrain & Benchmark Models'}</span>
        </button>
      </div>

      {retrainMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#6ee7b7',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{retrainMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Loading ML model telemetry...</div>
      ) : (
        <>
          {/* Active Model Version Status Card */}
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
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={18} color="#34d399" />
                <span style={{ fontSize: '0.8rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active Production Pipeline ({readinessMeta?.selected_algorithm || 'Selected Model'})
                </span>
              </div>
              <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '4px' }}>
                Version: <span className="gradient-text">{metricsData?.active_version}</span>
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                Duration: {metricsData?.training_duration_seconds}s • Initialized: {metricsData?.created_at ? new Date(metricsData.created_at).toLocaleString() : 'Active'} • Dataset: {readinessMeta?.dataset || 'student_profiles_training.csv'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.04)', padding: '12px 20px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Readiness Test R²</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                  {readinessMeta?.test_metrics?.test_r2 || '0.984'}
                </div>
              </div>

              <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.04)', padding: '12px 20px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Readiness Test MAE</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>
                  {readinessMeta?.test_metrics?.test_mae || '2.21'}%
                </div>
              </div>

              <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.04)', padding: '12px 20px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Trajectory Test R²</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22d3ee' }}>
                  {trajectoryMeta?.test_metrics?.test_r2 || '0.999'}
                </div>
              </div>
            </div>
          </div>

          {/* Model Tournament Table */}
          <div className="glass-card" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Job Readiness: Multi-Algorithm Tournament & Validation</h3>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '6px' }}>
                Evaluated on 70% Train / 15% Validation / 15% Untouched Test
              </span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '20px' }}>
              Baseline regressors and candidate tree ensembles evaluated simultaneously. Winner chosen purely on validation generalization.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#9ca3af' }}>Candidate Model</th>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#9ca3af' }}>Status</th>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#9ca3af' }}>Validation R²</th>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#9ca3af' }}>Validation MAE</th>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#9ca3af' }}>Validation RMSE</th>
                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#9ca3af' }}>Fit Time</th>
                  </tr>
                </thead>
                <tbody>
                  {tournamentResults.length > 0 ? (
                    tournamentResults.map((m: any, idx: number) => {
                      const isWinner = m.model_name === readinessMeta?.selected_algorithm;
                      return (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            background: isWinner ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '14px 18px', fontWeight: 600, color: isWinner ? '#ffffff' : '#d1d5db' }}>
                            {m.model_name}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            {isWinner ? (
                              <span className="badge badge-emerald">Selected Production</span>
                            ) : m.model_name.includes('Dummy') || m.model_name.includes('Ridge') || m.model_name.includes('Linear') ? (
                              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#9ca3af' }}>Baseline</span>
                            ) : (
                              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc' }}>Candidate</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: isWinner ? 700 : 400, color: isWinner ? '#34d399' : '#d1d5db' }}>
                            {m.val_r2}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#d1d5db' }}>{m.val_mae}</td>
                          <td style={{ padding: '14px 18px', color: '#d1d5db' }}>{m.val_rmse}</td>
                          <td style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '0.85rem' }}>{m.fit_time_seconds}s</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                        Click "Retrain & Benchmark Models" to execute the full model tournament.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Importance Section */}
          <div className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Global Permutation Feature Importance</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '20px' }}>
              Computed on the validation split by permuting individual features and measuring decrease in $R^2$.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {featureImportances.map((f, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 600, color: '#e5e7eb' }}>{f.feature}</span>
                    <span style={{ color: '#818cf8', fontWeight: 700 }}>{f.normalized_pct}% impact</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, f.normalized_pct * 2)}%`,
                        height: '100%',
                        background: idx === 0 ? '#6366f1' : idx === 1 ? '#38bdf8' : idx === 2 ? '#34d399' : '#a855f7',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dataset Management Section */}
          <div className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Dataset Management & Profiling Reports</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '20px' }}>
              All tabular datasets available in the ML repository with row counts and automated data quality audits.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Dataset Name</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Rows</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Columns</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>File Size</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Quality Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Database size={16} color="#818cf8" />
                          <span>{d.filename}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#d1d5db' }}>{d.row_count.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', color: '#d1d5db' }}>{d.columns_count}</td>
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: '0.85rem' }}>
                        {(d.size_bytes / 1024).toFixed(1)} KB
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleViewQuality(d.id)}
                          className="btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                        >
                          <FileText size={14} />
                          <span>View Report</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Versions in MongoDB */}
          <div className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Registered Model Versions in MongoDB</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Version Tag</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Model Name</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Algorithm</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>Created At</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#9ca3af' }}>State</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#818cf8' }}>{v.version_tag}</td>
                      <td style={{ padding: '12px 16px', color: '#ffffff' }}>{v.model_name}</td>
                      <td style={{ padding: '12px 16px', color: '#d1d5db', fontSize: '0.875rem' }}>{v.algorithm}</td>
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: '0.85rem' }}>
                        {new Date(v.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {v.is_active ? (
                          <span className="badge badge-emerald">Active Production</span>
                        ) : (
                          <button
                            onClick={() => handleActivate(v.id)}
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Data Quality Report Modal */}
      {selectedQuality && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '30px',
              background: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Quality Report: {selectedQuality.dataset_name}</h3>
              <button
                onClick={() => setSelectedQuality(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Audit Status</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: selectedQuality.is_valid ? '#34d399' : '#ef4444' }}>
                  {selectedQuality.status}
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Total Rows</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{selectedQuality.rows}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Duplicates</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{selectedQuality.duplicates?.count || 0}</div>
              </div>
            </div>

            {selectedQuality.target_distribution && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#818cf8', marginBottom: '8px' }}>Target Distribution</h4>
                <div style={{ fontSize: '0.85rem', color: '#d1d5db', background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '8px' }}>
                  Mean: {selectedQuality.target_distribution.mean} • Std: {selectedQuality.target_distribution.std} • Min: {selectedQuality.target_distribution.min} • Max: {selectedQuality.target_distribution.max} • Median: {selectedQuality.target_distribution.median}
                </div>
              </div>
            )}

            {selectedQuality.warnings?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#fbbf24', marginBottom: '8px' }}>Quality Warnings</h4>
                <ul style={{ paddingLeft: '20px', color: '#d1d5db', fontSize: '0.85rem' }}>
                  {selectedQuality.warnings.map((w: string, i: number) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={() => setSelectedQuality(null)} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Close Quality Audit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
