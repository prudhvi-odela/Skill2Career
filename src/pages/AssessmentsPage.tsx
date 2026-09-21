import React, { useState, useEffect } from 'react';
import {
  Award, CheckCircle2, XCircle, Clock, BookOpen, Search,
  ArrowRight, RotateCcw, Sparkles, ExternalLink, Filter, AlertCircle, ShieldCheck
} from 'lucide-react';
import { apiFetch } from '../lib/api';

interface LearningResource {
  title: string;
  url: string;
  category: string;
  description: string;
}

interface AssessmentQuestion {
  id: string;
  question_text: string;
  options_json: string[];
  correct_option_index?: number;
  explanation?: string;
}

interface AssessmentItem {
  id: string;
  skill_id: string;
  title: string;
  category: string;
  domain: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  time_limit_minutes: number;
  pass_score: number;
  questions_count: number;
  learning_resources: LearningResource[];
}

interface QuizState {
  assessment: AssessmentItem;
  questions: AssessmentQuestion[];
  currentIdx: number;
  answers: Record<string, number>;
  timeRemainingSeconds: number;
  isSubmitting: boolean;
  result: any | null;
}

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuiz, setActiveQuiz] = useState<QuizState | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Timer countdown for active quiz
  useEffect(() => {
    if (!activeQuiz || activeQuiz.result || activeQuiz.timeRemainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setActiveQuiz((prev) => {
        if (!prev || prev.result) return prev;
        if (prev.timeRemainingSeconds <= 1) {
          // Time expired -> auto submit
          clearInterval(timer);
          handleSubmitQuiz(prev);
          return { ...prev, timeRemainingSeconds: 0 };
        }
        return { ...prev, timeRemainingSeconds: prev.timeRemainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz?.assessment?.id, activeQuiz?.result]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/assessments');
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch (err) {
      console.warn('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (assessment: AssessmentItem) => {
    try {
      const res = await apiFetch(`/assessments/${assessment.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setActiveQuiz({
          assessment,
          questions: fullData.questions || [],
          currentIdx: 0,
          answers: {},
          timeRemainingSeconds: (assessment.time_limit_minutes || 10) * 60,
          isSubmitting: false,
          result: null
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      alert('Could not start assessment. Please try again.');
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (!activeQuiz || activeQuiz.result) return;
    setActiveQuiz((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: optionIndex
        }
      };
    });
  };

  const handleSubmitQuiz = async (stateToSubmit?: QuizState) => {
    const quiz = stateToSubmit || activeQuiz;
    if (!quiz || quiz.isSubmitting) return;

    setActiveQuiz((prev) => (prev ? { ...prev, isSubmitting: true } : null));

    try {
      const res = await apiFetch('/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: quiz.assessment.id,
          skill_id: quiz.assessment.skill_id,
          answers: quiz.answers
        })
      });

      if (res.ok) {
        const resultData = await res.json();
        setActiveQuiz((prev) => (prev ? { ...prev, isSubmitting: false, result: resultData } : null));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Submit failed');
      }
    } catch (err) {
      alert('Error submitting assessment. Please retry.');
      setActiveQuiz((prev) => (prev ? { ...prev, isSubmitting: false } : null));
    }
  };

  const categories = ['All', ...Array.from(new Set(assessments.map((a) => a.category)))];

  const filteredAssessments = assessments.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* ── Active Quiz Runner ── */}
      {activeQuiz && (
        <div style={{ marginBottom: '40px' }}>
          {!activeQuiz.result ? (
            /* Question taking state */
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
                overflow: 'hidden'
              }}
            >
              {/* Quiz Header Bar */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  padding: '20px 28px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        background: '#3b82f6',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700
                      }}
                    >
                      {activeQuiz.assessment.category}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Pass Target: {activeQuiz.assessment.pass_score}%
                    </span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
                    {activeQuiz.assessment.title}
                  </h2>
                </div>

                {/* Timer & Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: activeQuiz.timeRemainingSeconds < 120 ? '#ef4444' : 'rgba(255, 255, 255, 0.12)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '15px'
                    }}
                  >
                    <Clock size={18} />
                    <span>{formatTime(activeQuiz.timeRemainingSeconds)}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to exit? Your answers will not be saved.')) {
                        setActiveQuiz(null);
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#cbd5e1',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Exit Quiz
                  </button>
                </div>
              </div>

              {/* Quiz Body */}
              <div style={{ padding: '28px' }}>
                {/* Question progress */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                    Question {activeQuiz.currentIdx + 1} of {activeQuiz.questions.length}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {Object.keys(activeQuiz.answers).length} answered
                  </span>
                </div>

                {/* Progress Indicators */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
                  {activeQuiz.questions.map((q, idx) => {
                    const answered = activeQuiz.answers[q.id] !== undefined;
                    const isCurrent = activeQuiz.currentIdx === idx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setActiveQuiz((prev) => (prev ? { ...prev, currentIdx: idx } : null))}
                        style={{
                          flex: 1,
                          height: '6px',
                          borderRadius: '3px',
                          border: 'none',
                          cursor: 'pointer',
                          background: isCurrent ? '#006EFF' : answered ? '#10b981' : '#e2e8f0',
                          transition: 'all 0.2s'
                        }}
                        title={`Go to Question ${idx + 1}`}
                      />
                    );
                  })}
                </div>

                {/* Current Question */}
                {activeQuiz.questions[activeQuiz.currentIdx] && (
                  <div>
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: 1.5,
                        marginBottom: '20px'
                      }}
                    >
                      {activeQuiz.questions[activeQuiz.currentIdx].question_text}
                    </h3>

                    {/* Options list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                      {activeQuiz.questions[activeQuiz.currentIdx].options_json.map((option, optIdx) => {
                        const qId = activeQuiz.questions[activeQuiz.currentIdx].id;
                        const isSelected = activeQuiz.answers[qId] === optIdx;

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(qId, optIdx)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '14px',
                              padding: '16px 20px',
                              borderRadius: '10px',
                              border: isSelected ? '2px solid #006EFF' : '1px solid #e2e8f0',
                              background: isSelected ? '#eff6ff' : '#f8fafc',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                border: isSelected ? '6px solid #006EFF' : '2px solid #cbd5e1',
                                background: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            />
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: isSelected ? 600 : 500,
                                color: isSelected ? '#1e3a8a' : '#334155'
                              }}
                            >
                              {option}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() =>
                          setActiveQuiz((prev) =>
                            prev ? { ...prev, currentIdx: Math.max(0, prev.currentIdx - 1) } : null
                          )
                        }
                        disabled={activeQuiz.currentIdx === 0}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '13px',
                          border: 'none',
                          cursor: activeQuiz.currentIdx === 0 ? 'not-allowed' : 'pointer',
                          opacity: activeQuiz.currentIdx === 0 ? 0.5 : 1
                        }}
                      >
                        ← Previous
                      </button>

                      {activeQuiz.currentIdx < activeQuiz.questions.length - 1 ? (
                        <button
                          onClick={() =>
                            setActiveQuiz((prev) =>
                              prev
                                ? { ...prev, currentIdx: Math.min(prev.questions.length - 1, prev.currentIdx + 1) }
                                : null
                            )
                          }
                          style={{
                            padding: '10px 22px',
                            borderRadius: '8px',
                            background: '#006EFF',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Next Question →
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubmitQuiz()}
                          disabled={activeQuiz.isSubmitting}
                          style={{
                            padding: '10px 28px',
                            borderRadius: '8px',
                            background: '#10b981',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '14px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {activeQuiz.isSubmitting ? 'Evaluating Score...' : 'Submit Assessment ✓'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Assessment Results View */
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
                overflow: 'hidden'
              }}
            >
              {/* Score Header */}
              <div
                style={{
                  background: activeQuiz.result.passed
                    ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
                    : 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)',
                  padding: '32px',
                  color: '#ffffff',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  {activeQuiz.result.passed ? <Award size={36} /> : <AlertCircle size={36} />}
                </div>

                <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px' }}>
                  {activeQuiz.result.passed ? 'Assessment Passed! 🎉' : 'Needs More Preparation'}
                </h2>
                <p style={{ fontSize: '15px', color: '#e2e8f0', maxWidth: '600px', margin: '0 auto 20px' }}>
                  {activeQuiz.result.feedback}
                </p>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '24px', background: 'rgba(0,0,0,0.2)', padding: '12px 28px', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Score</div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>{activeQuiz.result.score_percentage}%</div>
                  </div>
                  <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)' }} />
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Correct Answers</div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>{activeQuiz.result.correct_count} / {activeQuiz.result.total_questions}</div>
                  </div>
                  <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)' }} />
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Required</div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>{activeQuiz.result.pass_score}%</div>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              {activeQuiz.result.passed && (
                <div
                  style={{
                    background: '#f0fdf4',
                    borderBottom: '1px solid #bbf7d0',
                    padding: '14px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#166534',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <span>
                    Verified Candidate Badge Earned! This skill status has been updated in your <strong>Student Profile</strong> and verified evidence portfolio.
                  </span>
                </div>
              )}

              {/* Breakdown by question */}
              <div style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                  Question Diagnostics & Explanations:
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  {activeQuiz.result.breakdown?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid',
                        borderColor: item.is_correct ? '#bbf7d0' : '#fecaca',
                        background: item.is_correct ? '#f0fdf4' : '#fff1f2',
                        borderRadius: '10px',
                        padding: '16px 20px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                        {item.is_correct ? (
                          <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                            {idx + 1}. {item.question_text}
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                            💡 <strong>Explanation:</strong> {item.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Curated Chrome Links */}
                {activeQuiz.result.learning_resources && activeQuiz.result.learning_resources.length > 0 && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <BookOpen size={18} className="text-blue-600" />
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Official Chrome Learning & Documentation Links:
                      </h4>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                      {activeQuiz.result.learning_resources.map((res: LearningResource, rIdx: number) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            padding: '12px 14px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#006EFF' }}>{res.title}</span>
                            <ExternalLink size={14} className="text-blue-500" />
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{res.description}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '14px' }}>
                  <button
                    onClick={() => handleStartQuiz(activeQuiz.assessment)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: '#006EFF',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <RotateCcw size={16} />
                    Retake Assessment
                  </button>

                  <button
                    onClick={() => setActiveQuiz(null)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: '#f1f5f9',
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Back to All Assessments
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Assessments Directory ── */}
      {!activeQuiz && (
        <>
          {/* Hero Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #006EFF 100%)',
              borderRadius: '16px',
              padding: '32px 36px',
              color: '#ffffff',
              marginBottom: '32px',
              boxShadow: '0 10px 25px -5px rgba(0, 110, 255, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={20} className="text-yellow-300 animate-pulse" />
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd' }}>
                Verified Candidate Skill Center
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 10px' }}>
              Topic Diagnostic Assessments
            </h1>
            <p style={{ fontSize: '15px', color: '#dbeafe', maxWidth: '720px', margin: 0, lineHeight: 1.5 }}>
              Benchmark your core competencies across Python, React, FastAPI, System Design, PyTorch, and Docker. Score <strong>70%+</strong> to earn verified profile badges and unlock premium employer recommendations.
            </p>

            <div style={{ display: 'flex', gap: '20px', marginTop: '24px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '10px 18px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#bfdbfe' }}>Available Quizzes</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{assessments.length || '16+'} Topics</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '10px 18px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#bfdbfe' }}>Pass Score</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>70.0% Minimum</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '10px 18px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#bfdbfe' }}>Profile Status</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>Instant Sync</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search topics (e.g. Python, SQL, FastAPI, System Design)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    background: selectedCategory === cat ? '#006EFF' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#475569',
                    border: selectedCategory === cat ? '1px solid #006EFF' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Assessments Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <div className="spinner spinner-primary" style={{ width: '32px', height: '32px', margin: '0 auto 12px' }} />
              <div>Loading diagnostic assessments...</div>
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <AlertCircle size={32} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>No assessments match your filter</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Try changing your search query or selecting a different category.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {filteredAssessments.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#006EFF',
                          background: '#eff6ff',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {item.category}
                      </span>

                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: item.difficulty === 'Advanced' ? '#b91c1c' : '#047857',
                          background: item.difficulty === 'Advanced' ? '#fef2f2' : '#ecfdf5',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {item.difficulty}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.4 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>
                      Domain: <strong>{item.domain}</strong>
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BookOpen size={14} className="text-blue-500" />
                        <span>{item.questions_count} Questions</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} className="text-amber-500" />
                        <span>{item.time_limit_minutes} Mins</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Award size={14} className="text-emerald-500" />
                        <span>Pass: {item.pass_score}%</span>
                      </div>
                    </div>

                    {/* Learning resources tags */}
                    {item.learning_resources && item.learning_resources.length > 0 && (
                      <div style={{ marginBottom: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {item.learning_resources.slice(0, 2).map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '11px',
                              color: '#2563eb',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <span>{res.title}</span>
                            <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartQuiz(item)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#006EFF',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'background 0.15s'
                    }}
                  >
                    <span>Start Assessment</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default AssessmentsPage;
