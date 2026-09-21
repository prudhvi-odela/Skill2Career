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
  Layers,
  Clock,
  ArrowRight
} from 'lucide-react';
import { SkeletonLoader, EmptyState, ErrorState, IncompleteProfileBanner } from '../components/StateFeedback';

export const RoadmapPage: React.FC = () => {
  const { profile } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    try {
      const res = await roadmapApi.getRoadmap(careerId);
      setRoadmap(res.data);
    } catch (err: any) {
      console.error('Error loading roadmap:', err);
      setError(err.response?.data?.detail || 'Failed to fetch personalized learning roadmap.');
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
    } catch (err: any) {
      console.error('Failed to toggle milestone:', err);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await roadmapApi.regenerateRoadmap(selectedCareerId);
      setRoadmap(res.data);
    } catch (err: any) {
      console.error('Failed to regenerate roadmap:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const completedCount = roadmap?.items?.filter((i: any) => i.is_completed).length || 0;
  const totalCount = roadmap?.items?.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <IncompleteProfileBanner />

      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Personalized Learning Roadmap</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Actionable weekly milestones dynamically generated to bridge your verified skill gaps and reach job readiness.
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
        <SkeletonLoader rows={5} type="table" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchRoadmap(selectedCareerId)} />
      ) : !roadmap ? (
        <EmptyState
          title="No Roadmap Generated"
          message="Select a target role to build a personalized milestone roadmap."
          actionText="Select Target Role"
          actionLink="/app/careers"
        />
      ) : (
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
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(17, 24, 39, 0.8) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', color: '#ffffff' }}>
                {roadmap.title}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Target Timeframe: {roadmap.target_completion_weeks} Weeks • {roadmap.items.length} Total Remediation Milestones
              </p>
            </div>

            <div style={{ minWidth: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#9ca3af' }}>Milestone Completion</span>
                <strong style={{ color: '#34d399' }}>{progressPct}% ({completedCount}/{totalCount})</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${progressPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #10b981)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Timeline Milestones List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {roadmap.items.length === 0 ? (
              <EmptyState
                title="All Milestones Completed!"
                message="You have no outstanding skill gaps for this target role. Check your updated ML Job-Readiness Score!"
                actionText="View Job Readiness"
                actionLink="/app/readiness"
              />
            ) : (
              roadmap.items.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="glass-card"
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    border: item.is_completed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                    background: item.is_completed ? 'rgba(16, 185, 129, 0.04)' : 'var(--card-bg)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <button
                    onClick={() => handleToggleItem(item.id, item.is_completed)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: item.is_completed ? '#34d399' : '#6b7280',
                      marginTop: '2px',
                    }}
                    title={item.is_completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                  >
                    {item.is_completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                  </button>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-indigo">Week {item.week_number}</span>
                        <h4 style={{
                          fontSize: '1.05rem',
                          color: item.is_completed ? '#9ca3af' : '#ffffff',
                          textDecoration: item.is_completed ? 'line-through' : 'none'
                        }}>
                          {item.skill_name}: {item.milestone_title}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#9ca3af' }}>
                        <Clock size={14} />
                        <span>~{item.estimated_hours} Hours</span>
                      </div>
                    </div>

                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      {item.description}
                    </p>

                    {item.resource_urls && item.resource_urls.length > 0 && (
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {item.resource_urls.map((url: string, i: number) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              color: '#818cf8',
                              textDecoration: 'none',
                            }}
                          >
                            <ExternalLink size={12} />
                            <span>Recommended Learning Resource #{i + 1}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
