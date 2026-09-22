import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Calendar, Users,
  BarChart3, RefreshCw, Eye, Check, ChevronRight, Shield, Download,
  PlayCircle, Clock, Sparkles, AlertCircle
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import FacultyDiscoveryDashboard from '../components/dashboards/FacultyDiscoveryDashboard';

interface Drive {
  id: number;
  company_name: string;
  role_title: string;
  cgpa_cutoff: number;
  eligible_branches: string[];
  package_min: number;
  package_max: number;
  headcount: number;
  required_skills: { required: string[]; preferred: string[] };
  status: string;
  stage: string;
}

interface Candidate {
  student_id: number;
  student_name: string;
  branch: string;
  cgpa: number;
  skills_score: number;
  prs_score: number;
  match_score: number;
  shap_waterfall: { feature: string; value: number; contribution: number }[];
  tier: string;
}

export const PlacementOpsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'intake' | 'eligibility' | 'matching' | 'schedule' | 'exceptions' | 'analytics' | 'reports' | 'agent13'>('intake');
  const [drives, setDrives] = useState<Drive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // JD Intake form
  const [companyName, setCompanyName] = useState('Google DeepMind');
  const [roleTitle, setRoleTitle] = useState('Systems & ML Infrastructure Engineer');
  const [jdRawText, setJdRawText] = useState(
    'Looking for high-impact candidates proficient in Python, SQL, and Distributed Systems. Minimum 8.0 CGPA, B.Tech in CSE or ISE. Package 18 - 24 LPA. Responsibilities include deploying scalable microservices, containerization with Docker/Kubernetes, and optimizing inference pipelines.'
  );
  const [intakeSuccess, setIntakeSuccess] = useState('');

  // Eligibility state
  const [eligibilityResults, setEligibilityResults] = useState<any[]>([]);

  // Matching & SHAP state
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
  const [shortlistLocked, setShortlistLocked] = useState(false);

  // Scheduling state
  const [interviews, setInterviews] = useState<any[]>([]);
  const [proposedCount, setProposedCount] = useState<number | null>(null);

  // Exceptions state
  const [exceptions, setExceptions] = useState<any[]>([]);

  // Analytics state
  const [skillGapData, setSkillGapData] = useState<any>(null);
  const [deptReadiness, setDeptReadiness] = useState<any>(null);

  // Reports state
  const [reportData, setReportData] = useState<any>(null);

  // Fetch initial drives
  const loadDrives = async () => {
    try {
      const res = await apiFetch('/drives');
      if (res.ok) {
        const data = await res.json();
        setDrives(data);
        if (data.length > 0 && !selectedDriveId) {
          setSelectedDriveId(data[0].id);
        }
      }
    } catch (e) {
      console.warn('loadDrives error:', e);
    }
  };

  useEffect(() => {
    loadDrives();
  }, []);

  // Fetch tab-specific data
  useEffect(() => {
    if (!selectedDriveId) return;

    if (activeTab === 'eligibility') {
      apiFetch(`/drives/${selectedDriveId}/eligibility`)
        .then(r => r.json())
        .then(data => setEligibilityResults(data))
        .catch(console.warn);
    } else if (activeTab === 'matching') {
      apiFetch(`/drives/${selectedDriveId}/shortlist`)
        .then(r => r.json())
        .then(data => setCandidates(data))
        .catch(console.warn);
    } else if (activeTab === 'schedule') {
      apiFetch(`/drives/${selectedDriveId}/interviews`)
        .then(r => r.json())
        .then(data => setInterviews(data))
        .catch(console.warn);
    } else if (activeTab === 'exceptions') {
      apiFetch('/exceptions')
        .then(r => r.json())
        .then(data => setExceptions(data))
        .catch(console.warn);
    } else if (activeTab === 'analytics') {
      Promise.all([
        apiFetch('/analytics/skill-gap').then(r => r.json()),
        apiFetch('/analytics/readiness-trend').then(r => r.json())
      ]).then(([gaps, depts]) => {
        setSkillGapData(gaps);
        setDeptReadiness(depts);
      }).catch(console.warn);
    } else if (activeTab === 'reports') {
      apiFetch(`/reports/${selectedDriveId}`)
        .then(r => r.json())
        .then(data => setReportData(data))
        .catch(console.warn);
    }
  }, [activeTab, selectedDriveId]);

  // Handle Intake
  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIntakeSuccess('');
    try {
      const res = await apiFetch('/drives', {
        method: 'POST',
        body: JSON.stringify({ company_name: companyName, role_title: roleTitle, jd_raw_text: jdRawText })
      });
      if (res.ok) {
        const newDrive = await res.json();
        setDrives(prev => [newDrive, ...prev]);
        setSelectedDriveId(newDrive.id);
        setIntakeSuccess(`Successfully parsed JD for ${newDrive.company_name}. Extracted cutoff: ${newDrive.cgpa_cutoff} CGPA.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle TPO Override
  const handleOverride = async (studentId: number) => {
    try {
      await apiFetch(`/eligibility/${studentId}/override`, { method: 'PATCH' });
      setEligibilityResults(prev =>
        prev.map(item => item.student_id === studentId ? { ...item, status: 'ELIGIBLE', failure_reasons: ['TPO Manual Override Applied'] } : item)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Lock Shortlist
  const handleLockShortlist = async () => {
    try {
      await apiFetch(`/drives/${selectedDriveId}/shortlist/approve`, { method: 'PATCH' });
      setShortlistLocked(true);
      setTimeout(() => setShortlistLocked(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Autonomous Scheduling
  const handleRunScheduler = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/drives/${selectedDriveId}/schedule/propose`, { method: 'POST' });
      const data = await res.json();
      setProposedCount(data.count);
      setInterviews(data.interviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Resolve Exception
  const handleResolveException = async (id: number) => {
    try {
      await apiFetch(`/exceptions/${id}/resolve`, { method: 'PATCH' });
      setExceptions(prev => prev.map(e => e.id === id ? { ...e, resolved: true, resolved_by: 'TPO Placement Cell' } : e));
    } catch (err) {
      console.error(err);
    }
  };

  const currentDrive = drives.find(d => d.id === selectedDriveId) || drives[0];

  return (
    <div className="dashboard-main motion-page" style={{ padding: '24px 32px' }}>
      {/* Top Header */}
      <div className="section-title" style={{ marginBottom: '20px' }}>
        <div>
          <div className="eyebrow">Autonomous Campus Recruitment & Operations Deck</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Placement Ops AI Multi-Agent Pipeline</h1>
          <p>
            Seamless end-to-end recruitment workflow: JD parsing, eligibility verification, SHAP explainable shortlists, conflict-free interview scheduling, and autonomous exception triage.
          </p>
        </div>

        {/* Drive Selector */}
        {drives.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontWeight: 600 }}>Active Drive:</span>
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(Number(e.target.value))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--foreground)',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {drives.map(d => (
                <option key={d.id} value={d.id}>
                  {d.company_name} — {d.role_title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {[
          { id: 'intake', label: '1. JD Intake Agent', icon: Upload },
          { id: 'eligibility', label: '2. Eligibility Engine', icon: Shield },
          { id: 'matching', label: '3. SHAP Match Shortlist', icon: BarChart3 },
          { id: 'schedule', label: '4. Interview Scheduler', icon: Calendar },
          { id: 'exceptions', label: '5. Exceptions Queue', icon: AlertTriangle },
          { id: 'analytics', label: '6. Skill Gap & Trends', icon: Sparkles },
          { id: 'reports', label: '7. Reports & CSV', icon: FileText },
          { id: 'agent13', label: '8. Agent 13 Talent', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px 8px 0 0',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                background: isActive ? 'var(--card)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--border) var(--border) var(--card) var(--border)' : 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: JD INTAKE ── */}
      {activeTab === 'intake' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Autonomous Job Description Intake</h2>
                <p>Paste an unstructured job posting or company recruitment circular to extract criteria automatically.</p>
              </div>
            </div>

            {intakeSuccess && (
              <div style={{ padding: '12px', background: 'var(--soft-teal)', color: '#0047A3', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
                <CheckCircle2 size={15} style={{ display: 'inline', marginRight: '6px' }} />
                {intakeSuccess}
              </div>
            )}

            <form onSubmit={handleIntakeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="eyebrow">Company Name</label>
                  <input
                    className="w-full p-2.5 border rounded-lg text-xs"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="eyebrow">Target Role</label>
                  <input
                    className="w-full p-2.5 border rounded-lg text-xs"
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="eyebrow">Raw Job Description Text</label>
                <textarea
                  rows={6}
                  className="w-full p-2.5 border rounded-lg text-xs font-mono"
                  value={jdRawText}
                  onChange={e => setJdRawText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Parse & Register Campus Drive
                </button>
              </div>
            </form>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Active Drive Extraction Specs</h2>
                <p>Structured criteria parsed from the circular.</p>
              </div>
              <span className="status-badge good">{currentDrive?.stage?.toUpperCase()}</span>
            </div>

            {currentDrive ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: 'var(--background)', padding: '10px', borderRadius: '8px' }}>
                    <span className="eyebrow">Min CGPA</span>
                    <strong style={{ fontSize: '18px', color: 'var(--primary)' }}>{currentDrive.cgpa_cutoff}</strong>
                  </div>
                  <div style={{ background: 'var(--background)', padding: '10px', borderRadius: '8px' }}>
                    <span className="eyebrow">Compensation Range</span>
                    <strong style={{ fontSize: '18px', color: '#15803d' }}>{currentDrive.package_min} - {currentDrive.package_max} LPA</strong>
                  </div>
                </div>

                <div>
                  <span className="eyebrow">Eligible Branches</span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {currentDrive.eligible_branches.map(b => (
                      <span key={b} className="status-badge good">{b}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="eyebrow">Mandatory Required Skills</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {currentDrive.required_skills?.required?.map(s => (
                      <span key={s} style={{ background: 'var(--soft-teal)', color: '#0047A3', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="eyebrow">Preferred Tech Stack</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {currentDrive.required_skills?.preferred?.map(s => (
                      <span key={s} style={{ background: 'var(--border)', color: 'var(--foreground)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>No drive selected.</div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: ELIGIBILITY ENGINE ── */}
      {activeTab === 'eligibility' && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Deterministic Eligibility Engine</h2>
              <p>Strict cutoff validation across academic CGPA, active backlogs, and branch guidelines.</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                  <th style={{ padding: '10px 12px' }}>Student</th>
                  <th style={{ padding: '10px 12px' }}>Branch</th>
                  <th style={{ padding: '10px 12px' }}>CGPA</th>
                  <th style={{ padding: '10px 12px' }}>Backlogs</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Reason / Audit</th>
                  <th style={{ padding: '10px 12px' }}>TPO Action</th>
                </tr>
              </thead>
              <tbody>
                {eligibilityResults.map(item => (
                  <tr key={item.student_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{item.student_name}</td>
                    <td style={{ padding: '12px' }}>{item.branch}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{item.cgpa}</td>
                    <td style={{ padding: '12px' }}>{item.backlog_count}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`status-badge ${item.status === 'ELIGIBLE' ? 'good' : 'danger'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--muted-foreground)', fontSize: '11px' }}>
                      {item.failure_reasons?.join(', ') || 'All criteria satisfied.'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.status !== 'ELIGIBLE' ? (
                        <button
                          onClick={() => handleOverride(item.student_id)}
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          Manual Override
                        </button>
                      ) : (
                        <span style={{ color: '#15803d', fontSize: '11px' }}>Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: SHAP EXPLAINABLE SHORTLIST ── */}
      {activeTab === 'matching' && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>MatchingAgent & SHAP Explainability Shortlist</h2>
              <p>Ranked candidates with feature attribution waterfalls (Skill Match 40%, CGPA 25%, Projects 20%, PRS 15%).</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleLockShortlist} className="btn btn-primary">
                {shortlistLocked ? <Check size={14} /> : <Shield size={14} />}
                {shortlistLocked ? 'Shortlist Approved & Locked' : 'Approve & Lock Shortlist'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {candidates.map((c, idx) => (
              <div
                key={c.student_id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '16px',
                  background: 'var(--card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--muted-foreground)' }}>#{idx + 1}</span>
                    <div>
                      <strong style={{ fontSize: '14px' }}>{c.student_name}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                        {c.branch} • CGPA: {c.cgpa} • PRS: {c.prs_score}%
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>SHAP Composite Score</span>
                      <strong style={{ display: 'block', fontSize: '20px', color: 'var(--primary)' }}>
                        {c.match_score.toFixed(1)}%
                      </strong>
                    </div>

                    <button
                      onClick={() => setExpandedStudentId(expandedStudentId === c.student_id ? null : c.student_id)}
                      className="btn btn-outline"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                    >
                      {expandedStudentId === c.student_id ? 'Hide SHAP' : 'Explain SHAP'}
                    </button>
                  </div>
                </div>

                {/* SHAP Waterfall Breakdown */}
                {expandedStudentId === c.student_id && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <span className="eyebrow">SHAP Feature Attribution Breakdown</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '8px' }}>
                      {c.shap_waterfall.map(item => {
                        const isPositive = item.contribution >= 0;
                        return (
                          <div key={item.feature} style={{ background: 'var(--background)', padding: '10px', borderRadius: '6px', fontSize: '11px' }}>
                            <span style={{ color: 'var(--muted-foreground)', display: 'block' }}>{item.feature}</span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                              <span>Val: {item.value}</span>
                              <strong style={{ color: isPositive ? '#15803d' : '#b91c1c' }}>
                                {isPositive ? `+${item.contribution}%` : `${item.contribution}%`}
                              </strong>
                            </div>
                            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${Math.min(100, Math.abs(item.contribution) * 2.5)}%`,
                                  background: isPositive ? '#15803d' : '#b91c1c'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: INTERVIEW SCHEDULER ── */}
      {activeTab === 'schedule' && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>SchedulingAgent & Interview Coordinator</h2>
              <p>Autonomous slot allocation across faculty panels, resolving room and schedule collisions.</p>
            </div>
            <button onClick={handleRunScheduler} disabled={loading} className="btn btn-primary">
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <PlayCircle size={14} />}
              Run Autonomous Optimization
            </button>
          </div>

          {proposedCount !== null && (
            <div style={{ padding: '12px', background: 'var(--soft-teal)', color: '#0047A3', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
              <CheckCircle2 size={15} style={{ display: 'inline', marginRight: '6px' }} />
              Proposed {proposedCount} conflict-free interview slots across verified faculty panels.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {interviews.map(slot => (
              <div
                key={slot.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '16px',
                  background: 'var(--card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '13px' }}>{slot.student_name}</strong>
                  <span className={`status-badge ${slot.conflict_flag ? 'danger' : 'good'}`}>
                    {slot.conflict_flag ? 'Collision Detected' : 'Scheduled & Confirmed'}
                  </span>
                </div>

                <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><Clock size={12} style={{ display: 'inline', marginRight: '5px' }} /> Slot: {slot.time_slot}</div>
                  <div><Users size={12} style={{ display: 'inline', marginRight: '5px' }} /> Panel Members: {slot.panel_members?.join(', ') || 'Faculty Evaluation Committee'}</div>
                  <div><Shield size={12} style={{ display: 'inline', marginRight: '5px' }} /> Venue: {slot.room_or_link}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: EXCEPTIONS QUEUE ── */}
      {activeTab === 'exceptions' && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Autonomous Exceptions & Triage Queue</h2>
              <p>Self-healing monitor detecting attendance drops, schedule conflicts, and grade discrepancy anomalies.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {exceptions.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: item.resolved ? 'var(--background)' : 'var(--card)',
                  opacity: item.resolved ? 0.7 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: item.severity === 'high' ? '#b91c1c' : '#b45309'
                    }}
                  />
                  <div>
                    <strong style={{ fontSize: '13px' }}>{item.issue_type}</strong>
                    <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                      {item.details} • Student ID #{item.student_id}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {item.resolved ? (
                    <span className="status-badge good">Resolved by {item.resolved_by}</span>
                  ) : (
                    <button
                      onClick={() => handleResolveException(item.id)}
                      className="btn btn-outline"
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                    >
                      Resolve Anomaly
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: ANALYTICS & SKILL GAPS ── */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Campus Industry Demand vs. Student Supply</h2>
                <p>Real-time skill shortage breakdown across active recruitment drives.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {skillGapData?.campus_gaps?.map((gap: any) => (
                <div key={gap.skill}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <strong>{gap.skill}</strong>
                    <span style={{ color: '#b91c1c', fontWeight: 600 }}>Shortage: {gap.gap_pct}%</span>
                  </div>
                  <div style={{ display: 'flex', height: '14px', borderRadius: '4px', overflow: 'hidden', background: 'var(--border)' }}>
                    <div style={{ width: `${gap.student_supply_pct}%`, background: 'var(--primary)' }} title="Student Supply" />
                    <div style={{ width: `${gap.gap_pct}%`, background: '#fca5a5' }} title="Unmet Demand" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                    <span>Student Supply: {gap.student_supply_pct}%</span>
                    <span>Industry Demand: {gap.industry_demand_pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Department Placement Readiness Indices</h2>
                <p>Average CGPA and Placement Readiness Score (PRS) benchmarks.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {deptReadiness?.departments?.map((dept: any) => (
                <div key={dept.branch} style={{ background: 'var(--background)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span className="eyebrow">{dept.branch} Engineering</span>
                  <strong style={{ display: 'block', fontSize: '24px', color: 'var(--primary)', margin: '6px 0' }}>
                    {dept.avg_prs}%
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                    Avg CGPA: {dept.average_cgpa} • Eligible: {dept.placement_eligible_pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: REPORTS & CSV EXPORT ── */}
      {activeTab === 'reports' && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Drive Conversion Funnel & Compliance Report</h2>
              <p>Audit trail of candidates through Registration, Cutoff Eligibility, SHAP Shortlist, and Scheduling.</p>
            </div>
            <a
              href={`/reports/${selectedDriveId}/csv`}
              download
              className="btn btn-outline"
              style={{ textDecoration: 'none' }}
            >
              <Download size={14} /> Export CSV Audit Trail
            </a>
          </div>

          {reportData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--background)', padding: '16px', borderRadius: '8px' }}>
                <span className="eyebrow">Registered</span>
                <strong style={{ fontSize: '26px', display: 'block', marginTop: '6px' }}>{reportData.registered_candidates}</strong>
              </div>
              <div style={{ background: 'var(--background)', padding: '16px', borderRadius: '8px' }}>
                <span className="eyebrow">Eligible</span>
                <strong style={{ fontSize: '26px', color: 'var(--primary)', display: 'block', marginTop: '6px' }}>{reportData.eligible_candidates}</strong>
              </div>
              <div style={{ background: 'var(--background)', padding: '16px', borderRadius: '8px' }}>
                <span className="eyebrow">Shortlisted (SHAP)</span>
                <strong style={{ fontSize: '26px', color: '#15803d', display: 'block', marginTop: '6px' }}>{reportData.shortlisted_candidates}</strong>
              </div>
              <div style={{ background: 'var(--background)', padding: '16px', borderRadius: '8px' }}>
                <span className="eyebrow">Conversion Rate</span>
                <strong style={{ fontSize: '26px', color: '#0047A3', display: 'block', marginTop: '6px' }}>{reportData.conversion_rate_pct}%</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 8: AGENT 13 TALENT DISCOVERY ── */}
      {activeTab === 'agent13' && (
        <FacultyDiscoveryDashboard />
      )}
    </div>
  );
};
