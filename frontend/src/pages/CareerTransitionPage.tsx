import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Award,
  Layers,
  Clock,
  Briefcase,
  Compass,
  Sliders,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  BarChart3,
  ListOrdered,
  FileCheck2,
  BookOpen
} from 'lucide-react';
import { careerTransitionApi, careersApi, aiApi } from '../api/client';

export const CareerTransitionPage: React.FC = () => {
  const [targetCareerId, setTargetCareerId] = useState<string>('CR002');
  const [allCareers, setAllCareers] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Scenario state
  const [selectedScenario, setSelectedScenario] = useState<string>('DIRECT_TRANSITION');
  const [studyHours, setStudyHours] = useState<number>(12);
  const [scenarioResult, setScenarioResult] = useState<any | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Comparison state
  const [compareCareerIds, setCompareCareerIds] = useState<string[]>(['CR002', 'CR003', 'CR004']);
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // AI Explanation state
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  useEffect(() => {
    loadCareers();
  }, []);

  useEffect(() => {
    if (targetCareerId) {
      loadTransitionData(targetCareerId);
    }
  }, [targetCareerId]);

  const loadCareers = async () => {
    try {
      const res = await careersApi.getCareers();
      setAllCareers(res.data.careers || res.data || []);
    } catch (err: any) {
      console.error('Error fetching career catalog:', err);
    }
  };

  const loadTransitionData = async (cid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await careerTransitionApi.getTransitionAnalysis(cid);
      setAnalysis(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze career transition.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateScenario = async () => {
    if (!targetCareerId) return;
    setIsSimulating(true);
    try {
      const res = await careerTransitionApi.simulateScenario({
        target_career_id: targetCareerId,
        scenario_type: selectedScenario,
        weekly_study_hours: studyHours,
      });
      setScenarioResult(res.data);
    } catch (err: any) {
      console.error('Scenario simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCompareTransitions = async () => {
    if (compareCareerIds.length < 2) return;
    setIsComparing(true);
    try {
      const res = await careerTransitionApi.compareTransitions(compareCareerIds);
      setComparisonData(res.data);
    } catch (err: any) {
      console.error('Career transition comparison error:', err);
    } finally {
      setIsComparing(false);
    }
  };

  const handleAskAI = async () => {
    if (!targetCareerId) return;
    setIsAiLoading(true);
    try {
      const res = await aiApi.explainTransition(targetCareerId);
      setAiExplanation(res.data);
    } catch (err: any) {
      console.error('AI transition explanation error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getTransferabilityBadge = (classification: string) => {
    switch (classification) {
      case 'DIRECTLY_TRANSFERABLE':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>Directly Transferable</span>;
      case 'PARTIALLY_TRANSFERABLE':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600 }}>Partially Transferable</span>;
      case 'ADJACENT':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600 }}>Adjacent Skill</span>;
      default:
        return <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600 }}>Not Yet Transferable</span>;
    }
  };

  const getGapCategoryBadge = (category: string) => {
    switch (category) {
      case 'MISSING_SKILL':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.72rem', fontWeight: 600 }}>Missing Skill</span>;
      case 'PREREQUISITE_BLOCKED':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(217, 70, 239, 0.2)', color: '#e879f9', fontSize: '0.72rem', fontWeight: 600 }}>Prerequisite Blocked</span>;
      case 'STAGNATING_SKILL':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', fontSize: '0.72rem', fontWeight: 600 }}>Stagnating</span>;
      case 'INSUFFICIENT_EVIDENCE':
        return <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', fontSize: '0.72rem', fontWeight: 600 }}>Needs Evidence</span>;
      default:
        return <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', fontSize: '0.72rem', fontWeight: 600 }}>Low Proficiency</span>;
    }
  };

  return (
    <div style={{ padding: '32px 28px', maxWidth: '1440px', margin: '0 auto', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <GitMerge size={24} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Career Transition & Strategic Planning
            </h1>
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
            Evidence-grounded cross-career transferability analysis, prerequisite dependency ordering, and milestone planning.
          </p>
        </div>

        {/* Target Career Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(30, 41, 59, 0.7)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Target Role:</label>
          <select
            value={targetCareerId}
            onChange={(e) => setTargetCareerId(e.target.value)}
            style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
          >
            {allCareers.map((c) => (
              <option key={c.career_code || c._id} value={c.career_code || c._id}>
                {c.title} ({c.career_code || c._id})
              </option>
            ))}
          </select>
          <button
            onClick={() => loadTransitionData(targetCareerId)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
          <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: '#6366f1' }} />
          <div>Evaluating cross-career competency transferability & prerequisite DAG...</div>
        </div>
      ) : error ? (
        <div style={{ padding: '24px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', marginBottom: '24px' }}>
          <AlertTriangle size={20} style={{ display: 'inline', marginRight: '8px' }} />
          {error}
        </div>
      ) : analysis ? (
        <>
          {/* Transition Profile Bridge Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.65)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '28px' }}>
            
            {/* Source Career Profile */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Source Career Baseline</div>
              <h2 style={{ margin: '0 0 6px', fontSize: '1.3rem', color: '#f8fafc' }}>{analysis.source_career.title}</h2>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '12px' }}>{analysis.source_career.domain} &bull; ${analysis.source_career.avg_salary_usd.toLocaleString()}/yr</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>Required Skills: <b>{analysis.source_career.required_skills_count}</b></span>
                <span>Active Track: <b>{analysis.status}</b></span>
              </div>
            </div>

            {/* Bridge Indicator */}
            <div style={{ textAlign: 'center', padding: '0 12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <ArrowRight size={24} color="#818cf8" />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>{analysis.skill_overlap.shared_required_skills_count} Shared Skills</div>
            </div>

            {/* Target Career Profile */}
            <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', marginBottom: '4px' }}>Target Career Pathway</div>
              <h2 style={{ margin: '0 0 6px', fontSize: '1.3rem', color: '#ffffff' }}>{analysis.target_career.title}</h2>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '12px' }}>{analysis.target_career.domain} &bull; ${analysis.target_career.avg_salary_usd.toLocaleString()}/yr</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>Coverage: <b style={{ color: '#34d399' }}>{analysis.skill_overlap.target_skill_coverage_pct}%</b></span>
                <span>Est. Weeks: <b>{analysis.forecast_context.time_to_target_weeks} wks</b></span>
                <span>Demand: <b>{analysis.market_context.target_career_demand_score}/100</b></span>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '6px' }}>
                <CheckCircle2 size={16} color="#34d399" /> Directly Transferable
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                {analysis.transferable_skills.filter((s: any) => s.transferability === 'DIRECTLY_TRANSFERABLE').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Meets or exceeds target required level</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '6px' }}>
                <Layers size={16} color="#fbbf24" /> Partially Transferable
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                {analysis.transferable_skills.filter((s: any) => s.transferability === 'PARTIALLY_TRANSFERABLE').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Requires proficiency elevation</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '6px' }}>
                <AlertTriangle size={16} color="#f87171" /> Remediation Gaps
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                {analysis.transition_gaps.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                {analysis.transition_gaps.filter((g: any) => g.is_critical).length} critical priorities
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '6px' }}>
                <Award size={16} color="#818cf8" /> Transferable Evidence
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                {analysis.transferable_evidence.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Auditable projects, certs & assessments</div>
            </div>
          </div>

          {/* Grid: Transferable Skills & Transition Gaps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            
            {/* Transferable Skills Card */}
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#34d399" /> Transferable Competencies ({analysis.transferable_skills.length})
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
                {analysis.transferable_skills.map((skill: any) => (
                  <div key={skill.skill_id} style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>{skill.skill_name}</span>
                      {getTransferabilityBadge(skill.transferability)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>Your Level: <b style={{ color: '#f8fafc' }}>{skill.student_level.toFixed(1)}</b> / Target Req: <b>{skill.target_level_required.toFixed(1)}</b></span>
                      <span>Verified Evidence: <b>{skill.verified_evidence_count}</b></span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                      {skill.transferability_rationale}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transition Gaps Card */}
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} color="#f87171" /> Transition Remediation Gaps ({analysis.transition_gaps.length})
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
                {analysis.transition_gaps.map((gap: any) => (
                  <div key={gap.skill_id} style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>{gap.skill_name}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {getGapCategoryBadge(gap.gap_category)}
                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: gap.priority_band === 'URGENT' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.2)', color: gap.priority_band === 'URGENT' ? '#fca5a5' : '#a5b4fc', fontSize: '0.72rem', fontWeight: 600 }}>
                          {gap.priority_band}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>Gap: <b style={{ color: '#f87171' }}>-{gap.gap.toFixed(1)} pts</b> (Current: {gap.current_level.toFixed(1)} &rarr; Req: {gap.target_level_required.toFixed(1)})</span>
                      <span>Est. Effort: <b>{gap.learning_effort_hours} hrs</b></span>
                    </div>
                    {gap.unmet_prerequisites && gap.unmet_prerequisites.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#e879f9', marginBottom: '4px' }}>
                        Blocked by: {gap.unmet_prerequisites.join(', ')}
                      </div>
                    )}
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                      {gap.remediation_rationale}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prerequisite Dependency Chains & Transition Milestones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            
            {/* Prerequisite Chains */}
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitMerge size={20} color="#a855f7" /> Prerequisite Dependency Chains
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analysis.prerequisite_chains.map((chain: any) => (
                  <div key={chain.target_skill_id} style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{chain.target_skill_name}</span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: chain.is_blocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: chain.is_blocked ? '#f87171' : '#34d399', fontWeight: 600 }}>
                        {chain.is_blocked ? 'BLOCKED' : 'UNLOCKED'} ({chain.chain_completion_pct.toFixed(0)}%)
                      </span>
                    </div>
                    {chain.prerequisite_chain && chain.prerequisite_chain.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {chain.prerequisite_chain.map((p: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: p.is_met ? '#34d399' : '#fca5a5' }}>
                            <span>&bull; {p.prerequisite_skill_id} ({p.dependency_type})</span>
                            <span>Level: {p.student_level.toFixed(1)} / Threshold: {p.threshold_level.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>No prerequisite constraints; foundational entry-level competency.</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Transition Milestones Pathway */}
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListOrdered size={20} color="#3b82f6" /> Strategic Transition Milestones
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {analysis.transition_milestones.map((ms: any) => (
                  <div key={ms.milestone_id} style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: '#60a5fa', fontSize: '0.95rem' }}>{ms.title}</span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: ms.status === 'READY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)', color: ms.status === 'READY' ? '#34d399' : '#9ca3af', fontWeight: 600 }}>
                        {ms.status} &bull; ~{ms.estimated_effort_hours} hrs
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#cbd5e1' }}>{ms.description}</p>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Required Competencies: <b>{ms.required_skill_ids.join(', ') || 'Capstone Project'}</b>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Scenario Simulation & What-If Planning */}
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '28px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="#fbbf24" /> In-Memory Transition Scenario Simulation
            </h3>
            <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '0.88rem' }}>
              Simulate counterfactual transition timelines purely in-memory. Scenario calculations do not alter authoritative student records or create real evidence.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Transition Strategy:</label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  style={{ width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem' }}
                >
                  <option value="DIRECT_TRANSITION">Direct Linear Progression</option>
                  <option value="FOUNDATION_FIRST">Foundation-First Pathway</option>
                  <option value="GAP_FOCUSED">Critical-Gap Focused</option>
                  <option value="EVIDENCE_FOCUSED">Evidence-Driven Verification</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Study Commitment (Hours/Week): {studyHours} hrs</label>
                <input
                  type="range"
                  min={4}
                  max={35}
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>

              <div>
                <button
                  onClick={handleSimulateScenario}
                  disabled={isSimulating}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#ffffff', fontWeight: 600, border: 'none', cursor: isSimulating ? 'not-allowed' : 'pointer', fontSize: '0.9rem', marginTop: '18px' }}
                >
                  {isSimulating ? 'Simulating...' : 'Run Scenario Simulation'}
                </button>
              </div>
            </div>

            {scenarioResult && (
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: '#a5b4fc', fontSize: '1rem' }}>{scenarioResult.scenario_name} (Simulated)</h4>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', fontWeight: 600 }}>In-Memory Simulation</span>
                </div>
                <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '10px' }}>
                  <span>Estimated Pacing: <b style={{ color: '#34d399' }}>~{scenarioResult.estimated_weeks} weeks</b></span>
                  <span>Projected Skill Coverage: <b>{scenarioResult.projected_skill_coverage_pct}%</b></span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  <b>Assumptions:</b> {scenarioResult.assumptions.join(' ')}
                </div>
              </div>
            )}
          </div>

          {/* Section: Multi-Career Transition Comparator */}
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={20} color="#38bdf8" /> Factual Multi-Career Transition Comparison
                </h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                  Multi-dimensional side-by-side comparison without rankings or 'best career' verdicts.
                </p>
              </div>
              <button
                onClick={handleCompareTransitions}
                disabled={isComparing}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)', fontWeight: 600, fontSize: '0.85rem', cursor: isComparing ? 'not-allowed' : 'pointer' }}
              >
                {isComparing ? 'Comparing...' : 'Compare 3 Target Pathways'}
              </button>
            </div>

            {comparisonData && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                      <th style={{ padding: '12px 10px' }}>Target Career</th>
                      <th style={{ padding: '12px 10px' }}>Shared Skills</th>
                      <th style={{ padding: '12px 10px' }}>Transferable</th>
                      <th style={{ padding: '12px 10px' }}>Gaps</th>
                      <th style={{ padding: '12px 10px' }}>Coverage</th>
                      <th style={{ padding: '12px 10px' }}>Effort Hours</th>
                      <th style={{ padding: '12px 10px' }}>Market Demand</th>
                      <th style={{ padding: '12px 10px' }}>Time-to-Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.comparisons.map((c: any) => (
                      <tr key={c.target_career_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#e2e8f0' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 600, color: '#ffffff' }}>{c.target_career_title}</td>
                        <td style={{ padding: '12px 10px' }}>{c.shared_skills_count}</td>
                        <td style={{ padding: '12px 10px', color: '#34d399' }}>{c.transferable_skills_count}</td>
                        <td style={{ padding: '12px 10px', color: '#f87171' }}>{c.transition_gaps_count} ({c.critical_gaps_count} crit)</td>
                        <td style={{ padding: '12px 10px' }}>{c.target_skill_coverage_pct}%</td>
                        <td style={{ padding: '12px 10px' }}>~{c.estimated_competency_effort_hours} hrs</td>
                        <td style={{ padding: '12px 10px' }}>{c.market_demand_score}/100</td>
                        <td style={{ padding: '12px 10px' }}>~{c.time_to_target_weeks} wks</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: AI Grounded Transition Explanation */}
          <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#a855f7" /> Grounded AI Career Transition Advisor
              </h3>
              <button
                onClick={handleAskAI}
                disabled={isAiLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)', fontWeight: 600, fontSize: '0.85rem', cursor: isAiLoading ? 'not-allowed' : 'pointer' }}
              >
                <Sparkles size={14} /> {isAiLoading ? 'Synthesizing...' : 'Explain This Transition'}
              </button>
            </div>

            {aiExplanation ? (
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <p style={{ margin: '0 0 12px', color: '#f1f5f9', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {aiExplanation.message}
                </p>
                {aiExplanation.key_points && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', marginBottom: '6px' }}>Key Takeaways</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {aiExplanation.key_points.map((kp: string, idx: number) => (
                        <li key={idx}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiExplanation.recommended_actions && (
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '6px' }}>Recommended Steps</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {aiExplanation.recommended_actions.map((act: string, idx: number) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                Click "Explain This Transition" to receive an auditable, AI-synthesized transition breakdown grounded in your verified evidence, prerequisite ordering, and target career taxonomy.
              </p>
            )}
          </div>

          {/* Section: Assumptions, Provenance & Scientific Limitations */}
          <div style={{ background: 'rgba(15, 23, 42, 0.45)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5' }}>
            <div style={{ fontWeight: 700, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Provenance & Scientific Limitations
            </div>
            <div>&bull; {analysis.limitations}</div>
            {analysis.provenance.map((prov: string, idx: number) => (
              <div key={idx}>&bull; {prov}</div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};
