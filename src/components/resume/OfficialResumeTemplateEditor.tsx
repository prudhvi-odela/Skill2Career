import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Globe,
  Briefcase, Code, GraduationCap, Award, Plus, Trash2,
  Sparkles, Check, Copy, Printer, Eye, Edit3, ArrowUpRight,
  Download, FileDown
} from 'lucide-react';
import { generateAndDownloadAtsPdf } from '../../utils/generateAtsPdf';

export interface ResumeProject {
  id: string;
  title: string;
  role?: string;
  technologies: string;
  liveUrl?: string;
  repoUrl?: string;
  bullets: string[];
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  duration: string;
  bullets: string[];
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  location?: string;
  graduationYear: string;
  cgpa: string;
  relevantCoursework?: string;
}

export interface StructuredResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
  skills: {
    languages: string;
    frameworks: string;
    databasesCloud: string;
    developerTools: string;
  };
  experiences: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation;
  certifications: string[];
}

export function compileResumeToText(data: StructuredResumeData): string {
  const lines: string[] = [];

  // Header
  lines.push(data.fullName || 'Engineering Candidate');
  const contactParts = [
    data.email,
    data.phone,
    data.location,
    data.githubUrl ? `github.com/${data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\/?/, '')}` : '',
    data.linkedinUrl ? `linkedin.com/in/${data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, '')}` : '',
    data.portfolioUrl
  ].filter(Boolean);
  if (contactParts.length > 0) {
    lines.push(contactParts.join(' | '));
  }
  lines.push('');

  // Professional Summary
  if (data.summary) {
    lines.push('Professional Summary:');
    lines.push(data.summary);
    lines.push('');
  }

  // Technical Skills
  lines.push('Technical Skills:');
  if (data.skills.languages) lines.push(`- Languages: ${data.skills.languages}`);
  if (data.skills.frameworks) lines.push(`- Frameworks & Libraries: ${data.skills.frameworks}`);
  if (data.skills.databasesCloud) lines.push(`- Databases & Cloud: ${data.skills.databasesCloud}`);
  if (data.skills.developerTools) lines.push(`- Tools & Platforms: ${data.skills.developerTools}`);
  lines.push('');

  // Projects
  if (data.projects && data.projects.length > 0) {
    lines.push('Projects:');
    data.projects.forEach(p => {
      const techStr = p.technologies ? ` (${p.technologies})` : '';
      lines.push(`${p.title}${techStr}`);
      p.bullets.forEach(b => {
        if (b.trim()) lines.push(`- ${b.trim()}`);
      });
      lines.push('');
    });
  }

  // Work Experience
  if (data.experiences && data.experiences.length > 0) {
    lines.push('Work Experience:');
    data.experiences.forEach(e => {
      const locStr = e.location ? ` | ${e.location}` : '';
      lines.push(`${e.role} | ${e.company}${locStr} (${e.duration})`);
      e.bullets.forEach(b => {
        if (b.trim()) lines.push(`- ${b.trim()}`);
      });
      lines.push('');
    });
  }

  // Education
  lines.push('Education:');
  const edu = data.education;
  lines.push(`${edu.degree} | ${edu.institution}${edu.location ? ` (${edu.location})` : ''}`);
  lines.push(`CGPA / GPA: ${edu.cgpa || '8.5 / 10.0'} | Expected Graduation: ${edu.graduationYear || '2026'}`);
  if (edu.relevantCoursework) {
    lines.push(`Relevant Coursework: ${edu.relevantCoursework}`);
  }
  lines.push('');

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    lines.push('Certifications & Achievements:');
    data.certifications.forEach(c => {
      if (c.trim()) lines.push(`- ${c.trim()}`);
    });
  }

  return lines.join('\n').trim();
}

interface OfficialResumeTemplateEditorProps {
  initialData?: Partial<StructuredResumeData>;
  targetRole?: string;
  onTextChange: (compiledText: string) => void;
  onApplySTARBullet?: (bulletText: string) => void;
}

export const OfficialResumeTemplateEditor: React.FC<OfficialResumeTemplateEditorProps> = ({
  initialData,
  targetRole = 'Software Engineer',
  onTextChange,
}) => {
  const [data, setData] = useState<StructuredResumeData>(() => ({
    fullName: initialData?.fullName || 'Alex Chen',
    email: initialData?.email || 'alex.chen@university.edu',
    phone: initialData?.phone || '+91 98765 43210',
    location: initialData?.location || 'Bangalore, India',
    linkedinUrl: initialData?.linkedinUrl || 'linkedin.com/in/alexchen',
    githubUrl: initialData?.githubUrl || 'github.com/alexchen',
    portfolioUrl: initialData?.portfolioUrl || 'alexchen.dev',
    summary: initialData?.summary || `Results-driven ${targetRole} with strong foundations in distributed backend services, algorithmic problem solving, and modern cloud deployment architectures.`,
    skills: {
      languages: initialData?.skills?.languages || 'Python, TypeScript, JavaScript, SQL, C++',
      frameworks: initialData?.skills?.frameworks || 'FastAPI, React 19, Node.js, Express, Next.js',
      databasesCloud: initialData?.skills?.databasesCloud || 'PostgreSQL, Redis, MongoDB, Docker, AWS (S3/EC2)',
      developerTools: initialData?.skills?.developerTools || 'Git, GitHub Actions, Linux, PyTest, Postman, Vite'
    },
    experiences: initialData?.experiences || [
      {
        id: 'exp_1',
        company: 'Acme Systems',
        role: `${targetRole} Intern`,
        location: 'Bangalore, India',
        duration: 'Jun 2024 - Dec 2024',
        bullets: [
          'Architected high-throughput REST microservices using Python and FastAPI, serving 5,000+ daily requests with <85ms response latency.',
          'Optimized PostgreSQL database indexes and query plans, reducing analytical dashboard loading time by 38%.',
          'Automated CI/CD pipelines with GitHub Actions and Docker, accelerating feature staging deployments by 45%.'
        ]
      }
    ],
    projects: initialData?.projects || [
      {
        id: 'prj_1',
        title: 'Skill2Career Placement Diagnostic & Skill-Gap Engine',
        technologies: 'FastAPI, React 19, PostgreSQL, Docker, Redis',
        liveUrl: 'https://skill2career.app',
        repoUrl: 'https://github.com/alexchen/skill2career',
        bullets: [
          'Engineered automated skill-gap diagnostic engine analyzing 50+ industry technical competencies for engineering candidates.',
          'Implemented Redis caching layer for role recommendation algorithms, achieving a 99.4% cache-hit ratio during mock placement tests.',
          'Containerized application with multi-stage Docker builds, reducing artifact build footprint by 62%.'
        ]
      },
      {
        id: 'prj_2',
        title: 'Distributed Real-Time Messaging & Event Pipeline',
        technologies: 'Python, WebSockets, Redis Pub/Sub, TypeScript',
        liveUrl: '',
        repoUrl: 'https://github.com/alexchen/realtime-pipeline',
        bullets: [
          'Built bi-directional WebSocket cluster handling 1,200 concurrent active client sessions with zero message packet drops.',
          'Implemented heartbeat health checks and automated reconnection protocols across distributed microservice instances.'
        ]
      }
    ],
    education: initialData?.education || {
      degree: 'B.Tech in Computer Science and Engineering',
      institution: 'National Institute of Technology',
      location: 'India',
      graduationYear: '2026',
      cgpa: '8.8 / 10.0',
      relevantCoursework: 'Data Structures & Algorithms, Operating Systems, Database Management Systems, Computer Networks'
    },
    certifications: initialData?.certifications || [
      'AWS Certified Cloud Practitioner (Foundational)',
      'Meta Backend Developer Professional Certificate (Coursera)',
      'HackerRank Problem Solving (5-Star Gold Badge)'
    ]
  }));

  const [activeSection, setActiveSection] = useState<'preview' | 'edit'>('edit');
  const [templateTheme, setTemplateTheme] = useState<'ivy' | 'modern' | 'minimal'>('ivy');

  // Trigger text compilation whenever data updates
  useEffect(() => {
    const text = compileResumeToText(data);
    onTextChange(text);
  }, [data]);

  const updateField = (field: keyof StructuredResumeData, val: any) => {
    setData(prev => ({ ...prev, [field]: val }));
  };

  const updateSkill = (subKey: keyof StructuredResumeData['skills'], val: string) => {
    setData(prev => ({
      ...prev,
      skills: { ...prev.skills, [subKey]: val }
    }));
  };

  const updateEdu = (subKey: keyof ResumeEducation, val: string) => {
    setData(prev => ({
      ...prev,
      education: { ...prev.education, [subKey]: val }
    }));
  };

  // Experience Handlers
  const addExperience = () => {
    const newExp: ResumeExperience = {
      id: 'exp_' + Date.now(),
      company: 'Tech Enterprise',
      role: `${targetRole} Intern`,
      location: 'Remote',
      duration: 'Present',
      bullets: ['Spearheaded engineering feature development, optimizing performance and unit test coverage by 30%.']
    };
    setData(prev => ({ ...prev, experiences: [...prev.experiences, newExp] }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experiences: prev.experiences.filter(e => e.id !== id) }));
  };

  const updateExpBullet = (expId: string, bulletIdx: number, val: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => {
        if (e.id !== expId) return e;
        const newBullets = [...e.bullets];
        newBullets[bulletIdx] = val;
        return { ...e, bullets: newBullets };
      })
    }));
  };

  const addExpBullet = (expId: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => {
        if (e.id !== expId) return e;
        return { ...e, bullets: [...e.bullets, 'Engineered new scalable module, reducing execution latency by 25%.'] };
      })
    }));
  };

  // Project Handlers
  const addProject = () => {
    const newPrj: ResumeProject = {
      id: 'prj_' + Date.now(),
      title: `${targetRole} Cloud Application`,
      technologies: 'Python, TypeScript, SQL, Docker',
      liveUrl: '',
      repoUrl: '',
      bullets: ['Architected scalable full-stack system serving concurrent API queries with sub-100ms latency.']
    };
    setData(prev => ({ ...prev, projects: [...prev.projects, newPrj] }));
  };

  const removeProject = (id: string) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const updatePrjBullet = (prjId: string, bulletIdx: number, val: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== prjId) return p;
        const newBullets = [...p.bullets];
        newBullets[bulletIdx] = val;
        return { ...p, bullets: newBullets };
      })
    }));
  };

  const addPrjBullet = (prjId: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== prjId) return p;
        return { ...p, bullets: [...p.bullets, 'Integrated automated data pipeline, boosting system throughput by 35%.'] };
      })
    }));
  };

  const handleDownloadPdf = () => {
    try {
      generateAndDownloadAtsPdf(data, { theme: templateTheme, paperSize: 'letter' });
    } catch (err) {
      console.error('Direct PDF export error, falling back to print-to-pdf:', err);
      handlePrint();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Controls: Theme selector, Mode Toggle, and Download PDF Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            ATS Format:
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'ivy', label: '🏛️ Ivy League' },
              { id: 'modern', label: '⚡ Modern' },
              { id: 'minimal', label: '📄 Minimal' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplateTheme(t.id as any)}
                style={{
                  fontSize: '11px',
                  fontWeight: templateTheme === t.id ? 700 : 500,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: templateTheme === t.id ? '#006EFF' : '#ffffff',
                  color: templateTheme === t.id ? '#ffffff' : '#334155',
                  border: '1px solid',
                  borderColor: templateTheme === t.id ? '#006EFF' : '#cbd5e1',
                  cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleDownloadPdf}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
            }}
            title="Download formatted 1-page ATS Resume PDF"
          >
            <Download size={13} />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('edit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              padding: '5px 9px',
              borderRadius: '6px',
              background: activeSection === 'edit' ? '#0f172a' : '#ffffff',
              color: activeSection === 'edit' ? '#ffffff' : '#475569',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            <Edit3 size={12} />
            <span>Form</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSection('preview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 700,
              padding: '5px 9px',
              borderRadius: '6px',
              background: activeSection === 'preview' ? '#0f172a' : '#ffffff',
              color: activeSection === 'preview' ? '#ffffff' : '#475569',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            <Eye size={12} />
            <span>Paper</span>
          </button>
        </div>
      </div>

      {/* ── MODE 1: Interactive Structured Editor ── */}
      {activeSection === 'edit' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '580px', overflowY: 'auto', paddingRight: '4px' }}>
          
          {/* Header & Personal Info */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} className="text-blue-600" />
              <span>Contact & Online Profiles</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>Full Name</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>Email</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>Phone</label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>Location</label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>GitHub Profile</label>
                <input
                  type="text"
                  value={data.githubUrl}
                  onChange={(e) => updateField('githubUrl', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>LinkedIn Profile</label>
                <input
                  type="text"
                  value={data.linkedinUrl}
                  onChange={(e) => updateField('linkedinUrl', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
              Professional Summary
            </label>
            <textarea
              rows={3}
              value={data.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              placeholder="Concise 2-3 sentence overview with target role and key technical strengths..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', resize: 'vertical' }}
            />
          </div>

          {/* Technical Skills */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code size={15} className="text-emerald-600" />
              <span>Technical Skills (Categorized)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>Languages</label>
                <input
                  type="text"
                  value={data.skills.languages}
                  onChange={(e) => updateSkill('languages', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>Frameworks & Libraries</label>
                <input
                  type="text"
                  value={data.skills.frameworks}
                  onChange={(e) => updateSkill('frameworks', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>Databases & Cloud</label>
                <input
                  type="text"
                  value={data.skills.databasesCloud}
                  onChange={(e) => updateSkill('databasesCloud', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>Developer Tools & Platforms</label>
                <input
                  type="text"
                  value={data.skills.developerTools}
                  onChange={(e) => updateSkill('developerTools', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Technical Projects Section */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={15} className="text-purple-600" />
                <span>Featured Technical Projects ({data.projects.length})</span>
              </div>
              <button
                type="button"
                onClick={addProject}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#006EFF',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={12} />
                <span>Add Project</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.projects.map((p, pIdx) => (
                <div key={p.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={p.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData(prev => ({
                          ...prev,
                          projects: prev.projects.map(item => item.id === p.id ? { ...item, title: val } : item)
                        }));
                      }}
                      style={{ fontWeight: 700, fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px', flex: 1, marginRight: '8px' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeProject(p.id)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }}
                      title="Remove Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="Technologies (e.g. Python, FastAPI, PostgreSQL, Docker)"
                      value={p.technologies}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData(prev => ({
                          ...prev,
                          projects: prev.projects.map(item => item.id === p.id ? { ...item, technologies: val } : item)
                        }));
                      }}
                      style={{ width: '100%', fontSize: '11.5px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>STAR Metric Bullets:</div>
                    {p.bullets.map((b, bIdx) => (
                      <div key={bIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>•</span>
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => updatePrjBullet(p.id, bIdx, e.target.value)}
                          placeholder="Action verb + Accomplished X as measured by Y doing Z..."
                          style={{ flex: 1, fontSize: '11.5px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px' }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addPrjBullet(p.id)}
                      style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#006EFF', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', marginTop: '2px' }}
                    >
                      + Add Bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Experience Section */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={15} className="text-amber-600" />
                <span>Work & Internship Experience ({data.experiences.length})</span>
              </div>
              <button
                type="button"
                onClick={addExperience}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#006EFF',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={12} />
                <span>Add Experience</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.experiences.map((exp) => (
                <div key={exp.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData(prev => ({
                          ...prev,
                          experiences: prev.experiences.map(item => item.id === exp.id ? { ...item, company: val } : item)
                        }));
                      }}
                      style={{ fontWeight: 700, fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px', flex: 1, marginRight: '8px' }}
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Software Engineer Intern)"
                      value={exp.role}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData(prev => ({
                          ...prev,
                          experiences: prev.experiences.map(item => item.id === exp.id ? { ...item, role: val } : item)
                        }));
                      }}
                      style={{ fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px', flex: 1, marginRight: '8px' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }}
                      title="Remove Experience"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {exp.bullets.map((b, bIdx) => (
                      <div key={bIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>•</span>
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => updateExpBullet(exp.id, bIdx, e.target.value)}
                          style={{ flex: 1, fontSize: '11.5px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px' }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addExpBullet(exp.id)}
                      style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#006EFF', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', marginTop: '2px' }}
                    >
                      + Add Bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={15} className="text-indigo-600" />
              <span>Education</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>Degree</label>
                <input
                  type="text"
                  value={data.education.degree}
                  onChange={(e) => updateEdu('degree', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>Institution</label>
                <input
                  type="text"
                  value={data.education.institution}
                  onChange={(e) => updateEdu('institution', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>CGPA / GPA</label>
                <input
                  type="text"
                  value={data.education.cgpa}
                  onChange={(e) => updateEdu('cgpa', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '3px' }}>Graduation Year</label>
                <input
                  type="text"
                  value={data.education.graduationYear}
                  onChange={(e) => updateEdu('graduationYear', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* ── MODE 2: Official ATS Paper Document Preview ── */
        <div
          id="official-ats-paper"
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '32px 28px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            fontFamily: templateTheme === 'ivy' ? '"Times New Roman", Times, serif' : 'system-ui, -apple-system, sans-serif',
            color: '#0f172a',
            lineHeight: 1.45,
            fontSize: '12px',
            maxHeight: '580px',
            overflowY: 'auto'
          }}
        >
          {/* Paper Header */}
          <div style={{ textAlign: 'center', borderBottom: '1.5px solid #0f172a', paddingBottom: '8px', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              {data.fullName}
            </h1>
            <div style={{ fontSize: '11px', color: '#334155' }}>
              {[
                data.location,
                data.phone,
                data.email,
                data.githubUrl ? `github.com/${data.githubUrl.replace(/^https?:\/\//, '')}` : '',
                data.linkedinUrl ? `linkedin.com/in/${data.linkedinUrl.replace(/^https?:\/\//, '')}` : ''
              ].filter(Boolean).join('  •  ')}
            </div>
          </div>

          {/* Paper Summary */}
          {data.summary && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '4px' }}>
                Professional Summary
              </div>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#1e293b' }}>{data.summary}</p>
            </div>
          )}

          {/* Paper Skills */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '4px' }}>
              Technical Competencies
            </div>
            <div style={{ fontSize: '11.5px', color: '#1e293b' }}>
              {data.skills.languages && <div><strong>Languages:</strong> {data.skills.languages}</div>}
              {data.skills.frameworks && <div><strong>Frameworks & Libraries:</strong> {data.skills.frameworks}</div>}
              {data.skills.databasesCloud && <div><strong>Databases & Cloud:</strong> {data.skills.databasesCloud}</div>}
              {data.skills.developerTools && <div><strong>Tools & Platforms:</strong> {data.skills.developerTools}</div>}
            </div>
          </div>

          {/* Paper Projects */}
          {data.projects && data.projects.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px' }}>
                Technical Projects
              </div>
              {data.projects.map(p => (
                <div key={p.id} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px' }}>
                    <span>{p.title} {p.technologies && <span style={{ fontWeight: 500, fontStyle: 'italic' }}>| {p.technologies}</span>}</span>
                    {p.repoUrl && <span style={{ fontSize: '10px', color: '#2563eb' }}>{p.repoUrl.replace(/^https?:\/\//, '')}</span>}
                  </div>
                  <ul style={{ margin: '3px 0 0 16px', padding: 0 }}>
                    {p.bullets.map((b, bIdx) => b.trim() ? (
                      <li key={bIdx} style={{ fontSize: '11px', marginBottom: '2px' }}>{b}</li>
                    ) : null)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Paper Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '6px' }}>
                Work Experience
              </div>
              {data.experiences.map(e => (
                <div key={e.id} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px' }}>
                    <span>{e.role} — {e.company}</span>
                    <span style={{ fontSize: '11px', fontWeight: 500 }}>{e.duration}</span>
                  </div>
                  <ul style={{ margin: '3px 0 0 16px', padding: 0 }}>
                    {e.bullets.map((b, bIdx) => b.trim() ? (
                      <li key={bIdx} style={{ fontSize: '11px', marginBottom: '2px' }}>{b}</li>
                    ) : null)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Paper Education */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '4px' }}>
              Education
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
              <span>{data.education.institution}</span>
              <span style={{ fontSize: '11px', fontWeight: 500 }}>Expected {data.education.graduationYear}</span>
            </div>
            <div style={{ fontSize: '11.5px' }}>
              {data.education.degree} — CGPA: <strong>{data.education.cgpa}</strong>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
