import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../api/client';
import { CAREER_GOALS_DATA, getCareerGoalsForBranch } from '../data/careerGoalsHierarchy';
import type { CareerGoalDefinition } from '../data/careerGoalsHierarchy';
import { Target, ArrowRight, Clock } from 'lucide-react';

interface Props {
  initialBranchCode?: string;
  onSelectCareer?: (careerId: string) => void;
}

export const BranchCareerGoalNavigator: React.FC<Props> = ({ initialBranchCode, onSelectCareer }) => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const userBranchCode = profile?.branch || profile?.major_or_branch || initialBranchCode || 'CSE';
  const [selectedBranch, setSelectedBranch] = useState<string>(userBranchCode);

  // Available career goals for chosen branch
  const goals = getCareerGoalsForBranch(selectedBranch);
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id || '');
  const [savingTarget, setSavingTarget] = useState(false);

  // Active goal object
  const activeGoal = goals.find(g => g.id === selectedGoalId) || goals[0];

  // Lookup student's current skill levels from profile
  const studentSkillsMap = new Map<string, number>();
  if (profile?.skills) {
    profile.skills.forEach((s: any) => {
      const name = (s.skill_name || s.name || '').toLowerCase().trim();
      const lvl = s.level ?? s.proficiency_level ?? 2;
      studentSkillsMap.set(name, Number(lvl));
    });
  }

  // Group branches by category for clear navigation
  const groupedBranches = React.useMemo(() => {
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

  const handleSetTarget = async (goal: CareerGoalDefinition) => {
    setSavingTarget(true);
    try {
      await studentApi.updateProfile({ target_career_id: goal.id });
      await refreshProfile();
      if (onSelectCareer) onSelectCareer(goal.id);
    } catch (err) {
      console.error('Error saving target career goal:', err);
    } finally {
      setSavingTarget(false);
    }
  };

  const isCurrentTarget = profile?.target_career_id === activeGoal?.id;

  return (
    <div className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Hierarchy Breadcrumb Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#1e40af', fontWeight: 700 }}>
            <span>Branch</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span>Career Goal</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span>Required Skills</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span>Skill Level</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span>Skill Gap</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span>Learning Roadmap</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '4px 0 0 0', fontWeight: 700 }}>
            Structured Career Goals & Learning Requirements
          </h2>
        </div>

        {/* Branch Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Engineering Branch:</span>
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
            style={{ minWidth: '280px', padding: '6px 10px', fontSize: '0.82rem', fontWeight: 600 }}
          >
            {Object.entries(groupedBranches).map(([groupName, branches]) => (
              <optgroup key={groupName} label={groupName}>
                {branches.map(b => (
                  <option key={b.code} value={b.code}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Step 1: Select Career Goal among Branch options */}
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
          Select Career Goal for {activeGoal?.branch_name || selectedBranch}:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {goals.map((g) => {
            const isSelected = g.id === activeGoal?.id;
            const isTarget = profile?.target_career_id === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGoalId(g.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: isSelected ? '2px solid #006EFF' : '1px solid #cbd5e1',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1e40af' : '#334155',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{g.title}</span>
                {isTarget && (
                  <span style={{ fontSize: '0.68rem', background: '#15803d', color: '#ffffff', padding: '1px 5px', borderRadius: '4px' }}>
                    TARGET
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeGoal && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Active Goal Overview Card */}
          <div
            style={{
              padding: '16px 20px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-primary">{activeGoal.category}</span>
                <span className="badge badge-success">{activeGoal.market_demand} Demand</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Industry Avg: <strong style={{ color: '#15803d' }}>${activeGoal.avg_salary_usd.toLocaleString()} / yr</strong>
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '2px 0 6px 0', fontWeight: 700 }}>
                {activeGoal.title}
              </h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem', maxWidth: '700px' }}>
                {activeGoal.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => handleSetTarget(activeGoal)}
                disabled={savingTarget}
                className={isCurrentTarget ? 'btn-secondary' : 'btn-primary'}
                style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Target size={16} />
                {isCurrentTarget ? '★ Active Target Goal' : 'Set as Target Goal'}
              </button>
            </div>
          </div>

          {/* Step 2: "Mainly Learn" Core Skill Checklist & Live Gap Engine */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                Mainly Learn Competencies for {activeGoal.title}:
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Curated Industry Standard Requirements (1-5 Level Scale)
              </span>
            </div>

            <div className="panel-card" style={{ padding: '0', overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Required Skill</th>
                    <th>Required Level</th>
                    <th>Your Verified Level</th>
                    <th>Skill Gap</th>
                    <th>Priority</th>
                    <th>Est. Remediation</th>
                  </tr>
                </thead>
                <tbody>
                  {activeGoal.required_skills.map((req) => {
                    // Check if student has verified this skill
                    let studentLvl = 0;
                    for (const [sname, slvl] of studentSkillsMap.entries()) {
                      if (req.skill_name.toLowerCase().includes(sname) || sname.includes(req.skill_name.toLowerCase())) {
                        studentLvl = Math.max(studentLvl, slvl);
                      }
                    }
                    if (studentLvl === 0) {
                      // Default simulated student level for demo if not explicitly assessed
                      studentLvl = 2.0;
                    }

                    const gap = Math.max(0, req.required_level - studentLvl);
                    const isMet = gap === 0;
                    const pct = Math.min(100, Math.round((studentLvl / req.required_level) * 100));

                    return (
                      <tr key={req.skill_id}>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>
                          {req.skill_name}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#1e40af' }}>
                            {req.required_level}.0 / 5.0
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#0f172a', width: '48px', fontWeight: 600 }}>
                              {studentLvl.toFixed(1)} / 5.0
                            </span>
                            <div className="progress-bar-container" style={{ width: '70px' }}>
                              <div
                                className={isMet ? 'progress-bar-fill-emerald' : 'progress-bar-fill-amber'}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: isMet ? '#15803d' : '#b91c1c' }}>
                            {isMet ? '[MET]' : `-${gap.toFixed(1)}`}
                          </span>
                        </td>
                        <td>
                          <span className={req.priority === 'Critical' ? 'badge badge-danger' : (req.priority === 'High' ? 'badge badge-warning' : 'badge badge-primary')}>
                            {req.priority}
                          </span>
                        </td>
                        <td style={{ color: '#475569' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} style={{ color: '#94a3b8' }} />
                            ~{isMet ? 0 : req.estimated_hours} hrs
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 3: Adaptive Learning Roadmap */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                Target Learning Roadmap for {activeGoal.title}:
              </div>
              <button
                onClick={() => navigate('/app/trajectory')}
                style={{ background: 'none', border: 'none', color: '#006EFF', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Simulate Weekly Trajectory <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {activeGoal.roadmap_stages.map((stg) => (
                <div
                  key={stg.stage}
                  className="panel-card"
                  style={{
                    padding: '14px 16px',
                    borderLeft: `4px solid ${stg.stage === 1 ? '#006EFF' : (stg.stage === 2 ? '#f59e0b' : '#10b981')}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                      STAGE {stg.stage}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                      {stg.focus_skills.length} Milestones
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', marginBottom: '6px' }}>
                    {stg.title}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    {stg.focus_skills.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          background: '#eff6ff',
                          color: '#1e40af',
                          border: '1px solid #bfdbfe',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4 }}>
                    <strong>Outcome:</strong> {stg.deliverable}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
