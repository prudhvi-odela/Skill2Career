import React, { useState, useEffect } from 'react';
import {
  Map,
  CheckCircle2,
  Circle,
  Sparkles,
  RotateCw,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Flame,
  GitFork,
  Check,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  History,
  ShieldCheck,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { roadmapApi, recommendationsApi, careersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CareerRoadmapPage: React.FC = () => {
  const { profile } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('CR001');
  const [roadmap, setRoadmap] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [historyVersions, setHistoryVersions] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [recalculating, setRecalculating] = useState<boolean>(false);
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCareersAndInitialData();
  }, []);

  useEffect(() => {
    if (selectedCareerId) {
      loadRoadmapAndRecommendations(selectedCareerId);
    }
  }, [selectedCareerId]);

  const loadCareersAndInitialData = async () => {
    try {
      const res = await careersApi.getCareers();
      setCareers(res.data);
      const defaultId = profile?.target_career_id || (res.data.length > 0 ? res.data[0].career_code || res.data[0].id : 'CR001');
      setSelectedCareerId(defaultId);
    } catch (err) {
      console.error('Failed to load careers:', err);
    }
  };

  const loadRoadmapAndRecommendations = async (careerId: string) => {
    setLoading(true);
    try {
      const [roadmapRes, recsRes, histRes] = await Promise.allSettled([
        roadmapApi.getAdaptiveCurrent(careerId),
        recommendationsApi.getCurrent(careerId),
        roadmapApi.getHistory(careerId)
      ]);

      if (roadmapRes.status === 'fulfilled') setRoadmap(roadmapRes.value.data);
      if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data);
      if (histRes.status === 'fulfilled') setHistoryVersions(histRes.value.data.versions || []);
    } catch (err) {
      console.error('Error loading roadmap data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneToggle = async (milestoneId: string, currentCompleted: boolean) => {
    const newStatus = !currentCompleted;
    try {
      const res = await roadmapApi.updateProgress(milestoneId, newStatus);
      setRoadmap(res.data);
      if (newStatus) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      }
    } catch (err) {
      console.error('Failed to update milestone progress:', err);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await roadmapApi.recalculateAdaptive(selectedCareerId);
      setRoadmap(res.data);
      const recsRes = await recommendationsApi.getCurrent(selectedCareerId);
      setRecommendations(recsRes.data);
      const histRes = await roadmapApi.getHistory(selectedCareerId);
      setHistoryVersions(histRes.data.versions || []);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Failed to recalculate roadmap:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleFeedback = async (skillId: string, feedbackType: string) => {
    try {
      await recommendationsApi.submitFeedback({
        skill_id: skillId,
        career_id: selectedCareerId,
        feedback_type: feedbackType
      });
      setFeedbackSuccess(prev => ({ ...prev, [skillId]: feedbackType }));
      setTimeout(() => {
        setFeedbackSuccess(prev => {
          const next = { ...prev };
          delete next[skillId];
          return next;
        });
      }, 3000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const getPriorityBandBadge = (band: string) => {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      URGENT: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
      HIGH: { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' },
      MODERATE: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
      LOW: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' }
    };
    const c = map[band] || map.LOW;
    return (
      <span className="badge" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
        {band}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#94a3b8' }}>Generating Personalized Adaptive Roadmap...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 0 60px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Map size={28} color="#6366f1" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Adaptive Career Roadmap</h1>
            <span className="badge badge-primary">Version {roadmap?.version || 1}</span>
          </div>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Dependency-aware learning milestones and deterministic skill recommendations prioritized across career requirements and market signals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="input"
            value={selectedCareerId}
            onChange={(e) => setSelectedCareerId(e.target.value)}
            style={{ minWidth: '220px' }}
          >
            {careers.map(c => (
              <option key={c.career_code || c.id} value={c.career_code || c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <button
            className="btn btn-secondary"
            onClick={() => setShowHistory(!showHistory)}
            title="View Roadmap History"
          >
            <History size={16} /> History ({historyVersions.length})
          </button>

          <button
            className="btn btn-primary"
            onClick={handleRecalculate}
            disabled={recalculating}
          >
            <RotateCw size={16} className={recalculating ? 'spin' : ''} /> {recalculating ? 'Recalculating...' : 'Recalculate Roadmap'}
          </button>
        </div>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Historical Roadmap Versions</strong>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total: {historyVersions.length} versions archived</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {historyVersions.map((v: any) => (
              <div
                key={v.id || v._id}
                style={{
                  padding: '10px 14px',
                  background: v.is_current ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: v.is_current ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ fontWeight: 600, color: '#ffffff' }}>
                  Version {v.version} {v.is_current && <span className="badge badge-primary">Active</span>}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  Progress: {v.overall_progress_pct?.toFixed(0)}% | Weeks: {v.target_completion_weeks}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                  {new Date(v.generated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress & Overview Card */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>OVERALL ROADMAP COMPLETION</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
              {roadmap?.overall_progress_pct?.toFixed(1) || '0.0'}%
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ML READINESS BENCHMARK</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a855f7' }}>
                {roadmap?.ml_readiness_benchmark?.toFixed(1) || '65.0'}%
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>MARKET DEMAND INDEX</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f97316' }}>
                {roadmap?.market_demand_index?.toFixed(1) || '85.0'}/100
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${roadmap?.overall_progress_pct || 0}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #38bdf8)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Top Recommended Skills Section */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Target size={20} color="#6366f1" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Top Ranked Skill Recommendations</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '-8px 0 16px' }}>
          Prioritized by deterministic formula: 30% Skill Gap + 25% Role Criticality + 20% Market Demand + 15% Dependency Leverage + 10% Learning Feasibility.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.slice(0, 6).map((r: any) => {
            const isExpanded = expandedRecId === r.recommendation_id;
            return (
              <div
                key={r.recommendation_id}
                style={{
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                      {r.skill_name}
                    </div>
                    {getPriorityBandBadge(r.priority_band)}
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Priority Score: <strong style={{ color: '#ffffff' }}>{r.priority_score?.toFixed(1)}</strong>/100
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Effort: {r.learning_effort_level} (~{r.estimated_planning_hours}h)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Feedback Buttons */}
                    <button
                      className="btn"
                      style={{ padding: '4px 8px', fontSize: '0.7rem', background: '#e2e8f0' }}
                      onClick={() => handleFeedback(r.skill_id, 'HELPFUL')}
                      title="Helpful recommendation"
                    >
                      Helpful {feedbackSuccess[r.skill_id] === 'HELPFUL' ? '[Noted]' : ''}
                    </button>
                    <button
                      className="btn"
                      style={{ padding: '4px 8px', fontSize: '0.7rem', background: '#e2e8f0' }}
                      onClick={() => handleFeedback(r.skill_id, 'ALREADY_KNOW_THIS')}
                      title="Already know this"
                    >
                      Already Know
                    </button>

                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => setExpandedRecId(isExpanded ? null : r.recommendation_id)}
                    >
                      Why this Skill? {isExpanded ? '[Hide]' : '[Details]'}
                    </button>
                  </div>
                </div>

                {/* Expanded Rationale */}
                {isExpanded && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#334155' }}>
                    <p style={{ margin: '0 0 8px', lineHeight: '1.5' }}>{r.rationale}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', background: '#f1f5f9', padding: '8px', borderRadius: '4px' }}>
                      <div><strong>Deficit Gap:</strong> {r.gap} levels (current: {r.student_proficiency}/5)</div>
                      <div><strong>Role Importance:</strong> {(r.career_relevance * 100).toFixed(0)}%</div>
                      <div>
                        <strong>Market Signal:</strong> {r.market_relevance?.toFixed(0)}/100{' '}
                        {r.is_market_fallback || r.market_signal_status === 'FALLBACK_UNAVAILABLE' ? (
                          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>(Neutral Fallback)</span>
                        ) : r.market_signal_status === 'STALE' ? (
                          <span style={{ color: '#b91c1c', fontSize: '0.7rem' }}>(Stale Benchmark)</span>
                        ) : r.market_signal_status === 'EXPIRING_SOON' ? (
                          <span style={{ color: '#b45309', fontSize: '0.7rem' }}>(Expiring Soon)</span>
                        ) : (
                          <span style={{ color: '#15803d', fontSize: '0.7rem' }}>(Verified Signal)</span>
                        )}
                      </div>
                      <div><strong>Prerequisites Met:</strong> {r.prerequisites_met ? 'Yes' : 'Pending'}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Phase Adaptive Roadmap */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {roadmap?.phases?.map((phase: any) => (
          <div key={phase.phase_id} className="card">
            {/* Phase Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                  PHASE {phase.phase_order}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{phase.title}</h3>
              </div>
              <span className={`badge ${phase.status === 'COMPLETED' ? 'badge-success' : (phase.status === 'IN_PROGRESS' ? 'badge-primary' : 'badge-secondary')}`}>
                {phase.status}
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 16px' }}>
              {phase.description}
            </p>

            {/* Milestones List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {phase.milestones?.map((ms: any) => (
                <div
                  key={ms.id}
                  onClick={() => handleMilestoneToggle(ms.id, ms.is_completed)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: ms.is_completed ? 'rgba(34, 197, 94, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                    border: ms.is_completed ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ marginTop: '2px', color: ms.is_completed ? '#4ade80' : '#6b7280' }}>
                    {ms.is_completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: ms.is_completed ? '#94a3b8' : '#ffffff', textDecoration: ms.is_completed ? 'line-through' : 'none' }}>
                      {ms.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {ms.description}
                    </div>
                    {ms.resources?.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {ms.resources.map((res: any, idx: number) => (
                          <a
                            key={idx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ fontSize: '0.75rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ExternalLink size={12} /> {res.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    ~{ms.estimated_hours} hrs
                  </div>
                </div>
              ))}
            </div>

            {/* Phase Project & Assessment Checkpoint Footer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              {phase.project_suggestion && (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  <strong style={{ color: '#38bdf8' }}>Recommended Project:</strong> {phase.project_suggestion.title} ({phase.project_suggestion.tech_stack})
                </div>
              )}
              {phase.assessment_checkpoint && (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  <strong style={{ color: '#a855f7' }}>Assessment Target:</strong> {phase.assessment_checkpoint.title} (Pass: {phase.assessment_checkpoint.recommended_score_pct}%)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Provenance Footer */}
      <div className="card" style={{ marginTop: '28px', background: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(255, 255, 255, 0.06)', fontSize: '0.8rem', color: '#64748b' }}>
        <strong>Recommendation & Roadmap Provenance:</strong> {roadmap?.provenance_note || 'Generated from deterministic formula and acyclic dependency graph. Authoritative ML readiness score is preserved.'}
      </div>
    </div>
  );
};

export default CareerRoadmapPage;
