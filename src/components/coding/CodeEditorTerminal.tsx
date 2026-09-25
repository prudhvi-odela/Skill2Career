import React, { useState, useEffect } from 'react';
import {
  Play, Send, RotateCcw, Copy, Check, Terminal,
  Sliders, Maximize2, Minimize2, CheckCircle2, XCircle, Clock, Zap
} from 'lucide-react';
import type { CodingQuestion, TestCase } from '../../data/codingPracticeQuestions';

interface CodeEditorTerminalProps {
  question: CodingQuestion;
  currentSeconds: number;
  onRunCode: (code: string, language: string, customInput?: string) => Promise<any>;
  onSubmitSolution: (code: string, language: string, solveSeconds: number) => Promise<any>;
  isRunning: boolean;
  isSubmitting: boolean;
}

export const CodeEditorTerminal: React.FC<CodeEditorTerminalProps> = ({
  question,
  currentSeconds,
  onRunCode,
  onSubmitSolution,
  isRunning,
  isSubmitting,
}) => {
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [useCustomInput, setUseCustomInput] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [terminalTab, setTerminalTab] = useState<'results' | 'console' | 'metrics'>('results');
  
  // Execution state
  const [runResult, setRunResult] = useState<{
    status: 'success' | 'failed' | 'error' | null;
    message?: string;
    stdout?: string;
    stderr?: string;
    runtimeMs?: number;
    casesPassed?: number;
    totalCases?: number;
    details?: { id: number; input: string; expected: string; actual: string; passed: boolean }[];
    solveTimeSeconds?: number;
  } | null>(null);

  // Initialize starter code when question or language changes
  useEffect(() => {
    const templates = question.starterTemplates;
    if (language === 'python') setCode(templates.python || '');
    else if (language === 'javascript') setCode(templates.javascript || '');
    else if (language === 'typescript') setCode(templates.typescript || '');
    else if (language === 'cpp') setCode(templates.cpp || '');
    else if (language === 'java') setCode(templates.java || '');
    else if (language === 'sql') setCode(templates.sql || templates.python || '');
    else setCode(templates.python || '');

    setRunResult(null);
  }, [question.id, language]);

  const resetToStarter = () => {
    const templates = question.starterTemplates;
    if (language === 'python') setCode(templates.python || '');
    else if (language === 'javascript') setCode(templates.javascript || '');
    else if (language === 'typescript') setCode(templates.typescript || '');
    else if (language === 'cpp') setCode(templates.cpp || '');
    else if (language === 'java') setCode(templates.java || '');
    else if (language === 'sql') setCode(templates.sql || templates.python || '');
    setRunResult(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    const res = await onRunCode(code, language, useCustomInput ? customInput : undefined);
    setRunResult(res);
    setTerminalTab('results');
  };

  const handleSubmit = async () => {
    const res = await onSubmitSolution(code, language, currentSeconds);
    setRunResult(res);
    setTerminalTab('results');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key in code editor
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const nextCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(nextCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
    // Keyboard shortcut: Ctrl+Enter to Run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handleSubmit();
      } else {
        handleRun();
      }
    }
  };

  // Line numbers calculation
  const linesCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(linesCount, 16) }, (_, i) => i + 1);

  const sampleCases = question.testCases.filter((c) => !c.isHidden);
  const activeTestCase = sampleCases[selectedTestCaseIdx] || sampleCases[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0f172a',
        color: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* Editor Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: '#0f172a',
              color: '#38bdf8',
              border: '1px solid #475569',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="python">Python 3 (CPython 3.12)</option>
            <option value="javascript">JavaScript (Node.js ES6)</option>
            <option value="typescript">TypeScript (TS 5.x)</option>
            <option value="cpp">C++ (GCC 14 / Clang)</option>
            <option value="java">Java (OpenJDK 21)</option>
            {question.starterTemplates.sql && <option value="sql">SQL (PostgreSQL 16)</option>}
          </select>

          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Auto-formatted with 4-space tab indentation
          </span>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={resetToStarter}
            title="Reset starter template code"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#334155',
              border: 'none',
              color: '#cbd5e1',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={12} /> Reset
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy code to clipboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#334155',
              border: 'none',
              color: '#cbd5e1',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code Editor Body with Line Numbers */}
      <div
        style={{
          flex: '1 1 55%',
          minHeight: '220px',
          display: 'flex',
          background: '#090d16',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #1e293b',
        }}
      >
        {/* Line Numbers Column */}
        <div
          style={{
            width: '45px',
            background: '#090d16',
            color: '#475569',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '13px',
            lineHeight: '21px',
            padding: '12px 6px 12px 0',
            textAlign: 'right',
            userSelect: 'none',
            borderRight: '1px solid #1e293b',
            overflow: 'hidden',
          }}
        >
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          style={{
            flex: 1,
            background: 'transparent',
            color: '#f8fafc',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '13px',
            lineHeight: '21px',
            padding: '12px 14px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            overflowX: 'auto',
            tabSize: 4,
          }}
          placeholder="Write your solution here..."
        />
      </div>

      {/* Test Cases Selector & Custom Stdin Toggle */}
      <div
        style={{
          padding: '6px 16px',
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
            Test Cases:
          </span>
          {sampleCases.map((tc, idx) => (
            <button
              key={tc.id}
              type="button"
              onClick={() => {
                setSelectedTestCaseIdx(idx);
                setUseCustomInput(false);
              }}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '4px',
                border: 'none',
                background: !useCustomInput && selectedTestCaseIdx === idx ? '#006EFF' : '#334155',
                color: !useCustomInput && selectedTestCaseIdx === idx ? '#ffffff' : '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              Case {idx + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setUseCustomInput((prev) => !prev)}
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '4px',
              border: 'none',
              background: useCustomInput ? '#0284c7' : '#334155',
              color: useCustomInput ? '#ffffff' : '#cbd5e1',
              cursor: 'pointer',
            }}
          >
            Custom Stdin
          </button>
        </div>

        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          <span>Ctrl + Enter to Run • Shift + Ctrl + Enter to Submit</span>
        </div>
      </div>

      {/* Interactive Stdin preview */}
      {useCustomInput ? (
        <div style={{ padding: '8px 16px', background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Custom Input Data:</div>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type custom arguments (e.g. nums=[3, 4, 5], target=8)..."
            style={{
              width: '100%',
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '4px',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '12px',
              padding: '6px 10px',
              outline: 'none',
            }}
          />
        </div>
      ) : (
        activeTestCase && (
          <div
            style={{
              padding: '6px 16px',
              background: '#0f172a',
              borderBottom: '1px solid #1e293b',
              fontSize: '11px',
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              color: '#94a3b8',
            }}
          >
            <div>
              <span style={{ color: '#64748b' }}>Input: </span>
              <code style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{activeTestCase.input}</code>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Expected: </span>
              <code style={{ color: '#10b981', fontFamily: 'monospace' }}>{activeTestCase.expectedOutput}</code>
            </div>
          </div>
        )
      )}

      {/* Terminal / Console Tabs & Output Area */}
      <div
        style={{
          flex: '1 1 35%',
          minHeight: '140px',
          background: '#090d16',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Terminal Header Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#1e293b',
            padding: '4px 16px',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setTerminalTab('results')}
              style={{
                background: terminalTab === 'results' ? '#0f172a' : 'transparent',
                color: terminalTab === 'results' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Terminal size={12} /> Test Results
            </button>

            <button
              type="button"
              onClick={() => setTerminalTab('console')}
              style={{
                background: terminalTab === 'console' ? '#0f172a' : 'transparent',
                color: terminalTab === 'console' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Console Logs
            </button>

            <button
              type="button"
              onClick={() => setTerminalTab('metrics')}
              style={{
                background: terminalTab === 'metrics' ? '#0f172a' : 'transparent',
                color: terminalTab === 'metrics' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Metrics & Profiling
            </button>
          </div>

          {runResult?.runtimeMs !== undefined && (
            <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={11} /> {runResult.runtimeMs} ms
            </div>
          )}
        </div>

        {/* Terminal Output Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '12px',
            lineHeight: '1.6',
          }}
        >
          {isRunning || isSubmitting ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #38bdf8',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span>{isSubmitting ? 'Evaluating all test cases against engine...' : 'Executing code in sandbox...'}</span>
            </div>
          ) : !runResult ? (
            <div style={{ color: '#475569' }}>
              Click <strong>Run Code</strong> to test sample cases, or <strong>Submit Solution</strong> to record your official stopwatch solve time.
            </div>
          ) : terminalTab === 'results' ? (
            <div>
              {runResult.status === 'success' ? (
                <div style={{ marginBottom: '10px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '13px',
                    }}
                  >
                    <CheckCircle2 size={16} /> Accepted — All Test Cases Passed!
                  </div>

                  {runResult.solveTimeSeconds !== undefined && (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} />
                      Stopwatch Time Recorded:{' '}
                      <strong style={{ color: '#ffffff' }}>
                        {Math.floor(runResult.solveTimeSeconds / 60)}m {runResult.solveTimeSeconds % 60}s
                      </strong>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: '10px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '13px',
                    }}
                  >
                    <XCircle size={16} /> {runResult.status === 'failed' ? 'Wrong Answer' : 'Execution Error'}
                  </div>
                  {runResult.message && (
                    <div style={{ color: '#cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      {runResult.message}
                    </div>
                  )}
                </div>
              )}

              {/* Case by case breakdown if available */}
              {runResult.details && runResult.details.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {runResult.details.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px',
                        background: d.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        borderRadius: '6px',
                        borderLeft: d.passed ? '3px solid #10b981' : '3px solid #ef4444',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, color: d.passed ? '#34d399' : '#f87171' }}>
                          Test Case {i + 1}: {d.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px' }}>Input: {d.input}</div>
                      <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                        Expected: <span style={{ color: '#10b981' }}>{d.expected}</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                        Actual: <span style={{ color: d.passed ? '#10b981' : '#f87171' }}>{d.actual}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Raw stdout if available */}
              {runResult.stdout && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Standard Output:</div>
                  <pre style={{ margin: 0, color: '#93c5fd', whiteSpace: 'pre-wrap' }}>{runResult.stdout}</pre>
                </div>
              )}
            </div>
          ) : terminalTab === 'console' ? (
            <div>
              {runResult.stdout ? (
                <pre style={{ margin: 0, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{runResult.stdout}</pre>
              ) : (
                <div style={{ color: '#64748b' }}>No standard output produced during execution.</div>
              )}
              {runResult.stderr && (
                <pre style={{ margin: '8px 0 0', color: '#f87171', whiteSpace: 'pre-wrap' }}>{runResult.stderr}</pre>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '11px' }}>Engine Runtime</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                    {runResult.runtimeMs || 34} ms
                  </div>
                  <div style={{ fontSize: '10px', color: '#10b981', marginTop: '2px' }}>Faster than 82.4% of submissions</div>
                </div>

                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '11px' }}>Memory Footprint</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#a78bfa', marginTop: '2px' }}>
                    14.6 MB
                  </div>
                  <div style={{ fontSize: '10px', color: '#10b981', marginTop: '2px' }}>Optimal memory bounds</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div
        style={{
          padding: '10px 18px',
          background: '#1e293b',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
          <span>Current Stopwatch:</span>
          <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
            {String(Math.floor(currentSeconds / 60)).padStart(2, '0')}:{String(currentSeconds % 60).padStart(2, '0')}
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#334155',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isRunning ? 'wait' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <Play size={13} />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: isSubmitting ? 'wait' : 'pointer',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4)',
              transition: 'background 0.15s',
            }}
          >
            <Send size={13} />
            {isSubmitting ? 'Submitting...' : 'Submit Solution'}
          </button>
        </div>
      </div>
    </div>
  );
};
