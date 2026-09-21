import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Target,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import { curriculumApi, careersApi } from '../api/client';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [programs, setPrograms] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);

  const [selectedProgram, setSelectedProgram] = useState<string>('BTECH');
  const [selectedBranch, setSelectedBranch] = useState<string>('CSE');
  const [academicYear, setAcademicYear] = useState<number>(3);
  const [weeklyHours, setWeeklyHours] = useState<number>(15);
  const [institution, setInstitution] = useState<string>('');
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [subjectRatings, setSubjectRatings] = useState<Record<string, number>>({});

  // Diagnostic Quiz State
  const [activeQuizSubject, setActiveQuizSubject] = useState<any | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);

  useEffect(() => {
    loadInitialCatalog();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      loadBranches(selectedProgram);
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedBranch) {
      loadSubjects(selectedBranch);
    }
  }, [selectedBranch]);

  const loadInitialCatalog = async () => {
    try {
      setLoading(true);
      const [progRes, carRes] = await Promise.all([
        curriculumApi.getPrograms(),
        careersApi.getCareers()
      ]);
      setPrograms(progRes.data || []);
      setCareers(carRes.data || []);
      if (progRes.data?.length > 0) {
        setSelectedProgram(progRes.data[0].program_code || 'BTECH');
      }
    } catch (err: any) {
      setError('Failed to load academic catalog. Using default curriculum options.');
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async (progId: string) => {
    try {
      const res = await curriculumApi.getBranches(progId);
      setBranches(res.data || []);
      if (res.data?.length > 0) {
        setSelectedBranch(res.data[0].branch_code || 'CSE');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSubjects = async (branchId: string) => {
    try {
      const res = await curriculumApi.getSubjects(branchId);
      setSubjects(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelfRating = async (subjectCode: string, rating: number) => {
    setSubjectRatings(prev => ({ ...prev, [subjectCode]: rating }));
    try {
      await curriculumApi.recordSubjectBaseline(subjectCode, {
        rating_type: 'SELF_RATING',
        proficiency_level: rating
      });
    } catch (err) {
      console.error(err);
    }
  };

  const startDiagnosticQuiz = async (subject: any) => {
    try {
      const res = await curriculumApi.getDiagnosticQuiz(subject.subject_code || subject.id);
      setActiveQuizSubject(subject);
      setQuizQuestions(res.data.questions || []);
      setQuizAnswers({});
      setQuizResult(null);
    } catch (err) {
      alert('Diagnostic quiz questions are not yet configured for this subject.');
    }
  };

  const submitQuiz = async () => {
    if (!activeQuizSubject) return;
    try {
      const res = await curriculumApi.submitDiagnostic(
        activeQuizSubject.subject_code || activeQuizSubject.id,
        quizAnswers
      );
      setQuizResult(res.data);
      setSubjectRatings(prev => ({
        ...prev,
        [activeQuizSubject.subject_code]: res.data.proficiency_level
      }));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit diagnostic assessment.');
    }
  };

  const handleFinishOnboarding = async () => {
    try {
      setSubmitting(true);
      await curriculumApi.completeOnboarding({
        program_id: selectedProgram,
        branch_id: selectedBranch,
        academic_year: academicYear,
        interests: [],
        target_career_id: selectedCareer || undefined,
        institution: institution || undefined,
        weekly_study_hours: weeklyHours
      });
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#9ca3af' }}>
        Loading academic curriculum engine...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          marginBottom: '32px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '16px'
          }}
        >
          <Sparkles size={14} /> Welcome to Skill2Career 2.0
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 10px 0' }}>
          Let's Understand Your Academic Foundation
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
          We configure your branch-specific curriculum, assess your current knowledge baseline, and build your personalized learning-to-career trajectory.
        </p>

        {/* Wizard Steps indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '28px' }}>
          {[
            { num: 1, label: 'Degree & Branch' },
            { num: 2, label: 'Academic Standing' },
            { num: 3, label: 'Subject Baseline' },
            { num: 4, label: 'Target Career' }
          ].map(s => (
            <div
              key={s.num}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: step === s.num ? '#60a5fa' : step > s.num ? '#34d399' : '#64748b',
                fontWeight: step === s.num ? 700 : 500,
                fontSize: '0.85rem'
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: step === s.num ? '#2563eb' : step > s.num ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.06)',
                  color: step > s.num ? '#34d399' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem'
                }}
              >
                {step > s.num ? 'Done' : s.num}
              </div>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.88rem'
          }}
        >
          {error}
        </div>
      )}

      {/* Step 1: Degree & Branch */}
      {step === 1 && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '28px',
            marginBottom: '24px'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap color="#60a5fa" /> Select Your Degree Program & Branch
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              ACADEMIC DEGREE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {programs.map(p => (
                <button
                  key={p.program_code}
                  type="button"
                  onClick={() => setSelectedProgram(p.program_code)}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    background: selectedProgram === p.program_code ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedProgram === p.program_code ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#f8fafc',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '4px' }}>{p.duration_years} Years</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              ACADEMIC MAJOR / BRANCH
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {branches.map(b => (
                <button
                  key={b.branch_code}
                  type="button"
                  onClick={() => setSelectedBranch(b.branch_code)}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    background: selectedBranch === b.branch_code ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedBranch === b.branch_code ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#f8fafc',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{b.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '4px' }}>{b.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
            <button
              onClick={() => setStep(2)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#2563eb',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Academic Standing */}
      {step === 2 && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '28px',
            marginBottom: '24px'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar color="#60a5fa" /> Academic Year & Study Commitment
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              CURRENT ACADEMIC YEAR
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[1, 2, 3, 4].map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setAcademicYear(y)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    background: academicYear === y ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: academicYear === y ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#f8fafc',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Year {y}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>Semesters {y * 2 - 1} & {y * 2}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              WEEKLY SELF-STUDY COMMITMENT: {weeklyHours} HOURS/WEEK
            </label>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={weeklyHours}
              onChange={e => setWeeklyHours(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#3b82f6' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>
              <span>5 hrs (Casual)</span>
              <span>15 hrs (Recommended)</span>
              <span>40 hrs (Intensive)</span>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              INSTITUTION / UNIVERSITY (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="e.g. University Institute of Technology"
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: '#94a3b8',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#2563eb',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Continue to Subjects <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Subject Baseline */}
      {step === 3 && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '28px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen color="#60a5fa" /> Establish Your Current Subject Knowledge
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Branch: <strong style={{ color: '#60a5fa' }}>{selectedBranch}</strong>
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '24px' }}>
            Rate your current comfort level in your core branch curriculum subjects, or take a quick diagnostic quiz to earn verified baseline evidence.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {subjects.map(s => {
              const curRating = subjectRatings[s.subject_code] || 0;
              return (
                <div
                  key={s.subject_code}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>{s.name}</span>
                        {s.is_core && (
                          <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            CORE
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 0 0' }}>{s.description}</p>
                    </div>

                    {s.has_diagnostic_quiz && (
                      <button
                        type="button"
                        onClick={() => startDiagnosticQuiz(s)}
                        style={{
                          background: 'rgba(52, 211, 153, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(52, 211, 153, 0.3)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Award size={13} /> Quick Diagnostic
                      </button>
                    )}
                  </div>

                  {/* Level Rating Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>LEVEL:</span>
                    {[
                      { lvl: 1, label: 'Beginner' },
                      { lvl: 2, label: 'Basic' },
                      { lvl: 3, label: 'Developing' },
                      { lvl: 4, label: 'Strong' },
                      { lvl: 5, label: 'Advanced' }
                    ].map(r => (
                      <button
                        key={r.lvl}
                        type="button"
                        onClick={() => handleSelfRating(s.subject_code, r.lvl)}
                        style={{
                          background: curRating === r.lvl ? '#2563eb' : 'rgba(255,255,255,0.04)',
                          color: curRating === r.lvl ? '#fff' : '#94a3b8',
                          border: curRating === r.lvl ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {r.lvl} - {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
            <button
              onClick={() => setStep(2)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: '#94a3b8',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#2563eb',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Continue to Career Target <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Target Career Interest */}
      {step === 4 && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '28px',
            marginBottom: '24px'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target color="#60a5fa" /> Choose an Optional Target Career
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '24px' }}>
            Your academic branch informs initial recommendations, but you can select any target career. You can also change this anytime later.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {careers.map(c => {
              const code = c.career_code || c.id;
              const isSelected = selectedCareer === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setSelectedCareer(isSelected ? '' : code)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#f8fafc',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{c.title}</div>
                  <div style={{ color: '#60a5fa', fontSize: '0.78rem', marginTop: '2px' }}>{c.domain}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '6px', lineClamp: 2 }}>{c.description}</div>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
            <button
              onClick={() => setStep(3)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: '#94a3b8',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              disabled={submitting}
              onClick={handleFinishOnboarding}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff',
                padding: '12px 32px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Constructing Learning Path...' : 'Launch My Dashboard'}
            </button>
          </div>
        </div>
      )}

      {/* Diagnostic Quiz Modal */}
      {activeQuizSubject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Diagnostic Test: {activeQuizSubject.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>~10 minutes • Automatic Evidence Logging</span>
              </div>
              <button
                onClick={() => setActiveQuizSubject(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

            {!quizResult ? (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '20px 0' }}>
                  {quizQuestions.map((q, idx) => (
                    <div key={q.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem', marginBottom: '10px' }}>
                        {idx + 1}. {q.question_text}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options?.map((opt: string, oIdx: number) => {
                          const isSelected = quizAnswers[q.id] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '6px',
                                textAlign: 'left',
                                background: isSelected ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255,255,255,0.03)',
                                border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                                color: isSelected ? '#93c5fd' : '#cbd5e1',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    onClick={() => setActiveQuizSubject(null)}
                    style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitQuiz}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Submit Test & Record Evidence
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    background: quizResult.passed ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: quizResult.passed ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    margin: '20px 0'
                  }}
                >
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: quizResult.passed ? '#34d399' : '#f87171' }}>
                    {quizResult.score.toFixed(1)}%
                  </div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                    {quizResult.passed ? 'Demonstrated Competency Verified!' : 'Diagnostic Completed - Needs Practice'}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '8px 0 0 0' }}>
                    Assessed Level: <strong>{quizResult.proficiency_level} / 5.0</strong> • Verified Evidence Recorded: {quizResult.evidence_created ? 'Yes' : 'No'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setActiveQuizSubject(null)}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
