import React, { useState, useEffect } from 'react';
import { studentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FolderGit2,
  Award,
  Plus,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  Code,
  Layers,
  Sparkles
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Project form state
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projRepo, setProjRepo] = useState('');
  const [projLive, setProjLive] = useState('');
  const [projComplexity, setProjComplexity] = useState(3.5);

  // Cert form state
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certUrl, setCertUrl] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        studentApi.getProjects(),
        studentApi.getCertifications(),
      ]);
      setProjects(pRes.data);
      setCertifications(cRes.data);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentApi.createProject({
        title: projTitle,
        description: projDesc,
        tech_stack: projTech,
        repo_url: projRepo || null,
        live_url: projLive || null,
        complexity_rating: Number(projComplexity),
      });
      await loadPortfolio();
      await refreshProfile();
      setIsProjectModalOpen(false);
      setProjTitle('');
      setProjDesc('');
      setProjTech('');
      setProjRepo('');
      setProjLive('');
    } catch (err) {
      console.error('Project creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentApi.createCertification({
        name: certName,
        issuer: certIssuer,
        issue_date: certDate || null,
        credential_url: certUrl || null,
      });
      await loadPortfolio();
      await refreshProfile();
      setIsCertModalOpen(false);
      setCertName('');
      setCertIssuer('');
      setCertDate('');
      setCertUrl('');
    } catch (err) {
      console.error('Certification creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Projects & Verified Credentials</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
          Portfolio depth and verified certifications directly elevate your ML Job-Readiness evaluation.
        </p>
      </div>

      {/* Projects Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderGit2 size={20} color="#818cf8" />
            <h2 style={{ fontSize: '1.35rem' }}>Portfolio Projects ({projects.length})</h2>
          </div>

          <button onClick={() => setIsProjectModalOpen(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Plus size={16} />
            <span>Add Project</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px',
          }}
        >
          {projects.map((p) => (
            <div
              key={p.id}
              className="glass-card glass-card-interactive"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>{p.title}</h3>
                  <span className="badge badge-indigo">
                    Complexity: {p.complexity_rating}/5.0
                  </span>
                </div>

                <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '16px' }}>
                  {p.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {p.tech_stack.split(',').map((tech: string, tIdx: number) => (
                    <span
                      key={tIdx}
                      style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: '#d1d5db',
                      }}
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                {p.repo_url && (
                  <a
                    href={p.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <GitBranch size={14} />
                    <span>Source Code</span>
                  </a>
                )}
                {p.live_url && (
                  <a
                    href={p.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <ExternalLink size={14} />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#34d399" />
            <h2 style={{ fontSize: '1.35rem' }}>Verified Certifications ({certifications.length})</h2>
          </div>

          <button onClick={() => setIsCertModalOpen(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Plus size={16} />
            <span>Add Certification</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {certifications.map((c) => (
            <div
              key={c.id}
              className="glass-card"
              style={{
                padding: '22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.05rem', color: '#ffffff' }}>{c.name}</h3>
                  <CheckCircle2 size={16} color="#34d399" />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                  Issued by <strong style={{ color: '#d1d5db' }}>{c.issuer}</strong>
                </div>
                {c.issue_date && (
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Issued: {c.issue_date}</span>
                )}
              </div>

              {c.credential_url && (
                <a
                  href={c.credential_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  <ExternalLink size={12} />
                  <span>Verify</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Project Modal */}
      {isProjectModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '18px' }}>Add Portfolio Project</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Project Title</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Distributed Task Queue"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Description & Architecture</label>
                <textarea
                  rows={3}
                  required
                  className="input-field"
                  placeholder="Explain the problem solved, architecture choices, and key technical achievements..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Python, FastAPI, Redis, Docker, React"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Repository URL</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://github.com/..."
                    value={projRepo}
                    onChange={(e) => setProjRepo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Live Demo URL</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://..."
                    value={projLive}
                    onChange={(e) => setProjLive(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Complexity Rating</label>
                  <strong style={{ color: '#818cf8' }}>{projComplexity}/5.0</strong>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={projComplexity}
                  onChange={(e) => setProjComplexity(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Adding...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Cert Modal */}
      {isCertModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '18px' }}>Add Certification</h2>
            <form onSubmit={handleCreateCert} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Certification Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Issuing Organization</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Amazon Web Services"
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Issue Date</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Nov 2025"
                  value={certDate}
                  onChange={(e) => setCertDate(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Credential Verification URL</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://..."
                  value={certUrl}
                  onChange={(e) => setCertUrl(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsCertModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Adding...' : 'Save Certification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
