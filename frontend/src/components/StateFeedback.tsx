import React from 'react';
import { AlertCircle, RotateCw, Inbox, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SkeletonProps {
  height?: string;
  width?: string;
  borderRadius?: string;
  className?: string;
  count?: number;
  rows?: number;
  type?: 'cards' | 'table' | 'lines';
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  height = '24px',
  width = '100%',
  borderRadius = '8px',
  count,
  rows = 3,
  type = 'lines',
}) => {
  const actualCount = count || rows;

  if (type === 'cards') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          width: '100%',
        }}
      >
        {Array.from({ length: actualCount }).map((_, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{
              height: '180px',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.02) 25%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.02) 75%)',
              backgroundSize: '200% 100%',
              animation: 'pulse 1.6s infinite ease-in-out',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {Array.from({ length: actualCount }).map((_, idx) => (
        <div
          key={idx}
          style={{
            height,
            width,
            borderRadius,
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 75%)',
            backgroundSize: '200% 100%',
            animation: 'pulse 1.6s infinite ease-in-out',
          }}
        />
      ))}
    </div>
  );
};

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  message?: string;
  actionText?: string;
  actionHref?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox size={42} color="#818cf8" />,
  title,
  description,
  message,
  actionText,
  actionHref,
  actionLink,
  onAction,
}) => {
  const desc = description || message || '';
  const href = actionHref || actionLink;

  return (
    <div
      className="glass-card"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
      }}
    >
      <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '4px' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.2rem', color: '#f3f4f6' }}>{title}</h3>
      {desc && (
        <p style={{ color: '#9ca3af', maxWidth: '440px', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {desc}
        </p>
      )}

      {actionText && (href || onAction) && (
        <div style={{ marginTop: '8px' }}>
          {href ? (
            <Link to={href} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>
              <span>{actionText}</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <button onClick={onAction} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.875rem' }}>
              <span>{actionText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load career intelligence',
  message = 'An error occurred while fetching the latest machine learning telemetry from the backend API.',
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 20px',
        background: 'rgba(244, 63, 94, 0.1)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        borderRadius: '12px',
        color: '#fecdd3',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertCircle size={24} color="#fb7185" />
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffe4e6', marginBottom: '2px' }}>{title}</h4>
          <p style={{ fontSize: '0.825rem', color: '#fda4af' }}>{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(244, 63, 94, 0.2)',
            color: '#ffffff',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RotateCw size={14} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export interface IncompleteProfileBannerProps {
  missingFields?: string[];
}

export const IncompleteProfileBanner: React.FC<IncompleteProfileBannerProps> = ({ missingFields }) => {
  const fieldsText = missingFields && missingFields.length > 0
    ? `Missing: ${missingFields.join(', ')}.`
    : 'Set your target career role and academic background to unlock high-precision ML predictions.';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '14px 20px',
        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.05) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertTriangle size={22} color="#fbbf24" />
        <div>
          <span style={{ fontWeight: 600, color: '#fef3c7', fontSize: '0.9rem' }}>
            Incomplete Student Academic Profile
          </span>
          <p style={{ fontSize: '0.8rem', color: '#fde68a', marginTop: '2px' }}>
            {fieldsText}
          </p>
        </div>
      </div>

      <Link
        to="/app/profile"
        className="btn-secondary"
        style={{
          padding: '6px 14px',
          fontSize: '0.8rem',
          background: 'rgba(245, 158, 11, 0.2)',
          borderColor: 'rgba(245, 158, 11, 0.4)',
          color: '#fef3c7',
        }}
      >
        <span>Complete Profile</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
};
