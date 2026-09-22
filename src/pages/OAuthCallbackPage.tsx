import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { oauthLogin } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Check for token in URL hash (e.g., #access_token=... from Google OAuth)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');

        if (accessToken) {
          // Fetch user info from Google
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!res.ok) throw new Error('Could not fetch user profile from provider.');
          const userInfo = await res.json();

          const payload = {
            provider: 'google',
            email: userInfo.email,
            full_name: userInfo.name || userInfo.email.split('@')[0],
            avatar_url: userInfo.picture || '',
          };

          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'google', payload }, window.location.origin);
            window.close();
            return;
          }

          await oauthLogin(payload);
          setStatus('success');
          setTimeout(() => navigate('/app/dashboard'), 800);
          return;
        }

        // 2. Check for code in search query params (e.g., ?code=... from GitHub/LinkedIn)
        const code = searchParams.get('code');
        const error = searchParams.get('error') || searchParams.get('error_description');

        if (error) {
          throw new Error(error);
        }

        if (code) {
          // Detect provider from state or fallback to github/linkedin
          const provider = searchParams.get('provider') || (window.location.search.includes('scope') || searchParams.get('state') === 'linkedin' ? 'linkedin' : 'github');
          const redirectUri = `${window.location.origin}/auth/callback`;

          const exchangeRes = await fetch('/api/v1/auth/oauth/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, code, redirect_uri: redirectUri }),
          });

          const data = await exchangeRes.json();
          if (!exchangeRes.ok || !data.access_token) {
            throw new Error(data.detail || 'OAuth authorization code exchange failed.');
          }

          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('placement_ops_token', data.access_token);
          localStorage.setItem('placement_ops_current_user', JSON.stringify({ ...data.user, name: data.user.full_name }));

          setStatus('success');
          setTimeout(() => {
            window.location.href = '/app/dashboard';
          }, 600);
          return;
        }

        // If no recognizable token or code was found
        throw new Error('No authorization token or response code found in provider callback.');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'OAuth verification failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, oauthLogin, navigate]);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: '#f8fafc',
      }}
    >
      <div
        className="panel-card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
          background: '#ffffff',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
        }}
      >
        {status === 'processing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader2 className="animate-spin" size={36} color="#006EFF" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Authenticating with Provider...
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Verifying official OAuth credentials and synchronizing your session.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <CheckCircle2 size={36} color="#16a34a" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Authentication Successful!
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              Redirecting you to your Skill2Career dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <AlertCircle size={36} color="#dc2626" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Sign In Failed
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#991b1b' }}>
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{ marginTop: '12px', padding: '10px 24px', fontSize: '0.9rem' }}
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
