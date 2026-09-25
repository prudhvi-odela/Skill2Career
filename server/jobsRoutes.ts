/**
 * Skill2Career Real-Time Jobs & Internships API Router
 * Endpoints for recommendations, search, filter metadata, saved jobs, and application tracking
 */

import { Router, Request, Response } from 'express';
import { adzunaClient } from './adzunaClient.js';
import { normalizeAdzunaJob, NormalizedJob } from './jobNormalization.js';
import { analyzeJobMatch, MatchAnalysisResult } from './jobMatchingEngine.js';
import { store } from './store.js';

export const jobsRouter = Router();

// Helper to extract userId from Authorization Bearer token or fallback
function getUserId(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token && token !== 'undefined' && token !== 'null') {
      return token;
    }
  }
  return 'usr_demo_01';
}

/**
 * GET /status
 * Health check & configuration status for Adzuna API
 */
jobsRouter.get('/status', (req: Request, res: Response) => {
  res.json(adzunaClient.getStatus());
});

/**
 * GET /filters
 * Return supported filter options and metadata
 */
jobsRouter.get('/filters', (req: Request, res: Response) => {
  res.json({
    countries: [
      { code: 'in', label: 'India (Official)' },
      { code: 'gb', label: 'United Kingdom' },
      { code: 'us', label: 'United States' },
    ],
    top_cities: [
      'All Locations',
      'Bengaluru',
      'Hyderabad',
      'Pune',
      'Mumbai',
      'Delhi NCR',
      'Chennai',
      'Kolkata',
      'Noida',
      'Gurugram',
      'Ahmedabad',
      'Remote',
    ],
    work_modes: ['All', 'Remote', 'Hybrid', 'On-Site'],
    employment_types: ['All', 'Internship', 'Full-Time', 'Part-Time', 'Contract'],
    experience_levels: [
      'All',
      'Entry-Level / Fresher',
      'Junior',
      'Mid-Level',
      'Senior',
    ],
    sort_options: [
      { value: 'relevance', label: 'Recommended Match (Best Fit)' },
      { value: 'match_pct', label: 'Highest Skill Match %' },
      { value: 'date', label: 'Most Recent Postings' },
      { value: 'salary', label: 'Highest Package / Stipend' },
    ],
    application_statuses: [
      'Interested',
      'Applied',
      'Interview',
      'Offer',
      'Rejected',
      'Withdrawn',
    ],
  });
});

/**
 * GET /recommendations
 * Personalized recommendations for the student based on target career, skills, and readiness
 */
jobsRouter.get('/recommendations', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const profile = store.getProfile(userId);
  const targetTitle = profile?.target_career_title || 'Software Engineer';

  // Filters from query
  const country = (req.query.country as string) || 'in';
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = Math.min(50, parseInt(req.query.limit as string, 10) || 15);
  const whatQuery = (req.query.what as string) || (req.query.query as string) || targetTitle;
  const whereLoc = (req.query.where as string) || (req.query.location as string) || '';
  const workModeFilter = (req.query.work_mode as string) || 'All';
  const empTypeFilter = (req.query.employment_type as string) || 'All';
  const expLevelFilter = (req.query.experience_level as string) || 'All';
  const sortBy = (req.query.sort_by as string) || 'relevance';
  const salaryMin = req.query.salary_min ? parseFloat(req.query.salary_min as string) : undefined;

  // Check Adzuna configuration
  if (!adzunaClient.isConfigured()) {
    return res.json({
      configured: false,
      message: 'Adzuna API credentials (ADZUNA_APP_ID, ADZUNA_APP_KEY) are not configured on the backend. Please add them to your environment variables to stream verified Indian job listings.',
      attribution: 'Powered by Adzuna (https://www.adzuna.in)',
      results: [],
      total: 0,
      page,
      limit,
      student_context: {
        target_career_title: targetTitle,
        skills_count: (profile?.skills || []).length,
        degree: profile?.degree || 'B.Tech',
      },
    });
  }

  // Fetch from Adzuna API
  const apiRes = await adzunaClient.searchJobs({
    country,
    page,
    resultsPerPage: 30, // fetch a batch to allow filtering and precision ranking
    what: whatQuery,
    where: whereLoc || undefined,
    salaryMin,
  });

  if (!apiRes.success || !apiRes.data) {
    return res.status(502).json({
      configured: true,
      error: apiRes.error || 'Failed to retrieve listings from Adzuna API.',
      results: [],
      total: 0,
      page,
      limit,
    });
  }

  // Normalize and Cache
  const rawList = apiRes.data.results || [];
  const normalizedList: NormalizedJob[] = rawList.map(item => {
    const norm = normalizeAdzunaJob(item, country);
    store.cacheJob(norm);
    return norm;
  });

  // Score each job with personalized matching engine
  let analyzed: (MatchAnalysisResult & { is_saved: boolean; saved_application_status?: string })[] = normalizedList.map(job => {
    const analysis = analyzeJobMatch(userId, job, whereLoc, workModeFilter);
    const isSaved = store.isJobSaved(userId, job.id);
    const savedRecord = isSaved ? store.getSavedJobs(userId).find(r => r.job_id === job.id) : undefined;
    return {
      ...analysis,
      is_saved: isSaved,
      saved_application_status: savedRecord?.application_status,
    };
  });

  // Apply in-memory filters for work_mode, employment_type, experience_level
  if (workModeFilter && workModeFilter !== 'All') {
    analyzed = analyzed.filter(a => a.job.work_mode.toLowerCase() === workModeFilter.toLowerCase());
  }

  if (empTypeFilter && empTypeFilter !== 'All') {
    analyzed = analyzed.filter(a => a.job.employment_type.toLowerCase() === empTypeFilter.toLowerCase());
  }

  if (expLevelFilter && expLevelFilter !== 'All') {
    analyzed = analyzed.filter(a => a.job.experience_level.toLowerCase() === expLevelFilter.toLowerCase());
  }

  // Sorting
  if (sortBy === 'match_pct') {
    analyzed.sort((a, b) => b.skill_match_percentage - a.skill_match_percentage);
  } else if (sortBy === 'date') {
    analyzed.sort((a, b) => new Date(b.job.posting_date).getTime() - new Date(a.job.posting_date).getTime());
  } else if (sortBy === 'salary') {
    analyzed.sort((a, b) => (b.job.salary_max || b.job.salary_min || 0) - (a.job.salary_max || a.job.salary_min || 0));
  } else {
    // Default: 'relevance' (recommendation_score descending)
    analyzed.sort((a, b) => b.recommendation_score - a.recommendation_score);
  }

  // Count summaries
  const internshipCount = analyzed.filter(a => a.job.employment_type === 'Internship').length;
  const fulltimeCount = analyzed.filter(a => a.job.employment_type === 'Full-Time').length;

  // Pagination slice
  const paginatedResults = analyzed.slice(0, limit);

  res.json({
    configured: true,
    attribution: 'Powered by Adzuna (https://www.adzuna.in)',
    results: paginatedResults,
    total: apiRes.data.count || analyzed.length,
    page,
    limit,
    from_cache: Boolean(apiRes.fromCache),
    stats: {
      internship_count: internshipCount,
      fulltime_count: fulltimeCount,
      batch_total: analyzed.length,
    },
    student_context: {
      target_career_title: targetTitle,
      skills_count: (profile?.skills || []).length,
      degree: profile?.degree || 'B.Tech',
      graduation_year: profile?.graduation_year || 2026,
      readiness_score: analyzed[0]?.readiness_score || 75,
    },
  });
});

/**
 * GET /search
 * Direct search endpoint with query, location, and filters
 */
jobsRouter.get('/search', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const country = (req.query.country as string) || 'in';
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = Math.min(50, parseInt(req.query.limit as string, 10) || 15);
  const whatQuery = (req.query.what as string) || (req.query.query as string) || '';
  const whereLoc = (req.query.where as string) || (req.query.location as string) || '';
  const workModeFilter = (req.query.work_mode as string) || 'All';
  const empTypeFilter = (req.query.employment_type as string) || 'All';
  const expLevelFilter = (req.query.experience_level as string) || 'All';
  const sortBy = (req.query.sort_by as string) || 'relevance';
  const salaryMin = req.query.salary_min ? parseFloat(req.query.salary_min as string) : undefined;
  const salaryMax = req.query.salary_max ? parseFloat(req.query.salary_max as string) : undefined;

  if (!adzunaClient.isConfigured()) {
    return res.json({
      configured: false,
      message: 'Adzuna API credentials (ADZUNA_APP_ID, ADZUNA_APP_KEY) are not configured.',
      attribution: 'Powered by Adzuna (https://www.adzuna.in)',
      results: [],
      total: 0,
      page,
      limit,
    });
  }

  const apiRes = await adzunaClient.searchJobs({
    country,
    page,
    resultsPerPage: 30,
    what: whatQuery,
    where: whereLoc || undefined,
    salaryMin,
    salaryMax,
  });

  if (!apiRes.success || !apiRes.data) {
    return res.status(502).json({
      configured: true,
      error: apiRes.error || 'Failed to search listings from Adzuna API.',
      results: [],
      total: 0,
      page,
      limit,
    });
  }

  const rawList = apiRes.data.results || [];
  const normalizedList: NormalizedJob[] = rawList.map(item => {
    const norm = normalizeAdzunaJob(item, country);
    store.cacheJob(norm);
    return norm;
  });

  let analyzed = normalizedList.map(job => {
    const analysis = analyzeJobMatch(userId, job, whereLoc, workModeFilter);
    const isSaved = store.isJobSaved(userId, job.id);
    const savedRecord = isSaved ? store.getSavedJobs(userId).find(r => r.job_id === job.id) : undefined;
    return {
      ...analysis,
      is_saved: isSaved,
      saved_application_status: savedRecord?.application_status,
    };
  });

  // Apply filters
  if (workModeFilter && workModeFilter !== 'All') {
    analyzed = analyzed.filter(a => a.job.work_mode.toLowerCase() === workModeFilter.toLowerCase());
  }
  if (empTypeFilter && empTypeFilter !== 'All') {
    analyzed = analyzed.filter(a => a.job.employment_type.toLowerCase() === empTypeFilter.toLowerCase());
  }
  if (expLevelFilter && expLevelFilter !== 'All') {
    analyzed = analyzed.filter(a => a.job.experience_level.toLowerCase() === expLevelFilter.toLowerCase());
  }

  if (sortBy === 'match_pct') {
    analyzed.sort((a, b) => b.skill_match_percentage - a.skill_match_percentage);
  } else if (sortBy === 'date') {
    analyzed.sort((a, b) => new Date(b.job.posting_date).getTime() - new Date(a.job.posting_date).getTime());
  } else if (sortBy === 'salary') {
    analyzed.sort((a, b) => (b.job.salary_max || b.job.salary_min || 0) - (a.job.salary_max || a.job.salary_min || 0));
  } else {
    analyzed.sort((a, b) => b.recommendation_score - a.recommendation_score);
  }

  res.json({
    configured: true,
    attribution: 'Powered by Adzuna (https://www.adzuna.in)',
    results: analyzed.slice(0, limit),
    total: apiRes.data.count || analyzed.length,
    page,
    limit,
    from_cache: Boolean(apiRes.fromCache),
  });
});

/**
 * GET /saved
 * Retrieve authenticated student's saved jobs and application status records
 */
jobsRouter.get('/saved', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const savedRecords = store.getSavedJobs(userId);

  // Augment saved jobs with live matching analysis
  const augmented = savedRecords.map(rec => {
    const analysis = analyzeJobMatch(userId, rec.job);
    return {
      ...rec,
      analysis,
    };
  });

  res.json({
    total: augmented.length,
    saved_jobs: augmented,
  });
});

/**
 * GET /:job_id
 * Retrieve full details for a single job by id
 */
jobsRouter.get('/:job_id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const jobId = req.params.job_id;

  const job = store.getCachedJob(jobId);
  if (!job) {
    return res.status(404).json({
      error: 'Job listing not found in active cache or expired. Please refresh search results to retrieve recent details.',
    });
  }

  const analysis = analyzeJobMatch(userId, job);
  const isSaved = store.isJobSaved(userId, job.id);
  const savedRecord = isSaved ? store.getSavedJobs(userId).find(r => r.job_id === job.id) : undefined;

  res.json({
    ...analysis,
    is_saved: isSaved,
    saved_record: savedRecord || null,
    attribution: 'Job details provided by Adzuna (https://www.adzuna.in)',
  });
});

/**
 * POST /:job_id/save
 * Save a job for the authenticated student
 */
jobsRouter.post('/:job_id/save', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const jobId = req.params.job_id;

  // Job data can come from body if provided, or from cache
  let jobToSave: NormalizedJob | null = req.body?.job || null;
  if (!jobToSave) {
    jobToSave = store.getCachedJob(jobId);
  }

  if (!jobToSave) {
    return res.status(400).json({
      error: 'Cannot save job: Listing information not found in cache and not provided in request body.',
    });
  }

  const record = store.saveJob(userId, jobToSave);
  res.json({
    success: true,
    message: 'Opportunity saved successfully.',
    saved_record: record,
  });
});

/**
 * DELETE /:job_id/save
 * Remove a job from saved opportunities
 */
jobsRouter.delete('/:job_id/save', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const jobId = req.params.job_id;

  const deleted = store.unsaveJob(userId, jobId);
  res.json({
    success: true,
    deleted,
    message: deleted ? 'Opportunity removed from saved list.' : 'Job was not in saved list.',
  });
});

/**
 * PATCH /:job_id/application-status
 * Manually update student's application tracking status for a job
 */
jobsRouter.patch('/:job_id/application-status', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const jobId = req.params.job_id;
  const { status, notes } = req.body;

  const validStatuses = ['Interested', 'Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid application status. Allowed: ${validStatuses.join(', ')}`,
    });
  }

  const record = store.updateJobApplicationStatus(userId, jobId, status, notes);
  if (!record) {
    return res.status(404).json({
      error: 'Job not found in saved list or active cache to update status. Please save the job first.',
    });
  }

  res.json({
    success: true,
    message: `Application status updated to "${status}".`,
    updated_record: record,
  });
});
