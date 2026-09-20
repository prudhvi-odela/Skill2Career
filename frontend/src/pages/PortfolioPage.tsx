import React, { useState, useEffect } from 'react';
import { studentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FolderGit2,
  Award,
  Briefcase,
  Plus,
  ExternalLink,
  GitBranch,
  Edit2,
  Trash2,
  Calendar,
  Building,
  CheckCircle2,
  X,
  AlertTriangle
} from 'lucide-react';
import { SkeletonLoader, EmptyState, ErrorState } from '../components/StateFeedback';

export const PortfolioPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [workExperiences, setWorkExperiences] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'certifications' | 'experience'>('projects');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projRepo, setProjRepo] = useState('');
  const [projLive, setProjLive] = useState('');
  const [projComplexity, setProjComplexity] = useState(3.5);

  // Cert Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certUrl, setCertUrl] = useState('');

  // Experience Modal State
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [expRole, setExpRole] = useState('');
  const [employmentType, setEmploymentType] = useState('INTERNSHIP');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState('');
  const [expSkills, setExpSkills] = useState<string[]>([]);
  const [expSkillInput, setExpSkillInput] = useState('');
  const [expResponsibilities, setExpResponsibilities] = useState<string[]>([]);
  const [expRespInput, setExpRespInput] = useState('');

  // Deletion confirm state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'project' | 'cert' | 'exp'; id: string; name: string } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, cRes, eRes] = await Promise.all([
        studentApi.getProjects(),
        studentApi.getCertifications(),
        studentApi.getWorkExperiences(),
      ]);
      setProjects(pRes.data);
      setCertifications(cRes.data);
      setWorkExperiences(eRes.data);
    } catch (err: any) {
      console.error('Failed to load portfolio:', err);
      setError(err.response?.data?.detail || 'Failed to load portfolio items.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PROJECT HANDLERS ----------------
  const openAddProject = () => {
    setEditingProjectId(null);
    setProjTitle('');
    setProjDesc('');
    setProjTech('');
    setProjRepo('');
    setProjLive('');
    setProjComplexity(3.5);
    setIsProjectModalOpen(true);
  };

  const openEditProject = (p: any) => {
    setEditingProjectId(p.id);
    setProjTitle(p.title);
    setProjDesc(p.description || '');
    setProjTech(p.tech_stack || '');
    setProjRepo(p.repo_url || '');
    setProjLive(p.live_url || '');
    setProjComplexity(p.complexity_rating || 3.5);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingProjectId) {
        await studentApi.updateProject(editingProjectId, {
          title: projTitle,
          description: projDesc,
          tech_stack: projTech,
          repo_url: projRepo || null,
          live_url: projLive || null,
          complexity_rating: Number(projComplexity),
        });
      } else {
        await studentApi.createProject({
          title: projTitle,
          description: projDesc,
          tech_stack: projTech,
          repo_url: projRepo || null,
          live_url: projLive || null,
          complexity_rating: Number(projComplexity),
        });
      }
      await loadPortfolio();
      await refreshProfile();
      setIsProjectModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save project');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setModalLoading(true);
    try {
      await studentApi.deleteProject(id);
      await loadPortfolio();
      await refreshProfile();
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete project');
    } finally {
      setModalLoading(false);
    }
  };

  // ---------------- CERTIFICATION HANDLERS ----------------
  const openAddCert = () => {
    setEditingCertId(null);
    setCertName('');
    setCertIssuer('');
    setCertDate('');
    setCertUrl('');
    setIsCertModalOpen(true);
  };

  const openEditCert = (c: any) => {
    setEditingCertId(c.id);
    setCertName(c.name);
    setCertIssuer(c.issuer);
    setCertDate(c.issue_date || '');
    setCertUrl(c.credential_url || '');
    setIsCertModalOpen(true);
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingCertId) {
        await studentApi.updateCertification(editingCertId, {
          name: certName,
          issuer: certIssuer,
          issue_date: certDate || null,
          credential_url: certUrl || null,
        });
      } else {
        await studentApi.createCertification({
          name: certName,
          issuer: certIssuer,
          issue_date: certDate || null,
          credential_url: certUrl || null,
        });
      }
      await loadPortfolio();
      await refreshProfile();
      setIsCertModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save certification');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCert = async (id: string) => {
    setModalLoading(true);
    try {
      await studentApi.deleteCertification(id);
      await loadPortfolio();
      await refreshProfile();
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete certification');
    } finally {
      setModalLoading(false);
    }
  };

  // ---------------- WORK EXPERIENCE HANDLERS ----------------
  const openAddExp = () => {
    setEditingExpId(null);
    setCompanyName('');
    setExpRole('');
    setEmploymentType('INTERNSHIP');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setExpDescription('');
    setExpSkills([]);
    setExpResponsibilities([]);
    setIsExpModalOpen(true);
  };

  const openEditExp = (exp: any) => {
    setEditingExpId(exp.id || exp._id);
    setCompanyName(exp.company_name);
    setExpRole(exp.role);
    setEmploymentType(exp.employment_type || 'INTERNSHIP');
    setStartDate(exp.start_date || '');
    setEndDate(exp.end_date || '');
    setIsCurrent(Boolean(exp.is_current));
    setExpDescription(exp.description || '');
    setExpSkills(exp.skills_used || []);
    setExpResponsibilities(exp.responsibilities || []);
    setIsExpModalOpen(true);
  };

  const handleAddExpSkill = () => {
    const trimmed = expSkillInput.trim();
    if (trimmed && !expSkills.includes(trimmed)) {
      setExpSkills([...expSkills, trimmed]);
      setExpSkillInput('');
    }
  };

  const handleAddExpResp = () => {
    const trimmed = expRespInput.trim();
    if (trimmed && !expResponsibilities.includes(trimmed)) {
      setExpResponsibilities([...expResponsibilities, trimmed]);
      setExpRespInput('');
    }
  };

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const payload = {
        company_name: companyName,
        role: expRole,
        employment_type: employmentType,
        start_date: startDate || null,
        end_date: isCurrent ? null : (endDate || null),
        is_current: isCurrent,
        description: expDescription || null,
        responsibilities: expResponsibilities,
        skills_used: expSkills,
      };

      if (editingExpId) {
        await studentApi.updateWorkExperience(editingExpId, payload);
      } else {
        await studentApi.createWorkExperience(payload);
      }
      await loadPortfolio();
      await refreshProfile();
      setIsExpModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save experience');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteExp = async (id: string) => {
    setModalLoading(true);
    try {
      await studentApi.deleteWorkExperience(id);
      await loadPortfolio();
      await refreshProfile();
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete experience');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Portfolio, Experience & Verified Credentials</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Document your real-world engineering projects, internships, work experience, and industry credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={openAddProject}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add Project</span>
          </button>
          <button
            onClick={openAddExp}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add Experience</span>
          </button>
          <button
            onClick={openAddCert}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add Certification</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', overflowX: 'auto' }}>
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
          onClick={() => setActiveTab('experience')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'experience' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'experience' ? '#818cf8' : '#9ca3af',
            border: activeTab === 'experience' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Briefcase size={16} />
          <span>Work Experience ({workExperiences.length})</span>
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
            onAction={openAddProject}
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditProject(p)}
                        style={{ background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#9ca3af', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Edit Project"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'project', id: p.id, name: p.title })}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#f87171', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
      ) : activeTab === 'experience' ? (
        /* Work Experience Grid */
        workExperiences.length === 0 ? (
          <EmptyState
            title="No Work Experience or Internships"
            description="Document your industry internships, full-time engineering roles, or freelance contracts with demonstrated skills."
            actionText="Add First Experience"
            onAction={openAddExp}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '24px',
            }}
          >
            {workExperiences.map((exp) => (
              <div
                key={exp.id || exp._id}
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
                    <span className="badge badge-emerald">{exp.employment_type?.replace('_', ' ')}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditExp(exp)}
                        style={{ background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#9ca3af', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Edit Experience"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'exp', id: exp.id || exp._id, name: `${exp.role} at ${exp.company_name}` })}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#f87171', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Delete Experience"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '4px' }}>{exp.role}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>
                    <Building size={14} />
                    <span>{exp.company_name}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '0.8rem', marginBottom: '12px' }}>
                    <Calendar size={13} />
                    <span>
                      {exp.start_date || 'N/A'} — {exp.is_current ? 'Present (Active)' : (exp.end_date || 'N/A')}
                    </span>
                  </div>

                  {exp.description && (
                    <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '12px' }}>
                      {exp.description}
                    </p>
                  )}

                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Responsibilities:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', color: '#9ca3af', fontSize: '0.8rem' }}>
                        {exp.responsibilities.map((r: string, idx: number) => (
                          <li key={idx} style={{ marginBottom: '2px' }}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exp.skills_used && exp.skills_used.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {exp.skills_used.map((skill: string, idx: number) => (
                        <span key={idx} className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
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
            onAction={openAddCert}
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditCert(c)}
                        style={{ background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#9ca3af', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Edit Certification"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'cert', id: c.id, name: c.name })}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#f87171', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Delete Certification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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

      {/* Project Modal (Add/Edit) */}
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
              <h2 style={{ fontSize: '1.35rem' }}>{editingProjectId ? 'Edit Project' : 'Add Portfolio Project'}</h2>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  {modalLoading ? 'Saving...' : (editingProjectId ? 'Update Project' : 'Save Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cert Modal (Add/Edit) */}
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
              <h2 style={{ fontSize: '1.35rem' }}>{editingCertId ? 'Edit Certification' : 'Add Industry Certification'}</h2>
              <button
                onClick={() => setIsCertModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCert} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  {modalLoading ? 'Saving...' : (editingCertId ? 'Update Certification' : 'Save Certification')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Experience Modal (Add/Edit) */}
      {isExpModalOpen && (
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
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.35rem' }}>{editingExpId ? 'Edit Work Experience' : 'Add Work Experience / Internship'}</h2>
              <button
                onClick={() => setIsExpModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveExp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Labs, Stripe, Google"
                    className="input-field"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Role / Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineering Intern"
                    className="input-field"
                    value={expRole}
                    onChange={(e) => setExpRole(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Employment Type</label>
                <select
                  className="input-field"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="FREELANCE">Freelance / Contract</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Start Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">End Date</label>
                  <input
                    type="date"
                    disabled={isCurrent}
                    className="input-field"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="isCurrentExp"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  style={{ accentColor: '#6366f1' }}
                />
                <label htmlFor="isCurrentExp" style={{ fontSize: '0.875rem', color: '#e5e7eb', cursor: 'pointer' }}>
                  I currently work in this role
                </label>
              </div>

              <div>
                <label className="input-label">Summary / Description</label>
                <textarea
                  rows={2}
                  placeholder="Summarize key projects, architectures delivered, or impact..."
                  className="input-field"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                />
              </div>

              {/* Skills Used */}
              <div>
                <label className="input-label">Technologies & Skills Used</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Python, Docker, Kubernetes"
                    className="input-field"
                    value={expSkillInput}
                    onChange={(e) => setExpSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddExpSkill();
                      }
                    }}
                  />
                  <button type="button" onClick={handleAddExpSkill} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {expSkills.map((s, idx) => (
                    <span key={idx} className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {s}
                      <button
                        type="button"
                        onClick={() => setExpSkills(expSkills.filter((item) => item !== s))}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <label className="input-label">Key Deliverables / Responsibilities</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Optimized database query performance by 40%"
                    className="input-field"
                    value={expRespInput}
                    onChange={(e) => setExpRespInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddExpResp();
                      }
                    }}
                  />
                  <button type="button" onClick={handleAddExpResp} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                    Add
                  </button>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#9ca3af', fontSize: '0.85rem' }}>
                  {expResponsibilities.map((r, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span>{r}</span>
                      <button
                        type="button"
                        onClick={() => setExpResponsibilities(expResponsibilities.filter((item) => item !== r))}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
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
                  {modalLoading ? 'Saving...' : (editingExpId ? 'Update Experience' : 'Save Experience')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Confirm Deletion</h3>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong style={{ color: '#ffffff' }}>"{deleteConfirm.name}"</strong>? This will permanently remove the record and adjust your profile evidence state.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={modalLoading}
                onClick={() => {
                  if (deleteConfirm.type === 'project') handleDeleteProject(deleteConfirm.id);
                  else if (deleteConfirm.type === 'cert') handleDeleteCert(deleteConfirm.id);
                  else if (deleteConfirm.type === 'exp') handleDeleteExp(deleteConfirm.id);
                }}
                className="btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444', padding: '8px 18px' }}
              >
                {modalLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
