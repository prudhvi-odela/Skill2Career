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
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let color = '#6366f1';
  let glowColor = 'rgba(99, 102, 241, 0.4)';
  if (clampedScore >= 75) {
    color = '#10b981';
    glowColor = 'rgba(16, 185, 129, 0.4)';
  } else if (clampedScore >= 50) {
    color = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.4)';
  } else {
    color = '#f43f5e';
    glowColor = 'rgba(244, 63, 94, 0.4)';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle with Glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease',
            filter: `drop-shadow(0 0 10px ${glowColor})`,
          }}
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
        <span style={{ fontSize: size * 0.24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
          {clampedScore.toFixed(0)}%
        </span>
        <span style={{ fontSize: size * 0.075, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      {sublabel && (
        <span style={{ marginTop: '12px', fontSize: '0.875rem', color: color, fontWeight: 600 }}>
          {sublabel}
        </span>
      )}
    </div>
  );
};
