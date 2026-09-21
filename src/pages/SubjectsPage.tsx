import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { curriculumApi, studentApi } from '../api/client';

export const SubjectsPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [learningProfile, setLearningProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Diagnostic Quiz Modal State
  const [activeQuizSubject, setActiveQuizSubject] = useState<any | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);

  useEffect(() => {
    loadSubjectsData();
  }, []);

  const loadSubjectsData = async () => {
    try {
      setLoading(true);
      const [profRes, learnProfRes] = await Promise.all([
        studentApi.getProfile(),
        curriculumApi.getLearningProfile().catch(() => ({ data: null }))
      ]);

      setProfile(profRes.data);
      setLearningProfile(learnProfRes.data);

      const branch = profRes.data.major_or_branch || 'CSE';
      const subRes = await curriculumApi.getSubjects(branch);
      setSubjects(subRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfRating = async (subjectCode: string, rating: number) => {
    try {
      await curriculumApi.recordSubjectBaseline(subjectCode, {
        rating_type: 'SELF_RATING',
        proficiency_level: rating
      });
      loadSubjectsData();
    } catch (err) {
      console.error(err);
    }
  };

  const openDiagnosticQuiz = async (subject: any) => {
    try {
      const res = await curriculumApi.getDiagnosticQuiz(subject.subject_code || subject.id);
      setActiveQuizSubject(subject);
      setQuizQuestions(res.data.questions || []);
      setQuizAnswers({});
      setQuizResult(null);
    } catch (err) {
      alert('Diagnostic quiz questions are not available for this subject.');
    }
  };

  const submitQuiz = async () => {
    if (!activeQuizSubject) return;
    try {
      setSubmittingQuiz(true);
      const res = await curriculumApi.submitDiagnostic(
        activeQuizSubject.subject_code || activeQuizSubject.id,
        quizAnswers
      );
      setQuizResult(res.data);
      loadSubjectsData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to evaluate diagnostic test.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const filteredSubjects = subjects.filter(s => {
    const matchesYear = selectedYear === 0 || s.academic_year === selectedYear;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
        Loading curriculum subjects & baseline records...
      </div>
    );
  }

  const branchName = profile?.major_or_branch || 'Computer Science & Engineering (CSE)';

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
          padding: '28px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>
              <BookOpen size={14} /> CURRICULUM ENGINE
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0' }}>
              Branch Curriculum: {branchName}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Official curriculum subjects mapped to canonical skills, diagnostic baseline tests, and verified learning resources.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '12px 18px',
                borderRadius: '10px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa' }}>{subjects.length}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL SUBJECTS</div>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '12px 18px',
                borderRadius: '10px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                {learningProfile?.subject_strengths?.length || 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>STRENGTHS</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search subjects by name or concept..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 0, label: 'All Years' },
              { id: 1, label: 'Year 1' },
              { id: 2, label: 'Year 2' },
              { id: 3, label: 'Year 3' },
              { id: 4, label: 'Year 4' }
            ].map(y => (
              <button
                key={y.id}
                type="button"
                onClick={() => setSelectedYear(y.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: selectedYear === y.id ? '#2563eb' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedYear === y.id ? '#fff' : '#94a3b8',
                  border: selectedYear === y.id ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {y.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filteredSubjects.map(sub => {
          const strengthInfo = learningProfile?.subject_strengths?.find((s: any) => s.subject_code === sub.subject_code);
          const gapInfo = learningProfile?.subject_gaps?.find((s: any) => s.subject_code === sub.subject_code);
          const profLevel = strengthInfo?.proficiency_level || gapInfo?.proficiency_level || 0;

          return (
            <div
              key={sub.subject_code}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>
                      Year {sub.academic_year} • Sem {sub.semester}
                    </span>
                    {sub.is_core && (
                      <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        CORE
                      </span>
                    )}
                  </div>

                  {profLevel >= 3.5 ? (
                    <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      Strength ({profLevel}/5)
                    </span>
                  ) : profLevel > 0 ? (
                    <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      Developing ({profLevel}/5)
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      Unassessed
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px 0' }}>
                  {sub.name}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                  {sub.description}
                </p>

                {/* Verified Resources Links */}
                {sub.learning_resources && sub.learning_resources.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '6px', letterSpacing: '0.04em' }}>
                      VERIFIED LEARNING RESOURCES
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {sub.learning_resources.map((res: any, idx: number) => (
                        <a
                          key={idx}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#93c5fd',
                            fontSize: '0.78rem',
                            textDecoration: 'none',
                            padding: '4px 8px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.04)'
                          }}
                        >
                          <ExternalLink size={12} />
                          <span style={{ fontWeight: 600 }}>{res.title}</span>
                          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>({res.source})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        title={`Rate myself: Level ${lvl}`}
                        onClick={() => handleSelfRating(sub.subject_code, lvl)}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '4px',
                          background: profLevel === lvl ? '#2563eb' : 'rgba(255,255,255,0.04)',
                          color: profLevel === lvl ? '#fff' : '#94a3b8',
                          border: profLevel === lvl ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  {sub.has_diagnostic_quiz && (
                    <button
                      type="button"
                      onClick={() => openDiagnosticQuiz(sub)}
                      style={{
                        background: 'rgba(52, 211, 153, 0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Award size={13} /> Quick Test
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostic Quiz Modal */}
      {activeQuizSubject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
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
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Subject Diagnostic: {activeQuizSubject.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>~10 minutes • Updates Authoritative Skill Evidence</span>
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
                    disabled={submittingQuiz}
                    onClick={submitQuiz}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {submittingQuiz ? 'Evaluating...' : 'Submit Diagnostic Test'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    background: quizResult.passed ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: quizResult.passed ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    margin: '20px 0'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: quizResult.passed ? '#34d399' : '#f87171' }}>
                    {quizResult.score.toFixed(1)}%
                  </div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.1rem', marginTop: '4px' }}>
                    {quizResult.passed ? 'Demonstrated Subject Competency!' : 'Diagnostic Recorded - Practice Recommended'}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '8px 0 0 0' }}>
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
