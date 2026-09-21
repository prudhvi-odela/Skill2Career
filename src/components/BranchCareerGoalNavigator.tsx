import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../api/client';
import { CAREER_GOALS_DATA, getCareerGoalsForBranch } from '../data/careerGoalsHierarchy';
import type { CareerGoalDefinition } from '../data/careerGoalsHierarchy';
import {
  Target,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface Props {
  initialBranchCode?: string;
  onSelectCareer?: (careerId: string) => void;
}

export const BranchCareerGoalNavigator: React.FC<Props> = ({ initialBranchCode, onSelectCareer }) => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // -------------------------------------------------------------
  // STEP 1: Branch Selection State
  // -------------------------------------------------------------
  const userBranchCode = profile?.branch || profile?.major_or_branch || initialBranchCode || 'CSE';
  const [selectedBranch, setSelectedBranch] = useState<string>(userBranchCode);
  const [branchSearch, setBranchSearch] = useState<string>('');

  // -------------------------------------------------------------
  // STEP 2: Career Goal Selection State
  // "according to branch the skill goal should come / only required skill goals should come"
  // -------------------------------------------------------------
  const goals = useMemo(() => getCareerGoalsForBranch(selectedBranch), [selectedBranch]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id || '');
  const [savingTarget, setSavingTarget] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Update selected goal whenever branch changes if previous goal is not in new branch
  useEffect(() => {
    if (!goals.some(g => g.id === selectedGoalId) && goals.length > 0) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

  // Active goal object
  const activeGoal = useMemo(() => {
    return goals.find(g => g.id === selectedGoalId) || goals[0];
  }, [goals, selectedGoalId]);

  // -------------------------------------------------------------
  // STEP 4: Interactive Student Skill Levels State
  // Allows testing and adjustment of: Required Skill -> Student Level (/ 5.0)
  // -------------------------------------------------------------
  const [customStudentLevels, setCustomStudentLevels] = useState<Record<string, number>>({});
  const [isSavingLevels, setIsSavingLevels] = useState(false);
  const [levelSaveFeedback, setLevelSaveFeedback] = useState<string | null>(null);

  // Reset or initialize custom student levels when activeGoal changes
  useEffect(() => {
    if (!activeGoal) return;
    const initialLevels: Record<string, number> = {};

    // Build lookup from verified profile
    const verifiedMap = new Map<string, number>();
    if (profile?.skills) {
      profile.skills.forEach((s: any) => {
        const name = (s.skill_name || s.name || '').toLowerCase().trim();
        const lvl = s.level ?? s.proficiency_level ?? s.score;
        if (lvl !== undefined && lvl !== null) {
          verifiedMap.set(name, Number(lvl));
        }
      });
    }

    activeGoal.required_skills.forEach((req) => {
      let matchedLevel: number | null = null;
      const reqName = req.skill_name.toLowerCase().trim();

      for (const [pName, pLvl] of verifiedMap.entries()) {
        if (reqName.includes(pName) || pName.includes(reqName)) {
          matchedLevel = pLvl;
          break;
        }
      }

      // If in profile, use profile level; otherwise use the realistic default student level
      initialLevels[req.skill_id] = matchedLevel !== null ? matchedLevel : req.default_student_level;
    });

    setCustomStudentLevels(initialLevels);
  }, [activeGoal, profile?.skills]);

  // Group branches by the 7 official engineering categories
  const groupedBranches = useMemo(() => {
    const groups: Record<string, { code: string; name: string }[]> = {
      '💻 Computer & IT': [],
      '⚡ Electrical & Electronics': [],
      '⚙️ Mechanical & Related': [],
      '🏗️ Civil & Infrastructure': [],
      '🧪 Chemical & Materials': [],
      '✈️ Aerospace & Specialized': [],
      '🌱 Emerging / Interdisciplinary': []
    };

    Object.entries(CAREER_GOALS_DATA).forEach(([code, def]) => {
      const cat = def.category;
      const groupKey = Object.keys(groups).find(k => k.toLowerCase().includes(cat.toLowerCase())) || '🌱 Emerging / Interdisciplinary';
      groups[groupKey].push({ code, name: def.branch_name });
    });

    return groups;
  }, []);

  // Filtered branches for search
  const filteredGroupedBranches = useMemo(() => {
    if (!branchSearch.trim()) return groupedBranches;
    const q = branchSearch.toLowerCase();
    const filtered: Record<string, { code: string; name: string }[]> = {};

    Object.entries(groupedBranches).forEach(([cat, list]) => {
      const matched = list.filter(b => b.code.toLowerCase().includes(q) || b.name.toLowerCase().includes(q));
      if (matched.length > 0) {
        filtered[cat] = matched;
      }
    });

    return filtered;
  }, [groupedBranches, branchSearch]);

  // Save selected goal as Target Career in backend profile
  const handleSetTarget = async (goal: CareerGoalDefinition) => {
    setSavingTarget(true);
    setSaveSuccessMsg(null);
    try {
      await studentApi.updateProfile({ target_career_id: goal.id });
      await refreshProfile();
      if (onSelectCareer) onSelectCareer(goal.id);
      setSaveSuccessMsg(`Target career successfully updated to ${goal.title}!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error saving target career goal:', err);
    } finally {
      setSavingTarget(false);
    }
  };

  // Save updated custom skill levels to student profile in backend
  const handleSaveLevelsToProfile = async () => {
    if (!activeGoal) return;
    setIsSavingLevels(true);
    setLevelSaveFeedback(null);
    try {
      const updatedSkillsList = activeGoal.required_skills.map(req => ({
        skill_name: req.skill_name,
        proficiency_level: customStudentLevels[req.skill_id] ?? req.default_student_level,
        level: customStudentLevels[req.skill_id] ?? req.default_student_level
      }));

      await studentApi.updateProfile({ skills: updatedSkillsList });
      await refreshProfile();
      setLevelSaveFeedback('Student skill levels successfully persisted to profile!');
      setTimeout(() => setLevelSaveFeedback(null), 4000);
    } catch (err) {
      console.error('Failed to update student profile skills:', err);
      setLevelSaveFeedback('Failed to update skills. Please try again.');
    } finally {
      setIsSavingLevels(false);
    }
  };

  const isCurrentTarget = profile?.target_career_id === activeGoal?.id;

  // -------------------------------------------------------------
  // STEP 5: Live Skill Gap Calculations
  // Gap = Math.max(0, Required Level - Student Level)
  // Priority: Critical (>=2.0), High (>=1.0), Medium (>0), Met (0)
  // -------------------------------------------------------------
  const gapAnalysis = useMemo(() => {
    if (!activeGoal) return { items: [], totalGapHours: 0, criticalCount: 0, metCount: 0, readinessPct: 0 };

    let totalPossible = 0;
    let totalAchieved = 0;
    let totalGapHours = 0;
    let criticalCount = 0;
    let metCount = 0;

    const items = activeGoal.required_skills.map((req) => {
      const studentLvl = customStudentLevels[req.skill_id] ?? req.default_student_level;
      const deficit = Math.max(0, req.required_level - studentLvl);
      const isMet = deficit === 0;

      totalPossible += req.required_level;
      totalAchieved += Math.min(req.required_level, studentLvl);

      let computedPriority: 'Critical' | 'High' | 'Medium' | 'Mastered' = 'Medium';
      if (isMet) {
        computedPriority = 'Mastered';
        metCount++;
      } else if (deficit >= 2.0 || req.priority === 'Critical') {
        computedPriority = 'Critical';
        criticalCount++;
        totalGapHours += req.estimated_hours;
      } else if (deficit >= 1.0) {
        computedPriority = 'High';
        totalGapHours += Math.round(req.estimated_hours * 0.7);
      } else {
        computedPriority = 'Medium';
        totalGapHours += Math.round(req.estimated_hours * 0.4);
      }

      return {
        ...req,
        studentLvl,
        deficit,
        isMet,
        computedPriority,
        matchPct: Math.min(100, Math.round((studentLvl / req.required_level) * 100))
      };
    });

    const readinessPct = totalPossible > 0 ? Math.round((totalAchieved / totalPossible) * 100) : 0;

    return {
      items,
      totalGapHours,
      criticalCount,
      metCount,
      readinessPct
    };
  }, [activeGoal, customStudentLevels]);

  return (
    <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* =========================================================
          FLOW HEADER & 6-STEP VISUAL BREADCRUMB
          Branch → Career Goal → Required Skills → Skill Level → Skill Gap → Learning Roadmap
         ========================================================= */}
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '3px 8px' }}>
                <Sparkles size={12} /> Skill2Career Academic Hierarchy Engine
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Main Academic Subjects Priority Flow
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0, fontWeight: 800 }}>
              Career Goal, Required Skills & Subject Gap Pathway
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Active Student Branch:</span>
            <span className="badge badge-neutral" style={{ fontWeight: 700, fontSize: '0.82rem', padding: '4px 10px' }}>
              {selectedBranch}
            </span>
          </div>
        </div>

        {/* 6-Step Visual Hierarchy Stepper */}
        <div
          style={{
            marginTop: '16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          {[
            { step: 1, label: 'Branch', desc: selectedBranch },
            { step: 2, label: 'Career Goal', desc: activeGoal?.title || 'Target Role' },
            { step: 3, label: 'Required Skills', desc: `${activeGoal?.required_skills.length || 0} Skills` },
            { step: 4, label: 'Skill Level', desc: '1.0 - 5.0 Scale' },
            { step: 5, label: 'Skill Gap', desc: `${gapAnalysis.readinessPct}% Readiness` },
            { step: 6, label: 'Learning Roadmap', desc: 'Main Subjects' }
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#006EFF',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}
                >
                  {item.step}
                </span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', maxWidth: '110px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
              {idx < 5 && (
                <div style={{ color: '#006EFF', display: 'flex', alignItems: 'center' }}>
                  <ChevronRight size={16} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* =========================================================
          STEP 1: BRANCH SELECTION
         ========================================================= */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#006EFF', background: '#eff6ff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              1
            </span>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
              Select Engineering Branch
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              (66 Disciplines Across 7 Engineering Domains)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search branch code or title..."
              value={branchSearch}
              onChange={(e) => setBranchSearch(e.target.value)}
              className="input-field"
              style={{ width: '220px', padding: '6px 10px', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={selectedBranch}
            onChange={(e) => {
              const code = e.target.value;
              setSelectedBranch(code);
              const branchGoals = getCareerGoalsForBranch(code);
              if (branchGoals.length > 0) {
                setSelectedGoalId(branchGoals[0].id);
              }
            }}
            className="input-field"
            style={{ minWidth: '320px', padding: '8px 12px', fontSize: '0.86rem', fontWeight: 600, background: '#ffffff' }}
          >
            {Object.entries(filteredGroupedBranches).map(([groupName, branches]) => (
              <optgroup key={groupName} label={groupName}>
                {branches.map(b => (
                  <option key={b.code} value={b.code}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Quick branch pill toggles for popular branches */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['CSE', 'IT', 'AI_ML', 'DATA_SCI', 'CYBER', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AERO'].map(code => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setSelectedBranch(code);
                  const branchGoals = getCareerGoalsForBranch(code);
                  if (branchGoals.length > 0) {
                    setSelectedGoalId(branchGoals[0].id);
                  }
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: selectedBranch === code ? 700 : 500,
                  background: selectedBranch === code ? '#006EFF' : '#f1f5f9',
                  color: selectedBranch === code ? '#ffffff' : '#475569',
                  border: selectedBranch === code ? '1px solid #006EFF' : '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================
          STEP 2: CAREER GOAL SELECTION (STRICTLY ACCORDING TO BRANCH)
          "according to branch the skill goal should come / only required skill goals should come"
         ========================================================= */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#006EFF', background: '#eff6ff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              2
            </span>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
              Career Goals for {activeGoal?.branch_name || selectedBranch}
            </h3>
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
              {goals.length} Specialized Roles
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Filtered strictly to {selectedBranch} degree domain
          </span>
        </div>

        {/* Career Goal Selection Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {goals.map((g) => {
            const isSelected = g.id === activeGoal?.id;
            const isTarget = profile?.target_career_id === g.id;

            return (
              <div
                key={g.id}
                onClick={() => setSelectedGoalId(g.id)}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #006EFF' : '1px solid #e2e8f0',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: isSelected ? '#1e40af' : '#0f172a' }}>
                    {g.title}
                  </h4>
                  {isTarget && (
                    <span style={{ fontSize: '0.66rem', background: '#15803d', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      TARGET
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                    {g.market_demand}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                    ${g.avg_salary_usd.toLocaleString()} / yr
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.35, maxHeight: '38px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {g.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Active Goal Detailed Header Card */}
        {activeGoal && (
          <div
            style={{
              marginTop: '12px',
              padding: '16px 20px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-primary">{activeGoal.category}</span>
                <span className="badge badge-neutral">{activeGoal.branch_name} ({activeGoal.branch_code})</span>
                <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}>
                  Avg Salary: ${activeGoal.avg_salary_usd.toLocaleString()} / yr
                </span>
              </div>
              <h4 style={{ margin: '2px 0 4px 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                Selected Target Role: {activeGoal.title}
              </h4>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.82rem', maxWidth: '720px' }}>
                {activeGoal.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleSetTarget(activeGoal)}
                disabled={savingTarget}
                className={isCurrentTarget ? 'btn-secondary' : 'btn-primary'}
                style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Target size={16} />
                {isCurrentTarget ? '★ Current Profile Target' : 'Set as My Target Goal'}
              </button>
            </div>
          </div>
        )}

        {saveSuccessMsg && (
          <div style={{ marginTop: '8px', padding: '8px 12px', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> {saveSuccessMsg}
          </div>
        )}
      </div>

      {/* =========================================================
          STEP 3: REQUIRED SKILLS HIERARCHY TREE
          Branch
           └── Career Goal
                ├── Skill 1
                ├── Skill 2
                ...
         ========================================================= */}
      {activeGoal && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#006EFF', background: '#eff6ff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                3
              </span>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
                Required Skills Hierarchy for {activeGoal.title}
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Curated Academic Subjects & Industry Standards
            </span>
          </div>

          {/* Visual Academic Subject Tree Structure */}
          <div
            style={{
              padding: '16px 20px',
              background: '#0f172a',
              borderRadius: '8px',
              color: '#f8fafc',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.85rem',
              lineHeight: 1.6,
              overflowX: 'auto',
              border: '1px solid #1e293b'
            }}
          >
            <div style={{ color: '#38bdf8', fontWeight: 700 }}>
              {activeGoal.branch_code} ({activeGoal.branch_name})
            </div>
            <div style={{ color: '#94a3b8' }}>
              └── <strong style={{ color: '#facc15' }}>{activeGoal.title}</strong>
            </div>
            {activeGoal.required_skills.map((req, idx) => {
              const isLast = idx === activeGoal.required_skills.length - 1;
              const branchSymbol = isLast ? '└──' : '├──';
              const isCore = req.subject_category === 'Core Subject';

              return (
                <div key={req.skill_id} style={{ paddingLeft: '24px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#64748b' }}>{branchSymbol}</span>
                  <span style={{ color: isCore ? '#ffffff' : '#cbd5e1', fontWeight: isCore ? 700 : 500 }}>
                    {req.skill_name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: isCore ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                      color: isCore ? '#38bdf8' : '#94a3b8',
                      border: isCore ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(148, 163, 184, 0.3)'
                    }}
                  >
                    {req.subject_category || 'Core Subject'}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    [Benchmark: {req.required_level}.0 / 5.0]
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 4: SKILL LEVEL ASSESSMENT (INTERACTIVE & PROFILE SYNC)
          Replicates user format:
          Required Skill       Student Level
          -----------------------------------
          Python                4.2 / 5
          DSA                   2.1 / 5
          SQL                   3.5 / 5
          DBMS                  2.8 / 5
          Git                   4.0 / 5
          System Design         1.5 / 5
         ========================================================= */}
      {activeGoal && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#006EFF', background: '#eff6ff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                4
              </span>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
                Student Skill Level vs. Industry Benchmark
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSaveLevelsToProfile}
                disabled={isSavingLevels}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={13} className={isSavingLevels ? 'animate-spin' : ''} />
                Save Levels to Profile
              </button>
            </div>
          </div>

          {levelSaveFeedback && (
            <div style={{ marginBottom: '10px', padding: '6px 12px', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '6px', fontSize: '0.78rem' }}>
              {levelSaveFeedback}
            </div>
          )}

          {/* Interactive Skill Level Table matching user's spec */}
          <div className="panel-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Required Skill</th>
                  <th style={{ width: '15%' }}>Subject Category</th>
                  <th style={{ width: '15%' }}>Benchmark Required</th>
                  <th style={{ width: '20%' }}>Student Level (/ 5.0)</th>
                  <th style={{ width: '25%' }}>Interactive Level Tuner</th>
                </tr>
              </thead>
              <tbody>
                {activeGoal.required_skills.map((req) => {
                  const currentLvl = customStudentLevels[req.skill_id] ?? req.default_student_level;
                  const isMet = currentLvl >= req.required_level;

                  return (
                    <tr key={req.skill_id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        {req.skill_name}
                      </td>
                      <td>
                        <span className={req.subject_category === 'Core Subject' ? 'badge badge-primary' : 'badge badge-neutral'} style={{ fontSize: '0.7rem' }}>
                          {req.subject_category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#1e40af' }}>
                          {req.required_level.toFixed(1)} / 5.0
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isMet ? '#15803d' : '#0f172a', width: '55px' }}>
                            {currentLvl.toFixed(1)} / 5
                          </span>
                          <div className="progress-bar-container" style={{ width: '70px', height: '7px' }}>
                            <div
                              className={isMet ? 'progress-bar-fill-emerald' : 'progress-bar-fill-amber'}
                              style={{ width: `${Math.min(100, Math.round((currentLvl / 5) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="range"
                            min="1.0"
                            max="5.0"
                            step="0.1"
                            value={currentLvl}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setCustomStudentLevels(prev => ({
                                ...prev,
                                [req.skill_id]: val
                              }));
                            }}
                            style={{ width: '110px', accentColor: '#006EFF', cursor: 'pointer' }}
                          />
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {[1.5, 2.5, 3.5, 4.5].map(preset => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setCustomStudentLevels(prev => ({ ...prev, [req.skill_id]: preset }))}
                                style={{
                                  padding: '2px 5px',
                                  fontSize: '0.65rem',
                                  borderRadius: '3px',
                                  border: '1px solid #cbd5e1',
                                  background: currentLvl === preset ? '#eff6ff' : '#f8fafc',
                                  color: currentLvl === preset ? '#1e40af' : '#64748b',
                                  fontWeight: currentLvl === preset ? 700 : 500,
                                  cursor: 'pointer'
                                }}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 5: SKILL GAP CALCULATION & PRIORITY ENGINE
          Career Goal → Skill Gap → Priority → Recommended Learning → Roadmap
         ========================================================= */}
      {activeGoal && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#006EFF', background: '#eff6ff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                5
              </span>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
                Live Skill Gap, Priority & Recommended Subject Learning
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem' }}>
              <span style={{ color: '#475569' }}>
                Overall Readiness: <strong style={{ color: '#006EFF' }}>{gapAnalysis.readinessPct}%</strong>
              </span>
              <span style={{ color: '#475569' }}>
                Critical Deficits: <strong style={{ color: gapAnalysis.criticalCount > 0 ? '#dc2626' : '#15803d' }}>{gapAnalysis.criticalCount}</strong>
              </span>
              <span style={{ color: '#475569' }}>
                Remediation Time: <strong style={{ color: '#0f172a' }}>~{gapAnalysis.totalGapHours} Hours</strong>
              </span>
            </div>
          </div>

          {/* Skill Gap Results Table */}
          <div className="panel-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Required Skill</th>
                  <th style={{ width: '12%' }}>Skill Gap</th>
                  <th style={{ width: '12%' }}>Priority</th>
                  <th style={{ width: '44%' }}>Recommended Learning (Focus on Main Subjects)</th>
                  <th style={{ width: '12%' }}>Est. Hours</th>
                </tr>
              </thead>
              <tbody>
                {gapAnalysis.items.map((item) => (
                  <tr key={item.skill_id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{item.skill_name}</span>
                        {item.subject_category === 'Core Subject' && (
                          <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1e40af', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                            MAIN
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: item.isMet ? '#15803d' : '#dc2626'
                        }}
                      >
                        {item.isMet ? '[MET]' : `-${item.deficit.toFixed(1)} Deficit`}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          item.computedPriority === 'Mastered'
                            ? 'badge badge-success'
                            : item.computedPriority === 'Critical'
                            ? 'badge badge-danger'
                            : item.computedPriority === 'High'
                            ? 'badge badge-warning'
                            : 'badge badge-primary'
                        }
                        style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                      >
                        {item.computedPriority}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.4 }}>
                        {item.recommended_learning}
                      </span>
                    </td>
                    <td style={{ color: '#475569', fontSize: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} style={{ color: '#94a3b8' }} />
                        {item.isMet ? '0 hrs' : `~${item.estimated_hours} hrs`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 6: LEARNING ROADMAP
          "students road map should mainly foucs on their main subjects"
         ========================================================= */}
      {activeGoal && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#006EFF', background: '#eff6ff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                6
              </span>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
                Learning Roadmap for {activeGoal.title} (Focus on Main Subjects)
              </h3>
            </div>

            <button
              type="button"
              onClick={() => navigate('/app/trajectory')}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <TrendingUp size={14} /> Open Weekly Trajectory Simulation
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
            {activeGoal.roadmap_stages.map((stg) => {
              const borderColors = ['#006EFF', '#f59e0b', '#10b981'];
              const accentColor = borderColors[(stg.stage - 1) % borderColors.length];

              return (
                <div
                  key={stg.stage}
                  className="panel-card"
                  style={{
                    padding: '18px',
                    borderLeft: `5px solid ${accentColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        STAGE {stg.stage}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        Core Academic Focus
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      {stg.title}
                    </h4>

                    {/* Main Subjects Focus Tag Badges */}
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                        Main Engineering Subjects to Master:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {stg.focus_skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            style={{
                              fontSize: '0.72rem',
                              background: '#eff6ff',
                              color: '#1e40af',
                              border: '1px solid #bfdbfe',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 700
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Academic syllabus & recommended topics */}
                    {stg.recommended_topics && (
                      <div style={{ marginBottom: '10px', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Syllabus Modules & Textbook Topics:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.73rem', color: '#475569', lineHeight: 1.4 }}>
                          {stg.recommended_topics.map((top, tIdx) => (
                            <li key={tIdx}>{top}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                      <strong style={{ color: '#0f172a' }}>Milestone Deliverable:</strong> {stg.deliverable}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Estimated Timeline: {stg.stage === 1 ? 'Weeks 1-6' : stg.stage === 2 ? 'Weeks 7-14' : 'Weeks 15-20'}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/app/curriculum')}
                      style={{ background: 'none', border: 'none', color: '#006EFF', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      Practice Subject Labs <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
