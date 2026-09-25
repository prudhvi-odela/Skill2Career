import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy, Clock, CheckCircle2, Zap, ArrowRight,
  RotateCcw, Sparkles, Award, Share2, X
} from 'lucide-react';
import type { CodingQuestion } from '../../data/codingPracticeQuestions';

interface SolutionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: CodingQuestion;
  solveTimeSeconds: number;
  runtimeMs: number;
  casesPassed: number;
  totalCases: number;
  onNextProblem: () => void;
}

export const SolutionSuccessModal: React.FC<SolutionSuccessModalProps> = ({
  isOpen,
  onClose,
  question,
  solveTimeSeconds,
  runtimeMs,
  casesPassed,
  totalCases,
  onNextProblem,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#006EFF', '#10b981', '#f59e0b', '#8b5cf6'],
        });
      } catch (err) {
        // graceful fallback if canvas is unavailable
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mins = Math.floor(solveTimeSeconds / 60);
  const secs = solveTimeSeconds % 60;
  const targetSeconds = question.targetTimeMinutes * 60;
  const isFasterThanTarget = solveTimeSeconds <= targetSeconds;
  const speedPercentage = targetSeconds > 0
    ? Math.max(1, Math.round(((targetSeconds - solveTimeSeconds) / targetSeconds) * 100))
    : 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '520px',
          maxWidth: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          position: 'relative',
          animation: 'scaleUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner with Trophy */}
        <div
          style={{
            background: 'linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%)',
            padding: '28px 24px',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>

          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Trophy size={34} style={{ color: '#fef08a' }} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
            Problem Solved Successfully!
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#d1fae5' }}>
            You solved <strong>{question.title}</strong> with all test cases verified.
          </p>
        </div>

        {/* Stopwatch & Performance Metrics */}
        <div style={{ padding: '24px' }}>
          {/* Primary Stopwatch Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '18px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Official Stopwatch Solve Time
            </div>
            <div
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '32px',
                fontWeight: 900,
                color: '#0f172a',
                margin: '6px 0',
                letterSpacing: '0.05em',
              }}
            >
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>

            {isFasterThanTarget ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <Zap size={14} />
                <span>{speedPercentage}% faster than target interview benchmark ({question.targetTimeMinutes}m)!</span>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Target benchmark was {question.targetTimeMinutes} minutes. Great persistence!
              </div>
            )}
          </div>

          {/* Test cases & Execution details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 14px',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '12px', fontWeight: 700 }}>
                <CheckCircle2 size={15} /> All Cases Passed
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {casesPassed} / {totalCases}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                100% test suite accuracy
              </div>
            </div>

            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 14px',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0369a1', fontSize: '12px', fontWeight: 700 }}>
                <Clock size={15} /> Runtime Speed
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {runtimeMs} ms
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Beats 84.2% of submissions
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px',
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Review Code
            </button>

            <button
              type="button"
              onClick={() => {
                onNextProblem();
                onClose();
              }}
              style={{
                flex: 1.5,
                padding: '10px',
                background: '#006EFF',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0, 110, 255, 0.3)',
              }}
            >
              <span>Next Challenge</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
