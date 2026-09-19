import React, { useState, useEffect } from 'react';
import { assessmentsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  BookOpenCheck,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  Check,
  X
} from 'lucide-react';

export const AssessmentsPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const res = await assessmentsApi.getAssessments();
      setAssessments(res.data);
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (assessmentId: string) => {
    try {
      const res = await assessmentsApi.getAssessmentQuiz(assessmentId);
      setActiveQuiz(res.data);
      setSelectedAnswers({});
      setQuizResult(null);
    } catch (err) {
      console.error('Failed to start quiz:', err);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const res = await assessmentsApi.submitAssessment(activeQuiz.id, selectedAnswers);
      setQuizResult(res.data);
      if (res.data.passed) {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
      await refreshProfile();
    } catch (err) {
      console.error('Assessment submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Interactive Skill Assessments</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
          Verify your self-reported skill ratings through timed quizzes to elevate your profile credibility.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Loading assessment catalog...</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {assessments.map((asm) => (
            <div
              key={asm.id}
              className="glass-card glass-card-interactive"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '18px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="badge badge-indigo">{asm.category}</span>
                  <span className="badge badge-cyan">{asm.difficulty}</span>
                </div>

                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '8px' }}>{asm.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                  Validates core competency in {asm.skill_name}. Passing automatically awards verified status.
                </p>

                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '0.8rem', color: '#d1d5db' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="#fbbf24" />
                    <span>{asm.time_limit_mins} Mins</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} color="#34d399" />
                    <span>Pass Score: {asm.pass_score}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HelpCircle size={14} color="#818cf8" />
                    <span>{asm.total_questions} Questions</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartQuiz(asm.id)}
                className="btn-primary"
                style={{ padding: '10px 16px', fontSize: '0.875rem' }}
              >
                <Play size={16} />
                <span>Start Assessment Quiz</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Quiz Modal */}
      {activeQuiz && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-indigo" style={{ marginBottom: '6px' }}>
                  {activeQuiz.skill_name}
                </span>
                <h2 style={{ fontSize: '1.4rem' }}>{activeQuiz.title}</h2>
              </div>

              <button
                onClick={() => setActiveQuiz(null)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {quizResult ? (
              /* Quiz Result Display */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '20px 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: quizResult.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    color: quizResult.passed ? '#34d399' : '#fb7185',
                  }}
                >
                  {quizResult.passed ? <Check size={36} /> : <X size={36} />}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '6px' }}>
                    {quizResult.passed ? 'Assessment Passed!' : 'Assessment Incomplete'}
                  </h3>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: quizResult.passed ? '#34d399' : '#fb7185' }}>
                    {quizResult.score_pct}% Score
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '6px' }}>
                    Answered {quizResult.correct_count} of {quizResult.total_questions} questions correctly.
                  </p>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '16px',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    color: '#d1d5db',
                    lineHeight: 1.5,
                  }}
                >
                  {quizResult.explanation}
                </div>

                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    loadAssessments();
                  }}
                  className="btn-primary"
                  style={{ margin: '0 auto', padding: '10px 24px' }}
                >
                  Back to Assessments
                </button>
              </div>
            ) : (
              /* Quiz Questions Form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activeQuiz.questions.map((q: any, qIdx: number) => (
                  <div
                    key={q.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '20px',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f3f4f6' }}>
                      {qIdx + 1}. {q.question_text}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt: string, optIdx: number) => (
                        <label
                          key={optIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: selectedAnswers[q.id] === optIdx ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                            border: selectedAnswers[q.id] === optIdx ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.06)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            color: selectedAnswers[q.id] === optIdx ? '#ffffff' : '#d1d5db',
                          }}
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            checked={selectedAnswers[q.id] === optIdx}
                            onChange={() => handleSelectOption(q.id, optIdx)}
                            style={{ accentColor: '#6366f1' }}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <button onClick={() => setActiveQuiz(null)} className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting || Object.keys(selectedAnswers).length < activeQuiz.questions.length}
                    className="btn-primary"
                    style={{ padding: '10px 24px' }}
                  >
                    {submitting ? 'Grading Answers...' : 'Submit Assessment'}
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
