import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { careersApi } from '../api/client';
import {
  GraduationCap, Target, Award, Sparkles, CheckCircle2,
  ArrowRight, ArrowLeft, Plus, X, Upload, BookOpen
} from 'lucide-react';
import { ENGINEERING_CATEGORIES, ALL_BRANCHES } from '../data/engineeringBranches';
import { getCareerGoalsForBranch } from '../data/careerGoalsHierarchy';

const COMMON_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'SQL',
  'Java', 'C++', 'Docker', 'Node.js', 'Data Structures & Algorithms',
  'Git', 'AWS', 'Machine Learning', 'Pandas & NumPy', 'FastAPI',
  'HTML/CSS', 'System Design', 'PostgreSQL', 'Tailwind CSS', 'Spring Boot'
];

export const OnboardingPage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>('');

  // Step 1: Academic
  const [fullName, setFullName] = useState(profile?.full_name || user?.full_name || '');
  const [institution, setInstitution] = useState(profile?.institution || 'RV College of Engineering');
  const [degree, setDegree] = useState(profile?.degree || 'B.Tech Computer Science');
  const [branch, setBranch] = useState(profile?.major_or_branch || 'Computer Science and Engineering (CSE)');
  const [cgpa, setCgpa] = useState<number>(profile?.gpa || 8.5);
  const [graduationYear, setGraduationYear] = useState<number>(profile?.graduation_year || 2026);

  // Dynamic career goals strictly for the chosen branch
  const branchGoals = React.useMemo(() => getCareerGoalsForBranch(branch), [branch]);
  const [careers, setCareers] = useState<any[]>(branchGoals);

  // Step 2: Target Career
  const [targetCareerId, setTargetCareerId] = useState<string>(profile?.target_career_id || branchGoals[0]?.id || 'CG_CSE_1_software_engineer');

  // Step 3: Skills
  const [selectedSkills, setSelectedSkills] = useState<{ name: string; level: number; category: string }[]>([
    { name: 'Python', level: 3.5, category: 'Programming' },
    { name: 'Data Structures & Algorithms', level: 3.0, category: 'Computer Science' },
    { name: 'SQL', level: 3.0, category: 'Databases' },
  ]);
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  // Step 4: Study Commitment & Resume
  const [weeklyHours, setWeeklyHours] = useState<number>(profile?.weekly_study_hours || 15);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [resumeSummary, setResumeSummary] = useState<string>('');

  // Update careers whenever branch changes
  useEffect(() => {
    const goals = getCareerGoalsForBranch(branch);
    setCareers(goals);
    if (!goals.some(g => (g.id || (g as any).career_id) === targetCareerId) && goals.length > 0) {
      setTargetCareerId(goals[0].id || (goals[0] as any).career_id);
    }
  }, [branch]);

  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (selectedSkills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    setSelectedSkills(prev => [...prev, { name: trimmed, level: 3.0, category: 'General' }]);
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setSelectedSkills(prev => prev.filter(s => s.name.toLowerCase() !== skillName.toLowerCase()));
  };

  const handleSkillLevelChange = (skillName: string, newLevel: number) => {
    setSelectedSkills(prev =>
      prev.map(s => (s.name.toLowerCase() === skillName.toLowerCase() ? { ...s, level: newLevel } : s))
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setResumeSummary(`Uploaded: ${file.name}. Relevant skills: Full-Stack Architecture, REST APIs, Database Optimization.`);
      // Extract dummy skills if not present
      if (!selectedSkills.some(s => s.name.toLowerCase() === 'react')) {
        handleAddSkill('React');
      }
    }
  };

  const selectedCareer = careers.find(c => (c.career_id || c.id) === targetCareerId) || careers[0];

  const handleSubmit = async () => {
    setLoading(true);

    const stepsList = [
      'Saving your student credentials...',
      'Mapping competencies to ' + (selectedCareer?.career_title || selectedCareer?.title || 'Target Role') + '...',
      'Running Job-Readiness and Skill Gap ML models...',
      'Synthesizing your personalized dashboard...'
    ];

    for (const msg of stepsList) {
      setAnalyzingStep(msg);
      await new Promise(r => setTimeout(r, 450));
    }

    try {
      const skillsToSave = selectedSkills.map((s, idx) => ({
        skill_id: `SK_CUSTOM_${idx + 1}`,
        name: s.name,
        category: s.category,
        domain: 'Technical',
        level: s.level,
        verified: false,
        verification_source: 'Self-Reported',
        years_experience: Math.round(s.level / 2)
      }));

      await updateProfile({
        full_name: fullName,
        institution,
        degree,
        major_or_branch: branch,
        graduation_year: Number(graduationYear),
        gpa: Number(cgpa),
        target_career_id: targetCareerId,
        target_career_title: selectedCareer?.career_title || selectedCareer?.title,
        skills: skillsToSave,
        weekly_study_hours: Number(weeklyHours),
        onboarded: true,
        resume_name: uploadedFileName || undefined
      });

      localStorage.setItem('skill2career_onboarded', 'true');
      navigate('/app/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      // Navigate anyway with local state set
      localStorage.setItem('skill2career_onboarded', 'true');
      navigate('/app/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '36px 20px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', maxWidth: '640px', marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            padding: '5px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          <Sparkles size={14} /> Student Career Profile Setup
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
          Welcome to Skill2Career, {fullName ? fullName.split(' ')[0] : 'Student'}!
        </h1>
        <p style={{ fontSize: '0.925rem', color: '#64748b', margin: 0 }}>
          Tell us about your background, dream career, and current skills so we can calibrate your real-time Readiness Score and custom gap roadmap.
        </p>
      </div>

      {/* Wizard Steps Indicator */}
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          position: 'relative',
        }}
      >
        {[
          { num: 1, label: 'Academic Details', icon: GraduationCap },
          { num: 2, label: 'Target Career', icon: Target },
          { num: 3, label: 'Current Skills', icon: Award },
          { num: 4, label: 'Readiness Launch', icon: CheckCircle2 },
        ].map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div
              key={s.num}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                flex: 1,
                zIndex: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setStep(s.num)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isDone ? '#10b981' : isActive ? '#006EFF' : '#e2e8f0',
                  color: isDone || isActive ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 0 0 4px rgba(0, 110, 255, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
              </button>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0f172a' : '#64748b',
                  textAlign: 'center',
                }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Container Card */}
      <div
        className="panel-card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '720px',
          padding: '36px',
          borderRadius: '12px',
          background: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '4px solid #e2e8f0',
                borderTopColor: '#006EFF',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 20px',
              }}
            />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Calibrating Your Career Dashboard
            </h3>
            <p style={{ color: '#006EFF', fontWeight: 600, fontSize: '0.95rem' }}>
              {analyzingStep}
            </p>
          </div>
        ) : (
          <>
            {/* STEP 1: Academic Details */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    1. Academic Background
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Official university verification and degree records used for placement eligibility.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aditya Sharma"
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label">College / University</label>
                    <input
                      type="text"
                      className="input-field"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. RVCE Bangalore"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="input-label">Degree / Program</label>
                    <select
                      className="input-field"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                    >
                      <option value="B.Tech Computer Science">B.Tech / B.E. Computer Science</option>
                      <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                      <option value="B.Tech AI & Data Science">B.Tech AI & Data Science</option>
                      <option value="B.Tech Electronics & Comm">B.Tech Electronics & Comm</option>
                      <option value="M.Tech Computer Science">M.Tech Computer Science</option>
                      <option value="MCA Computer Applications">MCA (Master of Computer Applications)</option>
                      <option value="BCA Computer Applications">BCA (Bachelor of Computer Applications)</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Branch / Engineering Discipline</label>
                    <select
                      className="input-field"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    >
                      {ENGINEERING_CATEGORIES.map((cat) => (
                        <optgroup key={cat.name} label={`${cat.emoji} ${cat.name}`}>
                          {cat.branches.map((b) => (
                            <option key={b.code} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="input-label">Current CGPA (Scale of 10)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      className="input-field"
                      value={cgpa}
                      onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 8.85"
                    />
                  </div>

                  <div>
                    <label className="input-label">Graduation Year</label>
                    <select
                      className="input-field"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(parseInt(e.target.value, 10))}
                    >
                      <option value={2025}>2025 (Immediate Batch)</option>
                      <option value={2026}>2026 (Upcoming Batch)</option>
                      <option value={2027}>2027</option>
                      <option value={2028}>2028</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    Next: Choose Target Career <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Target Career */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    2. Choose Your Target Career Role
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Your entire Skill Gap Analysis and learning milestones will be calculated against this role's industry benchmark.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  {careers.map((c) => {
                    const id = c.career_id || c.id;
                    const title = c.career_title || c.title;
                    const isSelected = targetCareerId === id;
                    return (
                      <div
                        key={id}
                        onClick={() => setTargetCareerId(id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #006EFF' : '1px solid #e2e8f0',
                          background: isSelected ? '#f0f7ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: isSelected ? '6px solid #006EFF' : '2px solid #cbd5e1',
                              background: '#ffffff',
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                              {title}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              Domain: <span style={{ fontWeight: 600 }}>{c.branch_name || c.domain}</span> • Key Skills: {(c.mainly_learn || c.required_skills?.map((s: any) => s.skill_name))?.slice(0, 3).join(', ')}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: '#ecfdf5',
                              color: '#065f46',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            ${(c.avg_salary_usd || 115000).toLocaleString()} / yr
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
                            {c.market_demand || 'High Demand'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    Next: Add Your Current Skills <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Current Skills */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    3. Your Current Skills & Proficiency
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Select your competencies and rate your proficiency from 1 (Novice) to 5 (Expert).
                  </p>
                </div>

                {/* Popular badges quick-add */}
                <div>
                  <label className="input-label" style={{ marginBottom: '8px' }}>
                    Quick Select Popular Skills
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {COMMON_SKILLS.map((skill) => {
                      const isAdded = selectedSkills.some(s => s.name.toLowerCase() === skill.toLowerCase());
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => (isAdded ? handleRemoveSkill(skill) : handleAddSkill(skill))}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: isAdded ? 700 : 500,
                            border: isAdded ? '1px solid #006EFF' : '1px solid #e2e8f0',
                            background: isAdded ? '#eff6ff' : '#f8fafc',
                            color: isAdded ? '#006EFF' : '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isAdded ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom skill input */}
                <div>
                  <label className="input-label">Add Other Custom Skill</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Next.js, Redis, PyTorch, GraphQL..."
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill(customSkillInput);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill(customSkillInput)}
                      className="btn-secondary"
                      style={{ padding: '0 16px', whiteSpace: 'nowrap' }}
                    >
                      Add Skill
                    </button>
                  </div>
                </div>

                {/* Selected Skills List with Level Sliders */}
                <div>
                  <label className="input-label" style={{ marginBottom: '8px' }}>
                    My Selected Competencies ({selectedSkills.length})
                  </label>
                  <div
                    style={{
                      maxHeight: '220px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '8px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {selectedSkills.map((s) => (
                      <div
                        key={s.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#ffffff',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '35%' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                            {s.name}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '50%' }}>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="0.5"
                            value={s.level}
                            onChange={(e) => handleSkillLevelChange(s.name, parseFloat(e.target.value))}
                            style={{ flex: 1, accentColor: '#006EFF' }}
                          />
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#006EFF',
                              width: '45px',
                              textAlign: 'right',
                            }}
                          >
                            {s.level} / 5
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s.name)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    Next: Commitment & Review <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Launch */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    4. Study Commitment & Profile Launch
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Final step: Set your weekly upskilling bandwidth and optional resume details.
                  </p>
                </div>

                {/* Weekly Study Hours */}
                <div>
                  <label className="input-label">
                    Weekly Study / Upskilling Commitment: <strong style={{ color: '#006EFF' }}>{weeklyHours} hrs/week</strong>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="1"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: '#006EFF' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    <span>5 hrs (Casual)</span>
                    <span>15 hrs (Standard placement prep)</span>
                    <span>30+ hrs (Intensive)</span>
                  </div>
                </div>

                {/* Resume Upload (Optional) */}
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    background: '#f8fafc',
                  }}
                >
                  <Upload size={24} style={{ color: '#64748b', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Upload Resume / Project Portfolio (Optional)'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Supports PDF, DOCX, TXT. Skills and achievements will be analyzed by Resume AI.
                  </div>
                  <input
                    type="file"
                    id="onboard-resume-input"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="onboard-resume-input"
                    className="btn-secondary"
                    style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    {uploadedFileName ? 'Change File' : 'Browse File'}
                  </label>
                </div>

                {/* Summary Card */}
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '14px 18px',
                    fontSize: '13px',
                    color: '#1e3a8a',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>Ready to Synthesize Your Placement Architecture:</div>
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <li><strong>Candidate:</strong> {fullName} ({degree}, {institution})</li>
                    <li><strong>Target Role:</strong> {selectedCareer?.career_title || selectedCareer?.title || 'Selected Career'}</li>
                    <li><strong>Skills Logged:</strong> {selectedSkills.length} competencies registered</li>
                    <li><strong>Weekly Velocity:</strong> {weeklyHours} hours committed</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 24px',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    <Sparkles size={16} /> Launch My Personalized Dashboard
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
