import React from 'react';

export interface KPICardProps {
  icon: React.ReactNode;
  label?: string;
  title?: string;
  value: string | number;
  subValue?: string;
  subtitle?: string;
  badge?: string | { text: string; variant?: string };
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan';
  trend?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  icon,
  label,
  title,
  value,
  subValue,
  subtitle,
  badge,
  badgeColor = 'indigo',
  trend,
  onClick,
}) => {
  const displayLabel = label || title || '';
  const displaySubtitle = subValue || subtitle || '';

  let badgeText: string | undefined;
  let effectiveBadgeColor = badgeColor;

  if (typeof badge === 'object' && badge !== null) {
    badgeText = badge.text;
    if (badge.variant) {
      effectiveBadgeColor = badge.variant as any;
    }
  } else if (typeof badge === 'string') {
    badgeText = badge;
  }

  const badgeClass =
    effectiveBadgeColor === 'emerald'
      ? 'badge-emerald'
      : effectiveBadgeColor === 'amber'
      ? 'badge-amber'
      : effectiveBadgeColor === 'rose'
      ? 'badge-rose'
      : effectiveBadgeColor === 'cyan'
      ? 'badge-cyan'
      : 'badge-indigo';

  return (
    <div
      className={`glass-card ${onClick ? 'glass-card-interactive' : ''}`}
      onClick={onClick}
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '120px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.825rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {displayLabel}
        </span>
        <div style={{ padding: '6px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            {value}
          </span>
          {trend && (
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
              {trend}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          {displaySubtitle && (
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{displaySubtitle}</span>
          )}
          {badgeText && <span className={`badge ${badgeClass}`}>{badgeText}</span>}
        </div>
      </div>
    </div>
  );
};
