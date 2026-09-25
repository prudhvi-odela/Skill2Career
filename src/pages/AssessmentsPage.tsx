import React, { useState, useEffect, useMemo } from 'react';
import {
  Award, CheckCircle2, XCircle, Clock, BookOpen, Search,
  ArrowRight, RotateCcw, Sparkles, ExternalLink, Filter, AlertCircle, ShieldCheck,
  Plus, Compass, Layers, Briefcase, ChevronRight, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
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
  branch_code?: string;
  branch_name?: string;
  role?: string;
  subject?: string;
  topic?: string;
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

const BRANCH_OPTIONS = [
  { code: 'All', name: 'All Disciplines', emoji: '🌐' },
  { code: 'CSE', name: 'Computer Science (CSE)', emoji: '💻' },
  { code: 'ECE', name: 'Electronics & Comm (ECE)', emoji: '⚡' },
  { code: 'MECH', name: 'Mechanical (MECH)', emoji: '⚙️' },
  { code: 'CIVIL', name: 'Civil & Infra (CIVIL)', emoji: '🏗️' },
  { code: 'EE', name: 'Electrical (EE)', emoji: '🔌' },
  { code: 'CHEM', name: 'Chemical (CHEM)', emoji: '⚗️' },
  { code: 'BIOTECH', name: 'Biotechnology (BIOTECH)', emoji: '🧬' },
  { code: 'AERO', name: 'Aerospace (AERO)', emoji: '🚀' },
  { code: 'ROBOTICS', name: 'Robotics & Automation', emoji: '🤖' },
  { code: 'DS', name: 'Data Science & AI', emoji: '📊' }
];

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuiz, setActiveQuiz] = useState<QuizState | null>(null);

  // Dynamic Generator State
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [genBranch, setGenBranch] = useState('CSE');
  const [genRole, setGenRole] = useState('');
  const [genSubject, setGenSubject] = useState('');
  const [genTopic, setGenTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
        if (resultData.passed) {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Submit failed');
      }
    } catch (err) {
      alert('Error submitting assessment. Please retry.');
      setActiveQuiz((prev) => (prev ? { ...prev, isSubmitting: false } : null));
    }
  };

  const handleGenerateOnDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) {
      alert('Please enter a topic to generate an assessment.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await apiFetch('/assessments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: genBranch,
          role: genRole.trim() || `${genBranch} Specialist`,
          subject: genSubject.trim() || 'Core Engineering Subject',
          topic: genTopic.trim()
        })
      });

      if (res.ok) {
        const generated = await res.json();
        setShowGeneratorModal(false);
        setGenTopic('');
        setGenRole('');
        setGenSubject('');
        await fetchAssessments();
        // Start immediately
        handleStartQuiz(generated);
      }
    } catch (err) {
      alert('Could not generate assessment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Derive unique Subjects and Roles available for the current branch selection
  const branchFilteredList = useMemo(() => {
    if (selectedBranch === 'All') return assessments;
    return assessments.filter((a) => a.branch_code?.toUpperCase() === selectedBranch.toUpperCase());
  }, [assessments, selectedBranch]);

  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    branchFilteredList.forEach((a) => {
      if (a.role) set.add(a.role);
    });
    return ['All', ...Array.from(set)];
  }, [branchFilteredList]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    branchFilteredList.forEach((a) => {
      if (a.subject) set.add(a.subject);
    });
    return ['All', ...Array.from(set)];
  }, [branchFilteredList]);

  const filteredAssessments = useMemo(() => {
    return branchFilteredList.filter((item) => {
      const matchesRole = selectedRole === 'All' || item.role === selectedRole;
      const matchesSub = selectedSubject === 'All' || item.subject === selectedSubject;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.topic && item.topic.toLowerCase().includes(q)) ||
        (item.subject && item.subject.toLowerCase().includes(q)) ||
        (item.role && item.role.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q);

      return matchesRole && matchesSub && matchesSearch;
    });
  }, [branchFilteredList, selectedRole, selectedSubject, searchQuery]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1360px', margin: '0 auto' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
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
                      {activeQuiz.assessment.branch_code || 'ENG'} · {activeQuiz.assessment.category}
                    </span>
                    {activeQuiz.assessment.subject && (
                      <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.15)', color: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                        Subject: {activeQuiz.assessment.subject}
                      </span>
                    )}
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
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            />
                            <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: isSelected ? 600 : 400 }}>
                              {option}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Question navigation footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => setActiveQuiz((prev) => (prev ? { ...prev, currentIdx: Math.max(0, prev.currentIdx - 1) } : null))}
                        disabled={activeQuiz.currentIdx === 0}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: activeQuiz.currentIdx === 0 ? 'not-allowed' : 'pointer',
                          opacity: activeQuiz.currentIdx === 0 ? 0.5 : 1
                        }}
                      >
                        ← Previous
                      </button>

                      {activeQuiz.currentIdx < activeQuiz.questions.length - 1 ? (
                        <button
                          onClick={() => setActiveQuiz((prev) => (prev ? { ...prev, currentIdx: prev.currentIdx + 1 } : null))}
                          style={{
                            padding: '10px 24px',
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
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>{activeQuiz.result.score_percentage ?? activeQuiz.result.score ?? 0}%</div>
                  </div>
                  <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)' }} />
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Correct Answers</div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>{activeQuiz.result.correct_count} / {activeQuiz.result.total_questions}</div>
                  </div>
                  <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)' }} />
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Required</div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>{activeQuiz.assessment.pass_score}%</div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ padding: '20px 28px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                  Review Your Detailed Answer Breakdown:
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleStartQuiz(activeQuiz.assessment)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RotateCcw size={14} /> Retake Assessment
                  </button>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      background: '#006EFF',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Done & Back to Assessments
                  </button>
                </div>
              </div>

              {/* Question Explanations */}
              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeQuiz.questions.map((q, idx) => {
                  const userAnswer = activeQuiz.answers[q.id];
                  const isCorrect = userAnswer === q.correct_option_index;

                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: '18px 22px',
                        borderRadius: '12px',
                        border: isCorrect ? '1px solid #86efac' : '1px solid #fca5a5',
                        background: isCorrect ? '#f0fdf4' : '#fef2f2'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        {isCorrect ? <CheckCircle2 size={18} color="#16a34a" /> : <XCircle size={18} color="#dc2626" />}
                        <span style={{ fontSize: '13px', fontWeight: 700, color: isCorrect ? '#166534' : '#991b1b' }}>
                          Question {idx + 1} {isCorrect ? '— Correct' : '— Incorrect'}
                        </span>
                      </div>

                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px' }}>
                        {q.question_text}
                      </p>

                      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: '#64748b' }}>Your Answer: </span>
                        <strong style={{ color: isCorrect ? '#16a34a' : '#dc2626' }}>
                          {userAnswer !== undefined ? q.options_json[userAnswer] : 'Not Answered'}
                        </strong>
                      </div>

                      {!isCorrect && q.correct_option_index !== undefined && (
                        <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                          <span style={{ color: '#64748b' }}>Correct Answer: </span>
                          <strong style={{ color: '#16a34a' }}>{q.options_json[q.correct_option_index]}</strong>
                        </div>
                      )}

                      {q.explanation && (
                        <div style={{ fontSize: '12px', color: '#475569', background: 'rgba(255,255,255,0.7)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.06)', marginTop: '8px' }}>
                          <strong>Engineering Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Main Catalog View ── */}
      {!activeQuiz && (
        <>
          {/* Hero Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #006EFF 100%)',
              borderRadius: '16px',
              padding: '36px',
              color: '#ffffff',
              marginBottom: '32px',
              boxShadow: '0 10px 25px -5px rgba(0, 110, 255, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={20} className="text-yellow-300 animate-pulse" />
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd' }}>
                Universal Verified Assessment Center
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 10px' }}>
              Diagnostic Assessments Across Every Branch, Subject, Role & Topic
            </h1>
            <p style={{ fontSize: '15px', color: '#dbeafe', maxWidth: '820px', margin: 0, lineHeight: 1.5 }}>
              Benchmark verified competencies for <strong>CSE, ECE, Mechanical, Civil, Electrical, Chemical, Biotechnology, Aerospace, Robotics, and Data Science</strong>. 
              Take topic tests for each subject and role, or generate an on-demand assessment for any custom topic to earn verified badges.
            </p>

            <div style={{ display: 'flex', gap: '20px', marginTop: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '10px 18px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#bfdbfe' }}>Available Assessments</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{assessments.length || '35+'} Verified Quizzes</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '10px 18px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#bfdbfe' }}>Disciplines Covered</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>10 Engineering Fields</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '10px 18px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#bfdbfe' }}>Pass Score</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>70.0% Minimum</div>
              </div>

              {/* Generator Trigger Button */}
              <button
                onClick={() => setShowGeneratorModal(true)}
                style={{
                  marginLeft: 'auto',
                  background: '#ffffff',
                  color: '#1e3a8a',
                  fontWeight: 800,
                  fontSize: '13px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <Plus size={16} /> Test Any Topic On-Demand
              </button>
            </div>
          </div>

          {/* Discipline / Branch Selector Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Engineering Discipline:
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              {BRANCH_OPTIONS.map((b) => {
                const isSelected = selectedBranch === b.code;
                return (
                  <button
                    key={b.code}
                    onClick={() => {
                      setSelectedBranch(b.code);
                      setSelectedRole('All');
                      setSelectedSubject('All');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? '#006EFF' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? '1px solid #006EFF' : '1px solid #cbd5e1',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{b.emoji}</span>
                    <span>{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Filters (Role, Subject, Search) */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search topics (e.g. Verilog, Rankine, Concrete, Transistors, Distillation, CRISPR, Aerodynamics)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filter by Subject */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Filter by Role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assessments Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <div className="spinner spinner-primary" style={{ width: '32px', height: '32px', margin: '0 auto 12px' }} />
              <div>Loading engineering diagnostic assessments...</div>
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <AlertCircle size={32} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>No assessments match your current filters</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                You can generate a custom diagnostic assessment for any topic or subject instantly!
              </p>
              <button
                onClick={() => setShowGeneratorModal(true)}
                style={{
                  background: '#006EFF',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={15} /> Generate Assessment for this Topic
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {filteredAssessments.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#1e40af',
                            background: '#dbeafe',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          {item.branch_code || 'ENG'}
                        </span>
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
                      </div>

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

                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.4 }}>
                      {item.title}
                    </h3>

                    {/* Role and Subject metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                      {item.subject && (
                        <div>
                          Subject: <strong style={{ color: '#1e293b' }}>{item.subject}</strong>
                        </div>
                      )}
                      {item.role && (
                        <div>
                          Target Role: <strong style={{ color: '#1e293b' }}>{item.role}</strong>
                        </div>
                      )}
                    </div>

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

          {/* Modal: Generate On-Demand Assessment for ANY Subject/Role/Topic */}
          {showGeneratorModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  maxWidth: '540px',
                  width: '100%',
                  padding: '28px',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} className="text-blue-600" />
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      Generate Topic Assessment
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowGeneratorModal(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
                  Enter any engineering subject, role, and topic. The engine will instantly create a verified 4-question diagnostic quiz tailored to that competency!
                </p>

                <form onSubmit={handleGenerateOnDemand} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Engineering Branch:
                    </label>
                    <select
                      value={genBranch}
                      onChange={(e) => setGenBranch(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {BRANCH_OPTIONS.filter((b) => b.code !== 'All').map((b) => (
                        <option key={b.code} value={b.code}>{b.emoji} {b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Target Role (e.g. VLSI Engineer, Thermal Analyst, Structural Designer):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Embedded Firmware Engineer"
                      value={genRole}
                      onChange={(e) => setGenRole(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Academic Subject (e.g. Thermodynamics, Concrete Design, Operating Systems):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Applied Thermodynamics"
                      value={genSubject}
                      onChange={(e) => setGenSubject(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Specific Topic to Test <span style={{ color: '#ef4444' }}>*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rankine Cycle Efficiency & Steam Superheating"
                      value={genTopic}
                      onChange={(e) => setGenTopic(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowGeneratorModal(false)}
                      style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isGenerating}
                      style={{
                        padding: '9px 20px',
                        borderRadius: '8px',
                        background: '#006EFF',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isGenerating ? 'Generating Quiz...' : 'Generate & Start Test →'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssessmentsPage;
