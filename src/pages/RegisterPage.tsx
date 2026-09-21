import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({ full_name: fullName, email, password });
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        className="panel-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#1e40af',
              marginBottom: '12px',
              letterSpacing: '0.04em',
            }}
          >
            ED-05 ONBOARDING
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            Create Student Profile
          </h2>
          <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>
            Start mapping your competencies to verified career roles today.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontWeight: 700 }}>Notice:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Full Name</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Jordan Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '11px', marginTop: '6px', width: '100%', fontSize: '0.9rem' }}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: '#475569', marginBottom: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1e40af', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
