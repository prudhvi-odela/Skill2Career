import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  FileCode,
  GraduationCap,
  RefreshCw,
  HelpCircle,
  Compass,
  BarChart3,
  Flame,
  Globe
} from 'lucide-react';
import { careerReadinessApi, careersApi, studentApi } from '../api/client';

export const CareerReadinessPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('CR001');
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STRENGTHS_GAPS' | 'EVIDENCE' | 'FACTORS' | 'ACTIONS'>('OVERVIEW');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Initial Load: Fetch Available Careers and Student Profile target career
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [careersRes, profileRes] = await Promise.all([
          careersApi.getCareers().catch(() => ({ data: [] })),
          studentApi.getProfile().catch(() => ({ data: null }))
        ]);

        const careersList = careersRes.data || [];
        setCareers(careersList);

        const targetCid = profileRes?.data?.target_career_id || (careersList.length > 0 ? (careersList[0].career_code || careersList[0].id) : 'CR001');
        setSelectedCareerId(targetCid);
        await loadCareerAnalysis(targetCid);
      } catch (err: any) {
        console.error('Failed to initialize career readiness page:', err);
        setErrorMsg('Failed to load career readiness information.');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const loadCareerAnalysis = async (cid: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await careerReadinessApi.getAnalysis(cid);
      setAnalysis(res.data);
    } catch (err: any) {
      console.error('Failed to load analysis for career:', cid, err);
      setErrorMsg(err?.response?.data?.detail || 'Unable to retrieve career readiness analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleCareerChange = (cid: string) => {
    setSelectedCareerId(cid);
    loadCareerAnalysis(cid);
  };

  if (loading && !analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Synthesizing evidence-grounded career readiness analysis...</p>
      </div>
    );
  }

  const ml = analysis?.existing_ml_readiness;
  const alignment = analysis?.skill_alignment;
  const evidence = analysis?.evidence_coverage;
  const trajectory = analysis?.learning_trajectory;
  const market = analysis?.market_alignment;
  const strengths = analysis?.strengths || [];
  const gaps = analysis?.gaps || [];
  const factors = analysis?.readiness_factors || [];
  const nextActions = analysis?.next_actions || [];
  const projects = analysis?.project_alignment?.projects || [];
  const assessments = analysis?.assessment_alignment?.assessments || [];
  const certs = analysis?.certification_alignment?.certifications || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Career Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Evidence-Grounded Career Readiness</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Phase 09C Engine
            </span>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Synthesizes authoritative skill proficiency, verified artifacts, longitudinal momentum, and external market demand for targeted career roles.
          </p>
        </div>

        {/* Career Selector */}
        <div className="flex items-center gap-3 bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
          <Briefcase className="w-4 h-4 text-indigo-400 ml-2" />
          <select
            value={selectedCareerId}
            onChange={(e) => handleCareerChange(e.target.value)}
            className="bg-transparent text-white text-sm font-medium focus:outline-none pr-4 cursor-pointer"
          >
            {careers.map((c) => {
              const cCode = c.career_code || c.id || c.code;
              return (
                <option key={cCode} value={cCode} className="bg-slate-900 text-white">
                  {c.title || cCode} ({c.domain || 'Tech'})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl text-sm border bg-rose-500/10 border-rose-500/30 text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => loadCareerAnalysis(selectedCareerId)} className="text-xs hover:underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Target Career Banner */}
      <div className="bg-gradient-to-r from-indigo-900/30 via-slate-900/60 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">{analysis?.domain || 'Technology'} Domain</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Benchmark Avg: ${analysis?.avg_salary_usd?.toLocaleString() || '95,000'}/yr</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">{analysis?.career_title || selectedCareerId}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${ml?.is_job_ready ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}`}>
              {ml?.readiness_tier || 'Needs Preparation'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {alignment?.coverage_percentage ? Math.round(alignment.coverage_percentage) : 0}% Skill Match
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ML Readiness Benchmark */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ML Readiness Benchmark</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {ml?.readiness_score ? ml.readiness_score.toFixed(1) : '0.0'}%
            </span>
            <span className="text-xs text-slate-400 font-medium" title="Approx. model test MAE residual error">
              ±{ml?.confidence_margin ? ml.confidence_margin.toFixed(1) : '2.2'} pts error
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-indigo-400 font-medium">{ml?.readiness_tier}</span>
            <span className="text-slate-500">{ml?.model_algorithm}</span>
          </div>
        </div>

        {/* Competency Coverage */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skill Alignment</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {alignment?.covered_skill_count || 0}/{alignment?.required_skill_count || 0}
            </span>
            <span className="text-xs text-slate-500">Skills ({Math.round(alignment?.coverage_percentage || 0)}%)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium">{alignment?.proficient_skill_count || 0} proficient</span>
            <span className="text-slate-500">{alignment?.critical_skill_gaps_count || 0} critical gaps</span>
          </div>
        </div>

        {/* Evidence Grounding */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evidence Grounding</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {Math.round((evidence?.evidence_coverage_ratio || 0) * 100)}%
            </span>
            <span className="text-xs text-slate-500">Verified Backing</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-cyan-400 font-medium">{evidence?.coverage_evaluation || 'Developing'}</span>
            <span className="text-slate-500">{evidence?.verified_evidence_count || 0} verified artifacts</span>
          </div>
        </div>

        {/* Market Demand Context */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Industry Demand</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {market?.demand_score ? market.demand_score.toFixed(0) : '75'}
            </span>
            <span className="text-xs text-slate-500">/ 100 index</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-purple-400 font-medium capitalize">{market?.trend_direction || 'Stable'}</span>
            <span className="text-slate-500 truncate max-w-[120px]">{market?.market_source || 'Benchmark'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2">
        {[
          { id: 'OVERVIEW', label: 'Holistic Overview', icon: BarChart3 },
          { id: 'STRENGTHS_GAPS', label: `Strengths (${strengths.length}) & Gaps (${gaps.length})`, icon: Layers },
          { id: 'EVIDENCE', label: `Evidence Ledger (${evidence?.verified_evidence_count || 0})`, icon: ShieldCheck },
          { id: 'FACTORS', label: `Readiness Factors (${factors.length})`, icon: Sparkles },
          { id: 'ACTIONS', label: `Next Best Actions (${nextActions.length})`, icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Holistic Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Trajectory & Momentum Integration */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Learning Trajectory & Momentum Grounding
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Integrates longitudinal velocity and consistency from Phase 09B</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Vector: {trajectory?.trajectory_direction || 'INSUFFICIENT_HISTORY'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  Cadence: {trajectory?.stagnation_status || 'STABLE_PROGRESS'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <span className="text-xs text-slate-400 block mb-1">Learning Velocity</span>
                <span className="text-lg font-bold text-white">{trajectory?.overall_learning_velocity?.toFixed(1) || '0.0'} / 5.0</span>
                <span className="text-xs text-indigo-400 block mt-1">{trajectory?.velocity_tier || 'Developing'}</span>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <span className="text-xs text-slate-400 block mb-1">Study Regularity</span>
                <span className="text-lg font-bold text-white">{Math.round(trajectory?.consistency_score || 0)}% Consistency</span>
                <span className="text-xs text-blue-400 block mt-1">{trajectory?.current_streak_days || 0}-day active streak</span>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <span className="text-xs text-slate-400 block mb-1">Top Progressing Competencies</span>
                <span className="text-sm font-semibold text-emerald-400 block">
                  {trajectory?.top_improving_skills?.length > 0 ? trajectory.top_improving_skills.join(', ') : 'Maintaining steady baseline'}
                </span>
                <span className="text-xs text-slate-500 block mt-1">{trajectory?.total_snapshots || 0} historical snapshots</span>
              </div>
            </div>
          </div>

          {/* Quick Strengths and Gaps Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Strengths */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-emerald-400" />
                Key Career Strengths ({strengths.length})
              </h3>
              {strengths.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">No demonstrated proficiencies exceeding baseline yet.</p>
              ) : (
                <div className="space-y-3">
                  {strengths.slice(0, 4).map((s: any) => (
                    <div key={s.skill_id} className="p-3.5 bg-slate-800/40 border border-slate-700/40 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{s.skill_name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium">
                            Level {s.proficiency.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{s.strength_rationale}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${s.evidence_status === 'VERIFIED' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700/40 text-slate-400'}`}>
                        {s.evidence_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Critical Gaps */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                Target Competency Deficits ({gaps.filter((g: any) => !g.is_mastered).length})
              </h3>
              {gaps.filter((g: any) => !g.is_mastered).length === 0 ? (
                <p className="text-emerald-400 text-xs py-4 text-center">All required skills meet career target proficiencies!</p>
              ) : (
                <div className="space-y-3">
                  {gaps.filter((g: any) => !g.is_mastered).slice(0, 4).map((g: any) => (
                    <div key={g.skill_id} className="p-3.5 bg-slate-800/40 border border-slate-700/40 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{g.skill_name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium">
                            Gap -{g.gap.toFixed(1)}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">{g.priority_band}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{g.gap_rationale}</p>
                      </div>
                      <span className="text-xs font-bold text-indigo-400">
                        {Math.round(g.priority_score)}/100
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Strengths & Gaps Matrix */}
      {activeTab === 'STRENGTHS_GAPS' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Full Career Competency Matrix</h3>
            <p className="text-slate-400 text-xs">Evaluates student skill proficiency against authoritative career role requirements</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Skill</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Your Level</th>
                  <th className="pb-3">Target Level</th>
                  <th className="pb-3">Deficit / Surplus</th>
                  <th className="pb-3">Evidence State</th>
                  <th className="pb-3">Trajectory</th>
                  <th className="pb-3 pr-2">Priority & Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {gaps.map((item: any) => (
                  <tr key={item.skill_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pl-2 font-semibold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      {item.skill_name}
                    </td>
                    <td className="py-3.5 text-slate-400">{item.category}</td>
                    <td className="py-3.5 font-bold text-slate-200">Level {item.current_proficiency.toFixed(1)}</td>
                    <td className="py-3.5 text-slate-400">Level {item.required_proficiency.toFixed(1)}</td>
                    <td className="py-3.5">
                      {item.is_mastered ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5" /> -{item.gap.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.evidence_status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/40 text-slate-400'}`}>
                        {item.evidence_status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-300">{item.trajectory_status}</td>
                    <td className="py-3.5 pr-2 max-w-xs truncate text-slate-400" title={item.gap_rationale}>
                      <span className="font-semibold text-indigo-300 mr-1.5">[{item.priority_band}]</span>
                      {item.gap_rationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Evidence Ledger */}
      {activeTab === 'EVIDENCE' && (
        <div className="space-y-6">
          {/* Evidence Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <FileCode className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Project Artifacts</span>
              </div>
              <span className="text-2xl font-extrabold text-white">{projects.length}</span>
              <p className="text-slate-400 text-xs mt-1">
                Covers {analysis?.project_alignment?.covered_skills_via_projects?.length || 0} career-relevant skills
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Verified Assessments</span>
              </div>
              <span className="text-2xl font-extrabold text-white">{assessments.filter((a: any) => a.passed).length}/{assessments.length}</span>
              <p className="text-slate-400 text-xs mt-1">{analysis?.assessment_alignment?.pass_rate_pct || 0}% overall pass rate</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2 text-purple-400">
                <GraduationCap className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Certifications</span>
              </div>
              <span className="text-2xl font-extrabold text-white">{certs.length}</span>
              <p className="text-slate-400 text-xs mt-1">{analysis?.certification_alignment?.verified_certifications_count || 0} verified credentials</p>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-4">Hands-on Technical Projects</h3>
            {projects.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">No project records logged yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p: any) => (
                  <div key={p.project_id} className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">{p.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300">
                        Complexity {p.complexity_rating.toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 my-2">
                      {p.technologies.map((tech: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-700/50 text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-700/40">
                      <span>Repository: {p.has_repository ? '✓ Attached' : 'None'}</span>
                      <span>Demo: {p.has_live_demo ? '✓ Live' : 'None'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Observable Readiness Factors */}
      {activeTab === 'FACTORS' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Observable Readiness Factors</h3>
            <p className="text-slate-400 text-xs">Transparent breakdown of empirical factors supporting or limiting readiness</p>
          </div>

          <div className="space-y-3">
            {factors.map((f: any, idx: number) => {
              const isPositive = f.impact_type === 'POSITIVE';
              const isLimiting = f.impact_type === 'LIMITING';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isPositive
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : isLimiting
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-slate-800/40 border-slate-700/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{f.category.replace('_', ' ')}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPositive ? 'bg-emerald-500/20 text-emerald-300' : isLimiting ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700/40 text-slate-300'
                      }`}>
                        {f.impact_type}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{f.factor_title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{f.description}</p>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap md:text-right">
                    <span className="text-slate-500 block text-[11px]">Provenance Source</span>
                    <strong className="text-slate-300">{f.evidence_source}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Recommended Next Actions */}
      {activeTab === 'ACTIONS' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Actionable Remediation Roadmap</h3>
            <p className="text-slate-400 text-xs">Prioritized next steps derived deterministically from critical gaps and prerequisite graphs</p>
          </div>

          <div className="space-y-3">
            {nextActions.map((act: any) => (
              <div key={act.action_id} className="p-4 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 rounded-xl transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{act.skill_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                      {act.action_type.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700/50 text-slate-300">
                      {act.priority_band}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Effort: <strong className="text-slate-200">{act.learning_effort_level}</strong></span>
                    <span>Est: <strong className="text-slate-200">~{act.estimated_planning_hours} hrs</strong></span>
                    <span className="text-indigo-400 font-bold">{Math.round(act.priority_score)} pts</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{act.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provenance & Ethical Disclaimers Footer */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-1.5">
        <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block mb-1">
          Scientific Provenance & Disclaimers
        </span>
        {analysis?.provenance_notes?.map((note: string, idx: number) => (
          <p key={idx} className="leading-relaxed text-slate-400">• {note}</p>
        ))}
      </div>
    </div>
  );
};
