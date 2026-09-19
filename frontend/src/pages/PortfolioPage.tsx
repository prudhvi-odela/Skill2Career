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
  Sparkles,
  X
} from 'lucide-react';
import { SkeletonLoader, EmptyState, ErrorState } from '../components/StateFeedback';

export const PortfolioPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'certifications'>('projects');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, cRes] = await Promise.all([
        studentApi.getProjects(),
        studentApi.getCertifications(),
      ]);
      setProjects(pRes.data);
      setCertifications(cRes.data);
    } catch (err: any) {
      console.error('Failed to load portfolio:', err);
      setError(err.response?.data?.detail || 'Failed to load portfolio items.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
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
    } catch (err: any) {
      console.error('Project creation failed:', err);
      alert(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
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
    } catch (err: any) {
      console.error('Certification creation failed:', err);
      alert(err.response?.data?.detail || 'Failed to add certification');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Projects & Verified Credentials</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Portfolio project complexity and verified industry certifications directly elevate your ML Job-Readiness evaluation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add Project</span>
          </button>
          <button
            onClick={() => setIsCertModalOpen(true)}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add Certification</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('projects')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'projects' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'projects' ? '#818cf8' : '#9ca3af',
            border: activeTab === 'projects' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <FolderGit2 size={16} />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certifications')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'certifications' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'certifications' ? '#818cf8' : '#9ca3af',
            border: activeTab === 'certifications' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Award size={16} />
          <span>Certifications ({certifications.length})</span>
        </button>
      </div>

      {loading ? (
        <SkeletonLoader count={4} type="cards" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadPortfolio} />
      ) : activeTab === 'projects' ? (
        /* Projects Grid */
        projects.length === 0 ? (
          <EmptyState
            title="No Projects Recorded"
            description="Add real-world coding projects with repository links and complexity ratings to boost your ML Job-Readiness score."
            actionText="Add First Project"
            onAction={() => setIsProjectModalOpen(true)}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '24px',
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
                    <span className="badge badge-indigo">Complexity: {p.complexity_rating} / 5.0</span>
                    <span className="badge badge-cyan">{p.profile_id ? 'Active' : ''}</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '8px' }}>{p.title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '14px' }}>
                    {p.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {p.tech_stack?.split(',').map((tech: string, i: number) => (
                      <span key={i} className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '14px' }}>
                  {p.repo_url && (
                    <a
                      href={p.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                    >
                      <GitBranch size={14} />
                      <span>Repository</span>
                    </a>
                  )}
                  {p.live_url && (
                    <a
                      href={p.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                    >
                      <ExternalLink size={14} />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Certifications Grid */
        certifications.length === 0 ? (
          <EmptyState
            title="No Certifications Added"
            description="Add recognized certificates from AWS, Google Cloud, Coursera, or Microsoft to substantiate your technical skills."
            actionText="Add Certification"
            onAction={() => setIsCertModalOpen(true)}
          />
        ) : (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="badge badge-emerald">Verified Credential</span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '4px' }}>{c.name}</h3>
                  <div style={{ color: '#818cf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px' }}>
                    {c.issuer}
                  </div>
                  {c.issue_date && (
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      Issued: {c.issue_date}
                    </span>
                  )}
                </div>

                {c.credential_url && (
                  <a
                    href={c.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center', width: '100%' }}
                  >
                    <ExternalLink size={14} />
                    <span>View Credential URL</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Add Project Modal */}
      {isProjectModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.35rem' }}>Add Portfolio Project</h2>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Cache Engine"
                  className="input-field"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Short Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Architected an in-memory key-value store using Raft consensus..."
                  className="input-field"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  required
                  placeholder="Python, FastAPI, Redis, Docker"
                  className="input-field"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">GitHub Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    className="input-field"
                    value={projRepo}
                    onChange={(e) => setProjRepo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Live Deployment URL</label>
                  <input
                    type="url"
                    placeholder="https://myproject.app"
                    className="input-field"
                    value={projLive}
                    onChange={(e) => setProjLive(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Complexity Rating</label>
                  <strong style={{ color: '#818cf8' }}>{projComplexity} / 5.0</strong>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={projComplexity}
                  onChange={(e) => setProjComplexity(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  {modalLoading ? 'Saving...' : 'Save Project'}
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
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.35rem' }}>Add Industry Certification</h2>
              <button
                onClick={() => setIsCertModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCert} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Certification Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="input-field"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Issuing Body</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services, Google, Coursera"
                  className="input-field"
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Issue Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Credential Verification URL</label>
                  <input
                    type="url"
                    placeholder="https://credly.com/..."
                    className="input-field"
                    value={certUrl}
                    onChange={(e) => setCertUrl(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  {modalLoading ? 'Saving...' : 'Save Certification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
