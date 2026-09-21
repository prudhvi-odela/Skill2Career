import React, { useState } from 'react';
import { aiApi } from '../api/client';
import { Sparkles, ArrowRight, CheckCircle2, RotateCw, Lightbulb, Compass, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CareerAIProps {
  contextCareerId?: string;
  onAskQuestion?: (q: string) => void;
}

export const CareerAI: React.FC<CareerAIProps> = ({ contextCareerId }) => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const fetchNextAction = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getNextAction(contextCareerId);
      setRecommendation(res.data);
    } catch (err) {
      console.error('Failed to fetch next action:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px' }}>
            <Sparkles size={20} color="#818cf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>AI Career Intelligence Advisor</h3>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Grounded actionable insights from your ML telemetry</span>
          </div>
        </div>

        <Link
          to="/app/ai-advisor"
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.825rem' }}
        >
          <MessageSquare size={14} />
          <span>Open Full AI Advisor</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {recommendation ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <p style={{ fontSize: '0.925rem', color: '#f3f4f6', lineHeight: 1.5, margin: 0 }}>
            {recommendation.message}
          </p>

          {recommendation.recommended_actions && recommendation.recommended_actions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {recommendation.recommended_actions.map((act: string, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#34d399" />
                  <span style={{ fontSize: '0.85rem', color: '#d1d5db' }}>{act}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '0.875rem', color: '#d1d5db', margin: 0 }}>
            Get an instant, explainable breakdown of your highest-ROI study milestone or audit your ML readiness attribution.
          </p>

          <button
            onClick={fetchNextAction}
            disabled={loading}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.825rem' }}
          >
            {loading ? <RotateCw size={14} className="animate-spin" /> : <Lightbulb size={14} color="#fbbf24" />}
            <span>{loading ? 'Synthesizing...' : 'Get Next Best Action'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
