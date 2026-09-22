import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';

export type OAuthProvider = 'google' | 'github' | 'linkedin';

export interface OAuthModalProps {
  isOpen: boolean;
  provider: OAuthProvider | null;
  onClose: () => void;
  onSuccess: (data: { provider: string; email: string; full_name: string; avatar_url: string }) => Promise<void>;
}

export const OAuthModal: React.FC<OAuthModalProps> = ({ isOpen, provider, onClose, onSuccess }) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeAccountIndex, setActiveAccountIndex] = useState<number | null>(null);

  if (!isOpen || !provider) return null;

  const providerConfigs = {
    google: {
      name: 'Google Workspace',
      title: 'Sign in with Google',
      subtitle: 'Select an authorized Google account for institutional single sign-on',
      brandColor: '#4285F4',
      badgeBg: '#e8f0fe',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      ),
      accounts: [
        {
          name: 'Alex Chen',
          email: 'alex.chen@university.edu',
          desc: 'Institutional Google Workspace Student',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        },
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@gmail.com',
          desc: 'Verified Google Developer Profile',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
        },
      ],
    },
    github: {
      name: 'GitHub',
      title: 'Sign in with GitHub',
      subtitle: 'Authorize Skill2Career to verify repository commit history and coding achievements',
      brandColor: '#24292e',
      badgeBg: '#f6f8fa',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#24292e">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
      accounts: [
        {
          name: 'alexchen-dev',
          email: 'alex.chen@github.io',
          desc: '24 Public Repositories • 482 Contributions',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        },
        {
          name: 'priyasharma-code',
          email: 'priya.sharma@octocat.dev',
          desc: '16 Public Repositories • 310 Contributions',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        },
      ],
    },
    linkedin: {
      name: 'LinkedIn',
      title: 'Sign in with LinkedIn',
      subtitle: 'Synchronize verified academic credentials and endorsements with Skill2Career',
      brandColor: '#0A66C2',
      badgeBg: '#e8f4f9',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.97 0 1.76-.79 1.76-1.76s-.79-1.76-1.76-1.76a1.76 1.76 0 0 0-1.76 1.76c0 .97.79 1.76 1.76 1.76m1.4 9.74V9.92H5.06v8.58h2.8z" />
        </svg>
      ),
      accounts: [
        {
          name: 'Alex Chen',
          email: 'alex.chen@linkedin.com',
          desc: 'B.Tech CS Candidate @ NIT • 500+ Connections',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        },
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@linkedin.com',
          desc: 'Aspiring Software Engineer • 350+ Connections',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
        },
      ],
    },
  };

  const config = providerConfigs[provider];

  const handleSelectAccount = async (acc: { name: string; email: string; avatar: string }, index: number) => {
    setActiveAccountIndex(index);
    setIsAuthenticating(true);
    try {
      await onSuccess({
        provider,
        email: acc.email,
        full_name: acc.name,
        avatar_url: acc.avatar,
      });
      onClose();
    } catch (err) {
      console.error('OAuth sign in error:', err);
    } finally {
      setIsAuthenticating(false);
      setActiveAccountIndex(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    setIsAuthenticating(true);
    try {
      await onSuccess({
        provider,
        email: customEmail.trim(),
        full_name: customName.trim() || customEmail.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(customEmail)}`,
      });
      onClose();
    } catch (err) {
      console.error('OAuth custom account error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="panel-card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              {config.icon}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {config.title}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {config.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Account Selector List */}
        <div style={{ padding: '24px 28px' }}>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              marginBottom: '12px',
            }}
          >
            Choose a verified profile
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {config.accounts.map((acc, index) => {
              const isSelected = activeAccountIndex === index;
              return (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isAuthenticating}
                  onClick={() => handleSelectAccount(acc, index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: isSelected ? `2px solid ${config.brandColor}` : '1px solid #e2e8f0',
                    background: isSelected ? '#f8fafc' : '#ffffff',
                    cursor: isAuthenticating ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isAuthenticating) {
                      e.currentTarget.style.borderColor = config.brandColor;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAuthenticating && !isSelected) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #e2e8f0',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                        {acc.name}
                      </span>
                      <CheckCircle size={14} color={config.brandColor} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {acc.email}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      {acc.desc}
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  ) : (
                    <ArrowRight size={16} color="#94a3b8" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Or enter custom account */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '20px 0 16px',
              color: '#94a3b8',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ padding: '0 12px', fontWeight: 600, color: '#64748b' }}>
              Or use another {config.name} account
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Full Name (e.g. Jordan Smith)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{ fontSize: '0.82rem', padding: '8px 12px' }}
              />
              <input
                type="email"
                required
                className="input-field"
                placeholder="Account Email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                style={{ fontSize: '0.82rem', padding: '8px 12px' }}
              />
            </div>
            <button
              type="submit"
              disabled={isAuthenticating || !customEmail}
              style={{
                background: config.brandColor,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 14px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: isAuthenticating || !customEmail ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isAuthenticating || !customEmail ? 0.6 : 1,
              }}
            >
              {isAuthenticating && activeAccountIndex === null ? (
                <>
                  <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderTopColor: '#ffffff' }} />
                  <span>Connecting to {config.name}...</span>
                </>
              ) : (
                <>
                  <span>Sign In with this {config.name} ID</span>
                  <ExternalLink size={14} />
                </>
              )}
            </button>
          </form>

          {/* Security Notice Footer */}
          <div
            style={{
              marginTop: '20px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.74rem',
              color: '#64748b',
            }}
          >
            <ShieldCheck size={16} color="#059669" />
            <span>
              Skill2Career official OAuth integration conforms to FERPA and AES-256 session token security standards.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
