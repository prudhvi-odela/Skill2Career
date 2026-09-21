import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  Calendar,
  Flame,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Clock,
  Compass,
  Layers,
  ChevronRight
} from 'lucide-react';
import { learningIntelligenceApi } from '../api/client';

export const LearningIntelligencePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [snapshotting, setSnapshotting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await learningIntelligenceApi.getOverview();
      setOverview(res.data);
    } catch (err: any) {
      console.error('Failed to fetch learning intelligence overview:', err);
      setFeedbackMsg({ type: 'error', text: 'Unable to load learning trajectory data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRecordSnapshot = async () => {
    try {
      setSnapshotting(true);
      const res = await learningIntelligenceApi.recordSnapshot();
      setFeedbackMsg({ type: 'success', text: res.data.message || 'Progress checkpoint recorded successfully.' });
      await fetchOverview();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.response?.data?.detail || 'Failed to record checkpoint.' });
    } finally {
      setSnapshotting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Analyzing learning trajectory & skill progression...</p>
      </div>
    );
  }

  const velocity = overview?.velocity;
  const consistency = overview?.consistency;
  const stagnation = overview?.stagnation;
  const progressions = overview?.skill_progressions || [];
  const timeline = overview?.trajectory_timeline || [];

  const filteredProgressions = progressions.filter((p: any) => {
    if (selectedFilter === 'IMPROVING') return p.status === 'IMPROVING';
    if (selectedFilter === 'STABLE') return p.status === 'STABLE';
    if (selectedFilter === 'NEWLY_ACQUIRED') return p.status === 'NEWLY_ACQUIRED';
    if (selectedFilter === 'INSUFFICIENT_HISTORY') return p.status === 'INSUFFICIENT_HISTORY';
    return true;
  });

  const getDirectionBadge = (dir: string) => {
    switch (dir) {
      case 'ACCELERATING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><TrendingUp className="w-3.5 h-3.5" /> Accelerating</span>;
      case 'STEADY':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><Activity className="w-3.5 h-3.5" /> Steady</span>;
      case 'STAGNANT':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Minus className="w-3.5 h-3.5" /> Plateau</span>;
      case 'DECELERATING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20"><ArrowDownRight className="w-3.5 h-3.5" /> Decelerating</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20"><Clock className="w-3.5 h-3.5" /> Baseline Setup</span>;
    }
  };

  const getStagnationBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300">Active Progress</span>;
      case 'STABLE_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300">Stable Retention</span>;
      case 'POSSIBLE_STAGNATION':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-300">Pace Slowdown</span>;
      case 'RECENTLY_RESTARTED':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/20 text-cyan-300">Recently Resumed</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-500/20 text-slate-400">Baseline Setup</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Learning Trajectory & Progression</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Phase 09B Engine
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Evidence-grounded velocity metrics, skill evolution timelines, and study consistency diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRecordSnapshot}
            disabled={snapshotting}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${snapshotting ? 'animate-spin' : ''}`} />
            {snapshotting ? 'Recording Checkpoint...' : 'Record Checkpoint'}
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-xl text-sm border flex items-center justify-between ${feedbackMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Velocity */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Learning Velocity</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {velocity?.overall_learning_velocity ? velocity.overall_learning_velocity.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-slate-500">/ 5.0 index</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-indigo-400 font-medium">{velocity?.velocity_tier || 'Insufficient History'}</span>
            <span className="text-slate-500">+{velocity?.skill_progression_velocity || 0} pts/mo</span>
          </div>
        </div>

        {/* Consistency Score */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Consistency</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {consistency?.consistency_score ? Math.round(consistency.consistency_score) : 0}%
            </span>
            <span className="text-xs text-slate-500">Score</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-blue-400 font-medium">{consistency?.consistency_tier || 'Developing'}</span>
            <span className="text-slate-500">{consistency?.active_learning_days_count || 0} active days</span>
          </div>
        </div>

        {/* Active Streak */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Learning Streak</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {consistency?.current_streak_days || 0}
            </span>
            <span className="text-xs text-slate-500">Days</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-medium">Best: {consistency?.longest_streak_days || 0} days</span>
            <span className="text-slate-500">{consistency?.study_frequency_per_week || 0} days/wk</span>
          </div>
        </div>

        {/* Trajectory Vector */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trajectory Vector</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-1">
            {getDirectionBadge(overview?.trajectory_direction || 'INSUFFICIENT_HISTORY')}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Confidence: {overview?.trajectory_confidence || 'N/A'}</span>
            <span className="text-slate-500">{overview?.total_snapshots || 0} checkpoints</span>
          </div>
        </div>
      </div>

      {/* Longitudinal Checkpoint Timeline */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Longitudinal Trajectory Timeline</h2>
            <p className="text-slate-400 text-xs">Chronological progression of competency, evidence, and ML readiness</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">{timeline.length} recorded checkpoints</span>
        </div>

        {timeline.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium">No trajectory snapshots recorded yet.</p>
            <p className="text-xs text-slate-500 mt-1">Click "Record Checkpoint" above to begin your trajectory baseline.</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6 my-4">
            {timeline.map((point: any, idx: number) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-4 border-slate-900 group-hover:scale-125 transition-transform" />
                <div className="bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 rounded-xl p-4 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-semibold text-white">{point.date_label}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                        Avg Level {point.average_proficiency.toFixed(1)}
                      </span>
                      {point.readiness_score !== null && point.readiness_score !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                          ML Readiness {point.readiness_score.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400 mt-2">
                    <div>Skills Tracked: <strong className="text-slate-200">{point.skill_count}</strong> ({point.verified_skill_count} verified)</div>
                    <div>Verified Evidence: <strong className="text-slate-200">{point.verified_evidence_count}</strong></div>
                    <div>Projects: <strong className="text-slate-200">{point.projects_count}</strong></div>
                    <div>Assessments: <strong className="text-slate-200">{point.assessments_count}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Progression Analysis Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Skill Evolution & Progression Matrix</h2>
            <p className="text-slate-400 text-xs">Delta tracking of individual skill proficiencies over time</p>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
            {['ALL', 'IMPROVING', 'STABLE', 'NEWLY_ACQUIRED', 'INSUFFICIENT_HISTORY'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${selectedFilter === filter ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Skill</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Current Level</th>
                <th className="pb-3">Trajectory Delta</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Evidence</th>
                <th className="pb-3 pr-2">Evidence-Grounded Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProgressions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No skills matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProgressions.map((p: any) => (
                  <tr key={p.skill_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pl-2 font-semibold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      {p.skill_name}
                    </td>
                    <td className="py-3.5 text-slate-400">{p.category}</td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-200">Level {p.current_proficiency.toFixed(1)}</span>
                      {p.is_verified && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold">
                          Verified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      {p.status === 'IMPROVING' ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" /> +{p.absolute_change.toFixed(1)}
                        </span>
                      ) : p.status === 'DECLINING' ? (
                        <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5" /> {p.absolute_change.toFixed(1)}
                        </span>
                      ) : p.status === 'NEWLY_ACQUIRED' ? (
                        <span className="text-cyan-400 font-semibold">New Entry</span>
                      ) : (
                        <span className="text-slate-500 font-medium">0.0</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      {p.status === 'IMPROVING' && <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Improving</span>}
                      {p.status === 'STABLE' && <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Stable</span>}
                      {p.status === 'NEWLY_ACQUIRED' && <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">New</span>}
                      {p.status === 'INSUFFICIENT_HISTORY' && <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Baseline</span>}
                    </td>
                    <td className="py-3.5 text-slate-300">
                      {p.verified_evidence_count > 0 ? (
                        <span className="font-semibold text-emerald-400">{p.verified_evidence_count} verified</span>
                      ) : (
                        <span className="text-slate-500">{p.evidence_count} unverified</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-2 text-slate-400 max-w-xs truncate" title={p.progression_summary}>
                      {p.progression_summary}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostics & Study Rhythm Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Momentum & Stagnation Diagnostic */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Momentum & Stagnation Diagnostics
            </h3>
            {getStagnationBadge(stagnation?.status || 'INSUFFICIENT_HISTORY')}
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {stagnation?.analysis_summary || 'Trajectory diagnostics analyze learning activity cadence against verified competency checkpoints.'}
          </p>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
              Recommended Momentum Action
            </span>
            <p className="text-slate-200 text-xs leading-relaxed">
              {stagnation?.recommended_intervention || 'Complete technical assessments and log project milestones to establish learning trajectory.'}
            </p>
          </div>
        </div>

        {/* Weekly Study Distribution */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Weekly Study Rhythm
            </h3>
            <span className="text-xs text-slate-500">{consistency?.study_frequency_per_week || 0} avg sessions/wk</span>
          </div>
          <div className="grid grid-cols-7 gap-2 my-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
              const count = consistency?.weekly_activity_distribution?.[day] || 0;
              const intensity = count > 5 ? 'bg-indigo-500 text-white' : count > 0 ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-500';
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <div className={`w-full aspect-square rounded-xl flex items-center justify-center font-bold text-xs ${intensity}`}>
                    {count}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{day}</span>
                </div>
              );
            })}
          </div>
          <p className="text-slate-400 text-xs mt-3">{consistency?.analysis_notes}</p>
        </div>
      </div>
    </div>
  );
};
