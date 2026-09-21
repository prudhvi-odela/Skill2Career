import React from 'react';

export interface KPICardProps {
  icon?: React.ReactNode;
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
      onClick={onClick}
      className="panel-card"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '110px',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {displayLabel}
        </span>
        {badgeText && <span className={`badge ${badgeClass}`}>{badgeText}</span>}
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {value}
          </span>
          {trend && (
            <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>
              {trend}
            </span>
          )}
        </div>

        {displaySubtitle && (
          <div style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{displaySubtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};
