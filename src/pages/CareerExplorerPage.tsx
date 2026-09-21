import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { careersApi, studentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
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

  const recMap = new Map(recommendations.map((r) => [r.career_id, r.match_score ?? r.match_percentage]));

  const domains = ['All', ...Array.from(new Set(careers.map((c) => c.domain)))];

  const filteredCareers = careers.filter((c) => {
    const title = c.career_title || c.title || '';
    const desc = c.description || '';
    const matchesDomain = selectedDomain === 'All' || c.domain === selectedDomain;
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-primary">SKILL2CAREER ENGINE</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Verified Career Path Architecture</span>
        </div>
        <h1 style={{ fontSize: '1.45rem', color: '#0f172a', marginBottom: '4px' }}>
          Career Path Matching Catalog
        </h1>
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>
          Explore technical career paths, market compensation benchmarks, required competencies, and live compatibility scores evaluated against your evolving skill profile.
        </p>
      </div>

      {/* Search & Domain Filter Toolbar */}
      <div className="panel-card" style={{ padding: '14px 18px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search career paths (e.g. Machine Learning, Cloud Architect, Full-Stack)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              style={{
                background: selectedDomain === dom ? '#1e40af' : '#ffffff',
                color: selectedDomain === dom ? '#ffffff' : '#334155',
                border: selectedDomain === dom ? '1px solid #1e40af' : '1px solid #cbd5e1',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: selectedDomain === dom ? '0 1px 2px rgba(30, 64, 175, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.02)',
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
            gap: '18px',
          }}
        >
          {filteredCareers.map((c) => {
            const cid = c.career_id || c.id;
            const ctitle = c.career_title || c.title;
            const matchPct = recMap.get(cid) ?? recMap.get(c.id);
            const isTarget = profile?.target_career_id === cid || profile?.target_career_id === c.id;

            return (
              <div
                key={cid}
                className="panel-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  border: isTarget ? '2px solid #006EFF' : '1px solid #e2e8f0',
                  background: isTarget ? '#eff6ff' : '#ffffff',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-neutral">{c.domain}</span>
                    {matchPct !== undefined && (
                      <span
                        className={matchPct >= 70 ? 'badge badge-success' : (matchPct >= 50 ? 'badge badge-warning' : 'badge badge-danger')}
                      >
                        {matchPct}% Skill Fit
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginBottom: '6px', color: '#0f172a' }}>
                    {ctitle}
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '14px' }}>
                    {c.description}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#475569', borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Benchmark: </span>
                      <strong style={{ color: '#15803d' }}>${(c.avg_salary_usd || 105000).toLocaleString()} / yr</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Experience: </span>
                      <strong>{c.min_exp_years === 0 ? 'Entry Level' : `${c.min_exp_years}+ yrs`}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button
                    onClick={() => handleSetTarget(cid)}
                    className={isTarget ? 'btn-secondary' : 'btn-primary'}
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.8rem' }}
                  >
                    {isTarget ? '[ACTIVE TARGET]' : 'Set as Target'}
                  </button>

                  <Link
                    to={`/app/careers/${cid}`}
                    className="btn-secondary"
                    style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                  >
                    View Role →
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
