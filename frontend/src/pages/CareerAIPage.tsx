import React, { useState, useEffect, useRef } from 'react';
import { aiApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  RotateCw,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Compass,
  TrendingUp,
  Award,
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';
import { SkeletonLoader, EmptyState, ErrorState, IncompleteProfileBanner } from '../components/StateFeedback';

interface StructuredAIResponse {
  message: string;
  key_points: string[];
  recommended_actions: string[];
  referenced_skills: string[];
  referenced_careers: string[];
  referenced_predictions: string[];
  warnings: string[];
  context_type: string;
  generated_at?: string;
  model_used?: string;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  structured?: StructuredAIResponse;
  timestamp: string;
}

export const CareerAIPage: React.FC = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Explain my readiness',
    'What should I learn next?',
    'Explain my biggest skill gap',
    'What projects should I build?',
    'Why does this career match me?',
    'How do I reach 75% readiness?'
  ];

  useEffect(() => {
    // Initial greeting message
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        structured: {
          message: `Hello ${profile?.degree ? 'there' : ''}! I am your Skill2Career AI Intelligence Advisor. I analyze your verified skills, projects, certifications, and ML Job-Readiness evaluations to provide personalized, grounded career coaching. What would you like to explore today?`,
          key_points: [
            'All insights are 100% grounded in your actual MongoDB profile and trained ML predictions.',
            'Zero hallucinated scores: Numerical readiness ratings come directly from our registered model.',
            'Click any quick action below or ask any question about your target career trajectory.'
          ],
          recommended_actions: [
            'Click "Explain My Readiness" to audit your ML score attribution',
            'Click "What Should I Learn Next?" to see your highest-ROI study milestone'
          ],
          referenced_skills: [],
          referenced_careers: profile?.target_career_id ? [profile.target_career_id] : [],
          referenced_predictions: [],
          warnings: [
            'Predictions represent statistical modeling and do not guarantee employment.',
            'Salary data represents static industry benchmark references.'
          ],
          context_type: 'welcome'
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [profile?.target_career_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || loading) return;

    setInputQuery('');
    setError(null);

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      let res;
      const lower = text.toLowerCase();

      if (lower === 'explain my readiness' || lower === 'explain readiness') {
        res = await aiApi.explainReadiness();
      } else if (lower === 'what should i learn next?' || lower === 'next action') {
        res = await aiApi.getNextAction();
      } else if (lower.includes('skill gap') || lower === 'explain my biggest skill gap') {
        res = await aiApi.explainGap();
      } else if (lower.includes('trajectory')) {
        res = await aiApi.explainTrajectory();
      } else {
        res = await aiApi.chat(text);
      }

      const assistantMsg: MessageItem = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        structured: res.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI query error:', err);
      setError(err.response?.data?.detail || 'Failed to generate AI guidance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTrigger = async (type: 'readiness' | 'action' | 'gap' | 'trajectory') => {
    if (loading) return;
    setLoading(true);
    setError(null);

    const promptLabel =
      type === 'readiness'
        ? 'Explain My Readiness'
        : type === 'action'
        ? 'What Should I Learn Next?'
        : type === 'gap'
        ? 'Explain My Skill Gaps'
        : 'Explain My Trajectory Forecast';

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptLabel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      let res;
      if (type === 'readiness') res = await aiApi.explainReadiness();
      else if (type === 'action') res = await aiApi.getNextAction();
      else if (type === 'gap') res = await aiApi.explainGap();
      else res = await aiApi.explainTrajectory();

      const assistantMsg: MessageItem = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        structured: res.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI quick trigger error:', err);
      setError(err.response?.data?.detail || 'Failed to fetch AI explanation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <IncompleteProfileBanner />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={24} color="#818cf8" />
            <h1 style={{ fontSize: '1.85rem' }}>AI Career Intelligence Advisor</h1>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Personalized career coaching grounded strictly in your verified skills, portfolio evidence, and ML model outputs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-indigo">
            <ShieldCheck size={12} />
            <span>Grounded ML Engine</span>
          </span>
          <span className="badge badge-emerald">Zero Score Hallucination</span>
        </div>
      </div>

      {/* Provenance & Ethical Disclosure Card */}
      <div
        style={{
          padding: '14px 20px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '10px',
          fontSize: '0.85rem',
          color: '#c7d2fe',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Lightbulb size={20} color="#818cf8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Architecture Principle:</strong> Machine learning algorithms compute all numerical readiness scores and feature importance.
          The AI advisor contextualizes findings and generates step-by-step learning recommendations without altering or inventing scores.
        </span>
      </div>

      {/* Quick Action Trigger Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <button
          onClick={() => handleQuickTrigger('readiness')}
          disabled={loading}
          className="glass-card glass-card-interactive"
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          <Target size={20} color="#818cf8" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>Explain Readiness</div>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Feature attribution breakdown</span>
          </div>
        </button>

        <button
          onClick={() => handleQuickTrigger('action')}
          disabled={loading}
          className="glass-card glass-card-interactive"
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <Compass size={20} color="#34d399" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>Next Best Action</div>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Highest-ROI study milestone</span>
          </div>
        </button>

        <button
          onClick={() => handleQuickTrigger('gap')}
          disabled={loading}
          className="glass-card glass-card-interactive"
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}
        >
          <Layers size={20} color="#fbbf24" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>Explain Skill Gaps</div>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Critical remediation needs</span>
          </div>
        </button>

        <button
          onClick={() => handleQuickTrigger('trajectory')}
          disabled={loading}
          className="glass-card glass-card-interactive"
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            border: '1px solid rgba(6, 182, 212, 0.25)',
          }}
        >
          <TrendingUp size={20} color="#22d3ee" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>Explain Trajectory</div>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>24-week growth forecast</span>
          </div>
        </button>
      </div>

      {/* Suggested Questions Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>Suggested Queries:</span>
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSendQuery(q)}
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#d1d5db',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '0.775rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Conversation Stream */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          minHeight: '420px',
          maxHeight: '650px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            {/* Sender & Timestamp */}
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', padding: '0 4px' }}>
              {m.sender === 'user' ? 'You' : 'Skill2Career AI Advisor'} • {m.timestamp}
            </div>

            {m.sender === 'user' ? (
              <div
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  padding: '12px 18px',
                  borderRadius: '16px 16px 4px 16px',
                  maxWidth: '75%',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                }}
              >
                {m.text}
              </div>
            ) : (
              /* Structured AI Assistant Response Card */
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '22px',
                  maxWidth: '92%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Main Narrative Message */}
                <p style={{ color: '#f3f4f6', fontSize: '0.975rem', lineHeight: 1.6, margin: 0 }}>
                  {m.structured?.message}
                </p>

                {/* Key Executive Takeaways */}
                {m.structured?.key_points && m.structured.key_points.length > 0 && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                      Key Model Factors
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {m.structured.key_points.map((pt, i) => (
                        <li key={i} style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Next Actions */}
                {m.structured?.recommended_actions && m.structured.recommended_actions.length > 0 && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                      Actionable Next Steps
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {m.structured.recommended_actions.map((act, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <CheckCircle2 size={16} color="#34d399" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badges: Referenced Skills, Career, Model Tag */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                  {m.structured?.referenced_careers && m.structured.referenced_careers.length > 0 && (
                    <span className="badge badge-indigo">
                      Role: {m.structured.referenced_careers.join(', ')}
                    </span>
                  )}

                  {m.structured?.referenced_skills?.map((sk) => (
                    <Link
                      key={sk}
                      to="/app/skills"
                      className="badge badge-cyan"
                      style={{ textDecoration: 'none' }}
                      title="View in Skills Inventory"
                    >
                      {sk}
                    </Link>
                  ))}

                  {m.structured?.model_used && (
                    <span style={{ fontSize: '0.7rem', color: '#6b7280', marginLeft: 'auto' }}>
                      Engine: {m.structured.model_used}
                    </span>
                  )}
                </div>

                {/* Warnings / Disclaimers */}
                {m.structured?.warnings && m.structured.warnings.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', borderTop: '1px dashed rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                    {m.structured.warnings.join(' • ')}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9ca3af', padding: '12px' }}>
            <RotateCw size={16} className="animate-spin" color="#818cf8" />
            <span style={{ fontSize: '0.875rem' }}>Synthesizing grounded career intelligence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && <ErrorState message={error} onRetry={() => inputQuery && handleSendQuery(inputQuery)} />}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery(inputQuery);
        }}
        className="glass-card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          className="input-field"
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 12px' }}
          placeholder="Ask anything about your readiness, skill gaps, projects to build, or roadmap milestones..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="btn-primary"
          style={{ padding: '10px 20px', borderRadius: '8px' }}
        >
          <Send size={16} />
          <span>Ask Advisor</span>
        </button>
      </form>
    </div>
  );
};
