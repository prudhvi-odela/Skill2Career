import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { careersApi, studentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Search,
  DollarSign,
  Briefcase,
  Target,
  ArrowRight,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { SkeletonLoader, EmptyState, ErrorState } from '../components/StateFeedback';

export const CareerExplorerPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRes, recRes] = await Promise.all([
        careersApi.getCareers(),
        careersApi.getRecommendations(),
      ]);
      setCareers(allRes.data);
      setRecommendations(recRes.data);
    } catch (err: any) {
      console.error('Failed to load careers:', err);
      setError(err.response?.data?.detail || 'Failed to load career catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetTarget = async (careerId: string) => {
    try {
      await studentApi.updateProfile({ target_career_id: careerId });
      await refreshProfile();
      navigate('/app/skill-gap');
    } catch (err) {
      console.error('Failed to set target career:', err);
    }
  };

  const recMap = new Map(recommendations.map((r) => [r.career_id, r.match_percentage]));

  const domains = ['All', ...Array.from(new Set(careers.map((c) => c.domain)))];

  const filteredCareers = careers.filter((c) => {
    const matchesDomain = selectedDomain === 'All' || c.domain === selectedDomain;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Industry Career Explorer</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
          Explore technical roles, market salaries, required skill profiles, and live compatibility matches based on your verified skills.
        </p>
      </div>

      {/* Search & Domain Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '38px' }}
            placeholder="Search roles e.g. Machine Learning, Cloud Architect, Full-Stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              style={{
                background: selectedDomain === dom ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                color: selectedDomain === dom ? '#ffffff' : '#d1d5db',
                border: selectedDomain === dom ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonLoader rows={6} type="cards" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadCareers} />
      ) : filteredCareers.length === 0 ? (
        <EmptyState
          title="No Careers Found"
          message={`No career matches found for "${searchQuery}". Try changing your search query or domain filter.`}
        />
      ) : (
        /* Careers Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredCareers.map((c) => {
            const matchPct = recMap.get(c.id);
            const isTarget = profile?.target_career_id === c.id;

            return (
              <div
                key={c.id}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '18px',
                  border: isTarget ? '1px solid #6366f1' : '1px solid var(--border-color)',
                  background: isTarget
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(17, 24, 39, 0.9) 100%)'
                    : 'var(--card-bg)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className="badge badge-indigo">{c.domain}</span>
                    {matchPct !== undefined && (
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: matchPct >= 70 ? '#34d399' : (matchPct >= 50 ? '#fbbf24' : '#f87171'),
                        }}
                      >
                        {matchPct}% Skill Match
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#ffffff' }}>{c.title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '16px' }}>
                    {c.description}
                  </p>

                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#d1d5db', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DollarSign size={15} color="#34d399" />
                      <span>${c.avg_salary_usd.toLocaleString()} / yr</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={15} color="#818cf8" />
                      <span>{c.min_exp_years === 0 ? 'Entry Level' : `${c.min_exp_years}+ yrs exp`}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    onClick={() => handleSetTarget(c.id)}
                    className={isTarget ? 'btn-secondary' : 'btn-primary'}
                    style={{ flex: 1, padding: '9px 12px', fontSize: '0.825rem' }}
                  >
                    <Target size={14} />
                    <span>{isTarget ? 'Active Target' : 'Set as Target'}</span>
                  </button>

                  <Link
                    to={`/app/careers/${c.id}`}
                    className="btn-secondary"
                    style={{ padding: '9px 14px', fontSize: '0.825rem' }}
                  >
                    <span>View Role</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
