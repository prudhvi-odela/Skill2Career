import React, { useState, useEffect } from 'react';
import { roadmapApi, careersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Map,
  CheckCircle,
  Circle,
  ExternalLink,
  Sparkles,
  RotateCw,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { profile } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  useEffect(() => {
    careersApi.getCareers().then((res) => {
      setCareers(res.data);
      const initialId = profile?.target_career_id || (res.data.length > 0 ? res.data[0].id : '');
      setSelectedCareerId(initialId);
      if (initialId) {
        fetchRoadmap(initialId);
      }
    });
  }, [profile?.target_career_id]);

  const fetchRoadmap = async (careerId: string) => {
    setLoading(true);
    try {
      const res = await roadmapApi.getRoadmap(careerId);
      setRoadmap(res.data);
    } catch (err) {
      console.error('Error loading roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCareerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedCareerId(newId);
    fetchRoadmap(newId);
  };

  const handleToggleItem = async (itemId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await roadmapApi.toggleRoadmapItem(itemId, newStatus);
      if (newStatus) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
      await fetchRoadmap(selectedCareerId);
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await roadmapApi.regenerateRoadmap(selectedCareerId);
      setRoadmap(res.data);
    } catch (err) {
      console.error('Failed to regenerate roadmap:', err);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Personalized Learning Roadmap</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Actionable weekly milestones dynamically generated to bridge your verified skill gaps.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="input-field"
            style={{ width: '260px' }}
            value={selectedCareerId}
            onChange={handleCareerChange}
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="btn-secondary"
            title="Re-compute roadmap from latest skills"
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          >
            <RotateCw size={14} className={regenerating ? 'animate-spin' : ''} />
            <span>{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
          Building your tailored roadmap...
        </div>
      ) : roadmap ? (
        <>
          {/* Progress Overview Card */}
          <div
            className="glass-card"
            style={{
              padding: '24px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(17, 24, 39, 0.8) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', color: '#ffffff' }}>
                {roadmap.title}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Target Timeframe: {roadmap.target_completion_weeks} Weeks • {roadmap.items.length} Total Milestones
              </p>
            </div>

            <div style={{ minWidth: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Overall Completion:</span>
                <strong style={{ color: '#34d399' }}>{roadmap.progress_pct}%</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}>
                <div
                  style={{
                    width: `${roadmap.progress_pct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Timeline Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {roadmap.items.map((item: any, idx: number) => (
              <div
                key={item.id}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '24px',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start',
                  borderLeft: item.is_completed ? '4px solid #10b981' : '4px solid #6366f1',
                  background: item.is_completed ? 'rgba(16, 185, 129, 0.04)' : 'rgba(17, 24, 39, 0.75)',
                }}
              >
                {/* Checkbox Trigger */}
                <button
                  onClick={() => handleToggleItem(item.id, item.is_completed)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '2px',
                    color: item.is_completed ? '#10b981' : '#6b7280',
                  }}
                >
                  {item.is_completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                </button>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4
                      style={{
                        fontSize: '1.1rem',
                        color: item.is_completed ? '#9ca3af' : '#ffffff',
                        textDecoration: item.is_completed ? 'line-through' : 'none',
                      }}
                    >
                      {item.title}
                    </h4>
                    <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                      Week {item.week_number}
                    </span>
                  </div>

                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '14px' }}>
                    {item.description}
                  </p>

                  {/* Resource Links */}
                  {item.recommended_resources && item.recommended_resources.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {item.recommended_resources.map((res: any, rIdx: number) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.775rem',
                            color: '#818cf8',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <BookOpen size={12} />
                          <span>{res.title}</span>
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};
