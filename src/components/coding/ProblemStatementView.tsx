import React, { useState } from 'react';
import {
  BookOpen, HelpCircle, Cpu, History, CheckCircle2,
  AlertCircle, Building2, Tag, Clock, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';
import type { CodingQuestion } from '../../data/codingPracticeQuestions';

interface SubmissionRecord {
  id: string;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error';
  language: string;
  solveTimeSeconds: number;
  testCasesPassed: number;
  totalTestCases: number;
  runtimeMs: number;
  createdAt: string;
}

interface ProblemStatementViewProps {
  question: CodingQuestion;
  submissions: SubmissionRecord[];
  isSolved: boolean;
  bestSolveTime?: number;
}

export const ProblemStatementView: React.FC<ProblemStatementViewProps> = ({
  question,
  submissions,
  isSolved,
  bestSolveTime
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'hints' | 'solution' | 'submissions'>('description');
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});

  const toggleHint = (index: number) => {
    setRevealedHints((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  let diffColor = '#10b981';
  let diffBg = '#ecfdf5';
  if (question.difficulty === 'Medium') {
    diffColor = '#f59e0b';
    diffBg = '#fffbeb';
  } else if (question.difficulty === 'Hard') {
    diffColor = '#ef4444';
    diffBg = '#fef2f2';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}
    >
      {/* Top Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 16px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('description')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'description' ? '#ffffff' : 'transparent',
            color: activeTab === 'description' ? '#006EFF' : '#64748b',
            boxShadow: activeTab === 'description' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
          }}
        >
          <BookOpen size={14} /> Description
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hints')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'hints' ? '#ffffff' : 'transparent',
            color: activeTab === 'hints' ? '#006EFF' : '#64748b',
            boxShadow: activeTab === 'hints' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
          }}
        >
          <HelpCircle size={14} /> Hints ({question.hints.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('solution')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'solution' ? '#ffffff' : 'transparent',
            color: activeTab === 'solution' ? '#006EFF' : '#64748b',
            boxShadow: activeTab === 'solution' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
          }}
        >
          <Cpu size={14} /> Optimal Complexity
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'submissions' ? '#ffffff' : 'transparent',
            color: activeTab === 'submissions' ? '#006EFF' : '#64748b',
            boxShadow: activeTab === 'submissions' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer',
          }}
        >
          <History size={14} /> Past Times ({submissions.length})
        </button>
      </div>

      {/* Tab Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {/* DESCRIPTION TAB */}
        {activeTab === 'description' && (
          <div>
            {/* Header: Title, Difficulty, Category, Target Time */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: diffColor,
                    background: diffBg,
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {question.difficulty}
                </span>

                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0369a1',
                    background: '#e0f2fe',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {question.category}
                </span>

                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748b',
                    background: '#f1f5f9',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Clock size={13} /> Target: {question.targetTimeMinutes} mins
                </span>

                {isSolved && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#059669',
                      background: '#ecfdf5',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 size={13} /> Solved
                    {bestSolveTime && ` in ${Math.floor(bestSolveTime / 60)}m ${bestSolveTime % 60}s`}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                {question.title}
              </h1>

              {/* Tags & Companies */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Building2 size={12} /> Asked in:
                </span>
                {question.companies.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#475569',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Problem Description Text */}
            <div
              style={{
                fontSize: '14px',
                lineHeight: '1.65',
                color: '#334155',
                marginBottom: '20px',
                whiteSpace: 'pre-line',
              }}
            >
              {question.description}
            </div>

            {/* Examples */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                Examples
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {question.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Example {idx + 1}:
                    </div>
                    <div style={{ fontFamily: 'ui-monospace, monospace', marginBottom: '4px', color: '#1e293b' }}>
                      <strong>Input:</strong> {ex.input}
                    </div>
                    <div style={{ fontFamily: 'ui-monospace, monospace', marginBottom: ex.explanation ? '4px' : '0', color: '#059669' }}>
                      <strong>Output:</strong> {ex.output}
                    </div>
                    {ex.explanation && (
                      <div style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>
                        <strong>Explanation:</strong> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Constraints
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                {question.constraints.map((c, i) => (
                  <li key={i} style={{ fontFamily: 'ui-monospace, monospace', fontSize: '12px', color: '#334155' }}>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags footer */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Tag size={12} /> Topics:
                </span>
                {question.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '11px',
                      color: '#006EFF',
                      background: '#eff6ff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HINTS TAB */}
        {activeTab === 'hints' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Progressive Interview Hints
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Try solving the problem using the stopwatch before revealing hints to simulate live company interview conditions.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {question.hints.map((hint, idx) => {
                const isRevealed = revealedHints[idx];
                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: isRevealed ? '#ffffff' : '#f8fafc',
                    }}
                  >
                    <div
                      onClick={() => toggleHint(idx)}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        background: isRevealed ? '#f0f9ff' : '#f8fafc',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        💡 Hint {idx + 1}
                      </span>
                      <button
                        type="button"
                        style={{
                          background: isRevealed ? '#e0f2fe' : '#006EFF',
                          color: isRevealed ? '#0369a1' : '#ffffff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {isRevealed ? 'Hide' : 'Reveal Hint'}
                      </button>
                    </div>

                    {isRevealed && (
                      <div
                        style={{
                          padding: '14px 16px',
                          fontSize: '13px',
                          lineHeight: '1.6',
                          color: '#334155',
                          borderTop: '1px solid #e0f2fe',
                        }}
                      >
                        {hint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* OPTIMAL COMPLEXITY TAB */}
        {activeTab === 'solution' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Algorithmic Complexity & Architecture
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Benchmarks expected by technical interviewers at tier-1 technology teams.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                  Optimal Time Complexity
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#14532d', marginTop: '4px' }}>
                  {question.optimalComplexity.time}
                </div>
              </div>

              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                  Optimal Space Complexity
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a8a', marginTop: '4px' }}>
                  {question.optimalComplexity.space}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '13px',
                lineHeight: '1.65',
                color: '#334155',
              }}
            >
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                Strategy & Tradeoff Breakdown
              </h4>
              <p style={{ margin: 0 }}>{question.solutionExplanation}</p>
            </div>
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                My Solve Times & History
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Every stopwatch session is logged to measure your problem-solving velocity over time.
              </p>
            </div>

            {submissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <Clock size={36} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
                <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>No submissions yet for this problem.</p>
                <p style={{ fontSize: '12px', margin: '4px 0 0' }}>
                  Click "Run Code" or "Submit Solution" to track your time!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {submissions.map((sub, idx) => {
                  const mins = Math.floor(sub.solveTimeSeconds / 60);
                  const secs = sub.solveTimeSeconds % 60;
                  const isAccepted = sub.status === 'Accepted';

                  return (
                    <div
                      key={sub.id || idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: isAccepted ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                        background: isAccepted ? '#f0fdf4' : '#fffbeb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isAccepted ? (
                          <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                        ) : (
                          <AlertCircle size={18} style={{ color: '#f59e0b' }} />
                        )}

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: isAccepted ? '#15803d' : '#b45309' }}>
                              {sub.status}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                              {sub.language}
                            </span>
                          </div>

                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {sub.testCasesPassed} / {sub.totalTestCases} test cases passed • {sub.runtimeMs} ms
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            fontWeight: 800,
                            color: '#0f172a',
                            background: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Clock size={12} style={{ color: '#006EFF' }} />
                          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>
                          {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
