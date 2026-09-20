import React, { useState, useEffect } from 'react';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Terminal,
  ChevronRight,
  Sparkles,
  AlertCircle,
  History,
  FileCode
} from 'lucide-react';
import { practiceApi } from '../api/client';

export const PracticeLabPage: React.FC = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'problem' | 'attempts'>('problem');

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const [probRes, attRes] = await Promise.all([
        practiceApi.getProblems(),
        practiceApi.getMyAttempts()
      ]);
      setProblems(probRes.data || []);
      setAttempts(attRes.data || []);

      if (probRes.data?.length > 0) {
        loadProblemDetail(probRes.data[0].problem_code || probRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProblemDetail = async (problemId: string) => {
    try {
      const res = await practiceApi.getProblemDetail(problemId);
      setSelectedProblem(res.data);
      const starter = res.data.starter_code?.[selectedLanguage] || '# Write your solution here\n';
      setCode(starter);
      setExecutionResult(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (selectedProblem?.starter_code?.[lang]) {
      setCode(selectedProblem.starter_code[lang]);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    try {
      setSubmitting(true);
      const res = await practiceApi.submitCode(selectedProblem.problem_code || selectedProblem.id, {
        language: selectedLanguage,
        code
      });
      setExecutionResult(res.data);
      // Refresh attempts
      const attRes = await practiceApi.getMyAttempts();
      setAttempts(attRes.data || []);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Execution failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
        Loading Practice & Code Lab environment...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
          padding: '20px 24px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
            <Code2 size={14} /> PRACTICE & CODING LAB
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Sandboxed Algorithm & Problem Lab
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('problem')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: activeTab === 'problem' ? '#2563eb' : 'rgba(255,255,255,0.04)',
              color: activeTab === 'problem' ? '#fff' : '#94a3b8',
              border: activeTab === 'problem' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <FileCode size={14} /> Editor
          </button>
          <button
            onClick={() => setActiveTab('attempts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: activeTab === 'attempts' ? '#2563eb' : 'rgba(255,255,255,0.04)',
              color: activeTab === 'attempts' ? '#fff' : '#94a3b8',
              border: activeTab === 'attempts' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <History size={14} /> Attempt History ({attempts.length})
          </button>
        </div>
      </div>

      {activeTab === 'problem' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Problem Selector Sidebar */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              maxHeight: 'calc(100vh - 180px)',
              overflowY: 'auto'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', marginBottom: '12px' }}>
              CHALLENGES ({problems.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {problems.map(p => {
                const isSelected = selectedProblem?.problem_code === p.problem_code;
                return (
                  <button
                    key={p.problem_code}
                    onClick={() => loadProblemDetail(p.problem_code)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'left',
                      background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>{p.title}</div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: p.difficulty === 'Easy' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                            color: p.difficulty === 'Easy' ? '#34d399' : '#fbbf24',
                            fontWeight: 700
                          }}
                        >
                          {p.difficulty}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{p.category}</span>
                      </div>
                    </div>
                    {p.is_solved && <CheckCircle2 size={14} color="#34d399" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Editor & Problem Spec Pane */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Left: Problem Statement & Test Cases */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '24px',
                height: 'calc(100vh - 180px)',
                overflowY: 'auto'
              }}
            >
              {selectedProblem ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                      {selectedProblem.title}
                    </h2>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: selectedProblem.difficulty === 'Easy' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                        color: selectedProblem.difficulty === 'Easy' ? '#34d399' : '#fbbf24',
                        fontWeight: 700
                      }}
                    >
                      {selectedProblem.difficulty}
                    </span>
                  </div>

                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '20px' }}>
                    {selectedProblem.description}
                  </p>

                  {/* Constraints */}
                  {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        CONSTRAINTS
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '0.82rem' }}>
                        {selectedProblem.constraints.map((c: string, idx: number) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>
                            <code>{c}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sample Test Cases */}
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      SAMPLE TEST CASES
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedProblem.sample_test_cases?.map((tc: any, idx: number) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            <strong style={{ color: '#f8fafc' }}>Input:</strong> <code>{tc.input_data}</code>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                            <strong style={{ color: '#f8fafc' }}>Expected:</strong> <code>{tc.expected_output}</code>
                          </div>
                          {tc.explanation && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>{tc.explanation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '60px' }}>Select a problem to begin.</div>
              )}
            </div>

            {/* Right: Code Editor & Console Output */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: 'calc(100vh - 180px)' }}>
              {/* Editor Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={e => handleLanguageChange(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#f8fafc',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="python">Python 3</option>
                    <option value="javascript">JavaScript (Node)</option>
                    <option value="typescript">TypeScript</option>
                    <option value="cpp">C++ (GCC)</option>
                    <option value="java">Java 17</option>
                    <option value="c">C (Clang)</option>
                  </select>
                </div>

                <button
                  disabled={submitting}
                  onClick={handleSubmitCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Play size={13} /> {submitting ? 'Running Tests...' : 'Run & Submit'}
                </button>
              </div>

              {/* Code Area */}
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck={false}
                style={{
                  flex: 1,
                  width: '100%',
                  background: '#090d16',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: '0.88rem',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.5
                }}
              />

              {/* Execution Output Console */}
              <div
                style={{
                  height: '180px',
                  background: '#0b0f19',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '14px',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                  <Terminal size={12} /> CONSOLE / TEST EVALUATION
                </div>

                {executionResult ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: executionResult.status === 'ACCEPTED' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: executionResult.status === 'ACCEPTED' ? '#34d399' : '#f87171'
                        }}
                      >
                        {executionResult.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Passed: {executionResult.passed_tests_count} / {executionResult.total_tests_count} • {executionResult.execution_time_ms}ms
                      </span>
                      {executionResult.evidence_recorded && (
                        <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Award size={12} /> Evidence Logged
                        </span>
                      )}
                    </div>

                    {executionResult.error_message && (
                      <div style={{ color: '#f87171', fontSize: '0.8rem', fontFamily: 'monospace', margin: '6px 0' }}>
                        {executionResult.error_message}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                      {executionResult.test_results?.map((tr: any, idx: number) => (
                        <div key={idx} style={{ fontSize: '0.75rem', color: tr.passed ? '#34d399' : '#f87171', fontFamily: 'monospace' }}>
                          {tr.passed ? '✓' : '✗'} Test Case {idx + 1}: {tr.passed ? 'Passed' : `Expected ${tr.expected_output}, got ${tr.actual_output || 'Error'}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    Click "Run & Submit" to safely execute your solution against test cases.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Attempts History Tab */
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
            Your Practice Attempt Logs
          </h2>

          {attempts.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
              No practice attempts recorded yet. Solve a coding challenge to build your history!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {attempts.map(att => (
                <div
                  key={att.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 18px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>{att.problem_title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Language: <strong style={{ color: '#60a5fa' }}>{att.language}</strong> • {new Date(att.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: att.status === 'ACCEPTED' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: att.status === 'ACCEPTED' ? '#34d399' : '#f87171'
                      }}
                    >
                      {att.status}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      {att.passed_tests_count} / {att.total_tests_count} Tests Passed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
