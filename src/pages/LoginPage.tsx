import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@skill2career.com');
    setPassword('Password123!');
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#f0f2f5',
      }}
    >
      <div className="panel-card" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              background: '#e2e8f0',
              border: '1px solid #cbd5e1',
              borderRadius: '3px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#1e3a8a',
              marginBottom: '10px',
            }}
          >
            ED-05 PORTAL
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '4px' }}>Student Sign In</h2>
          <p style={{ color: '#475569', fontSize: '0.85rem' }}>
            Access your skill-to-career gap engine and readiness forecasts.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '10px 12px',
              borderRadius: '3px',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            [ERROR] {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '10px', marginTop: '4px' }}>
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>

          <button
            type="button"
            onClick={handleDemoFill}
            className="btn-secondary"
            style={{ padding: '8px', fontSize: '0.825rem' }}
          >
            Fill Demo Student Credentials
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#475569' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1e3a8a', fontWeight: 600 }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};
