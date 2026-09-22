// Enhancv-Grade Live Resume ATS Score Verification & Enhancement Engine
import { GoogleGenAI } from '@google/genai';

export interface ATSEnhancement {
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

export interface ATSVerificationResult {
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

const ROLE_KEYWORDS: Record<string, string[]> = {
  'software engineer': [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'PostgreSQL',
    'REST APIs', 'Docker', 'Git', 'Data Structures', 'Algorithms', 'CI/CD',
    'System Design', 'Unit Testing', 'Redis', 'Microservices', 'FastAPI'
  ],
  'full stack': [
    'React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'MongoDB',
    'RESTful APIs', 'GraphQL', 'Tailwind CSS', 'Docker', 'AWS', 'State Management',
    'CI/CD Pipelines', 'Authentication', 'Git', 'Agile'
  ],
  'backend': [
    'Python', 'Go', 'Java', 'FastAPI', 'Node.js', 'PostgreSQL', 'Redis',
    'Kafka', 'Microservices', 'Docker', 'Kubernetes', 'SQL Optimization',
    'Distributed Systems', 'REST & gRPC', 'Database Indexing', 'Linux', 'Unit Testing'
  ],
  'frontend': [
    'React', 'TypeScript', 'JavaScript', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS',
    'Redux', 'Responsive Design', 'Web Performance', 'REST API Integration',
    'Accessibility (a11y)', 'Vite', 'Jest', 'Webpack', 'Cross-browser Compatibility'
  ],
  'data scientist': [
    'Python', 'SQL', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy',
    'Machine Learning', 'Deep Learning', 'Data Pipelines', 'Statistical Modeling',
    'Data Visualization', 'Feature Engineering', 'Jupyter', 'Big Data', 'Docker'
  ],
  'devops': [
    'Linux', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions',
    'AWS', 'GCP', 'Bash Scripting', 'Prometheus', 'Grafana', 'Nginx',
    'Infrastructure as Code', 'Helm', 'Security & Compliance', 'Networking'
  ],
  'default': [
    'Python', 'JavaScript', 'SQL', 'Git', 'APIs', 'Docker', 'Database',
    'Problem Solving', 'Data Structures', 'Testing', 'Agile', 'Code Review'
  ]
};

const POWER_ACTION_VERBS = [
  'Architected', 'Engineered', 'Spearheaded', 'Optimized', 'Implemented',
  'Containerized', 'Automated', 'Deployed', 'Designed', 'Benchmarked',
  'Streamlined', 'Overhauled', 'Orchestrated', 'Reduced', 'Accelerated',
  'Refactored', 'Constructed', 'Formulated', 'Centralized', 'Provisioned'
];

const WEAK_PASSIVE_PHRASES = [
  { phrase: 'responsible for', replacement: 'Spearheaded and executed' },
  { phrase: 'worked on', replacement: 'Engineered and scaled' },
  { phrase: 'assisted in', replacement: 'Collaborated on and delivered' },
  { phrase: 'helped to', replacement: 'Facilitated and implemented' },
  { phrase: 'handled', replacement: 'Managed and optimized' },
  { phrase: 'participated in', replacement: 'Drove development in' },
  { phrase: 'tasked with', replacement: 'Owned and executed' },
  { phrase: 'duties included', replacement: 'Successfully delivered' },
  { phrase: 'made changes', replacement: 'Refactored and enhanced' }
];

const CLICHES_TO_AVOID = [
  { phrase: 'hard worker', fix: 'demonstrated track record of delivering high-velocity engineering features' },
  { phrase: 'team player', fix: 'cross-functional collaborator partnering across engineering and product teams' },
  { phrase: 'go-getter', fix: 'self-directed engineer driving technical initiatives from inception to production' },
  { phrase: 'results-driven', fix: 'focused on measurable latency reduction, uptime, and business metrics' },
  { phrase: 'detail-oriented', fix: 'rigorous in code quality, comprehensive unit test coverage, and documentation' },
  { phrase: 'self-starter', fix: 'independently researched, designed, and deployed architectural solutions' },
  { phrase: 'think outside the box', fix: 'innovated novel distributed algorithms and non-linear caching strategies' }
];

export async function verifyResumeATS(
  resumeText: string,
  targetRole: string = 'Software Engineer',
  jobDescription?: string,
  aiClient?: GoogleGenAI | null
): Promise<ATSVerificationResult> {
  const text = (resumeText || '').trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeSeconds = Math.round((wordCount / 200) * 60);

  // 1. Detect Standard Sections
  const expectedSections = [
    { name: 'Contact Information', regex: /(@|github\.com|linkedin\.com|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)/i },
    { name: 'Summary / Objective', regex: /(summary|objective|profile|about\s+me)\b/i },
    { name: 'Work Experience', regex: /(experience|employment|work\s+history|internship)\b/i },
    { name: 'Education', regex: /(education|academic|university|degree|b\.tech|b\.s|b\.e|cgpa|gpa)\b/i },
    { name: 'Projects', regex: /(projects|portfolio|technical\s+projects|open\s+source)\b/i },
    { name: 'Technical Skills', regex: /(skills|technologies|technical\s+stack|competencies|tools)\b/i }
  ];

  const detectedSections: string[] = [];
  const missingSections: string[] = [];

  expectedSections.forEach(sec => {
    if (sec.regex.test(text)) {
      detectedSections.push(sec.name);
    } else {
      missingSections.push(sec.name);
    }
  });

  // 2. Detect Quantifiable Impact & Metrics
  const metricRegex = /\b\d+(\.\d+)?%|\b\d+\+?\s*(k|m|million|users|requests|ms|s|seconds|queries|stars|downloads|clients|students)\b|\b\$\s*\d+|\b\d+\s*x\s*(faster|speedup|reduction|increase)/gi;
  const matches = text.match(metricRegex) || [];
  const metricsCount = matches.length;

  // 3. Detect Action Verbs & Weak Verbs
  const weakVerbsFound: string[] = [];
  WEAK_PASSIVE_PHRASES.forEach(item => {
    if (lower.includes(item.phrase)) {
      weakVerbsFound.push(item.phrase);
    }
  });

  let powerVerbCount = 0;
  POWER_ACTION_VERBS.forEach(verb => {
    const rx = new RegExp(`\\b${verb}\\b`, 'i');
    if (rx.test(text)) powerVerbCount++;
  });

  // 4. Detect Clichés
  const clichésFound: string[] = [];
  CLICHES_TO_AVOID.forEach(item => {
    if (lower.includes(item.phrase)) {
      clichésFound.push(item.phrase);
    }
  });

  // 5. Keyword Matching against Target Role
  const roleKey = Object.keys(ROLE_KEYWORDS).find(k => targetRole.toLowerCase().includes(k)) || 'default';
  const targetKeywords = ROLE_KEYWORDS[roleKey] || ROLE_KEYWORDS['default'];

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  targetKeywords.forEach(kw => {
    const rx = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (rx.test(text)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  // ── Compute 5 Enhancv Pillars ──
  // Pillar 1: ATS Compatibility (20 pts max)
  let p1 = 12;
  if (detectedSections.includes('Contact Information')) p1 += 3;
  if (detectedSections.includes('Work Experience') || detectedSections.includes('Projects')) p1 += 3;
  if (detectedSections.includes('Education')) p1 += 2;
  if (wordCount >= 300 && wordCount <= 900) p1 = Math.min(20, p1 + 2);
  else if (wordCount < 150) p1 = Math.max(6, p1 - 5);
  p1 = Math.min(20, Math.max(0, p1));

  // Pillar 2: Content & Measurable Impact (25 pts max)
  let p2 = 8;
  if (metricsCount >= 5) p2 = 25;
  else if (metricsCount >= 3) p2 = 21;
  else if (metricsCount >= 1) p2 = 16;
  else p2 = 8; // Penalty for zero metrics

  // Pillar 3: Keyword Optimization (25 pts max)
  const kwMatchPct = matchedKeywords.length / (targetKeywords.length || 1);
  const p3 = Math.round(Math.min(25, kwMatchPct * 25 + 4));

  // Pillar 4: Action Verbs & Voice (15 pts max)
  let p4 = 10;
  if (powerVerbCount >= 5) p4 += 5;
  else if (powerVerbCount >= 2) p4 += 2;
  if (weakVerbsFound.length > 2) p4 = Math.max(4, p4 - 4);
  else if (weakVerbsFound.length > 0) p4 = Math.max(6, p4 - 2);
  p4 = Math.min(15, Math.max(0, p4));

  // Pillar 5: Structure, Brevity & Cliché Avoidance (15 pts max)
  let p5 = 15;
  if (clichésFound.length > 0) p5 -= clichésFound.length * 3;
  if (wordCount > 1100) p5 -= 3;
  p5 = Math.min(15, Math.max(4, p5));

  const overallScore = Math.min(100, Math.max(20, p1 + p2 + p3 + p4 + p5));

  let verdict: 'ready' | 'needs_work' | 'at_risk' = 'needs_work';
  let verdictLabel = 'Needs Optimization';
  let verdictSummary = 'Your resume will pass basic ATS filters, but lacks sufficient quantifiable metrics and role-specific keywords to stand out to hiring managers.';

  if (overallScore >= 85) {
    verdict = 'ready';
    verdictLabel = 'Ready to Apply';
    verdictSummary = 'Exceptional ATS compatibility. Your resume features strong quantifiable metrics, active verbs, and high keyword alignment for top-tier tech roles.';
  } else if (overallScore < 65) {
    verdict = 'at_risk';
    verdictLabel = 'At Risk';
    verdictSummary = 'Your resume is at risk of being screened out by automated ATS parsers due to missing critical sections, low keyword density, or absence of measurable impact.';
  }

  // ── Construct Structured Enhancements for Modifying in Resume ──
  const enhancements: ATSEnhancement[] = [];

  // Enhancement 1: Replace Weak Passive Verbs
  WEAK_PASSIVE_PHRASES.forEach((item, idx) => {
    if (lower.includes(item.phrase)) {
      // Find line with this phrase
      const lines = text.split('\n');
      const targetLine = lines.find(l => l.toLowerCase().includes(item.phrase)) || item.phrase;
      const enhancedLine = targetLine.replace(
        new RegExp(item.phrase, 'i'),
        item.replacement
      ) + (targetLine.includes('%') || targetLine.includes('0') ? '' : ' to optimize system performance by 28%');

      enhancements.push({
        id: `enh_verb_${idx}`,
        category: 'Action Verbs',
        severity: 'critical',
        title: `Replace Weak Verb Phrase: "${item.phrase}"`,
        description: `ATS parsers and senior hiring managers look for strong power verbs at the start of bullet points rather than passive duties.`,
        original_text: targetLine.trim(),
        suggested_enhancement: enhancedLine.trim(),
        action_type: 'replace',
        target_section: 'Experience / Projects'
      });
    }
  });

  // Enhancement 2: Inject Measurable Numbers / STAR Metrics if low
  if (metricsCount < 3) {
    const lines = text.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().length > 30);
    const candidateLine = lines.find(l => !l.match(/\d+%/)) || lines[0] || 'Built web application using modern framework.';
    enhancements.push({
      id: 'enh_metric_1',
      category: 'Content Impact',
      severity: 'critical',
      title: 'Add Quantifiable Metrics (Google X-Y-Z STAR Rule)',
      description: 'Quantify your achievement: "Accomplished [X], as measured by [Y], by doing [Z]". Resumes with metrics get 3.2x more interview callbacks.',
      original_text: candidateLine.trim(),
      suggested_enhancement: `${candidateLine.trim()} — reducing latency by 35% and serving 5,000+ active user requests.`,
      action_type: 'replace',
      target_section: 'Projects / Experience'
    });
  }

  // Enhancement 3: Replace Clichés with Technical Competence
  CLICHES_TO_AVOID.forEach((item, idx) => {
    if (lower.includes(item.phrase)) {
      const lines = text.split('\n');
      const targetLine = lines.find(l => l.toLowerCase().includes(item.phrase)) || item.phrase;
      enhancements.push({
        id: `enh_cliche_${idx}`,
        category: 'Clichés',
        severity: 'recommended',
        title: `Eliminate Cliché Buzzword: "${item.phrase}"`,
        description: `Phrases like "${item.phrase}" are filtered as fluff by modern recruiters. Replace with concrete technical evidence.`,
        original_text: targetLine.trim(),
        suggested_enhancement: targetLine.replace(new RegExp(item.phrase, 'i'), item.fix).trim(),
        action_type: 'replace',
        target_section: 'Summary / Experience'
      });
    }
  });

  // Enhancement 4: Missing Keywords Injection
  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 4);
    enhancements.push({
      id: 'enh_kw_inject',
      category: 'Keywords',
      severity: 'recommended',
      title: `Inject High-Priority ATS Keywords for ${targetRole}`,
      description: `Target role requires competencies in ${topMissing.join(', ')}. Add them to your Technical Skills and project bullets.`,
      original_text: 'Technical Skills Section',
      suggested_enhancement: `Technical Skills: ${matchedKeywords.slice(0, 5).join(', ')}, ${topMissing.join(', ')}`,
      action_type: 'insert',
      target_section: 'Skills'
    });
  }

  // Enhancement 5: Missing Section Warnings
  if (missingSections.length > 0) {
    missingSections.forEach((sec, sIdx) => {
      enhancements.push({
        id: `enh_sec_${sIdx}`,
        category: 'ATS Formatting',
        severity: 'critical',
        title: `Missing Standard Section: "${sec}"`,
        description: `ATS applicant tracking systems scan for standard headings to categorize your profile. Add a dedicated "${sec}" heading.`,
        original_text: `[Section Missing: ${sec}]`,
        suggested_enhancement: `## ${sec}\n- Add concise bullet points highlighting your background here.`,
        action_type: 'insert',
        target_section: sec
      });
    });
  }

  // ── Deep Gemini Live AI Polish (if AI client available) ──
  if (aiClient && text.length > 50) {
    try {
      const prompt = `You are the lead resume reviewer at Enhancv and senior engineering hiring manager.
Analyze this resume text for a candidate targeting the role "${targetRole}".

Resume Text:
"""
${text.slice(0, 3000)}
"""

Task:
Identify 2 to 3 specific weak bullet points or phrases in this resume that lack impact, numbers, or action verbs.
Provide direct BEFORE -> AFTER enhancements formatted with the Google X-Y-Z STAR formula.
Also provide 1-2 critical ATS recommendations.

Return ONLY a valid JSON object matching this schema:
{
  "enhancements": [
    {
      "title": "Title of improvement",
      "category": "Content Impact",
      "original_text": "Exact or approximate weak phrase from resume",
      "suggested_enhancement": "Strong quantified rewrite with active verbs and numbers",
      "description": "Why this change dramatically improves ATS ranking"
    }
  ],
  "personalized_critique": "Brief 2-sentence summary of resume standing"
}`;

      const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      for (const m of candidateModels) {
        try {
          const aiResponse = await aiClient.models.generateContent({
            model: m,
            contents: prompt,
            config: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          });

          if (aiResponse && aiResponse.text) {
            const parsed = JSON.parse(aiResponse.text);
            if (Array.isArray(parsed.enhancements) && parsed.enhancements.length > 0) {
              parsed.enhancements.forEach((enh: any, gIdx: number) => {
                if (enh.original_text && enh.suggested_enhancement) {
                  enhancements.unshift({
                    id: `gemini_enh_${gIdx}_${Date.now()}`,
                    category: enh.category || 'Content Impact',
                    severity: 'critical',
                    title: enh.title || 'AI STAR Formula Enhancement',
                    description: enh.description || 'Rewritten with active power verbs and quantifiable scale.',
                    original_text: enh.original_text,
                    suggested_enhancement: enh.suggested_enhancement,
                    action_type: 'replace',
                    target_section: 'Projects / Experience'
                  });
                }
              });
              if (parsed.personalized_critique) {
                verdictSummary = parsed.personalized_critique;
              }
            }
            break;
          }
        } catch (mErr) {
          // Continue to next model
        }
      }
    } catch (err) {
      console.warn('Gemini semantic resume enhancement skipped:', err);
    }
  }

  return {
    overall_score: overallScore,
    verdict,
    verdict_label: verdictLabel,
    verdict_summary: verdictSummary,
    category_scores: {
      ats_compatibility: {
        score: p1,
        max: 20,
        pct: Math.round((p1 / 20) * 100),
        detail: detectedSections.length >= 5 ? 'All major ATS sections detected cleanly.' : `Missing sections: ${missingSections.join(', ')}`,
        status: p1 >= 16 ? 'good' : p1 >= 12 ? 'warning' : 'critical'
      },
      content_impact: {
        score: p2,
        max: 25,
        pct: Math.round((p2 / 25) * 100),
        detail: metricsCount >= 4 ? `Found ${metricsCount} quantifiable metrics (%, $, scale).` : `Found only ${metricsCount} metrics. Target 4+ to reach top 5% tier.`,
        status: p2 >= 20 ? 'good' : p2 >= 14 ? 'warning' : 'critical'
      },
      keyword_optimization: {
        score: p3,
        max: 25,
        pct: Math.round((p3 / 25) * 100),
        detail: `Matched ${matchedKeywords.length}/${targetKeywords.length} core keywords for ${targetRole}.`,
        status: p3 >= 20 ? 'good' : p3 >= 14 ? 'warning' : 'critical'
      },
      action_verbs: {
        score: p4,
        max: 15,
        pct: Math.round((p4 / 15) * 100),
        detail: weakVerbsFound.length === 0 ? `Strong active verbs utilized (${powerVerbCount} detected).` : `Found ${weakVerbsFound.length} passive/weak phrases.`,
        status: p4 >= 12 ? 'good' : p4 >= 8 ? 'warning' : 'critical'
      },
      structure_formatting: {
        score: p5,
        max: 15,
        pct: Math.round((p5 / 15) * 100),
        detail: clichésFound.length === 0 ? 'Zero clichés detected; professional tone.' : `Found ${clichésFound.length} generic buzzwords to replace.`,
        status: p5 >= 12 ? 'good' : p5 >= 8 ? 'warning' : 'critical'
      }
    },
    metrics_found_count: metricsCount,
    word_count: wordCount,
    reading_time_seconds: readingTimeSeconds,
    detected_sections: detectedSections,
    missing_sections: missingSections,
    matched_keywords: matchedKeywords,
    missing_keywords: missingKeywords,
    clichés_found: clichésFound,
    weak_verbs_found: weakVerbsFound,
    enhancements: enhancements.slice(0, 10), // Return top 10 actionable modifications
    analyzed_at: new Date().toISOString(),
    source: aiClient ? 'enhancv-gemini-hybrid' : 'enhancv-rule-engine'
  };
}
