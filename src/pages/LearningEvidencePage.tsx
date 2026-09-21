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
  Sparkles,
  Users,
  Plus,
  Send,
  Star,
  X
} from 'lucide-react';
import { evidenceApi, studentApi, skillsApi } from '../api/client';

export const LearningEvidencePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'peer_reviews'>('evidence');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skillHistory, setSkillHistory] = useState<any | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Peer Review States
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');

  // Submit Review Modal
  const [activeReviewItem, setActiveReviewItem] = useState<any | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(4);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

  // Filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [syncing, setSyncing] = useState<boolean>(false);
  const [updatingSkillId, setUpdatingSkillId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    loadPeerReviewData();
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

  const loadPeerReviewData = async () => {
    try {
      const [pRes, sRes, pendRes, mineRes] = await Promise.all([
        studentApi.getProjects(),
        skillsApi.getSkills(),
        evidenceApi.getPendingPeerReviews(),
        evidenceApi.getMyPeerReviews(),
      ]);
      setMyProjects(pRes.data);
      setAllSkills(sRes.data);
      setPendingReviews(pendRes.data);
      setMyReviews(mineRes.data);
    } catch (err) {
      console.error('Failed to load peer review metadata:', err);
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

  // Peer review actions
  const handleRequestPeerReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('Please choose a project for review.');
      return;
    }
    try {
      await evidenceApi.requestPeerReview({
        project_id: selectedProjectId,
        skill_ids: selectedSkillIds,
        notes: reviewNotes || null,
      });
      setIsRequestModalOpen(false);
      setSelectedProjectId('');
      setSelectedSkillIds([]);
      setReviewNotes('');
      setActionSuccess('Peer review requested successfully. Reviewers can now evaluate your project artifacts.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadPeerReviewData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit review request.');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewItem) return;
    try {
      await evidenceApi.submitPeerReview(activeReviewItem.id, {
        score: Number(reviewScore),
        comment: reviewComment,
        verification_status: reviewAction,
      });
      setActiveReviewItem(null);
      setReviewComment('');
      setActionSuccess('Peer evaluation recorded. Verified evidence generated.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadPeerReviewData();
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit review.');
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
        ● {strength?.replace('_', ' ')}
      </span>
    );
  };

  const getVerificationBadge = (status: string) => {
    if (status === 'ASSESSMENT_VERIFIED' || status === 'MANUALLY_VERIFIED' || status === 'SYSTEM_VERIFIED' || status === 'APPROVED') {
      return (
        <span className="badge" style={{ background: '#dcfce7', color: '#14532d', border: '1px solid #bbf7d0' }}>
          [VERIFIED] {status?.replace('_', ' ')}
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="badge" style={{ background: '#fee2e2', color: '#7f1d1d', border: '1px solid #fecaca' }}>
          [REJECTED]
        </span>
      );
    }
    return (
      <span className="badge" style={{ background: '#e2e8f0', color: '#334155', border: '1px solid #cbd5e1' }}>
        [PENDING] {status?.replace('_', ' ') || 'UNVERIFIED'}
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
      case 'PEER_REVIEW':
        return <Users size={16} color="#ec4899" />;
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Learning Evidence & Peer Validation</h1>
            <span className="badge badge-primary">Auditable Provenance</span>
          </div>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Persistent, auditable evidence graph connecting projects, assessments, certifications, and peer reviews to verified skill competencies.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsRequestModalOpen(true)}
          >
            <Users size={16} /> Request Peer Review
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSyncArtifacts}
            disabled={syncing}
          >
            <RefreshCw size={16} className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing...' : 'Sync Evidence from Artifacts'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('evidence')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'evidence' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'evidence' ? '#818cf8' : '#9ca3af',
            border: activeTab === 'evidence' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <FileCode size={16} />
          <span>Evidence Graph & Artifacts</span>
        </button>

        <button
          onClick={() => setActiveTab('peer_reviews')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'peer_reviews' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'peer_reviews' ? '#818cf8' : '#9ca3af',
            border: activeTab === 'peer_reviews' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Users size={16} />
          <span>Peer Reviews ({pendingReviews.length} Pending)</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#4ade80', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {activeTab === 'peer_reviews' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Pending Reviews Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Pending Peer Review Requests</h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
                  Evaluate fellow students' projects and code contributions to produce verifiable peer review evidence.
                </p>
              </div>
            </div>

            {pendingReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af' }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: 0 }}>No pending peer reviews waiting for your feedback.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {pendingReviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span className="badge badge-indigo">Peer Review</span>
                        <span className="badge badge-secondary">{rev.status}</span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', color: '#ffffff', margin: '0 0 6px' }}>{rev.project_title}</h4>
                      {rev.notes && <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0 0 8px' }}>"{rev.notes}"</p>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {rev.skill_ids?.map((sid: string) => (
                          <span key={sid} className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                            {sid}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.8rem', justifyContent: 'center' }}
                      onClick={() => setActiveReviewItem(rev)}
                    >
                      Evaluate Submission
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Submitted / Received Reviews */}
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Peer Review Activity & History</h2>
            {myReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af' }}>
                <p style={{ margin: 0 }}>No peer review history recorded yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myReviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>{rev.project_title}</strong>
                        {getVerificationBadge(rev.status)}
                      </div>
                      {rev.comment && (
                        <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '4px 0 0' }}>
                          Feedback: "{rev.comment}"
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
                        Score: {rev.score ? `${rev.score} / 5.0` : 'Pending'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                        {new Date(rev.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Original Evidence Graph View */
        <>
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
                  Complete auditable registry of all student artifacts, peer validations, and verification checkpoints.
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
                  <option value="PEER_REVIEW">Peer Reviews</option>
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
                  <option value="APPROVED">Approved Peer Review</option>
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
        </>
      )}

      {/* Request Peer Review Modal */}
      {isRequestModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
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
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Request Peer Review</h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestPeerReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Select Project to Review</label>
                <select
                  className="input-field"
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">-- Choose from your portfolio projects --</option>
                  {myProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Target Skills Demonstrated</label>
                <select
                  className="input-field"
                  onChange={(e) => {
                    const sid = e.target.value;
                    if (sid && !selectedSkillIds.includes(sid)) {
                      setSelectedSkillIds([...selectedSkillIds, sid]);
                    }
                  }}
                >
                  <option value="">-- Select demonstrated skills --</option>
                  {allSkills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {selectedSkillIds.map((sid) => (
                    <span key={sid} className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {sid}
                      <button
                        type="button"
                        onClick={() => setSelectedSkillIds(selectedSkillIds.filter((s) => s !== sid))}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">Notes for Reviewer</label>
                <textarea
                  rows={3}
                  placeholder="Describe specific modules, test suites, or architectures you would like evaluated..."
                  className="input-field"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Evaluation Modal */}
      {activeReviewItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
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
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Evaluate Peer Project</h3>
                <p style={{ fontSize: '0.85rem', color: '#818cf8', margin: '2px 0 0' }}>{activeReviewItem.project_title}</p>
              </div>
              <button
                onClick={() => setActiveReviewItem(null)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Skill Execution Score</label>
                  <strong style={{ color: '#818cf8' }}>{reviewScore} / 5.0</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={reviewScore}
                  onChange={(e) => setReviewScore(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>

              <div>
                <label className="input-label">Verification Decision</label>
                <select
                  className="input-field"
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value as any)}
                >
                  <option value="APPROVED">Approve (Valid Evidence Confirmed)</option>
                  <option value="REJECTED">Reject (Insufficient Implementation)</option>
                </select>
              </div>

              <div>
                <label className="input-label">Detailed Review Feedback</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide structured feedback on code quality, architecture patterns, and technical execution..."
                  className="input-field"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveReviewItem(null)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  Record Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningEvidencePage;
