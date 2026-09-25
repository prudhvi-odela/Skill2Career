/**
 * Skill2Career Jobs & Internships Client API
 */

import { apiFetch } from './api';

export interface NormalizedJob {
  id: string;
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
}

export interface MatchedSkillDetail {
  skill_name: string;
  student_level: number;
  verified: boolean;
  match_quality: 'Strong' | 'Adequate' | 'Basic';
}

export interface MissingSkillDetail {
  skill_name: string;
  recommended_target_level: number;
  priority: 'High' | 'Medium' | 'Recommended';
}

export interface MatchAnalysisResult {
  job: NormalizedJob;
  skill_match_percentage: number;
  readiness_score: number;
  eligibility_status: 'Eligible' | 'Ineligible' | 'Eligibility not verified';
  eligibility_reasons: string[];
  matched_skills: MatchedSkillDetail[];
  missing_skills: MissingSkillDetail[];
  location_match: boolean;
  work_mode_match: boolean;
  recommendation_score: number;
  match_reasons: string[];
  actionable_recommendations: string[];
  target_career_alignment: {
    target_role: string;
    aligned: boolean;
  };
  is_saved?: boolean;
  saved_application_status?: string;
}

export interface SavedJobRecord {
  job_id: string;
  saved_at: string;
  job: NormalizedJob;
  application_status: 'Interested' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';
  status_updated_at: string;
  notes?: string;
  analysis?: MatchAnalysisResult;
}

export interface JobFilterOptions {
  countries: { code: string; label: string }[];
  top_cities: string[];
  work_modes: string[];
  employment_types: string[];
  experience_levels: string[];
  sort_options: { value: string; label: string }[];
  application_statuses: string[];
}

export interface JobRecommendationResponse {
  configured: boolean;
  message?: string;
  attribution: string;
  results: MatchAnalysisResult[];
  total: number;
  page: number;
  limit: number;
  from_cache?: boolean;
  stats?: {
    internship_count: number;
    fulltime_count: number;
    batch_total: number;
  };
  student_context?: {
    target_career_title: string;
    skills_count: number;
    degree: string;
    graduation_year: number;
    readiness_score: number;
  };
}

export async function fetchJobStatus(): Promise<{
  configured: boolean;
  provider: string;
  default_country: string;
  attribution: string;
  app_id_set: boolean;
  app_key_set: boolean;
}> {
  const res = await apiFetch('/api/jobs/status');
  if (!res.ok) throw new Error('Failed to retrieve job service status');
  return res.json();
}

export async function fetchJobFilters(): Promise<JobFilterOptions> {
  const res = await apiFetch('/api/jobs/filters');
  if (!res.ok) throw new Error('Failed to retrieve job filters');
  return res.json();
}

export async function fetchJobRecommendations(params: {
  page?: number;
  limit?: number;
  query?: string;
  location?: string;
  work_mode?: string;
  employment_type?: string;
  experience_level?: string;
  sort_by?: string;
  salary_min?: number;
}): Promise<JobRecommendationResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.query) qs.set('query', params.query);
  if (params.location && params.location !== 'All Locations') qs.set('location', params.location);
  if (params.work_mode && params.work_mode !== 'All') qs.set('work_mode', params.work_mode);
  if (params.employment_type && params.employment_type !== 'All') qs.set('employment_type', params.employment_type);
  if (params.experience_level && params.experience_level !== 'All') qs.set('experience_level', params.experience_level);
  if (params.sort_by) qs.set('sort_by', params.sort_by);
  if (params.salary_min) qs.set('salary_min', String(params.salary_min));

  const res = await apiFetch(`/api/jobs/recommendations?${qs.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch job recommendations');
  }
  return res.json();
}

export async function searchJobs(params: {
  query?: string;
  location?: string;
  page?: number;
  limit?: number;
  work_mode?: string;
  employment_type?: string;
  experience_level?: string;
  sort_by?: string;
}): Promise<JobRecommendationResponse> {
  const qs = new URLSearchParams();
  if (params.query) qs.set('what', params.query);
  if (params.location && params.location !== 'All Locations') qs.set('where', params.location);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.work_mode && params.work_mode !== 'All') qs.set('work_mode', params.work_mode);
  if (params.employment_type && params.employment_type !== 'All') qs.set('employment_type', params.employment_type);
  if (params.experience_level && params.experience_level !== 'All') qs.set('experience_level', params.experience_level);
  if (params.sort_by) qs.set('sort_by', params.sort_by);

  const res = await apiFetch(`/api/jobs/search?${qs.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to search jobs');
  }
  return res.json();
}

export async function fetchJobDetails(jobId: string): Promise<MatchAnalysisResult & {
  is_saved: boolean;
  saved_record: SavedJobRecord | null;
  attribution: string;
}> {
  const res = await apiFetch(`/api/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch job details');
  }
  return res.json();
}

export async function fetchSavedJobs(): Promise<{
  total: number;
  saved_jobs: SavedJobRecord[];
}> {
  const res = await apiFetch('/api/jobs/saved');
  if (!res.ok) throw new Error('Failed to retrieve saved jobs');
  return res.json();
}

export async function saveJob(jobId: string, jobData?: NormalizedJob): Promise<{ success: boolean; saved_record: SavedJobRecord }> {
  const res = await apiFetch(`/api/jobs/${encodeURIComponent(jobId)}/save`, {
    method: 'POST',
    body: JSON.stringify({ job: jobData }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save job');
  }
  return res.json();
}

export async function unsaveJob(jobId: string): Promise<{ success: boolean; deleted: boolean }> {
  const res = await apiFetch(`/api/jobs/${encodeURIComponent(jobId)}/save`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to unsave job');
  return res.json();
}

export async function updateApplicationStatus(
  jobId: string,
  status: 'Interested' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn',
  notes?: string
): Promise<{ success: boolean; updated_record: SavedJobRecord }> {
  const res = await apiFetch(`/api/jobs/${encodeURIComponent(jobId)}/application-status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update application status');
  }
  return res.json();
}
