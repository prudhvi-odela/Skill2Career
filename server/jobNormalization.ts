/**
 * Skill2Career Normalized Job Data Model & Parser
 * Normalizes Adzuna listings into clean, type-safe structures
 * Handles deterministic skill extraction, work-mode detection, and salary formatting.
 */

import { SKILLS_CATALOG } from './seedData.js';
import type { AdzunaRawJob } from './adzunaClient.js';

export interface NormalizedJob {
  id: string; // e.g., adzuna_in_12345678
  source_id: string;
  source: 'adzuna';
  title: string;
  company_name: string;
  company_initials: string;
  description: string;
  required_skills: string[];
  employment_type: 'Full-Time' | 'Internship' | 'Part-Time' | 'Contract' | 'Unknown';
  experience_level: 'Entry-Level / Fresher' | 'Junior' | 'Mid-Level' | 'Senior' | 'Not Specified';
  education_requirements: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_is_predicted: boolean;
  salary_formatted: string;
  city: string;
  state: string;
  country: string;
  location_display: string;
  work_mode: 'Remote' | 'Hybrid' | 'On-Site' | 'Not Specified';
  application_url: string;
  original_url: string;
  posting_date: string;
  application_deadline: string | null;
  fetched_at: string;
  status: 'active' | 'expired' | 'unverified';
  category_tag?: string;
  category_label?: string;
  latitude?: number;
  longitude?: number;
}

// Build precompiled skill search regexes for high-performance deterministic extraction
const SKILL_RULES: { name: string; pattern: RegExp }[] = [];

// Seed from SKILLS_CATALOG
SKILLS_CATALOG.forEach(s => {
  const terms = [s.skill_name, ...(s.aliases || [])];
  terms.forEach(t => {
    // Avoid short words without boundaries
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // For languages like C++ or C#, special boundary handling
    let patternStr = `\\b${escaped}\\b`;
    if (t === 'C++' || t === 'c++') {
      patternStr = `(?:\\bC\\+\\+|\\bc\\+\\+)`;
    } else if (t === 'C#' || t === 'c#') {
      patternStr = `(?:\\bC#|\\bc#)`;
    } else if (t === '.NET' || t === '.net') {
      patternStr = `(?:\\.NET|\\.net)`;
    }
    SKILL_RULES.push({
      name: s.skill_name,
      pattern: new RegExp(patternStr, 'i'),
    });
  });
});

// Additional top industry technical skills & tools
const EXTRA_TECH_SKILLS = [
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Google Cloud', 'Linux',
  'Git', 'GitHub', 'CI/CD', 'Jenkins', 'Terraform', 'GraphQL', 'Kafka',
  'Microservices', 'REST API', 'OOP', 'System Design', 'Agile', 'Scrum',
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'LLM',
  'Generative AI', 'NLP', 'Computer Vision', 'Data Structures & Algorithms',
  'Spring Boot', 'Next.js', 'Express', 'Node.js', 'FastAPI', 'Django',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'TypeScript', 'JavaScript',
  'Python', 'Java', 'C++', 'Go', 'Rust', 'PHP', 'HTML5 & CSS3', 'Tailwind CSS'
];

EXTRA_TECH_SKILLS.forEach(skill => {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  SKILL_RULES.push({
    name: skill,
    pattern: new RegExp(`\\b${escaped}\\b`, 'i'),
  });
});

/**
 * Deterministically extracts skills from job title and description
 */
export function extractSkills(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();

  for (const rule of SKILL_RULES) {
    if (rule.pattern.test(text)) {
      found.add(rule.name);
    }
  }

  return Array.from(found);
}

/**
 * Detects remote / hybrid / on-site work mode from text and location
 */
export function detectWorkMode(title: string, description: string, locationDisplay: string): 'Remote' | 'Hybrid' | 'On-Site' | 'Not Specified' {
  const combined = `${title} ${description} ${locationDisplay}`.toLowerCase();

  if (combined.includes('work from home') || combined.includes('wfh') || combined.includes('remote') || combined.includes('fully remote') || combined.includes('100% remote')) {
    // If it says "hybrid / remote" or mentions days in office, check hybrid
    if (combined.includes('hybrid') || combined.includes('days in office') || combined.includes('days a week from office')) {
      return 'Hybrid';
    }
    return 'Remote';
  }

  if (combined.includes('hybrid') || combined.includes('flexible working')) {
    return 'Hybrid';
  }

  if (combined.includes('on-site') || combined.includes('onsite') || combined.includes('in-office') || combined.includes('work from office') || combined.includes('wfo')) {
    return 'On-Site';
  }

  // If a specific physical city is listed in India and no remote mention, it's typically On-Site
  if (locationDisplay && !locationDisplay.toLowerCase().includes('remote')) {
    return 'On-Site';
  }

  return 'Not Specified';
}

/**
 * Detects employment type (Internship, Full-Time, Part-Time, Contract)
 */
export function detectEmploymentType(raw: AdzunaRawJob): 'Full-Time' | 'Internship' | 'Part-Time' | 'Contract' | 'Unknown' {
  const combined = `${raw.title} ${raw.description} ${raw.contract_type || ''} ${raw.contract_time || ''}`.toLowerCase();

  if (
    combined.includes('intern') ||
    combined.includes('internship') ||
    combined.includes('summer intern') ||
    combined.includes('graduate trainee') ||
    combined.includes('apprentice') ||
    combined.includes('co-op') ||
    combined.includes('trainee')
  ) {
    return 'Internship';
  }

  if (
    raw.contract_type === 'contract' ||
    combined.includes('contractor') ||
    combined.includes('contract basis') ||
    combined.includes('freelance') ||
    combined.includes('consultant')
  ) {
    return 'Contract';
  }

  if (
    raw.contract_time === 'part_time' ||
    combined.includes('part-time') ||
    combined.includes('part time')
  ) {
    return 'Part-Time';
  }

  if (
    raw.contract_time === 'full_time' ||
    raw.contract_type === 'permanent' ||
    combined.includes('full-time') ||
    combined.includes('full time') ||
    combined.includes('permanent')
  ) {
    return 'Full-Time';
  }

  return 'Full-Time'; // Default standard in job boards
}

/**
 * Detects experience level required
 */
export function detectExperienceLevel(title: string, description: string): 'Entry-Level / Fresher' | 'Junior' | 'Mid-Level' | 'Senior' | 'Not Specified' {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes('fresher') ||
    text.includes('0-1 year') ||
    text.includes('0 to 1 year') ||
    text.includes('0-2 years') ||
    text.includes('0 to 2 years') ||
    text.includes('entry level') ||
    text.includes('entry-level') ||
    text.includes('intern') ||
    text.includes('internship') ||
    text.includes('graduate') ||
    text.includes('campus hiring')
  ) {
    return 'Entry-Level / Fresher';
  }

  if (text.includes('senior') || text.includes('lead') || text.includes('principal') || text.includes('architect') || text.includes('5+ years') || text.includes('7+ years')) {
    return 'Senior';
  }

  if (text.includes('junior') || text.includes('associate') || text.includes('1-3 years') || text.includes('1 to 3 years')) {
    return 'Junior';
  }

  if (text.includes('3-5 years') || text.includes('3 to 5 years') || text.includes('mid-level') || text.includes('mid level')) {
    return 'Mid-Level';
  }

  return 'Not Specified';
}

/**
 * Detects degree and academic requirements from listing
 */
export function detectEducationRequirements(text: string): string {
  const lower = text.toLowerCase();
  const matchedDegrees: string[] = [];

  if (lower.includes('b.tech') || lower.includes('btech')) matchedDegrees.push('B.Tech');
  if (lower.includes('b.e.') || lower.includes('be computer')) matchedDegrees.push('B.E.');
  if (lower.includes('m.tech') || lower.includes('mtech')) matchedDegrees.push('M.Tech');
  if (lower.includes('mca')) matchedDegrees.push('MCA');
  if (lower.includes('bca')) matchedDegrees.push('BCA');
  if (lower.includes('b.sc') || lower.includes('bsc computer')) matchedDegrees.push('B.Sc Computer Science');
  if (lower.includes('bachelor')) matchedDegrees.push("Bachelor's Degree in CS/IT/Engineering");
  if (lower.includes('master')) matchedDegrees.push("Master's Degree");

  if (matchedDegrees.length > 0) {
    return Array.from(new Set(matchedDegrees)).join(' / ');
  }

  return 'Not Specified';
}

/**
 * Formats salary for Indian currency (INR / Lakhs Per Annum) or raw
 */
export function formatSalaryDisplay(salaryMin: number | null, salaryMax: number | null, country: string = 'in'): string {
  if (salaryMin == null && salaryMax == null) {
    return 'Competitive / Not Disclosed';
  }

  const isIndia = country.toLowerCase() === 'in';

  if (isIndia) {
    // Adzuna India salaries are usually annual in INR
    const minLpa = salaryMin != null ? (salaryMin / 100000).toFixed(1) : null;
    const maxLpa = salaryMax != null ? (salaryMax / 100000).toFixed(1) : null;

    if (minLpa && maxLpa && minLpa !== maxLpa) {
      return `₹${minLpa} – ₹${maxLpa} LPA`;
    } else if (maxLpa) {
      return `Up to ₹${maxLpa} LPA`;
    } else if (minLpa) {
      return `From ₹${minLpa} LPA`;
    }
  }

  // Fallback for other currencies
  if (salaryMin && salaryMax) {
    return `${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`;
  }
  return `${(salaryMax || salaryMin)?.toLocaleString()}`;
}

/**
 * Main Normalization function
 */
export function normalizeAdzunaJob(raw: AdzunaRawJob, country: string = 'in'): NormalizedJob {
  const sourceId = String(raw.id || raw.adref || Math.random().toString(36).substring(2, 9));
  const id = `adzuna_${country.toLowerCase()}_${sourceId}`;
  
  const title = (raw.title || 'Career Opportunity')
    .replace(/<[^>]*>/g, '') // remove any stray HTML tags
    .trim();

  const description = (raw.description || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const companyName = raw.company?.display_name?.trim() || 'Hiring Enterprise';
  const companyInitials = companyName
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('') || 'CO';

  const locationDisplay = raw.location?.display_name?.trim() || (country.toUpperCase() === 'IN' ? 'India' : 'Not Specified');
  const areas = raw.location?.area || [];
  const city = areas.length >= 3 ? areas[2] : (areas[1] || locationDisplay.split(',')[0].trim());
  const state = areas.length >= 2 ? areas[1] : '';

  // Extract skills
  const requiredSkills = extractSkills(`${title} ${description} ${raw.category?.label || ''}`);

  // Work mode
  const workMode = detectWorkMode(title, description, locationDisplay);

  // Employment type
  const employmentType = detectEmploymentType(raw);

  // Experience level
  const experienceLevel = detectExperienceLevel(title, description);

  // Education
  const educationRequirements = detectEducationRequirements(`${title} ${description}`);

  // Salary
  const salaryMin = typeof raw.salary_min === 'number' ? Math.round(raw.salary_min) : null;
  const salaryMax = typeof raw.salary_max === 'number' ? Math.round(raw.salary_max) : null;
  const salaryIsPredicted = Boolean(raw.salary_is_predicted === '1' || raw.salary_is_predicted === 1 || raw.salary_is_predicted === true);
  const salaryFormatted = formatSalaryDisplay(salaryMin, salaryMax, country);

  // Clean URLs
  const appUrl = raw.redirect_url || `https://www.adzuna.in/jobs/details/${sourceId}`;

  return {
    id,
    source_id: sourceId,
    source: 'adzuna',
    title,
    company_name: companyName,
    company_initials: companyInitials,
    description,
    required_skills: requiredSkills,
    employment_type: employmentType,
    experience_level: experienceLevel,
    education_requirements: educationRequirements,
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_currency: country.toLowerCase() === 'in' ? 'INR' : 'USD',
    salary_is_predicted: salaryIsPredicted,
    salary_formatted: salaryFormatted,
    city: city || 'Bengaluru',
    state: state || '',
    country: country.toUpperCase(),
    location_display: locationDisplay,
    work_mode: workMode,
    application_url: appUrl,
    original_url: appUrl,
    posting_date: raw.created ? new Date(raw.created).toISOString() : new Date().toISOString(),
    application_deadline: null, // Never fabricate application deadline when unprovided
    fetched_at: new Date().toISOString(),
    status: 'active',
    category_tag: raw.category?.tag,
    category_label: raw.category?.label,
    latitude: raw.latitude,
    longitude: raw.longitude,
  };
}
