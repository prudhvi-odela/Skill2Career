import React, { useState, useEffect } from 'react';
import {
  Globe2,
  TrendingUp,
  AlertCircle,
  Database,
  Building2,
  Scale,
  RefreshCw,
  Clock,
  ExternalLink,
  ShieldCheck,
  Flame,
  Search
} from 'lucide-react';
import { marketApi, careersApi, studentApi } from '../api/client';

export const CareerMarketIntelligencePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [profile, setProfile] = useState<any>(null);
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('CR001');
  const [careerSignal, setCareerSignal] = useState<any>(null);
  const [careerSkillsMatrix, setCareerSkillsMatrix] = useState<any>(null);
  const [studentAnalysis, setStudentAnalysis] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);

  // Multi-career comparison state
  const [compareCareerIds, setCompareCareerIds] = useState<string[]>(['CR001', 'CR004']);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [comparing, setComparing] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCareerId) {
      loadCareerMarketData(selectedCareerId);
    }
  }, [selectedCareerId]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, careersRes, sourcesRes] = await Promise.all([
        studentApi.getProfile(),
        careersApi.getCareers(),
        marketApi.getSources()
      ]);

      const prof = profileRes.data;
      const crs = careersRes.data;
      const srcs = sourcesRes.data;

      setProfile(prof);
      setCareers(crs);
      setSources(srcs);

      const defaultCid = prof.target_career_id || (crs.length > 0 ? crs[0].career_code || crs[0].id : 'CR001');
      setSelectedCareerId(defaultCid);

      // Pre-set comparison careers
      if (crs.length >= 2) {
        setCompareCareerIds([crs[0].career_code || crs[0].id, crs[1].career_code || crs[1].id]);
      }
    } catch (err: any) {
      console.error('Error loading market intelligence initial data:', err);
      setError(err.response?.data?.detail || 'Failed to connect to market intelligence engine.');
    } finally {
      setLoading(false);
    }
  };

  const loadCareerMarketData = async (careerId: string) => {
    try {
      const [signalRes, matrixRes, analysisRes] = await Promise.allSettled([
        marketApi.getCareerSignal(careerId),
        marketApi.getCareerSkillsMarket(careerId),
        marketApi.getStudentAnalysis(careerId)
      ]);

      if (signalRes.status === 'fulfilled') setCareerSignal(signalRes.value.data);
      if (matrixRes.status === 'fulfilled') setCareerSkillsMatrix(matrixRes.value.data);
      if (analysisRes.status === 'fulfilled') setStudentAnalysis(analysisRes.value.data);
    } catch (err) {
      console.error('Error fetching career market signals:', err);
    }
  };

  const handleRunComparison = async () => {
    if (compareCareerIds.length < 2) return;
    setComparing(true);
    try {
      const res = await marketApi.compareCareers(compareCareerIds);
      setComparisonData(res.data);
    } catch (err: any) {
      console.error('Error running career comparison:', err);
    } finally {
      setComparing(false);
    }
  };

  const toggleCompareCareer = (cid: string) => {
    if (compareCareerIds.includes(cid)) {
      if (compareCareerIds.length > 2) {
        setCompareCareerIds(compareCareerIds.filter(id => id !== cid));
      }
    } else {
      if (compareCareerIds.length < 4) {
        setCompareCareerIds([...compareCareerIds, cid]);
      }
    }
  };

  const getFreshnessBadge = (freshness: string) => {
    if (freshness === 'fresh') {
      return (
        <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          ● Verified Fresh
        </span>
      );
    }
    if (freshness === 'expiring_soon') {
      return (
        <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
          ▲ Expiring Soon
        </span>
      );
    }
    if (freshness === 'unavailable') {
      return (
        <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)' }}>
          ○ Unobserved (Fallback)
        </span>
      );
    }
    return (
      <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        ■ Stale / Archive
      </span>
    );
  };

  const getPriorityBadge = (p: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      URGENT: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
      HIGH: { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' },
      MODERATE: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
      LOW: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' }
    };
    const c = colors[p] || colors.LOW;
    return (
      <span className="badge" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
        {p}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#94a3b8' }}>Connecting to Career Market Intelligence Engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className="card" style={{ textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#f87171', marginBottom: '8px' }}>Market Signal Connection Issue</h2>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>{error}</p>
          <button className="btn btn-primary" onClick={loadInitialData}>
            <RefreshCw size={16} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 0 60px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Globe2 size={28} color="#6366f1" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Career Market Intelligence</h1>
            <span className="badge badge-primary">Separate Layer</span>
          </div>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Macro industry demand indices, growth vectors, and data-provenance tracking. Complements the ML readiness benchmark without altering trained model weights.
          </p>
        </div>

        {/* Career Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Target Role:</label>
          <select
            className="input"
            value={selectedCareerId}
            onChange={(e) => setSelectedCareerId(e.target.value)}
            style={{ minWidth: '240px' }}
          >
            {careers.map((c) => (
              <option key={c.career_code || c.id} value={c.career_code || c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Stats Overview */}
      {careerSignal && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                {careerSignal.is_fallback ? 'BASELINE BENCHMARK' : 'MARKET DEMAND INDEX'}
              </span>
              <Flame size={18} color="#f97316" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
              {careerSignal.demand_score?.toFixed(1)} <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 500 }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: careerSignal.is_fallback ? '#94a3b8' : '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> Trend: {careerSignal.trend_direction?.toUpperCase()}
              {careerSignal.is_fallback && <span style={{ color: '#fb923c' }}>(Fallback)</span>}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>SURVEY SAMPLE SIZE</span>
              <Building2 size={18} color="#6366f1" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
              {careerSignal.sample_size ? careerSignal.sample_size.toLocaleString() : 'N/A'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Region: {careerSignal.region || 'Global Technology Hubs'}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>ML READINESS BENCHMARK</span>
              <ShieldCheck size={18} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
              {studentAnalysis?.ml_readiness_benchmark_score?.toFixed(1) || '65.0'}%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Authoritative student competency model
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>DATA FRESHNESS & SOURCE</span>
              <Clock size={18} color="#a855f7" />
            </div>
            <div style={{ marginBottom: '6px' }}>
              {getFreshnessBadge(careerSignal.freshness)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              Source: {careerSignal.source_name || careerSignal.source_id || 'Neutral Baseline'}
            </div>
          </div>
        </div>
      )}

      {/* Student vs Market Gap Prioritization */}
      {studentAnalysis && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Student-vs-Market Gap Prioritization</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
                Merges your verified proficiency deficits with external industry demand signals to establish high-impact learning priorities.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {studentAnalysis.top_priority_market_skills?.map((sk: string) => (
                <span key={sk} className="badge badge-primary">
                  [Key Skill] {sk}
                </span>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '12px 10px' }}>SKILL</th>
                  <th style={{ padding: '12px 10px' }}>CURRENT / REQUIRED</th>
                  <th style={{ padding: '12px 10px' }}>GAP DEFICIT</th>
                  <th style={{ padding: '12px 10px' }}>MARKET DEMAND</th>
                  <th style={{ padding: '12px 10px' }}>PRIORITY</th>
                  <th style={{ padding: '12px 10px' }}>PRIORITY RATIONALE</th>
                  <th style={{ padding: '12px 10px' }}>PROVENANCE</th>
                </tr>
              </thead>
              <tbody>
                {studentAnalysis.analyzed_skill_gaps?.map((gap: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#ffffff' }}>
                      {gap.skill_name}
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{gap.category}</div>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#94a3b8' }}>
                      <span style={{ color: '#ffffff' }}>{gap.student_proficiency?.toFixed(1)}</span> / {gap.required_proficiency?.toFixed(1)}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ color: gap.gap > 0 ? '#f87171' : '#4ade80', fontWeight: 600 }}>
                        {gap.gap > 0 ? `-${gap.gap.toFixed(1)}` : 'Met'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                          <div style={{ width: `${gap.market_demand_score}%`, height: '100%', background: gap.market_demand_score >= 90 ? '#f97316' : '#3b82f6' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#ffffff' }}>{gap.market_demand_score?.toFixed(0)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {getPriorityBadge(gap.priority_level)}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#cbd5e1', fontSize: '0.8rem' }}>
                      {gap.priority_reason}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#64748b', fontSize: '0.75rem' }}>
                      {gap.source_provenance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Multi-Career Comparison Tool */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={20} color="#6366f1" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Multi-Career Side-by-Side Comparison</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
              Select 2 to 4 target careers to evaluate objective evidence across student competency match, ML readiness benchmark, and external market demand.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleRunComparison}
            disabled={comparing || compareCareerIds.length < 2}
          >
            {comparing ? 'Comparing...' : 'Run Comparative Analysis'}
          </button>
        </div>

        {/* Selection Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {careers.map((c) => {
            const cid = c.career_code || c.id;
            const isSelected = compareCareerIds.includes(cid);
            return (
              <button
                key={cid}
                onClick={() => toggleCompareCareer(cid)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.4)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease'
                }}
              >
                {isSelected ? '[Selected] ' : '[Select] '} {c.title}
              </button>
            );
          })}
        </div>

        {/* Comparison Table */}
        {comparisonData && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '12px 10px' }}>CAREER PATHWAY</th>
                  <th style={{ padding: '12px 10px' }}>SKILL MATCH %</th>
                  <th style={{ padding: '12px 10px' }}>ML READINESS</th>
                  <th style={{ padding: '12px 10px' }}>MARKET DEMAND</th>
                  <th style={{ padding: '12px 10px' }}>BENCHMARK SALARY</th>
                  <th style={{ padding: '12px 10px' }}>CRITICAL SKILL GAPS</th>
                  <th style={{ padding: '12px 10px' }}>FRESHNESS</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.comparisons?.map((c: any) => (
                  <tr key={c.career_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#ffffff' }}>
                      {c.career_title}
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{c.domain}</div>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontWeight: 700, color: '#38bdf8' }}>{c.existing_skill_match_pct}%</span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontWeight: 700, color: '#a855f7' }}>{c.existing_readiness_benchmark}%</span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontWeight: 600, color: '#f97316' }}>{c.market_demand_score}/100</span>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.market_trend}</div>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#10b981', fontWeight: 600 }}>
                      ${c.avg_salary_usd?.toLocaleString()}
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{c.salary_provenance}</div>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {c.critical_skill_gaps?.map((g: any, i: number) => (
                          <span key={i} className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                            {g.skill_name || g.skill_id}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {getFreshnessBadge(c.data_freshness)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', color: '#94a3b8' }}>
              <strong>Neutrality Principle:</strong> {comparisonData.provenance_disclaimer}
            </div>
          </div>
        )}
      </div>

      {/* Data Provenance & Authoritative Sources Footer */}
      <div className="card" style={{ background: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Database size={18} color="#6366f1" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Data Provenance & Verified Sources</h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>
          Skill2Career market signals are attributed to authoritative open datasets and government statistics. No live scraping is performed without explicit licensing.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          {sources.map((s: any) => (
            <div key={s.source_id} style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>{s.source_name}</strong>
                <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>{s.quality_level}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                <strong>Provider:</strong> {s.provider} | <strong>Coverage:</strong> {s.coverage}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>
                {s.methodology}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ExternalLink size={12} /> {s.license}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareerMarketIntelligencePage;
