import React, { useState } from 'react';
import {
  CheckCircle2, XCircle, Sparkles, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Software Architecture',
    question: 'In modern distributed applications, what is the primary benefit of adhering to the Single Responsibility Principle (SRP) in microservices?',
    options: [
      'It maximizes the physical CPU cache locality across servers',
      'Services are loosely coupled, enabling independent scaling and isolated failure domains',
      'It eliminates the need for database indexing and network serializers',
      'It automatically compiles all runtime code to WebAssembly binaries',
    ],
    correctIndex: 1,
    explanation: 'Single Responsibility ensures services address one bounded domain, making deployments independent, resilient, and easier to scale without ripple failures.',
  },
  {
    id: 2,
    category: 'API & Web Performance',
    question: 'Why are idempotent operations (like HTTP PUT or idempotency keys) critical when designing payment or order processing APIs?',
    options: [
      'They prevent duplicate transactions or state corruptions if a network retry occurs',
      'They encrypt the payload with asymmetric RSA quantum-resistant keys',
      'They convert all JSON representations directly into binary protobufs',
      'They guarantee zero-latency execution on mobile client devices',
    ],
    correctIndex: 0,
    explanation: 'Network timeouts often cause client retries. Idempotency guarantees that executing the same request multiple times produces the exact same side-effect without double-charging.',
  },
  {
    id: 3,
    category: 'Database & Data Modeling',
    question: 'What is the primary trade-off when adding multiple B-Tree indexes to high-throughput relational tables (PostgreSQL)?',
    options: [
      'Query execution speed drops dramatically for SELECT statements',
      'Read queries become significantly faster, but write/insert operations incur latency overhead',
      'The database loses ACID transaction guarantees',
      'Foreign key constraints can no longer be evaluated by the query planner',
    ],
    correctIndex: 1,
    explanation: 'Indexes accelerate SELECT search operations via balanced search trees, but every INSERT, UPDATE, and DELETE must also update index tree pointers, adding write latency.',
  },
  {
    id: 4,
    category: 'DevOps & CI/CD Pipelines',
    question: 'Which strategy best describes a "Canary Deployment" in cloud container environments?',
    options: [
      'Shutting down all production servers simultaneously at midnight to swap code',
      'Routing a small percentage of live production traffic to the new version before global rollout',
      'Running all customer traffic on staging servers permanently',
      'Rebuilding all container images from scratch on every user HTTP request',
    ],
    correctIndex: 1,
    explanation: 'Canary releases route a tiny fraction (e.g. 5%) of real traffic to the new build to verify telemetry, error rates, and latency before rolling out to 100% of users.',
  },
  {
    id: 5,
    category: 'Production Reliability & Quality',
    question: 'In automated testing pyramids for production software, why should Unit Tests form the largest base compared to End-to-End (E2E) tests?',
    options: [
      'Unit tests are fast, deterministic, and pinpoint exact line regressions at lowest cost',
      'E2E tests cannot test asynchronous HTTP requests',
      'Unit tests are required by the operating system kernel',
      'Only Unit tests can test CSS styling and frontend responsiveness',
    ],
    correctIndex: 0,
    explanation: 'Unit tests run in milliseconds, isolate logic cleanly, and provide rapid feedback, while E2E tests are slower, more brittle, and expensive to execute at high frequency.',
  },
];

interface CourseAwarenessMockTestProps {
  onClose?: () => void;
  onRatingUpdated?: (ratingScore: number, grade: string) => void;
}

export const CourseAwarenessMockTest: React.FC<CourseAwarenessMockTestProps> = ({
  onClose,
  onRatingUpdated,
}) => {
  const { profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: number }>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const handleSelect = (qId: number, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: QUESTIONS.length,
      percentage: Math.round((correct / QUESTIONS.length) * 100),
    };
  };

  const result = calculateScore();

  const getRatingGrade = (pct: number) => {
    if (pct >= 90) return { stars: '★★★★★', label: 'Tier-1 Production Ready', grade: 'Grade A+', badge: '#16a34a' };
    if (pct >= 75) return { stars: '★★★★☆', label: 'Advanced Course Awareness', grade: 'Grade A', badge: '#2563eb' };
    if (pct >= 60) return { stars: '★★★☆☆', label: 'Competent with Minor Gaps', grade: 'Grade B+', badge: '#d97706' };
    return { stars: '★★☆☆☆', label: 'Foundational Awareness', grade: 'Grade C', badge: '#dc2626' };
  };

  const ratingInfo = getRatingGrade(result.percentage);

  const handleSubmitTest = () => {
    setSubmitted(true);
    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleSaveToProfile = async () => {
    setSaving(true);
    try {
      localStorage.setItem('skillbridge_course_awareness_rating', JSON.stringify({
        score: result.percentage,
        grade: ratingInfo.grade,
        label: ratingInfo.label,
        date: new Date().toISOString(),
      }));

      if (updateProfile) {
        await updateProfile({
          course_awareness_rating: result.percentage,
          course_awareness_grade: ratingInfo.grade,
        } as any);
      }

      if (onRatingUpdated) {
        onRatingUpdated(result.percentage, ratingInfo.grade);
      }

      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.5 },
      });
    } catch (err) {
      console.error('Error saving rating:', err);
    } finally {
      setSaving(false);
    }
  };

  const allAnswered = Object.keys(selectedAnswers).length === QUESTIONS.length;

  return (
    <div
      className="skillbridge-card"
      style={{
        padding: '28px',
        maxWidth: '780px',
        margin: '0 auto',
        width: '100%',
        background: '#ffffff',
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Test Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              SkillBridge Official Diagnostic
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              5-Question Industry & Curriculum Awareness Verification
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0 0' }}>
            Course Awareness Diagnostic Mock Test
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            ✕ Close
          </button>
        )}
      </div>

      {!submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Progress Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Answered: {Object.keys(selectedAnswers).length} of {QUESTIONS.length} Questions</span>
            <span>Est. Duration: ~4 mins</span>
          </div>

          {/* Question List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {QUESTIONS.map((q, qIndex) => {
              const selectedIdx = selectedAnswers[q.id];

              return (
                <div
                  key={q.id}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                      Question {qIndex + 1} · {q.category}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                    {q.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedIdx === optIdx;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelect(q.id, optIdx)}
                          style={{
                            textAlign: 'left',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: isChosen ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            background: isChosen ? '#eff6ff' : '#ffffff',
                            color: isChosen ? '#1e40af' : '#1e293b',
                            fontSize: '0.85rem',
                            fontWeight: isChosen ? 700 : 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              background: isChosen ? '#2563eb' : '#e2e8f0',
                              color: isChosen ? '#ffffff' : '#475569',
                              flexShrink: 0,
                            }}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {!allAnswered ? 'Please answer all 5 questions to generate official rating' : 'All questions answered!'}
            </span>
            <button
              onClick={handleSubmitTest}
              disabled={!allAnswered}
              className="btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '0.9rem',
                opacity: allAnswered ? 1 : 0.5,
                cursor: allAnswered ? 'pointer' : 'not-allowed',
              }}
            >
              <span>Submit & Calculate Awareness Rating</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Score & Rating Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
              borderRadius: '12px',
              padding: '24px',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#bfdbfe', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official Course Awareness Diagnostic
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '2px', lineHeight: 1.1 }}>
                {result.percentage}% ({result.correct}/{result.total} Correct)
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#93c5fd', marginTop: '4px' }}>
                Assigned Rating: {ratingInfo.grade} · {ratingInfo.label}
              </div>
              <div style={{ fontSize: '1.2rem', color: '#fef08a', marginTop: '2px' }}>
                {ratingInfo.stars}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleSaveToProfile}
                disabled={saving}
                style={{
                  background: '#ffffff',
                  color: '#1e40af',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <Sparkles size={16} />
                <span>{saving ? 'Saving...' : 'Update My Profile Rating'}</span>
              </button>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setSelectedAnswers({});
                }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Retake Diagnostic
              </button>
            </div>
          </div>

          {/* Question Breakdown with Explanations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Diagnostic Competency Breakdown
            </h3>

            {QUESTIONS.map((q) => {
              const isCorrect = selectedAnswers[q.id] === q.correctIndex;
              const chosen = selectedAnswers[q.id];

              return (
                <div
                  key={q.id}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '8px',
                    background: isCorrect ? '#f0fdf4' : '#fef2f2',
                    border: isCorrect ? '1px solid #bbf7d0' : '1px solid #fecaca',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isCorrect ? '#166534' : '#991b1b', textTransform: 'uppercase' }}>
                      {q.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isCorrect ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {isCorrect ? 'Correct (+20%)' : 'Incorrect Deficit'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    {q.question}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '6px', lineHeight: 1.45 }}>
                    <strong>Verified Answer:</strong> {q.options[q.correctIndex]}
                  </div>

                  <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                    💡 {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Close */}
          {onClose && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 18px' }}>
                Done & Return
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
