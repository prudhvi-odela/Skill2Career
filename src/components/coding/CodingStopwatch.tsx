import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Clock, Flag, Bell, AlertTriangle } from 'lucide-react';

interface CodingStopwatchProps {
  onTimeUpdate?: (seconds: number) => void;
  targetTimeMinutes?: number;
  problemId?: string;
  isPausedExternally?: boolean;
}

export const CodingStopwatch: React.FC<CodingStopwatchProps> = ({
  onTimeUpdate,
  targetTimeMinutes = 20,
  problemId,
  isPausedExternally = false
}) => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [mode, setMode] = useState<'countup' | 'countdown'>('countup');
  const [laps, setLaps] = useState<{ label: string; time: string; seconds: number }[]>([]);
  const [showLaps, setShowLaps] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer whenever student switches to a new problem
  useEffect(() => {
    setSeconds(0);
    setIsRunning(true);
    setLaps([]);
  }, [problemId]);

  // Handle external pause (e.g. modal open or submission)
  useEffect(() => {
    if (isPausedExternally) {
      setIsRunning(false);
    }
  }, [isPausedExternally]);

  // Main timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (onTimeUpdate) onTimeUpdate(next);
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, onTimeUpdate]);

  const toggleRunning = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setSeconds(0);
    setIsRunning(false);
    setLaps([]);
    if (onTimeUpdate) onTimeUpdate(0);
  }, [onTimeUpdate]);

  const addLap = useCallback(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const lapNumber = laps.length + 1;
    let label = `Checkpoint ${lapNumber}`;
    if (lapNumber === 1) label = 'Idea & Logic Formulated';
    else if (lapNumber === 2) label = 'Core Code Drafted';
    else if (lapNumber === 3) label = 'Edge Cases & Debugging';

    setLaps((prev) => [...prev, { label, time: formatted, seconds }]);
    setShowLaps(true);
  }, [seconds, laps.length]);

  // Formatting helpers
  const targetSeconds = (targetTimeMinutes || 20) * 60;
  const isOvertime = seconds > targetSeconds;

  const displaySeconds = mode === 'countup' ? seconds : Math.max(0, targetSeconds - seconds);
  const hours = Math.floor(displaySeconds / 3600);
  const minutes = Math.floor((displaySeconds % 3600) / 60);
  const secs = displaySeconds % 60;

  const formattedTime = `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: '#0f172a',
        borderRadius: '12px',
        padding: '6px 14px',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.35)',
        border: isOvertime && isRunning ? '1px solid #ef4444' : '1px solid #334155',
        color: '#ffffff',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Live Pulsing Dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '10px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isRunning ? (isOvertime ? '#ef4444' : '#10b981') : '#f59e0b',
            boxShadow: isRunning
              ? isOvertime
                ? '0 0 8px #ef4444'
                : '0 0 8px #10b981'
              : 'none',
            animation: isRunning ? 'pulseDot 1.5s infinite' : 'none',
          }}
        />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Clock size={13} style={{ color: '#38bdf8' }} />
          Stopwatch
        </span>
      </div>

      {/* Monospace Digital Display */}
      <div
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '20px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          color: isOvertime ? '#f87171' : isRunning ? '#38bdf8' : '#fcd34d',
          minWidth: hours > 0 ? '110px' : '75px',
          textAlign: 'center',
          padding: '2px 8px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        title={mode === 'countup' ? 'Time elapsed on this problem' : 'Time remaining before target'}
      >
        {formattedTime}
      </div>

      {/* Target time comparison pill */}
      <div
        style={{
          marginLeft: '10px',
          fontSize: '11px',
          color: isOvertime ? '#fca5a5' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.06)',
          padding: '3px 8px',
          borderRadius: '6px',
        }}
      >
        {isOvertime ? (
          <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
            <AlertTriangle size={11} /> Over benchmark ({targetTimeMinutes}m)
          </span>
        ) : (
          <span>Target: <strong style={{ color: '#e2e8f0' }}>{targetTimeMinutes}m</strong></span>
        )}
      </div>

      {/* Control Buttons: Play/Pause, Reset, Lap, Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
        <button
          type="button"
          onClick={toggleRunning}
          title={isRunning ? 'Pause Timer' : 'Resume Timer'}
          style={{
            background: isRunning ? '#334155' : '#059669',
            border: 'none',
            color: '#ffffff',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          title="Reset Stopwatch"
          style={{
            background: '#334155',
            border: 'none',
            color: '#cbd5e1',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <RotateCcw size={13} />
        </button>

        <button
          type="button"
          onClick={addLap}
          title="Record Time Checkpoint (Lap)"
          style={{
            background: '#334155',
            border: 'none',
            color: '#cbd5e1',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <Flag size={13} />
        </button>

        <button
          type="button"
          onClick={() => setMode((prev) => (prev === 'countup' ? 'countdown' : 'countup'))}
          title={mode === 'countup' ? 'Switch to Countdown Mode' : 'Switch to Stopwatch Count-up Mode'}
          style={{
            background: mode === 'countdown' ? '#0369a1' : '#1e293b',
            border: '1px solid #475569',
            color: '#93c5fd',
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {mode === 'countup' ? 'UP' : 'DOWN'}
        </button>
      </div>

      {/* Laps Dropdown overlay if present */}
      {showLaps && laps.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '10px',
            zIndex: 100,
            width: '260px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Session Checkpoints</span>
            <button
              type="button"
              onClick={() => setShowLaps(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
            {laps.map((lap, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#cbd5e1' }}>{lap.label}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>{lap.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
