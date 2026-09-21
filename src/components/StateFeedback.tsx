import React from 'react';
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

// Clean text-based loader without skeleton pulse bars or fake layout boxes
export const SkeletonLoader: React.FC<SkeletonProps> = () => {
  return (
    <div
      style={{
        padding: '24px',
        textAlign: 'center',
        background: '#f8f9fa',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        color: '#475569',
        fontSize: '0.875rem',
        fontWeight: 500,
        margin: '12px 0',
      }}
    >
      Retrieving verified telemetry...
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
      style={{
        padding: '36px 20px',
        textAlign: 'center',
        background: '#f8f9fa',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#64748b',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        [Empty Dataset]
      </div>
      <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>{title}</h3>
      {desc && (
        <p style={{ color: '#475569', maxWidth: '440px', fontSize: '0.875rem', lineHeight: '1.5' }}>
          {desc}
        </p>
      )}

      {actionText && (href || onAction) && (
        <div style={{ marginTop: '8px' }}>
          {href ? (
            <Link to={href} className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
              {actionText}
            </Link>
          ) : (
            <button onClick={onAction} className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
              {actionText}
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
  title = 'Failed to load telemetry',
  message = 'An error occurred while fetching data from the backend API.',
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        background: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '4px',
        color: '#991b1b',
        width: '100%',
      }}
    >
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#991b1b', marginBottom: '2px' }}>
          [Error] {title}
        </h4>
        <p style={{ fontSize: '0.825rem', color: '#7f1d1d' }}>{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: '#ffffff',
            color: '#991b1b',
            border: '1px solid #fca5a5',
            padding: '5px 12px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export interface IncompleteProfileBannerProps {
  missingFields?: string[];
}

export const IncompleteProfileBanner: React.FC<IncompleteProfileBannerProps> = ({ missingFields }) => {
  const fieldsText =
    missingFields && missingFields.length > 0
      ? `Missing parameters: ${missingFields.join(', ')}.`
      : 'Set your target career role and academic background to unlock high-precision ML predictions.';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        background: '#fef3c7',
        border: '1px solid #fde68a',
        borderRadius: '4px',
        color: '#78350f',
      }}
    >
      <div>
        <span style={{ fontWeight: 700, color: '#92400e', fontSize: '0.875rem' }}>
          [Notice] Incomplete Student Academic Profile
        </span>
        <p style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '2px' }}>
          {fieldsText}
        </p>
      </div>

      <Link
        to="/app/profile"
        className="btn-secondary"
        style={{
          padding: '5px 12px',
          fontSize: '0.8rem',
          background: '#fde68a',
          borderColor: '#fcd34d',
          color: '#78350f',
        }}
      >
        Complete Profile
      </Link>
    </div>
  );
};
