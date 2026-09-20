import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sliders,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Sparkles,
  BarChart3,
  Calendar,
  Zap,
  Target,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Layers,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { careerForecastApi, careersApi, studentApi } from '../api/client';

export const CareerForecastPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('CR001');
  const [selectedHorizon, setSelectedHorizon] = useState<string>('90_DAYS');
  const [forecast, setForecast] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'PROJECTIONS' | 'BOTTLENECKS' | 'SIMULATOR' | 'SCENARIO_COMPARISON' | 'HISTORY'>('PROJECTIONS');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Simulation Form State (In-Memory)
  const [simScenarioType, setSimScenarioType] = useState<string>('INCREASED_CONSISTENCY');
  const [simHours, setSimHours] = useState<number>(20);
  const [simConsistency, setSimConsistency] = useState<number>(1.25);
  const [simRemediation, setSimRemediation] = useState<boolean>(true);
  const [simSelectedSkills, setSimSelectedSkills] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // 1. Initial Load
  useEffect(() => {
    const init = async () => {
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
        if (profileRes?.data?.weekly_study_hours) {
          setSimHours(profileRes.data.weekly_study_hours);
        }

        await fetchForecastData(targetCid, selectedHorizon);
      } catch (err: any) {
        console.error('Failed to initialize career forecast page:', err);
        setErrorMsg('Failed to load career forecasting intelligence.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchForecastData = async (cid: string, horizon: string, forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [forecastRes, compRes, histRes] = await Promise.all([
        careerForecastApi.getForecast(cid, horizon, forceRefresh),
        careerForecastApi.compareScenarios(cid, horizon).catch(() => ({ data: null })),
        careerForecastApi.getHistory(cid, 10).catch(() => ({ data: [] }))
      ]);

      setForecast(forecastRes.data);
      setComparison(compRes?.data || null);
      setHistory(histRes?.data || []);

      // Prepopulate simulation skills from bottlenecks or missing skills
      if (forecastRes.data?.bottlenecks?.length > 0) {
        setSimSelectedSkills(forecastRes.data.bottlenecks.map((b: any) => b.skill_id).slice(0, 3));
      }
    } catch (err: any) {
      console.error('Error fetching career forecast:', err);
      setErrorMsg(err?.response?.data?.detail || 'Unable to retrieve career forecasting data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCareerChange = (newCid: string) => {
    setSelectedCareerId(newCid);
    fetchForecastData(newCid, selectedHorizon);
    setSimulationResult(null);
  };

  const handleHorizonChange = (newHorizon: string) => {
    setSelectedHorizon(newHorizon);
    fetchForecastData(selectedCareerId, newHorizon);
  };

  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      const payload = {
        scenario_type: simScenarioType,
        horizon: selectedHorizon,
        simulated_weekly_hours: simHours,
        consistency_multiplier: simConsistency,
        targeted_skills: simSelectedSkills,
        remediation_focused: simRemediation,
        custom_name: `Custom Simulation (${simHours}h/w @ ${simConsistency}x)`
      };
      const res = await careerForecastApi.simulateScenario(selectedCareerId, payload);
      setSimulationResult(res.data);
    } catch (err: any) {
      console.error('Simulation error:', err);
      alert('Failed to run simulation: ' + (err?.response?.data?.detail || err.message));
    } finally {
      setSimulating(false);
    }
  };

  const getUncertaintyColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getGrowthStatusBadge = (status: string) => {
    switch (status) {
      case 'RAPID_PROGRESS':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800">Rapid Progress</span>;
      case 'STEADY_GROWTH':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">Steady Growth</span>;
      case 'SLOW_GROWTH':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">Slow Growth</span>;
      case 'STAGNANT':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-100 text-rose-800">Stagnant</span>;
      case 'MAXED_OUT':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-800">Mastered</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-100 text-rose-700 border border-rose-200">Critical Severity</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-orange-100 text-orange-700 border border-orange-200">High Severity</span>;
      case 'MODERATE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-700 border border-amber-200">Moderate</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">Low</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">Phase 10 Intelligence</span>
            <span className="text-xs text-slate-500 font-medium">Longitudinal Forecasting & Scenarios</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Career Forecasting & Scenario Intelligence</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Longitudinal skill growth projections, competency bottleneck discovery, and in-memory what-if scenario simulations.
          </p>
        </div>

        {/* Career & Horizon Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-500" />
            <select
              value={selectedCareerId}
              onChange={(e) => handleCareerChange(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 font-medium"
            >
              {careers.map((c) => (
                <option key={c.career_code || c.id} value={c.career_code || c.id}>
                  {c.title} ({c.career_code || c.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={selectedHorizon}
              onChange={(e) => handleHorizonChange(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 font-medium"
            >
              <option value="30_DAYS">30-Day Horizon</option>
              <option value="60_DAYS">60-Day Horizon</option>
              <option value="90_DAYS">90-Day Horizon</option>
              <option value="180_DAYS">180-Day Horizon</option>
            </select>
          </div>

          <button
            onClick={() => fetchForecastData(selectedCareerId, selectedHorizon, true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition"
            title="Recalculate forecast"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to load forecast</p>
            <p className="text-xs text-rose-600 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Readiness Benchmark & Forecast Banner */}
      {forecast && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Readiness Comparison Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-sm col-span-1 lg:col-span-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-indigo-200">
                {forecast.forecast_horizon_days}-Day Trajectory Projection
              </span>
              <span className="text-xs px-2.5 py-1 bg-white/10 rounded-full font-mono">
                {forecast.career_title}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div>
                <span className="text-xs text-indigo-200">Current Readiness</span>
                <div className="text-3xl font-bold text-white mt-1">
                  {forecast.active_scenario?.baseline_readiness_score?.toFixed(1)}%
                </div>
                <span className="text-xs text-indigo-300">Authoritative ML Baseline</span>
              </div>

              <div>
                <span className="text-xs text-indigo-200">Projected Readiness</span>
                <div className="text-3xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  {forecast.active_scenario?.projected_readiness_benchmark?.toFixed(1)}%
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs text-emerald-300">
                  +{(forecast.active_scenario?.projected_readiness_delta || 0).toFixed(1)}% Projected Gain
                </span>
              </div>
            </div>

            {/* Prediction Interval Bar */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-300" />
                <span>Prediction Range (±2.2 pts error margin):</span>
                <strong className="text-white">
                  [{forecast.projected_range_low?.toFixed(1)}%, {forecast.projected_range_high?.toFixed(1)}%]
                </strong>
              </div>
              <span className="text-indigo-300 text-[11px]">
                Model: {forecast.model_version}
              </span>
            </div>
          </div>

          {/* Time to Target Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span className="uppercase tracking-wider">Competency Time-to-Target</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900">
                  {forecast.time_to_target?.min_weeks ?? 0} – {forecast.time_to_target?.max_weeks ?? 0}
                  <span className="text-sm font-normal text-slate-500 ml-1">weeks</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Range: <strong className="text-slate-800">{forecast.time_to_target?.estimated_weeks_range || 'Standard Study Commitment'}</strong>
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Target: <strong className="text-indigo-700">{forecast.career_title} Competency Baseline</strong>
            </div>
          </div>

          {/* Uncertainty Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span className="uppercase tracking-wider">Data Uncertainty</span>
                <ShieldCheck className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-3">
                <div className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg border ${getUncertaintyColor(forecast.uncertainty)}`}>
                  {forecast.uncertainty} UNCERTAINTY
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2" title={forecast.uncertainty_rationale}>
                  {forecast.uncertainty_rationale}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Active Bottlenecks: <strong className="text-rose-600">{forecast.bottlenecks?.length || 0} discovered</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('PROJECTIONS')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'PROJECTIONS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Projected Skill Growth ({forecast?.projected_skills?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('BOTTLENECKS')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'BOTTLENECKS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Competency Bottlenecks ({forecast?.bottlenecks?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'SIMULATOR'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Scenario Simulator
        </button>

        <button
          onClick={() => setActiveTab('SCENARIO_COMPARISON')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'SCENARIO_COMPARISON'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Scenario Comparison
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'HISTORY'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Forecast History ({history.length})
        </button>
      </div>

      {/* Tab 1: Projected Skill Growth */}
      {activeTab === 'PROJECTIONS' && forecast && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Longitudinal Skill Trajectory Breakdown</h3>
                <p className="text-xs text-slate-500">
                  Projected competency gain over {forecast.forecast_horizon_days} days based on velocity index and weekly commitment.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Scale: [1.0, 5.0]
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Skill Name</th>
                    <th className="py-3 px-4 text-center">Current Level</th>
                    <th className="py-3 px-4 text-center">Projected Level</th>
                    <th className="py-3 px-4 text-center">Target Level</th>
                    <th className="py-3 px-4 text-center">Growth Status</th>
                    <th className="py-3 px-4 text-center">Velocity (pts/mo)</th>
                    <th className="py-3 px-4 text-right">Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {forecast.skill_growth_projections?.map((item: any) => (
                    <tr key={item.skill_id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.skill_name}
                        <div className="text-[11px] text-slate-400 font-mono">{item.skill_id}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {item.current_proficiency.toFixed(1)} / 5.0
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-indigo-700">
                          {item.projected_proficiency.toFixed(1)}
                        </span>
                        <span className="text-xs text-emerald-600 ml-1">
                          (+{(item.projected_change || 0).toFixed(1)})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {item.target_proficiency.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getGrowthStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-4 text-center text-xs text-slate-600 font-mono">
                        +{item.growth_velocity_monthly?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-slate-500 max-w-xs truncate" title={item.rationale}>
                        {item.rationale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Competency Bottlenecks */}
      {activeTab === 'BOTTLENECKS' && forecast && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Discovered Competency Bottlenecks</h3>
            <p className="text-xs text-slate-600 mb-5">
              These competencies restrict overall trajectory growth due to prerequisite gaps, historical stagnation, or zero verified evidence.
            </p>

            {forecast.bottlenecks?.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">No Restrictive Bottlenecks Detected</p>
                <p className="text-xs text-slate-500 mt-1">Your learning velocity is well-distributed across all required competencies.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {forecast.bottlenecks?.map((bn: any) => (
                  <div key={bn.skill_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{bn.skill_name}</span>
                        {getSeverityBadge(bn.impact_severity)}
                      </div>

                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {bn.reason}
                        </span>
                        <span className="text-xs text-slate-500">
                          Deficit: -{bn.gap.toFixed(1)} pts
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-3">
                        <strong className="text-slate-700">Diagnosis:</strong> {bn.explanation}
                      </p>

                      {bn.blocking_prerequisites?.length > 0 && (
                        <div className="mt-2 text-xs text-rose-600 font-medium">
                          Blocked by prerequisites: {bn.blocking_prerequisites.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/70">
                      <div className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Remediation Action:
                      </div>
                      <p className="text-xs text-slate-700 mt-1">
                        {bn.recommended_remediation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Scenario Simulator */}
      {activeTab === 'SIMULATOR' && forecast && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">What-If Simulator</h3>
              <p className="text-xs text-slate-500">
                Simulate potential growth outcomes strictly in-memory without altering your student profile.
              </p>
            </div>

            {/* Scenario Type */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Scenario Type</label>
              <select
                value={simScenarioType}
                onChange={(e) => setSimScenarioType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg p-2 font-medium"
              >
                <option value="CURRENT_TRAJECTORY">Current Trajectory (Baseline)</option>
                <option value="INCREASED_CONSISTENCY">Increased Consistency (+25% Study / 1.25x Pace)</option>
                <option value="GAP_FOCUSED">Gap-Focused Remediation (Critical Gaps Only)</option>
                <option value="CUSTOM">Custom Parameters</option>
              </select>
            </div>

            {/* Simulated Hours Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Weekly Commitment:</span>
                <span className="text-indigo-600 font-mono">{simHours} hrs/week</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={simHours}
                onChange={(e) => setSimHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>5 hrs</span>
                <span>20 hrs</span>
                <span>40 hrs</span>
              </div>
            </div>

            {/* Consistency Multiplier Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Pace / Consistency Multiplier:</span>
                <span className="text-indigo-600 font-mono">{simConsistency.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={simConsistency}
                onChange={(e) => setSimConsistency(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0.5x (Intermittent)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Intensive)</span>
              </div>
            </div>

            {/* Remediation Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Gap-Remediation Mode</span>
                <p className="text-[11px] text-slate-500">Reallocate 80% study hours to critical bottlenecks</p>
              </div>
              <input
                type="checkbox"
                checked={simRemediation}
                onChange={(e) => setSimRemediation(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
            >
              {simulating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {simulating ? 'Simulating In-Memory...' : 'Execute What-If Simulation'}
            </button>
          </div>

          {/* Simulation Output Card */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            {simulationResult ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-mono uppercase text-indigo-600 font-semibold">
                      Simulation Output: {simulationResult.scenario_name}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                      {simulationResult.scenario_id}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    +{(simulationResult.projected_readiness_delta || 0).toFixed(1)}% Projected Gain
                  </span>
                </div>

                {/* Score Comparison Banner */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500">Baseline Score</span>
                    <div className="text-xl font-bold text-slate-700 mt-0.5">
                      {simulationResult.baseline_readiness_score?.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Simulated Score</span>
                    <div className="text-xl font-bold text-indigo-700 mt-0.5">
                      {simulationResult.projected_readiness_benchmark?.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Simulated Time-to-Target</span>
                    <div className="text-sm font-bold text-slate-800 mt-1">
                      {simulationResult.estimated_time_to_target?.min_weeks ?? 0}–{simulationResult.estimated_time_to_target?.max_weeks ?? 0} wks
                    </div>
                  </div>
                </div>

                {/* Narrative Explanation */}
                <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950">
                  <p className="font-semibold text-indigo-900 mb-1">Simulation Insight:</p>
                  <p>{simulationResult.description}</p>
                </div>

                {/* Simulated Skills Preview */}
                <div>
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Simulated Skill Changes</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                    {simulationResult.projected_skill_changes?.slice(0, 6).map((s: any) => (
                      <div key={s.skill_id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                        <span className="font-medium text-slate-800">{s.skill_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">{s.current_proficiency.toFixed(1)}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-mono font-bold text-indigo-700">{s.projected_proficiency.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center my-auto">
                <Sliders className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">No Simulation Executed</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Adjust weekly commitment and pace sliders on the left, then click "Execute What-If Simulation" to project outcomes in-memory.
                </p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Simulations are computed strictly in-memory and do not modify persistent student profile state.</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Scenario Comparison */}
      {activeTab === 'SCENARIO_COMPARISON' && comparison && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Predefined Scenario Matrix</h3>
            <p className="text-xs text-slate-500 mb-6">
              Compare 3 canonical study pathways side-by-side to understand trade-offs in velocity, time-to-target, and uncertainty.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {comparison.scenarios?.map((sc: any) => (
                <div key={sc.scenario_id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-indigo-700 font-bold">{sc.scenario_type}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mt-2">{sc.scenario_name}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-3">{sc.description}</p>

                    <div className="mt-4 pt-4 border-t border-slate-200/70 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Projected Readiness:</span>
                        <strong className="text-indigo-700 font-mono text-sm">{sc.projected_readiness_benchmark?.toFixed(1)}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Readiness Gain:</span>
                        <strong className="text-emerald-600 font-mono">+{(sc.projected_readiness_delta || 0).toFixed(1)}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Est. Time to Target:</span>
                        <strong className="text-slate-800">
                          {sc.estimated_time_to_target?.min_weeks ?? 0}–{sc.estimated_time_to_target?.max_weeks ?? 0} wks
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Data Uncertainty:</span>
                        <strong className="text-slate-700">{sc.estimated_time_to_target?.analytical_confidence || 'MEDIUM'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Forecast History */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Chronological Forecast Snapshots</h3>
            <p className="text-xs text-slate-500">
              Audit trail of previous forecast generations for this career target.
            </p>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No historical forecast snapshots found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date Recorded</th>
                    <th className="py-3 px-4">Horizon</th>
                    <th className="py-3 px-4 text-center">Baseline Score</th>
                    <th className="py-3 px-4 text-center">Projected Score</th>
                    <th className="py-3 px-4 text-center">Uncertainty</th>
                    <th className="py-3 px-4 text-center">Bottlenecks</th>
                    <th className="py-3 px-4 text-right">Model Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((h: any) => (
                    <tr key={h.forecast_id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-xs font-mono text-slate-700">
                        {h.created_at ? new Date(h.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-indigo-700">
                        {h.forecast_horizon_days || 90} Days
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {(h.baseline_snapshot?.ml_readiness_score || 0).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                        {(h.active_scenario?.projected_readiness_benchmark || 0).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${getUncertaintyColor(h.uncertainty)}`}>
                          {h.uncertainty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-xs text-slate-600">
                        {h.bottlenecks?.length || 0}
                      </td>
                      <td className="py-3 px-4 text-right text-xs font-mono text-slate-400">
                        {h.model_version}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Scientific & Provenance Footer */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          Scientific Forecasting & Scenario Intelligence Notice
        </p>
        <p>
          Career forecasts and what-if simulations model longitudinal skill acquisition velocity and competency progression over time.
          Projections are bounded by historical student evidence and authoritative curriculum constraints.
          Forecasts represent analytical readiness benchmarks and do not constitute guarantees of job offers or hiring outcomes.
        </p>
      </div>
    </div>
  );
};
export default CareerForecastPage;
