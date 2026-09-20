import React, { useState, useEffect } from 'react';
import { assessmentsApi, skillsApi } from '../api/client';
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
  Plus,
  Edit2,
  Trash2,
  Layers,
  X,
  ShieldCheck
} from 'lucide-react';
import { SkeletonLoader, EmptyState, ErrorState } from '../components/StateFeedback';

export const AssessmentsPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'take' | 'author'>('take');
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authoring state
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSkillId, setNewSkillId] = useState('');
  const [newCategory, setNewCategory] = useState('Frameworks');
  const [newDifficulty, setNewDifficulty] = useState('INTERMEDIATE');
  const [newTimeLimit, setNewTimeLimit] = useState(15);
  const [newPassScore, setNewPassScore] = useState(70);
  const [authorQuestions, setAuthorQuestions] = useState<any[]>([
    { question_text: '', options: ['', '', '', ''], correct_option: 0, explanation: '' }
  ]);
  const [authoringLoading, setAuthoringLoading] = useState(false);

  useEffect(() => {
    loadAssessments();
    skillsApi.getSkills().then((res: any) => setAllSkills(res.data)).catch(() => {});
  }, []);

  const loadAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await assessmentsApi.getAssessments();
      setAssessments(res.data);
    } catch (err: any) {
      console.error('Failed to load assessments:', err);
      setError(err.response?.data?.detail || 'Failed to load assessments catalog.');
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
    } catch (err: any) {
      console.error('Failed to start quiz:', err);
      alert(err.response?.data?.detail || 'Failed to load assessment questions.');
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
    } catch (err: any) {
      console.error('Assessment submission failed:', err);
      alert(err.response?.data?.detail || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Authoring Handlers
  const handleAddQuestionSlot = () => {
    setAuthorQuestions([
      ...authorQuestions,
      { question_text: '', options: ['', '', '', ''], correct_option: 0, explanation: '' }
    ]);
  };

  const handleUpdateQuestion = (idx: number, field: string, value: any) => {
    const updated = [...authorQuestions];
    updated[idx] = { ...updated[idx], [field]: value };
    setAuthorQuestions(updated);
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...authorQuestions];
    const opts = [...updated[qIdx].options];
    opts[optIdx] = value;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setAuthorQuestions(updated);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (authorQuestions.length <= 1) return;
    setAuthorQuestions(authorQuestions.filter((_, i) => i !== idx));
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillId) {
      alert('Please select an associated canonical skill.');
      return;
    }
    setAuthoringLoading(true);
    try {
      await assessmentsApi.createAssessment({
        skill_id: newSkillId,
        title: newTitle,
        category: newCategory,
        difficulty: newDifficulty,
        time_limit_mins: Number(newTimeLimit),
        pass_score: Number(newPassScore),
        questions: authorQuestions.map((q, idx) => ({
          question_text: q.question_text,
          options: q.options,
          correct_option: Number(q.correct_option),
          explanation: q.explanation || null,
          order_idx: idx,
        })),
      });
      await loadAssessments();
      setIsAuthorModalOpen(false);
      setNewTitle('');
      setNewSkillId('');
      setAuthorQuestions([{ question_text: '', options: ['', '', '', ''], correct_option: 0, explanation: '' }]);
      alert('Assessment authored and published successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to author assessment.');
    } finally {
      setAuthoringLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Interactive Skill Assessments</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Verify technical competency through timed diagnostic quizzes and expand the canonical assessment catalog.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsAuthorModalOpen(true)}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Author Assessment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('take')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'take' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'take' ? '#818cf8' : '#9ca3af',
            border: activeTab === 'take' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <BookOpenCheck size={16} />
          <span>Available Assessments ({assessments.length})</span>
        </button>
      </div>

      {loading ? (
        <SkeletonLoader rows={6} type="cards" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadAssessments} />
      ) : assessments.length === 0 ? (
        <EmptyState
          title="No Assessments Available"
          message="Assessment modules will appear here once registered in the catalog."
        />
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
                  Validates core competency in {asm.skill_name || 'the targeted discipline'}. Passing automatically awards verified status in your skill inventory.
                </p>

                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '0.8rem', color: '#d1d5db' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="#fbbf24" />
                    <span>{asm.time_limit_mins} Mins</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} color="#34d399" />
                    <span>Pass: {asm.pass_score}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HelpCircle size={14} color="#818cf8" />
                    <span>{asm.total_questions || 5} Questions</span>
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
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
              <div>
                <span className="badge badge-indigo" style={{ marginBottom: '4px' }}>{activeQuiz.category}</span>
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
              /* Quiz Result Outcome */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '20px 0' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: quizResult.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {quizResult.passed ? (
                    <CheckCircle2 size={48} color="#34d399" />
                  ) : (
                    <AlertCircle size={48} color="#f87171" />
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
                    {quizResult.passed ? 'Assessment Passed! Verified Skill Awarded.' : 'Assessment Incomplete'}
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
                    You scored <strong style={{ color: quizResult.passed ? '#34d399' : '#f87171' }}>{quizResult.score_percentage}%</strong> ({quizResult.correct_count}/{quizResult.total_questions} correct).
                    Passing threshold was {quizResult.pass_score}%.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="btn-primary"
                    style={{ padding: '10px 24px' }}
                  >
                    Return to Assessments
                  </button>
                </div>
              </div>
            ) : (
              /* Questions Flow */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activeQuiz.questions.map((q: any, idx: number) => (
                  <div
                    key={q.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600, marginBottom: '6px' }}>
                      Question {idx + 1} of {activeQuiz.questions.length}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginBottom: '14px' }}>
                      {q.question_text}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            style={{
                              textAlign: 'left',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                              border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                              color: isSelected ? '#ffffff' : '#d1d5db',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveQuiz(null)}
                    className="btn-secondary"
                    style={{ padding: '10px 20px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={submitting || Object.keys(selectedAnswers).length === 0}
                    className="btn-primary"
                    style={{ padding: '10px 24px' }}
                  >
                    {submitting ? 'Evaluating...' : 'Submit Answers for Scoring'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Authoring Modal */}
      {isAuthorModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem' }}>Author New Skill Assessment</h2>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Create standardized diagnostic questions linked to canonical skills.</p>
              </div>
              <button
                onClick={() => setIsAuthorModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Assessment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Docker Architecture Assessment"
                    className="input-field"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Target Skill</label>
                  <select
                    className="input-field"
                    required
                    value={newSkillId}
                    onChange={(e) => setNewSkillId(e.target.value)}
                  >
                    <option value="">-- Select Canonical Skill --</option>
                    {allSkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id} • {s.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Category</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Difficulty</label>
                  <select
                    className="input-field"
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Time Limit (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    required
                    className="input-field"
                    value={newTimeLimit}
                    onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="input-label">Pass Score (%)</label>
                  <input
                    type="number"
                    min="40"
                    max="100"
                    required
                    className="input-field"
                    value={newPassScore}
                    onChange={(e) => setNewPassScore(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '1.05rem', color: '#ffffff' }}>Questions ({authorQuestions.length})</h4>
                  <button
                    type="button"
                    onClick={handleAddQuestionSlot}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <Plus size={14} />
                    <span>Add Question</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {authorQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8' }}>
                          Question #{qIdx + 1}
                        </span>
                        {authorQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Enter the question text..."
                        className="input-field"
                        value={q.question_text}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'question_text', e.target.value)}
                      />

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {q.options.map((opt: string, optIdx: number) => (
                          <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correct_option === optIdx}
                              onChange={() => handleUpdateQuestion(qIdx, 'correct_option', optIdx)}
                              style={{ accentColor: '#10b981' }}
                            />
                            <input
                              type="text"
                              required
                              placeholder={`Option ${optIdx + 1}`}
                              className="input-field"
                              value={opt}
                              onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Explanation for the correct answer (optional)..."
                        className="input-field"
                        value={q.explanation}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAuthorModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={authoringLoading}
                  className="btn-primary"
                  style={{ padding: '8px 24px' }}
                >
                  {authoringLoading ? 'Publishing...' : 'Save & Publish Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
