import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { triggerGoogleOAuth, triggerGithubOAuth, triggerLinkedinOAuth } from '../lib/oauth';
import {
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Compass,
} from 'lucide-react';

interface RipplePoint {
  id: number;
  x: number;
  y: number;
}

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState<string | null>(null);

  // Mouse interaction state for dynamic light and 3D card tilt
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [normalizedPos, setNormalizedPos] = useState({ x: 0, y: 0 });
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [ripples, setRipples] = useState<RipplePoint[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { register, oauthLogin } = useAuth();
  const navigate = useNavigate();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();

    setMousePos({ x: clientX, y: clientY });

    const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((clientY - rect.top) / rect.height) * 2 - 1;
    setNormalizedPos({ x: normX, y: normY });

    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;

      // 3D tilt calculations with smooth responsive physics (up to +-16 deg)
      const tiltX = -((clientY - cardCenterY) / (cardRect.height / 2)) * 16;
      const tiltY = ((clientX - cardCenterX) / (cardRect.width / 2)) * 16;

      setCardTilt({
        x: Math.max(-18, Math.min(18, tiltX)),
        y: Math.max(-18, Math.min(18, tiltY)),
      });

      // Specular glare position percentage across card surface
      const glareX = Math.max(0, Math.min(100, ((clientX - cardRect.left) / cardRect.width) * 100));
      const glareY = Math.max(0, Math.min(100, ((clientY - cardRect.top) / cardRect.height) * 100));
      setGlarePos({ x: glareX, y: glareY });
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const { clientX, clientY } = e;
    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;

      const tiltX = -((clientY - cardCenterY) / (cardRect.height / 2)) * 16;
      const tiltY = ((clientX - cardCenterX) / (cardRect.width / 2)) * 16;

      setCardTilt({
        x: Math.max(-18, Math.min(18, tiltX)),
        y: Math.max(-18, Math.min(18, tiltY)),
      });

      const glareX = Math.max(0, Math.min(100, ((clientX - cardRect.left) / cardRect.width) * 100));
      const glareY = Math.max(0, Math.min(100, ((clientY - cardRect.top) / cardRect.height) * 100));
      setGlarePos({ x: glareX, y: glareY });
    }
  };

  const handleMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
    setNormalizedPos({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = Date.now();
    const newRipple: RipplePoint = { id, x: e.clientX, y: e.clientY };
    setRipples((prev) => [...prev.slice(-3), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 900);
  };

  const validateEmailFormat = (val: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(val.trim());
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!validateEmailFormat(email)) {
      setError('Please provide a valid student email address (e.g. student@university.edu).');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);

    try {
      await register({ full_name: fullName.trim(), email: email.trim(), password });
      navigate('/onboarding');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Registration failed. An account with this email may already exist or input is invalid.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setOauthLoadingProvider('google');
    try {
      const googleUser = await triggerGoogleOAuth();
      await oauthLogin(googleUser);
      navigate('/onboarding');
    } catch (err: any) {
      console.error('Google Sign Up Error:', err);
      setError(err.message || 'Google sign-up was cancelled or encountered an error.');
    } finally {
      setOauthLoadingProvider(null);
    }
  };

  const handleGithubSignUp = () => {
    setError(null);
    try {
      triggerGithubOAuth();
    } catch (err: any) {
      setError(err.message || 'Could not redirect to GitHub.');
    }
  };

  const handleLinkedinSignUp = () => {
    setError(null);
    try {
      triggerLinkedinOAuth();
    } catch (err: any) {
      setError(err.message || 'Could not redirect to LinkedIn.');
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleContainerClick}
      className="interactive-spotlight-container overflow-hidden"
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: '#f8fafc',
        position: 'relative',
      }}
    >
      {/* ── Ambient Glowing Mouse Light Orbs ─────────────────────────────── */}
      <div
        className="pointer-events-none absolute -inset-20 z-0 transition-opacity duration-500"
        style={{ opacity: 0.7 }}
      >
        <div
          className="absolute rounded-full blur-[90px] transition-transform duration-100 ease-out"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, rgba(99, 102, 241, 0.08) 60%, transparent 80%)',
            left: `${mousePos.x || window.innerWidth / 2}px`,
            top: `${mousePos.y || window.innerHeight / 2}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute rounded-full blur-[100px] transition-transform duration-300 ease-out"
          style={{
            width: '380px',
            height: '380px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
            left: `calc(50% + ${-normalizedPos.x * 200}px)`,
            top: `calc(50% + ${-normalizedPos.y * 150}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* ── Click Ripple Physics ─────────────────────────────────────────── */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none fixed rounded-full z-10"
          style={{
            left: r.x,
            top: r.y,
            transform: 'translate(-50%, -50%)',
            animation: 'pulseGlowRing 0.8s ease-out forwards',
            width: '36px',
            height: '36px',
          }}
        />
      ))}

      {/* ── Floating Parallax Badges ────────────────────────────────────── */}
      <div className="hidden lg:block pointer-events-none absolute inset-0 z-10 max-w-6xl mx-auto">
        <div
          className="absolute top-24 left-10 p-3 bg-white/85 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-md text-xs font-medium text-slate-700 flex items-center gap-2.5 transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(${normalizedPos.x * -20}px, ${normalizedPos.y * -16}px, 0)`,
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
            <Compass size={17} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-[13px]">Trajectory Engine</div>
            <div className="text-[11px] text-slate-500">Autonomous student skill roadmaps</div>
          </div>
        </div>

        <div
          className="absolute top-28 right-12 p-3 bg-white/85 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-md text-xs font-medium text-slate-700 flex items-center gap-2.5 transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(${normalizedPos.x * 22}px, ${normalizedPos.y * -20}px, 0)`,
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            <Sparkles size={17} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-[13px]">Live ATS Matcher</div>
            <div className="text-[11px] text-emerald-600 font-medium">Auto-enhancement ready</div>
          </div>
        </div>

        <div
          className="absolute bottom-20 left-16 p-3 bg-white/85 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-md text-xs font-medium text-slate-700 flex items-center gap-2.5 transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(${normalizedPos.x * -18}px, ${normalizedPos.y * 18}px, 0)`,
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            <ShieldCheck size={17} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-[13px]">Verified Credentials</div>
            <div className="text-[11px] text-slate-500">Autonomous rubric grading</div>
          </div>
        </div>

        <div
          className="absolute bottom-24 right-16 p-3 bg-white/85 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-md text-xs font-medium text-slate-700 flex items-center gap-2.5 transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(${normalizedPos.x * 18}px, ${normalizedPos.y * 22}px, 0)`,
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
            <GraduationCap size={17} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-[13px]">Career Placement</div>
            <div className="text-[11px] text-slate-500">Direct university integrations</div>
          </div>
        </div>
      </div>

      {/* ── Student Register Card ────────────────────────────────────────── */}
      <div className="z-20 w-full max-w-[460px]">
        <div
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleMouseLeave}
          className="panel-card relative"
          style={{
            width: '100%',
            maxWidth: '460px',
            padding: '36px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            transform: `perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
            transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.4, 1), box-shadow 0.2s ease',
          }}
        >
          {/* Specular Glare */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[16px] overflow-hidden"
            style={{
              background: `radial-gradient(circle 400px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.7) 0%, rgba(219, 234, 254, 0.2) 40%, transparent 70%)`,
              mixBlendMode: 'overlay',
              opacity: 0.5,
              zIndex: 1,
            }}
          />

          <div className="relative z-10" style={{ pointerEvents: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <img
                src="/logo.png"
                alt="Skill2Career Logo"
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 12px',
                  borderRadius: '12px',
                  objectFit: 'contain',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              />
              <div className="official-badge" style={{ marginBottom: '12px' }}>
                Skill2Career Official Student Portal
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Create Student Account
              </h2>
              <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>
                Enroll in the official career readiness and placement architecture.
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
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <span style={{ fontWeight: 700 }}>Notice: </span>
                {error}
              </div>
            </div>
          )}

          {/* Official OAuth Buttons Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              disabled={!!oauthLoadingProvider || loading}
              onClick={handleGoogleSignUp}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#1e293b',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: oauthLoadingProvider ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                if (!oauthLoadingProvider) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (!oauthLoadingProvider) {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            >
              {oauthLoadingProvider === 'google' ? (
                <>
                  <Loader2 className="animate-spin" size={18} color="#4285F4" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
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
                  <span>Sign up with Google</span>
                </>
              )}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                disabled={!!oauthLoadingProvider || loading}
                onClick={handleGithubSignUp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#24292e',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>GitHub</span>
              </button>

              <button
                type="button"
                disabled={!!oauthLoadingProvider || loading}
                onClick={handleLinkedinSignUp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #0A66C2',
                  background: '#0A66C2',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.97 0 1.76-.79 1.76-1.76s-.79-1.76-1.76-1.76a1.76 1.76 0 0 0-1.76 1.76c0 .97.79 1.76 1.76 1.76m1.4 9.74V9.92H5.06v8.58h2.8z" />
                </svg>
                <span>LinkedIn</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '20px 0',
              color: '#94a3b8',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ padding: '0 12px', fontWeight: 600, color: '#64748b' }}>
              Or register with student email
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Register Form */}
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
              <label className="input-label">Student Email Address</label>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="input-label" style={{ margin: 0 }}>Password (min 6 characters)</label>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field"
                  style={{ paddingRight: '40px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength visual indicator */}
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', height: '4px', borderRadius: '9999px', overflow: 'hidden', background: '#f1f5f9' }}>
                    <div
                      style={{
                        height: '100%',
                        width: '25%',
                        background: passwordStrength >= 1 ? '#ef4444' : 'transparent',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <div
                      style={{
                        height: '100%',
                        width: '25%',
                        background: passwordStrength >= 2 ? '#f59e0b' : 'transparent',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <div
                      style={{
                        height: '100%',
                        width: '25%',
                        background: passwordStrength >= 3 ? '#3b82f6' : 'transparent',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <div
                      style={{
                        height: '100%',
                        width: '25%',
                        background: passwordStrength >= 4 ? '#10b981' : 'transparent',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                    <span>Security rating</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>
                      {passwordStrength === 1 && 'Basic'}
                      {passwordStrength === 2 && 'Fair'}
                      {passwordStrength === 3 && 'Good'}
                      {passwordStrength >= 4 && 'Strong'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                padding: '11px',
                marginTop: '4px',
                width: '100%',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Enrolling Student Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Student Account</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

            <p
              style={{
                textAlign: 'center',
                marginTop: '24px',
                fontSize: '0.875rem',
                color: '#475569',
                marginBottom: 0,
              }}
            >
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#1e40af', fontWeight: 600 }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
