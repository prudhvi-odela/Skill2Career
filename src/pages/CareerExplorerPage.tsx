import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { careersApi, studentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SkeletonLoader, EmptyState, ErrorState } from '../components/StateFeedback';
import { ALL_BRANCHES, ENGINEERING_CATEGORIES } from '../data/engineeringBranches';
import { ALL_CAREER_ROLES, getCareersForBranch } from '../data/branchCareerRoles';
import { BranchCareerGoalNavigator } from '../components/BranchCareerGoalNavigator';

export const CareerExplorerPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [viewMode, setViewMode] = useState<'hierarchy' | 'catalog'>('catalog');
  const [careers, setCareers] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const userBranchCode = profile?.branch || profile?.major_or_branch || 'CSE';
  const userBranchDef = ALL_BRANCHES.find(
    b => b.code.toUpperCase() === userBranchCode.toUpperCase() ||
         b.name.toUpperCase().includes(userBranchCode.toUpperCase())
  ) || ALL_BRANCHES[0];

  useEffect(() => {
    // Default to student's enrolled branch on first load
    setSelectedBranch(userBranchDef.code);
  }, [userBranchCode]);

  useEffect(() => {
    loadCareers();
  }, [selectedBranch]);

  const loadCareers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRes, recRes] = await Promise.all([
        careersApi.getCareers(undefined, selectedBranch && selectedBranch !== 'All' ? selectedBranch : undefined),
        careersApi.getRecommendations(selectedBranch && selectedBranch !== 'All' ? selectedBranch : undefined),
      ]);

      // If backend returns records, use them, supplemented by the local authoritative catalog
      const fetched = allRes.data && allRes.data.length > 0 ? allRes.data : ALL_CAREER_ROLES;
      setCareers(fetched);
      setRecommendations(recRes.data || []);
    } catch (err: any) {
      console.warn('Network fallback to local catalog:', err);
      // Resilient fallback to local comprehensive branch careers
      const localCareers = selectedBranch && selectedBranch !== 'All' 
        ? getCareersForBranch(selectedBranch) 
        : ALL_CAREER_ROLES;
      setCareers(localCareers);
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

  // Disciplines list for pills
  const categories = [
    'All Disciplines',
    'Computer & IT',
    'Electrical & Electronics',
    'Mechanical & Related',
    'Civil & Infrastructure',
    'Chemical & Materials',
    'Aerospace & Specialized',
    'Emerging / Interdisciplinary'
  ];

  const filteredCareers = careers.filter((c) => {
    const title = c.career_title || c.title || '';
    const desc = c.description || '';
    const domain = c.domain || '';
    const category = c.category || '';
    const branchCodes: string[] = c.branch_codes || [];

    const matchesCategory = selectedCategory === 'All' || selectedCategory === 'All Disciplines' || 
      category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesBranch = !selectedBranch || selectedBranch === 'All' ||
      branchCodes.some(bc => bc.toUpperCase() === selectedBranch.toUpperCase());

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branchCodes.some(bc => bc.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesBranch && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-primary">BRANCH-SPECIALIZED CAREER ENGINE</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>All 66+ Engineering Disciplines • Real-World Industry Roles</span>
        </div>
        <h1 style={{ fontSize: '1.45rem', color: '#0f172a', marginBottom: '4px' }}>
          Career Path Matching Catalog
        </h1>
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>
          Every engineering branch features distinct real-world career roles, compensation benchmarks, core industry workflows, and automated skill-gap alignments.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setViewMode('hierarchy')}
          style={{
            padding: '8px 18px',
            borderRadius: '6px',
            background: viewMode === 'hierarchy' ? '#006EFF' : '#f1f5f9',
            color: viewMode === 'hierarchy' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: viewMode === 'hierarchy' ? '0 2px 4px rgba(0, 110, 255, 0.2)' : 'none'
          }}
        >
          <span>🎯 Branch → Career Goal Hierarchy</span>
          <span style={{ fontSize: '0.7rem', background: viewMode === 'hierarchy' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
            Mainly Learn & Roadmaps
          </span>
        </button>

        <button
          onClick={() => setViewMode('catalog')}
          style={{
            padding: '8px 18px',
            borderRadius: '6px',
            background: viewMode === 'catalog' ? '#006EFF' : '#f1f5f9',
            color: viewMode === 'catalog' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: viewMode === 'catalog' ? '0 2px 4px rgba(0, 110, 255, 0.2)' : 'none'
          }}
        >
          <span>📋 All Roles Catalog & Matching</span>
        </button>
      </div>

      {viewMode === 'hierarchy' ? (
        <BranchCareerGoalNavigator initialBranchCode={selectedBranch !== 'All' ? selectedBranch : undefined} />
      ) : (
        <>
          {/* Active Branch Status Banner */}
          <div
            className="panel-card"
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
              border: '1px solid #bbf7d0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.8rem' }}>{userBranchDef.categoryEmoji || '🎓'}</div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Enrolled Degree Discipline
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              {userBranchDef.name} ({userBranchDef.code})
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
              Specialized Target Roles: {userBranchDef.targetRoles?.join(', ') || 'Tailored Engineering Paths'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              setSelectedBranch(userBranchDef.code);
              setSelectedCategory('All');
            }}
            style={{
              background: selectedBranch === userBranchDef.code ? '#15803d' : '#ffffff',
              color: selectedBranch === userBranchDef.code ? '#ffffff' : '#15803d',
              border: '1px solid #15803d',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Show My Branch Roles ({userBranchDef.code})
          </button>
          <button
            onClick={() => {
              setSelectedBranch('All');
              setSelectedCategory('All');
            }}
            style={{
              background: selectedBranch === 'All' ? '#1e40af' : '#ffffff',
              color: selectedBranch === 'All' ? '#ffffff' : '#334155',
              border: selectedBranch === 'All' ? '1px solid #1e40af' : '1px solid #cbd5e1',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            View All Disciplines
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Search, Branch Dropdown & Category Tabs */}
      <div className="panel-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search by role title, specialized tool, or discipline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Branch Dropdown selector with all 55 branches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
              Branch Focus:
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="input-field"
              style={{ minWidth: '260px', padding: '6px 10px', fontSize: '0.82rem' }}
            >
              <option value="All">All Engineering Branches (66+)</option>
              {ENGINEERING_CATEGORIES.map((cat) => (
                <optgroup key={cat.name} label={`${cat.emoji} ${cat.name}`}>
                  {cat.branches.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Discipline Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat || (selectedCategory === 'All' && cat === 'All Disciplines');
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'All Disciplines' ? 'All' : cat)}
                style={{
                  background: isSelected ? '#1e40af' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: isSelected ? '1px solid #1e40af' : '1px solid #cbd5e1',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
        <span>
          Showing <strong>{filteredCareers.length}</strong> specialized career path{filteredCareers.length === 1 ? '' : 's'}
          {selectedBranch && selectedBranch !== 'All' ? ` tailored for ${selectedBranch}` : ''}
        </span>
        <span style={{ fontSize: '0.8rem' }}>
          Click "Set as Target" to calculate live gaps against your verified skill profile.
        </span>
      </div>

      {loading ? (
        <SkeletonLoader rows={6} type="cards" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadCareers} />
      ) : filteredCareers.length === 0 ? (
        <EmptyState
          title="No Careers Found for Selected Filters"
          message={`No direct career path matches found for "${searchQuery || selectedBranch}". Try resetting your branch filter or searching for broader engineering roles.`}
        />
      ) : (
        /* Careers Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '18px',
          }}
        >
          {filteredCareers.map((c, index) => {
            const cid = c.career_id || c.id;
            const ctitle = c.career_title || c.title;
            const matchPct = recMap.get(cid) ?? recMap.get(c.id);
            const isTarget = profile?.target_career_id === cid || profile?.target_career_id === c.id;
            const branchCodes: string[] = c.branch_codes || [];

            return (
              <div
                key={`${cid}_${index}`}
                className="panel-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  border: isTarget ? '2px solid #006EFF' : '1px solid #e2e8f0',
                  background: isTarget ? '#eff6ff' : '#ffffff',
                  boxShadow: isTarget ? '0 4px 12px rgba(0, 110, 255, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{c.domain}</span>
                      {c.market_demand && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: c.market_demand.includes('Explosive') ? '#fef3c7' : '#f0fdf4',
                            color: c.market_demand.includes('Explosive') ? '#b45309' : '#15803d',
                            border: `1px solid ${c.market_demand.includes('Explosive') ? '#fde68a' : '#bbf7d0'}`
                          }}
                        >
                          {c.market_demand}
                        </span>
                      )}
                    </div>

                    {matchPct !== undefined ? (
                      <span
                        className={matchPct >= 70 ? 'badge badge-success' : (matchPct >= 50 ? 'badge badge-warning' : 'badge badge-danger')}
                      >
                        {matchPct}% Fit
                      </span>
                    ) : (
                      <span className="badge badge-neutral">Branch Aligned</span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '6px', color: '#0f172a', fontWeight: 700 }}>
                    {ctitle}
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '12px' }}>
                    {c.description}
                  </p>

                  {/* Branch Affinity Tags */}
                  {branchCodes.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Target Branches:</span>
                      {branchCodes.map((b) => (
                        <span
                          key={b}
                          style={{
                            fontSize: '0.7rem',
                            background: b.toUpperCase() === userBranchDef.code ? '#dbeafe' : '#f1f5f9',
                            color: b.toUpperCase() === userBranchDef.code ? '#1e40af' : '#475569',
                            border: b.toUpperCase() === userBranchDef.code ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Key Industry Workflows */}
                  {c.key_workflows && c.key_workflows.length > 0 && (
                    <div style={{ marginBottom: '12px', background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Core Engineering Workflows:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                        {c.key_workflows.map((wf: string, idx: number) => (
                          <li key={idx}>{wf}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Required Competencies preview */}
                  {c.required_skills && c.required_skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                      {c.required_skills.slice(0, 4).map((sk: any) => (
                        <span
                          key={sk.skill_id}
                          style={{
                            fontSize: '0.72rem',
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1'
                          }}
                        >
                          {sk.skill_name}
                        </span>
                      ))}
                      {c.required_skills.length > 4 && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', padding: '2px 4px' }}>
                          +{c.required_skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metrics Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Benchmark: </span>
                      <strong style={{ color: '#15803d' }}>${(c.avg_salary_usd || 105000).toLocaleString()} / yr</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Min Experience: </span>
                      <strong>{c.min_exp_years === 0 ? 'Fresh Graduate' : `${c.min_exp_years}+ yrs`}</strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    onClick={() => handleSetTarget(cid)}
                    className={isTarget ? 'btn-secondary' : 'btn-primary'}
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    {isTarget ? '★ ACTIVE TARGET ROLE' : 'Set as Target Career'}
                  </button>

                  <Link
                    to={`/app/careers/${cid}`}
                    className="btn-secondary"
                    style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                  >
                    Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
};
