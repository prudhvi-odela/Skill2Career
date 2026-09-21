import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  sublabel?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 180,
  label = 'Job Readiness',
  sublabel,
}) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let color = '#1e3a8a';
  if (clampedScore >= 75) {
    color = '#15803d';
  } else if (clampedScore >= 50) {
    color = '#b45309';
  } else {
    color = '#b91c1c';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle (Crisp, No drop shadow, No glow) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="square"
          fill="transparent"
        />
      </svg>
      {/* Centered Score Display */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: size * 0.24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          {clampedScore.toFixed(0)}%
        </span>
        <span style={{ fontSize: size * 0.075, color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      {sublabel && (
        <span style={{ marginTop: '10px', fontSize: '0.85rem', color: color, fontWeight: 700 }}>
          {sublabel}
        </span>
      )}
    </div>
  );
};
