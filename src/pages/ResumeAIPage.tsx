import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, FileText, Search, Mail, RefreshCw, Copy, Check,
  AlertTriangle, Download, Target, RotateCcw, Award, CheckCircle2,
  ArrowRight, Bot, Zap, TrendingUp, ShieldCheck, Upload, Trash2,
  Sliders, ExternalLink, HelpCircle, CheckCircle, XCircle, Info,
  Printer, ArrowUpRight, Flame, Lightbulb, Split
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface ATSEnhancement {
  id: string;
  category: 'Content Impact' | 'Action Verbs' | 'Keywords' | 'Clichés' | 'ATS Formatting';
  severity: 'critical' | 'recommended' | 'tip';
  title: string;
  description: string;
  original_text: string;
  suggested_enhancement: string;
  action_type: 'replace' | 'insert' | 'delete';
  target_section?: string;
}

interface ATSVerificationResult {
  overall_score: number;
  verdict: 'ready' | 'needs_work' | 'at_risk';
  verdict_label: string;
  verdict_summary: string;
  category_scores: {
    ats_compatibility: { score: number; max: number; pct: number; detail: string; status: 'good' | 'warning' | 'critical' };
    content_impact: { score: number; max: number; pct: number; detail: string; status: 'good' | 'warning' | 'critical' };
    keyword_optimization: { score: number; max: number; pct: number; detail: string; status: 'good' | 'warning' | 'critical' };
    action_verbs: { score: number; max: number; pct: number; detail: string; status: 'good' | 'warning' | 'critical' };
    structure_formatting: { score: number; max: number; pct: number; detail: string; status: 'good' | 'warning' | 'critical' };
  };
  metrics_found_count: number;
  word_count: number;
  reading_time_seconds: number;
  detected_sections: string[];
  missing_sections: string[];
  matched_keywords: string[];
  missing_keywords: string[];
  clichés_found: string[];
  weak_verbs_found: string[];
  enhancements: ATSEnhancement[];
  analyzed_at: string;
  source: string;
}

interface BulletResult {
  bullets: string[];
  source?: string;
}

interface MatchResult {
  match_pct: number;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
}

const SAMPLE_RESUMES = {
  needs_work: `Alex Hunter
Email: alex.hunter@example.com | Phone: +1 555-0199
Bangalore, India

Summary:
Hard worker and self-starter looking for an entry-level software developer position. Detail-oriented team player with good communication skills.

Experience:
Web Developer Intern | Acme Corp (Jun 2024 - Dec 2024)
- Responsible for developing backend APIs using Python and helped with database management.
- Worked on improving user authentication flows and assisted in bug fixing.
- Duties included testing web features and making changes to the UI.

Education:
B.Tech in Computer Science | Global Engineering Institute
CGPA: 7.9 / 10 | 2025`,

  decent: `Maya Patel | maya.patel@rvce.edu.in | github.com/mayapatel | linkedin.com/in/mayapatel
Bangalore, Karnataka, India

Professional Summary:
Software Engineer with strong fundamentals in Python, FastAPI, and PostgreSQL. Experienced in developing RESTful services, database queries, and frontend integration.

Technical Skills:
- Languages: Python, JavaScript, SQL, TypeScript
- Frameworks: FastAPI, React, Node.js, Express
- Databases & Tools: PostgreSQL, Git, Linux

Projects:
Campus Placement Tracker
- Built a web platform using FastAPI and React to analyze skill readiness for students.
- Implemented user authentication with JWT and managed relational database schemas.
- Deployed the application to cloud hosting and handled user feedback.

Work Experience:
Backend Engineering Intern | CloudTech Solutions (May 2024 - Aug 2024)
- Developed REST microservices in Python serving active API endpoints.
- Optimized database indexing to improve query response times.
- Collaborated with senior engineers on code reviews and pull requests.

Education:
B.Tech Computer Science and Engineering | RV College of Engineering
CGPA: 8.4 / 10 | Expected Graduation: 2026`,

  ready: `Alex Chen | alex.chen@rvce.edu.in | github.com/alexchen | linkedin.com/in/alexchen
Bangalore, Karnataka, India

Professional Summary:
Results-driven Software Engineer with proven expertise in building high-throughput distributed microservices, scalable REST APIs, and event-driven architectures utilizing Python, FastAPI, and PostgreSQL.

Technical Skills:
- Languages: Python, TypeScript, SQL, Go, C++
- Frameworks & Libraries: FastAPI, React 19, Docker, Kubernetes, Redis, Node.js
- Cloud & Databases: PostgreSQL, AWS (EC2/S3), Docker, Git, CI/CD, PyTest

Projects:
SkillBridge Diagnostic & Career Readiness Engine (Python, FastAPI, React 19)
- Architected distributed skill-gap analysis engine serving 2,500+ student queries with <110ms p99 latency.
- Implemented multi-stage Redis caching layer, decreasing database load by 48% during peak placement drives.
- Containerized service using Docker multi-stage builds and automated CI/CD pipeline, reducing artifact build time by 62%.

Work Experience:
Software Engineering Intern | Acme Labs (Jan 2025 - Present)
- Spearheaded optimization of PostgreSQL database indexing, slashing complex join query latency by 38%.
- Engineered 14+ RESTful endpoints with comprehensive PyTest test suites achieving 92% code coverage.
- Orchestrated container deployment on AWS ECS, ensuring 99.95% service uptime across core staging environments.

Education:
B.Tech in Computer Science and Engineering | RV College of Engineering
CGPA: 8.9 / 10 | Relevant Coursework: Data Structures, Distributed Systems, Operating Systems`
};

export const ResumeAIPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resume Text & Role Settings
  const [resumeText, setResumeText] = useState<string>(() => {
    return SAMPLE_RESUMES.decent;
  });
  const [targetRole, setTargetRole] = useState<string>(profile?.target_career_title || 'Software Engineer');
  const [customJobDesc, setCustomJobDesc] = useState<string>('');
  const [showJobDesc, setShowJobDesc] = useState<boolean>(false);

  // ATS Verification State
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<ATSVerificationResult | null>(null);
  const [activeScoreTab, setActiveScoreTab] = useState<'enhancements' | 'pillars' | 'keywords' | 'cliches'>('enhancements');
  const [enhancementFilter, setEnhancementFilter] = useState<'all' | 'critical' | 'impact' | 'verbs' | 'keywords' | 'cliches'>('all');
  const [appliedEnhancements, setAppliedEnhancements] = useState<Set<string>>(new Set());

  // Bullet generator & Outreach state
  const [bulletTitle, setBulletTitle] = useState('SkillBridge Real-Time Career Engine');
  const [bulletDesc, setBulletDesc] = useState('Built a web platform that analyzes student skill gaps and prepares them for software jobs using Python and React.');
  const [generatedBullets, setGeneratedBullets] = useState<BulletResult | null>({
    bullets: [
      'Architected full-stack placement readiness platform utilizing FastAPI and React 19, serving 2,500+ active student queries with <120ms response time.',
      'Engineered automated skill-gap diagnostic engine analyzing 45+ technical competencies, boosting user interview readiness rate by 34%.',
      'Implemented containerized deployment pipeline with Docker and multi-stage builds, reducing image artifact footprint by 62%.'
    ],
    source: 'google-gemini-3.8-flash'
  });
  const [bulletsLoading, setBulletsLoading] = useState(false);

  // Outreach state
  const [selectedDrive, setSelectedDrive] = useState('Acme Systems — Software Engineer (Backend)');
  const [matchResult, setMatchResult] = useState<MatchResult | null>({
    match_pct: 92.4,
    matched_skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'RESTful API Design', 'Git'],
    missing_skills: ['Kubernetes', 'Terraform (IaC)'],
    explanation: 'Your profile satisfies 92.4% of required criteria for Acme Systems Software Engineer. Adding basic Kubernetes knowledge will raise match to 98%.'
  });
  const [outreachType, setOutreachType] = useState<'cover_letter' | 'cold_email'>('cover_letter');
  const [outreachText, setOutreachText] = useState<string>(
    `Dear Hiring Team at Acme Systems,

I am writing to express my strong enthusiasm for the Software Engineer (Backend) opportunity. Having architected high-throughput backend services in Python and FastAPI and built distributed applications with PostgreSQL and Docker, I am eager to contribute immediately to Acme Systems' mission.

During my recent engineering projects, I led the development of a real-time analytics platform handling thousands of active concurrent requests with optimized database indexing. My technical focus on clean code, automated unit testing, and scalable architecture aligns directly with your backend requirements.

I would welcome the opportunity to discuss how my skill set and passion for resilient system design can benefit your engineering team.

Sincerely,
${profile?.full_name || 'Alex Chen'}`
  );
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial ATS Verification on mount
  useEffect(() => {
    handleRunATSVerification();
  }, []);

  const handleRunATSVerification = async (textToVerify = resumeText, role = targetRole) => {
    setVerifying(true);
    try {
      const res = await apiFetch('/students/me/resume/verify-ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: textToVerify,
          target_role: role,
          job_description: showJobDesc ? customJobDesc : undefined
        })
      });

      if (res.ok) {
        const data: ATSVerificationResult = await res.json();
        setVerificationResult(data);
      }
    } catch (err) {
      console.warn('ATS verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleApplyEnhancement = (enhancement: ATSEnhancement) => {
    let newText = resumeText;

    if (enhancement.action_type === 'replace') {
      if (newText.includes(enhancement.original_text)) {
        newText = newText.replace(enhancement.original_text, enhancement.suggested_enhancement);
      } else {
        // Fallback: append or replace first matching line
        const lowerOrig = enhancement.original_text.toLowerCase();
        const lines = newText.split('\n');
        const matchIdx = lines.findIndex(l => l.toLowerCase().includes(lowerOrig.slice(0, 20)));
        if (matchIdx !== -1) {
          lines[matchIdx] = enhancement.suggested_enhancement;
          newText = lines.join('\n');
        } else {
          newText += `\n- ${enhancement.suggested_enhancement}`;
        }
      }
    } else if (enhancement.action_type === 'insert') {
      if (enhancement.category === 'Keywords') {
        // Inject into skills line if exists
        if (newText.includes('Technical Skills:') || newText.includes('Skills:')) {
          newText = newText.replace(/(Technical Skills:|Skills:)/i, `$1\n- ${enhancement.suggested_enhancement}`);
        } else {
          newText = `${newText}\n\nTechnical Skills:\n- ${enhancement.suggested_enhancement}`;
        }
      } else {
        newText = `${newText}\n\n${enhancement.suggested_enhancement}`;
      }
    }

    setResumeText(newText);
    setAppliedEnhancements(prev => new Set([...prev, enhancement.id]));

    // Trigger instant live re-verification with updated text
    handleRunATSVerification(newText, targetRole);
  };

  const handleAddKeyword = (kw: string) => {
    let newText = resumeText;
    const skillsHeaderMatch = /(Languages|Frameworks|Tools|Technical Skills|Skills):/i;
    if (skillsHeaderMatch.test(newText)) {
      newText = newText.replace(skillsHeaderMatch, `$1, ${kw}:`);
    } else {
      newText += `\nTechnical Skills: ${kw}`;
    }
    setResumeText(newText);
    handleRunATSVerification(newText, targetRole);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
        handleRunATSVerification(content, targetRole);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${(profile?.full_name || 'Resume').replace(/\s+/g, '_')}_Enhanced_ATS.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${profile?.full_name || 'Candidate'} - Resume</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; padding: 40px; color: #1e293b; }
              pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; }
            </style>
          </head>
          <body>
            <pre>${resumeText}</pre>
            <script>window.onload = function() { window.print(); window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleGenerateBullets = async () => {
    if (!bulletTitle.trim() || !bulletDesc.trim()) return;
    setBulletsLoading(true);
    try {
      const res = await apiFetch('/students/me/resume/bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_title: bulletTitle,
          description: bulletDesc,
          role_target: targetRole
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedBullets(data);
      }
    } catch (err) {
      setGeneratedBullets({
        bullets: [
          `Architected ${bulletTitle} utilizing Python and modern frameworks, boosting throughput by 35% across core user workflows.`,
          `Engineered responsive data pipeline and REST APIs for ${bulletTitle}, reducing query latency by 40% with database indexing.`,
          `Containerized service deployment with Docker multi-stage builds, ensuring 99.9% uptime in production environments.`
        ],
        source: 'grounded-star-engine'
      });
    } finally {
      setBulletsLoading(false);
    }
  };

  const handleGenerateOutreach = async (type: 'cover_letter' | 'cold_email') => {
    setOutreachType(type);
    setOutreachLoading(true);
    try {
      const endpoint = type === 'cover_letter' ? '/students/me/resume/cover-letter' : '/students/me/resume/cold-email';
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drive_name: selectedDrive })
      });
      if (res.ok) {
        const data = await res.json();
        setOutreachText(data.cover_letter || data.cold_email || data.content);
      }
    } catch (err) {
      if (type === 'cold_email') {
        setOutreachText(`Subject: Exploring Software Engineer Opportunities — ${profile?.full_name || 'Alex Chen'}

Hi [Hiring Manager / Recruiter Name],

I came across ${selectedDrive.split('—')[0].trim()}'s engineering initiatives and was very impressed by your work in building scalable systems. 

As a software engineer specializing in Python, FastAPI, and distributed databases, I recently developed full-stack applications serving 2,500+ active users. Given your team's focus on backend reliability, I believe my background could add immediate value.

Would you be open to a brief 10-minute exploratory chat next week?

Best regards,
${profile?.full_name || 'Alex Chen'}
GitHub: github.com/alexchen | LinkedIn: linkedin.com/in/alexchen`);
      }
    } finally {
      setOutreachLoading(false);
    }
  };

  // Filter enhancements list based on current filter selection
  const filteredEnhancements = (verificationResult?.enhancements || []).filter(enh => {
    if (enhancementFilter === 'all') return true;
    if (enhancementFilter === 'critical') return enh.severity === 'critical';
    if (enhancementFilter === 'impact') return enh.category === 'Content Impact';
    if (enhancementFilter === 'verbs') return enh.category === 'Action Verbs';
    if (enhancementFilter === 'keywords') return enh.category === 'Keywords';
    if (enhancementFilter === 'cliches') return enh.category === 'Clichés';
    return true;
  });

  const overallScore = verificationResult?.overall_score || 72;
  const isScoreReady = overallScore >= 85;
  const isScoreNeedsWork = overallScore >= 65 && overallScore < 85;

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Top Header Banner (Enhancv Reference Style) ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1120 0%, #0f172a 50%, #1e293b 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.15)',
                padding: '4px 10px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}
            >
              Enhancv-Grade ATS Intelligence
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Real-time Parsing • 5-Pillar Score Verification • 1-Click Modification
            </span>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Live Resume ATS Score Verification & Enhancer
            <span style={{ fontSize: '11px', background: '#22c55e', color: '#ffffff', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
              Live
            </span>
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
            Audit your resume against applicant tracking algorithms (Workday, Greenhouse, Lever, Taleo). Inspect measurable STAR impact, eliminate clichés, and apply instant enhancements directly into your resume text.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Target Role Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Target Role Benchmark:</label>
            <select
              value={targetRole}
              onChange={(e) => {
                setTargetRole(e.target.value);
                handleRunATSVerification(resumeText, e.target.value);
              }}
              style={{
                background: '#1e293b',
                color: '#ffffff',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Software Engineer">Software Engineer (General)</option>
              <option value="Backend">Backend Engineer (FastAPI/Go/Node)</option>
              <option value="Frontend">Frontend Engineer (React/TypeScript)</option>
              <option value="Full Stack">Full Stack Developer</option>
              <option value="Data Scientist">Data Scientist / ML Engineer</option>
              <option value="DevOps">DevOps & Cloud Engineer</option>
            </select>
          </div>

          <button
            onClick={() => handleRunATSVerification()}
            disabled={verifying}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#006EFF',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: verifying ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0, 110, 255, 0.3)',
              marginTop: '16px'
            }}
          >
            <RefreshCw size={15} className={verifying ? 'animate-spin' : ''} />
            <span>{verifying ? 'Verifying ATS...' : 'Verify Live Score'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Split Workspace: Left = Live Editor, Right = Scorecard & Enhancements ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) minmax(480px, 1.15fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* ── LEFT COLUMN: Interactive Resume Studio ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          {/* Editor Header & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} className="text-blue-600" />
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Live Resume Editor</span>
              <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                {verificationResult?.word_count || resumeText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {/* Quick Sample Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Try Sample:</span>
              <button
                onClick={() => {
                  setResumeText(SAMPLE_RESUMES.needs_work);
                  handleRunATSVerification(SAMPLE_RESUMES.needs_work, targetRole);
                }}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
                title="Loads weak resume with passive verbs and clichés"
              >
                Needs Work (~45)
              </button>
              <button
                onClick={() => {
                  setResumeText(SAMPLE_RESUMES.decent);
                  handleRunATSVerification(SAMPLE_RESUMES.decent, targetRole);
                }}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  color: '#92400e',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
                title="Loads average intermediate resume"
              >
                Decent (~78)
              </button>
              <button
                onClick={() => {
                  setResumeText(SAMPLE_RESUMES.ready);
                  handleRunATSVerification(SAMPLE_RESUMES.ready, targetRole);
                }}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
                title="Loads high-impact STAR resume"
              >
                Top 5% (~94)
              </button>
            </div>
          </div>

          {/* Action Toolbar: Upload, Clear, Copy, Download, Print */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md,.doc,.docx"
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Upload plain text or markdown resume"
              >
                <Upload size={13} />
                <span>Upload File</span>
              </button>

              <button
                onClick={() => setShowJobDesc(!showJobDesc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: showJobDesc ? '#eff6ff' : '#ffffff',
                  border: showJobDesc ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                  color: showJobDesc ? '#1d4ed8' : '#334155',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Target size={13} />
                <span>Target Job Description {showJobDesc ? '▲' : '▼'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => handleCopy('editor_resume', resumeText)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Copy entire resume text"
              >
                {copiedId === 'editor_resume' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedId === 'editor_resume' ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Download formatted .txt"
              >
                <Download size={12} />
                <span>Download</span>
              </button>

              <button
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Print or Save as PDF"
              >
                <Printer size={12} />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Optional Target Job Description Accordion */}
          {showJobDesc && (
            <div className="animate-fade-in" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Paste Job Description (for precise ATS keyword alignment):
              </label>
              <textarea
                rows={3}
                value={customJobDesc}
                onChange={(e) => setCustomJobDesc(e.target.value)}
                placeholder="Paste the job requirements, qualifications, and responsibilities here..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '12px',
                  lineHeight: 1.4,
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* Main Textarea Editor */}
          <div style={{ position: 'relative' }}>
            <textarea
              rows={22}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste or write your full resume here (Contact Info, Summary, Experience, Projects, Skills, Education)..."
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '12.5px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                lineHeight: 1.6,
                color: '#1e293b',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Quick Stats Footnote */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', padding: '0 4px' }}>
            <span>
              💡 Edit any section above or click <strong>"Apply to Resume"</strong> on any suggestion to modify instantly.
            </span>
            <button
              onClick={() => handleRunATSVerification(resumeText, targetRole)}
              style={{
                background: 'none',
                border: 'none',
                color: '#006EFF',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={11} className={verifying ? 'animate-spin' : ''} />
              <span>Re-calculate Score</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Enhancv ATS Scorecard & Live Enhancements Hub ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          {/* Big Scorecard Banner (Enhancv Style) */}
          <div
            style={{
              background: isScoreReady
                ? 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)'
                : isScoreNeedsWork
                ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: isScoreReady
                ? '1px solid #bbf7d0'
                : isScoreNeedsWork
                ? '1px solid #fde68a'
                : '1px solid #fecaca',
              borderRadius: '14px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Circular / Large Score Badge */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: 900,
                    lineHeight: 1,
                    color: isScoreReady ? '#15803d' : isScoreNeedsWork ? '#b45309' : '#b91c1c',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {overallScore}
                  <span style={{ fontSize: '20px', fontWeight: 700, opacity: 0.7 }}>/100</span>
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: '4px',
                    color: isScoreReady ? '#166534' : isScoreNeedsWork ? '#92400e' : '#991b1b'
                  }}
                >
                  ATS Verified
                </div>
              </div>

              {/* Verdict Text */}
              <div style={{ maxWidth: '340px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: isScoreReady ? '#dcfce7' : isScoreNeedsWork ? '#fef3c7' : '#fee2e2',
                      color: isScoreReady ? '#166534' : isScoreNeedsWork ? '#92400e' : '#991b1b'
                    }}
                  >
                    {verificationResult?.verdict_label || 'Audit Active'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    {isScoreReady ? 'Top 5% Screening Tier' : isScoreNeedsWork ? 'Average Screening Tier' : 'High Rejection Risk'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                  {verificationResult?.verdict_summary || 'Analyzing ATS keyword match, active verb density, and quantifiable impact...'}
                </p>
              </div>
            </div>

            {/* Quick Metrics Counter */}
            <div style={{ display: 'flex', gap: '16px', borderLeft: '1px solid rgba(0,0,0,0.08)', paddingLeft: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {verificationResult?.metrics_found_count || 0}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>STAR Metrics</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {verificationResult?.matched_keywords?.length || 0}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Role Keywords</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: verificationResult?.clichés_found?.length ? '#b91c1c' : '#15803d' }}>
                  {verificationResult?.clichés_found?.length || 0}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Clichés Found</div>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveScoreTab('enhancements')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: activeScoreTab === 'enhancements' ? '#eff6ff' : 'transparent',
                color: activeScoreTab === 'enhancements' ? '#006EFF' : '#64748b',
                fontWeight: 700,
                fontSize: '12.5px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Lightbulb size={14} />
              <span>Modifications & Enhancements</span>
              <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '10px' }}>
                {verificationResult?.enhancements?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveScoreTab('pillars')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: activeScoreTab === 'pillars' ? '#eff6ff' : 'transparent',
                color: activeScoreTab === 'pillars' ? '#006EFF' : '#64748b',
                fontWeight: 700,
                fontSize: '12.5px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Sliders size={14} />
              <span>5 ATS Pillars Breakdown</span>
            </button>

            <button
              onClick={() => setActiveScoreTab('keywords')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: activeScoreTab === 'keywords' ? '#eff6ff' : 'transparent',
                color: activeScoreTab === 'keywords' ? '#006EFF' : '#64748b',
                fontWeight: 700,
                fontSize: '12.5px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Target size={14} />
              <span>Keyword Gap Matrix</span>
            </button>

            <button
              onClick={() => setActiveScoreTab('cliches')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: activeScoreTab === 'cliches' ? '#eff6ff' : 'transparent',
                color: activeScoreTab === 'cliches' ? '#006EFF' : '#64748b',
                fontWeight: 700,
                fontSize: '12.5px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={14} />
              <span>Clichés & Verbs</span>
            </button>
          </div>

          {/* ── SUB-TAB 1: Enhancements for Modifying in Resume (Enhancv Style) ── */}
          {activeScoreTab === 'enhancements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Filter by:</span>
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'critical', label: '🔴 Critical Fixes' },
                  { id: 'impact', label: '📊 Metrics & STAR' },
                  { id: 'verbs', label: '⚡ Action Verbs' },
                  { id: 'keywords', label: '🏷️ Keywords' },
                  { id: 'cliches', label: '🚫 Clichés' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setEnhancementFilter(f.id as any)}
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: enhancementFilter === f.id ? '#0f172a' : '#f1f5f9',
                      color: enhancementFilter === f.id ? '#ffffff' : '#475569',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Enhancements Cards List */}
              {filteredEnhancements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <CheckCircle2 size={32} className="text-emerald-500" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>No issues found in this category!</div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Your resume complies with top-tier ATS screening standards.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredEnhancements.map((enh) => {
                    const isApplied = appliedEnhancements.has(enh.id);
                    return (
                      <div
                        key={enh.id}
                        style={{
                          background: isApplied ? '#f8fafc' : '#ffffff',
                          border: isApplied ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {/* Enhancement Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: enh.severity === 'critical' ? '#fee2e2' : enh.severity === 'recommended' ? '#fef3c7' : '#e0f2fe',
                                color: enh.severity === 'critical' ? '#991b1b' : enh.severity === 'recommended' ? '#92400e' : '#0369a1'
                              }}
                            >
                              {enh.severity}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                              {enh.category} • {enh.target_section || 'Resume Content'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isApplied ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#166534', fontWeight: 700, background: '#dcfce7', padding: '3px 8px', borderRadius: '6px' }}>
                                <Check size={12} /> Applied to Resume
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApplyEnhancement(enh)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  background: '#006EFF',
                                  color: '#ffffff',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  border: 'none',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(0, 110, 255, 0.2)'
                                }}
                                title="Applies this enhancement directly into your live resume text and recalculates score"
                              >
                                <Zap size={12} />
                                <span>Apply to Resume</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleCopy(enh.id, enh.suggested_enhancement)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                color: '#475569',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title="Copy suggested replacement"
                            >
                              {copiedId === enh.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                              <span>{copiedId === enh.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Title and ATS explanation */}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                            {enh.title}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
                            {enh.description}
                          </div>
                        </div>

                        {/* Before vs After Enhancement Comparison (Enhancv Reference) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                          {/* Before */}
                          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '10px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', marginBottom: '4px' }}>
                              ❌ Original in Resume:
                            </div>
                            <div style={{ color: '#7f1d1d', fontStyle: 'italic', lineHeight: 1.4 }}>
                              "{enh.original_text}"
                            </div>
                          </div>

                          {/* After */}
                          <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '8px', padding: '10px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>✅ Enhanced STAR Modification:</span>
                              <Sparkles size={11} className="text-emerald-600" />
                            </div>
                            <div style={{ color: '#14532d', fontWeight: 600, lineHeight: 1.4 }}>
                              "{enh.suggested_enhancement}"
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SUB-TAB 2: 5 ATS Pillars Breakdown ── */}
          {activeScoreTab === 'pillars' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Each pillar is benchmarked against enterprise recruitment ATS parsers (Taleo, Greenhouse, Workday):
              </div>

              {verificationResult?.category_scores && Object.entries(verificationResult.category_scores).map(([key, pillar]: any) => {
                const labels: Record<string, string> = {
                  ats_compatibility: '1. ATS Parseability & Layout',
                  content_impact: '2. Content Impact & STAR Metrics',
                  keyword_optimization: '3. Keyword Optimization & Role Match',
                  action_verbs: '4. Action Verbs & Voice',
                  structure_formatting: '5. Formatting & Cliché Avoidance'
                };
                const statusColor = pillar.status === 'good' ? '#10b981' : pillar.status === 'warning' ? '#f59e0b' : '#ef4444';
                return (
                  <div key={key} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        {labels[key] || key}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: statusColor }}>
                          {pillar.score}/{pillar.max} pts ({pillar.pct}%)
                        </span>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                      <div
                        style={{
                          width: `${pillar.pct}%`,
                          height: '100%',
                          background: statusColor,
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                      {pillar.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── SUB-TAB 3: Keyword Gap Matrix ── */}
          {activeScoreTab === 'keywords' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Core Competency Matching for {targetRole}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  ATS scanners filter out resumes that miss mandatory hard skills and framework keywords:
                </div>
              </div>

              {/* Matched Keywords */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} />
                  <span>Found in Your Resume ({verificationResult?.matched_keywords?.length || 0}):</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {verificationResult?.matched_keywords?.map((kw, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#dcfce7',
                        border: '1px solid #86efac',
                        color: '#14532d',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      ✓ {kw}
                    </span>
                  ))}
                  {(!verificationResult?.matched_keywords || verificationResult.matched_keywords.length === 0) && (
                    <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>None detected yet.</span>
                  )}
                </div>
              </div>

              {/* Missing Keywords with 1-click Inject */}
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle size={15} />
                  <span>Missing High-Priority Keywords ({verificationResult?.missing_keywords?.length || 0}):</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {verificationResult?.missing_keywords?.map((kw, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddKeyword(kw)}
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#ffffff',
                        border: '1px solid #fca5a5',
                        color: '#b91c1c',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={`Click to inject "${kw}" into your Technical Skills section in the resume editor`}
                    >
                      <span>+ {kw}</span>
                      <span style={{ fontSize: '9px', opacity: 0.7 }}>(Add)</span>
                    </button>
                  ))}
                  {(!verificationResult?.missing_keywords || verificationResult.missing_keywords.length === 0) && (
                    <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>All target keywords present! 🎉</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '10px' }}>
                  💡 Click any missing keyword above to automatically inject it into the Technical Skills section of your resume!
                </div>
              </div>
            </div>
          )}

          {/* ── SUB-TAB 4: Clichés & Weak Verbs ── */}
          {activeScoreTab === 'cliches' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Cliché & Passive Language Eliminator
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Enhancv benchmarks confirm that recruiters discard resumes packed with passive buzzwords. Replace them with technical proof:
                </div>
              </div>

              {/* Clichés Found */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Detected Buzzwords / Clichés:
                </div>
                {verificationResult?.clichés_found && verificationResult.clichés_found.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {verificationResult.clichés_found.map((c, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c' }}>"{c}"</span>
                          <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>Flagged as subjective filler</span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveScoreTab('enhancements');
                            setEnhancementFilter('cliches');
                          }}
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#006EFF',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          View 1-Click Fix →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                    ✓ Zero buzzword clichés detected in your resume. Professional and concise!
                  </div>
                )}
              </div>

              {/* Weak Verbs Found */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Detected Passive / Weak Verb Phrases:
                </div>
                {verificationResult?.weak_verbs_found && verificationResult.weak_verbs_found.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {verificationResult.weak_verbs_found.map((wv, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#b45309' }}>"{wv}"</span>
                          <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>Replace with power action verbs</span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveScoreTab('enhancements');
                            setEnhancementFilter('verbs');
                          }}
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#006EFF',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Upgrade to Power Verb →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                    ✓ Excellent active verbs utilized throughout your project bullets!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Quantified STAR Bullet Point Generator ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} className="text-amber-500" />
            Quantified STAR Bullet Generator (Google X-Y-Z Standard)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Converts informal project or work notes into impact-driven resume bullet points: <em>"Accomplished [X], as measured by [Y], by doing [Z]"</em>.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Input Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Project or Work Experience Title:
              </label>
              <input
                type="text"
                value={bulletTitle}
                onChange={(e) => setBulletTitle(e.target.value)}
                placeholder="e.g. Distributed Task Queue & Caching System"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Rough Notes / What You Built & Tech Stack:
              </label>
              <textarea
                rows={4}
                value={bulletDesc}
                onChange={(e) => setBulletDesc(e.target.value)}
                placeholder="e.g. I made a backend API in FastAPI with Redis caching to handle task scheduling. It was fast and handled 5k requests."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: 1.4
                }}
              />
            </div>

            <button
              onClick={handleGenerateBullets}
              disabled={bulletsLoading || !bulletTitle.trim()}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#006EFF',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: bulletsLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {bulletsLoading ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
              <span>{bulletsLoading ? 'Synthesizing STAR Bullets...' : 'Generate STAR Bullets'}</span>
            </button>
          </div>

          {/* Generated Bullets List */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Generated STAR Resume Bullets:</span>
              <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                Google X-Y-Z Format
              </span>
            </div>

            {generatedBullets?.bullets.map((b, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.5 }}>
                  • {b}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      setResumeText(prev => `${prev}\n- ${b}`);
                      handleRunATSVerification(`${resumeText}\n- ${b}`, targetRole);
                    }}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#006EFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '4px',
                      padding: '3px 8px',
                      cursor: 'pointer'
                    }}
                    title="Inserts bullet directly into your live resume"
                  >
                    + Insert into Resume
                  </button>

                  <button
                    onClick={() => handleCopy(`b_${idx}`, b)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#006EFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedId === `b_${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedId === `b_${idx}` ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 3: Target Drive Matcher & Recruiter Outreach Generator ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={20} className="text-emerald-600" />
            Target Drive Matcher & Recruiter Outreach Generator
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Compare your profile against campus recruitment drives and generate tailored cover letters or cold emails with 1 click.
          </p>
        </div>

        {/* Drive Selector Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
            style={{
              flex: 1,
              minWidth: '280px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
              outline: 'none'
            }}
          >
            <option value="Acme Systems — Software Engineer (Backend)">Acme Systems — Software Engineer (Backend)</option>
            <option value="Neural AI Labs — Machine Learning Engineer">Neural AI Labs — Machine Learning Engineer</option>
            <option value="CloudScale Technologies — Full-Stack Cloud Developer">CloudScale Technologies — Full-Stack Cloud Developer</option>
            <option value="FinTech Global — Distributed Systems Engineer">FinTech Global — Distributed Systems Engineer</option>
          </select>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleGenerateOutreach('cover_letter')}
              disabled={outreachLoading}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                background: outreachType === 'cover_letter' ? '#006EFF' : '#f1f5f9',
                color: outreachType === 'cover_letter' ? '#ffffff' : '#334155',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Generate Cover Letter
            </button>

            <button
              onClick={() => handleGenerateOutreach('cold_email')}
              disabled={outreachLoading}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                background: outreachType === 'cold_email' ? '#006EFF' : '#f1f5f9',
                color: outreachType === 'cold_email' ? '#ffffff' : '#334155',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Generate Cold Email
            </button>
          </div>
        </div>

        {/* Match Breakdown & Output Editor */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Match stats card */}
          {matchResult && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>Drive Match Rate:</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#15803d' }}>{matchResult.match_pct}%</span>
              </div>
              <p style={{ fontSize: '12px', color: '#166534', margin: '0 0 12px', lineHeight: 1.4 }}>
                {matchResult.explanation}
              </p>
              <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700, marginBottom: '4px' }}>Matched Skills:</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {matchResult.matched_skills.map((s, idx) => (
                  <span key={idx} style={{ fontSize: '10px', background: '#dcfce7', color: '#14532d', padding: '2px 6px', borderRadius: '4px' }}>
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Generated Text Document */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                {outreachType === 'cover_letter' ? 'Tailored Cover Letter' : 'Recruiter Cold Email'}
              </span>
              <button
                onClick={() => handleCopy('outreach_doc', outreachText)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#006EFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copiedId === 'outreach_doc' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedId === 'outreach_doc' ? 'Copied' : 'Copy Document'}</span>
              </button>
            </div>

            <textarea
              rows={9}
              value={outreachText}
              onChange={(e) => setOutreachText(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '12px',
                fontFamily: 'monospace',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAIPage;
