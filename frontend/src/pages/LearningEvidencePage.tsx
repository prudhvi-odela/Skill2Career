import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileCode,
  FolderGit2,
  BookOpenCheck,
  Flame,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sliders,
  Sparkles
} from 'lucide-react';
import { evidenceApi } from '../api/client';

export const LearningEvidencePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skillHistory, setSkillHistory] = useState<any | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [syncing, setSyncing] = useState<boolean>(false);
  const [updatingSkillId, setUpdatingSkillId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [filterType, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, evRes] = await Promise.all([
        evidenceApi.getSummary(),
        evidenceApi.getEvidence({
          evidence_type: filterType !== 'ALL' ? filterType : undefined,
          verification_status: filterStatus !== 'ALL' ? filterStatus : undefined,
        }),
      ]);
      setSummary(sumRes.data);
      setEvidenceList(evRes.data);
    } catch (err: any) {
      console.error('Failed to load evidence data:', err);
      setError(err.response?.data?.detail || 'Failed to connect to Learning Evidence Engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncArtifacts = async () => {
    setSyncing(true);
    try {
      const res = await evidenceApi.syncArtifacts();
      setActionSuccess(res.data.message || 'Artifacts synchronized successfully.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      console.error('Failed to sync artifacts:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleViewSkillHistory = async (skillId: string) => {
    setSelectedSkillId(skillId);
    setLoadingHistory(true);
    try {
      const res = await evidenceApi.getSkillHistory(skillId);
      setSkillHistory(res.data);
    } catch (err) {
      console.error('Failed to load skill evidence history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleApplySkillState = async (skillId: string) => {
    setUpdatingSkillId(skillId);
    try {
      const res = await evidenceApi.applySkillState(skillId);
      setActionSuccess(res.data.message || 'Skill state updated in profile.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
      if (selectedSkillId === skillId) {
        await handleViewSkillHistory(skillId);
      }
    } catch (err: any) {
      console.error('Failed to apply skill state:', err);
    } finally {
      setUpdatingSkillId(null);
    }
  };

  const getStrengthBadge = (strength: string) => {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      VERY_STRONG: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
      STRONG: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
      MODERATE: { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', border: 'rgba(234, 179, 8, 0.3)' },
      WEAK: { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' },
    };
    const c = map[strength] || map.WEAK;
    return (
      <span className="badge" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
        ● {strength.replace('_', ' ')}
      </span>
    );
  };

  const getVerificationBadge = (status: string) => {
    if (status === 'ASSESSMENT_VERIFIED' || status === 'MANUALLY_VERIFIED' || status === 'SYSTEM_VERIFIED') {
      return (
        <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          ✓ {status.replace('_', ' ')}
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          ✕ REJECTED
        </span>
      );
    }
    return (
      <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)' }}>
        ○ UNVERIFIED
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ASSESSMENT':
        return <BookOpenCheck size={16} color="#38bdf8" />;
      case 'PROJECT':
        return <FolderGit2 size={16} color="#a855f7" />;
      case 'CERTIFICATION':
        return <Award size={16} color="#facc15" />;
      default:
        return <FileCode size={16} color="#60a5fa" />;
    }
  };

  if (loading && !summary) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#94a3b8' }}>Loading Learning Evidence Graph...</p>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className="card" style={{ textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#f87171', marginBottom: '8px' }}>Learning Evidence Connection Issue</h2>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>
            <RefreshCw size={16} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 0 60px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Award size={28} color="#6366f1" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Learning Evidence Engine</h1>
            <span className="badge badge-primary">Auditable Provenance</span>
          </div>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Persistent, auditable evidence graph connecting projects, assessments, certifications, and practical activities to verified skill competencies.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSyncArtifacts}
          disabled={syncing}
        >
          <RefreshCw size={16} className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing...' : 'Sync Evidence from Artifacts'}
        </button>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#4ade80', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {/* Summary KPI Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL EVIDENCE ITEMS</span>
              <FileCode size={18} color="#6366f1" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
              {summary.total_evidence_count}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Across {summary.skills_with_evidence_count} verified skills
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>VERIFIED CHECKPOINTS</span>
              <ShieldCheck size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80' }}>
              {summary.verified_evidence_count}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Assessments, projects & credentials
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>UNVERIFIED LOGS</span>
              <Clock size={18} color="#facc15" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#facc15' }}>
              {summary.unverified_evidence_count}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Self-reported practice items
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>STRONGEST EVIDENCE</span>
              <Flame size={18} color="#f97316" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fb923c' }}>
              {summary.strongest_evidence_items?.length || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              High-impact validated proofs
            </div>
          </div>
        </div>
      )}

      {/* Skills Evidence Summary Table */}
      {summary && summary.skills_summary?.length > 0 && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Skills Supported by Evidence</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
                Aggregated evidence scores and observed proficiencies mapped to your canonical skill profile.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '12px 10px' }}>SKILL</th>
                  <th style={{ padding: '12px 10px' }}>PROFILE PROFICIENCY</th>
                  <th style={{ padding: '12px 10px' }}>EVIDENCE PROFICIENCY</th>
                  <th style={{ padding: '12px 10px' }}>EVIDENCE COUNT</th>
                  <th style={{ padding: '12px 10px' }}>STRONGEST PROOF</th>
                  <th style={{ padding: '12px 10px' }}>EVIDENCE SCORE</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {summary.skills_summary.map((sk: any) => (
                  <tr key={sk.skill_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#ffffff' }}>
                      {sk.skill_name}
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{sk.category}</div>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontWeight: 600, color: '#ffffff' }}>Level {sk.current_student_proficiency?.toFixed(1)}</span>
                      {sk.is_verified_in_profile && <span className="badge badge-success" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>Verified</span>}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontWeight: 700, color: '#38bdf8' }}>Level {sk.observed_proficiency?.toFixed(1)}</span>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#94a3b8' }}>
                      {sk.evidence_count} artifact{sk.evidence_count !== 1 ? 's' : ''} ({sk.verified_evidence_count} verified)
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {getStrengthBadge(sk.strongest_evidence_level)}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden', minWidth: '50px' }}>
                          <div style={{ width: `${sk.aggregated_evidence_score}%`, height: '100%', background: '#6366f1' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#ffffff' }}>{sk.aggregated_evidence_score?.toFixed(0)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => handleViewSkillHistory(sk.skill_id)}
                          title="View evidence history"
                        >
                          History
                        </button>
                        {sk.observed_proficiency > sk.current_student_proficiency && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleApplySkillState(sk.skill_id)}
                            disabled={updatingSkillId === sk.skill_id}
                          >
                            {updatingSkillId === sk.skill_id ? 'Applying...' : 'Apply to Profile'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Skill Evidence History Modal / Drawer */}
      {selectedSkillId && skillHistory && (
        <div className="card" style={{ marginBottom: '28px', borderColor: '#6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Evidence Timeline: {skillHistory.skill_name}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0' }}>
                Current Profile Level: {skillHistory.current_proficiency_level} | Status: {skillHistory.is_verified ? 'Verified' : 'Unverified'} ({skillHistory.verification_source})
              </p>
            </div>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => setSelectedSkillId(null)}
            >
              Close Timeline
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {skillHistory.timeline?.map((ev: any) => (
              <div
                key={ev.evidence_id}
                style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getTypeIcon(ev.evidence_type)}
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>{ev.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {ev.description} • Observed Level: <strong>{ev.observed_proficiency}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStrengthBadge(ev.evidence_strength)}
                  {getVerificationBadge(ev.verification_status)}
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                    {new Date(ev.observed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Evidence Artifacts Log */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>All Evidence Records</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
              Complete auditable registry of all student artifacts and verification checkpoints.
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <option value="ALL">All Artifact Types</option>
              <option value="ASSESSMENT">Assessments</option>
              <option value="PROJECT">Projects</option>
              <option value="CERTIFICATION">Certifications</option>
              <option value="LEARNING_ACTIVITY">Learning Activities</option>
            </select>

            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="ASSESSMENT_VERIFIED">Assessment Verified</option>
              <option value="SYSTEM_VERIFIED">System Verified</option>
              <option value="MANUALLY_VERIFIED">Manually Verified</option>
              <option value="UNVERIFIED">Unverified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {evidenceList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <FileCode size={36} color="#6b7280" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0 }}>No evidence records found matching the active filters.</p>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
              Click "Sync Evidence from Artifacts" above to convert your existing projects, certifications, and quiz results.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {evidenceList.map((ev: any) => (
              <div
                key={ev.evidence_id}
                style={{
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '280px' }}>
                  <div style={{ marginTop: '3px' }}>{getTypeIcon(ev.evidence_type)}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>{ev.title}</strong>
                      <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                        {ev.skill_name || ev.skill_id}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '4px 0' }}>
                      {ev.description}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      <strong>Confidence Rationale:</strong> {ev.confidence_reason}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {getStrengthBadge(ev.evidence_strength)}
                    {getVerificationBadge(ev.verification_status)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Score: <strong style={{ color: '#ffffff' }}>{ev.evidence_score?.toFixed(0)}</strong>/100 • Observed: Level {ev.observed_proficiency?.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                    Logged on {new Date(ev.observed_at || ev.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningEvidencePage;
