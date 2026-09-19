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
  GitPullRequest
} from 'lucide-react';

export const CareerExplorerPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    try {
      const [allRes, recRes] = await Promise.all([
        careersApi.getCareers(),
        careersApi.getRecommendations(),
      ]);
      setCareers(allRes.data);
      setRecommendations(recRes.data);
    } catch (err) {
      console.error('Failed to load careers:', err);
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
          Explore technical career paths, compensation benchmarks, and required skill proficiencies.
        </p>
      </div>

      {/* Search & Domain Filter */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '38px' }}
            placeholder="Search roles e.g. Machine Learning, Full-Stack..."
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
              }}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Careers Grid */}
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
                      {matchPct}% Match
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#ffffff' }}>{c.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '16px' }}>
                  {c.description}
                </p>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.825rem', color: '#d1d5db', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={14} color="#34d399" />
                    <span>Avg ${c.avg_salary_usd.toLocaleString()} / yr</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={14} color="#818cf8" />
                    <span>{c.min_exp_years === 0 ? 'Entry Level' : `${c.min_exp_years}+ yrs exp`}</span>
                  </div>
                </div>

                {/* Required Skills Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {c.required_skills.slice(0, 5).map((rs: any) => (
                    <span
                      key={rs.skill_id}
                      style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        color: '#9ca3af',
                      }}
                    >
                      {rs.skill_name} (Lvl {rs.required_level})
                    </span>
                  ))}
                  {c.required_skills.length > 5 && (
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', padding: '3px 4px' }}>
                      +{c.required_skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => handleSetTarget(c.id)}
                  className={isTarget ? 'btn-secondary' : 'btn-primary'}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <Target size={14} />
                  <span>{isTarget ? 'Current Target' : 'Set as Target'}</span>
                </button>

                <Link
                  to={`/app/careers/${c.id}`}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  Details &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
