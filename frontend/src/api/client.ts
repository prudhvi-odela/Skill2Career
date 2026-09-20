import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if JWT token exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on a protected route, token is expired
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// ==================== API Methods ====================
export const authApi = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
};

export const studentApi = {
  getProfile: () => apiClient.get('/student/profile'),
  updateProfile: (data: any) => apiClient.put('/student/profile', data),
  getSkills: () => apiClient.get('/student/skills'),
  addSkill: (data: { skill_id: string; proficiency_level: number; years_experience?: number }) =>
    apiClient.post('/student/skills', data),
  deleteSkill: (skillId: string) => apiClient.delete(`/student/skills/${skillId}`),
  getProjects: () => apiClient.get('/student/projects'),
  createProject: (data: any) => apiClient.post('/student/projects', data),
  getCertifications: () => apiClient.get('/student/certifications'),
  createCertification: (data: any) => apiClient.post('/student/certifications', data),
  getActivities: () => apiClient.get('/student/activities'),
};

export const careersApi = {
  getCareers: (domain?: string) => apiClient.get('/careers', { params: { domain } }),
  getCareerDetail: (careerId: string) => apiClient.get(`/careers/${careerId}`),
  getSkillsCatalog: (category?: string) => apiClient.get('/careers/skills/catalog', { params: { category } }),
  getRecommendations: () => apiClient.get('/careers/matching/recommendations'),
};

export const analysisApi = {
  getSkillGap: (targetCareerId?: string) =>
    apiClient.post('/analysis/gap', null, { params: { target_career_id: targetCareerId } }),
  predictReadiness: (targetCareerId?: string, customSkills?: any[]) =>
    apiClient.post('/analysis/readiness', { target_career_id: targetCareerId, custom_skills: customSkills }),
  forecastTrajectory: (weeklyStudyHours?: number, consistency?: number, targetCareerId?: string) =>
    apiClient.post('/analysis/trajectory', {
      weekly_study_hours: weeklyStudyHours,
      learning_consistency: consistency,
      target_career_id: targetCareerId,
    }),
  getPredictionHistory: () => apiClient.get('/analysis/history'),
};

export const roadmapApi = {
  getRoadmap: (targetCareerId?: string) =>
    apiClient.get('/roadmap', { params: { target_career_id: targetCareerId } }),
  regenerateRoadmap: (targetCareerId?: string) =>
    apiClient.post('/roadmap/regenerate', null, { params: { target_career_id: targetCareerId } }),
  toggleRoadmapItem: (itemId: string, isCompleted: boolean) =>
    apiClient.put(`/roadmap/items/${itemId}`, { is_completed: isCompleted }),
  getAdaptiveCurrent: (careerId?: string) =>
    apiClient.get('/roadmap/current', { params: { career_id: careerId } }),
  recalculateAdaptive: (careerId?: string) =>
    apiClient.post('/roadmap/recalculate', null, { params: { career_id: careerId } }),
  getHistory: (careerId?: string) =>
    apiClient.get('/roadmap/history', { params: { career_id: careerId } }),
  updateProgress: (milestoneId: string, isCompleted: boolean) =>
    apiClient.post('/roadmap/progress', { milestone_id: milestoneId, is_completed: isCompleted }),
};

export const recommendationsApi = {
  getCurrent: (careerId?: string) =>
    apiClient.get('/recommendations', { params: { career_id: careerId } }),
  getForCareer: (careerId: string) =>
    apiClient.get(`/recommendations/${careerId}`),
  generate: (careerId?: string) =>
    apiClient.post('/recommendations/generate', null, { params: { career_id: careerId } }),
  submitFeedback: (data: { skill_id: string; career_id: string; feedback_type: string; notes?: string }) =>
    apiClient.post('/recommendations/feedback', data),
};

export const assessmentsApi = {
  getAssessments: () => apiClient.get('/assessments'),
  getAssessmentQuiz: (assessmentId: string) => apiClient.get(`/assessments/${assessmentId}`),
  submitAssessment: (assessmentId: string, answers: Record<string, number>) =>
    apiClient.post('/assessments/submit', { assessment_id: assessmentId, answers }),
};

export const mlAdminApi = {
  getModelVersions: () => apiClient.get('/ml/versions'),
  getMetrics: () => apiClient.get('/ml/metrics'),
  getDatasets: () => apiClient.get('/ml/datasets'),
  getDatasetQuality: (datasetId: string) => apiClient.get(`/ml/datasets/${datasetId}/quality`),
  getFeatureImportance: () => apiClient.get('/ml/feature-importance'),
  activateVersion: (versionId: string) => apiClient.post(`/ml/versions/${versionId}/activate`),
  triggerRetraining: (datasetName?: string) =>
    apiClient.post('/ml/train', null, { params: { dataset_name: datasetName } }),
};

export const aiApi = {
  explainReadiness: () => apiClient.post('/ai/explain-readiness'),
  explainGap: (careerId?: string, skillId?: string) =>
    apiClient.post('/ai/explain-gap', { career_id: careerId, skill_id: skillId }),
  getNextAction: (careerId?: string) =>
    apiClient.post('/ai/next-action', { career_id: careerId }),
  explainCareer: (careerId: string) =>
    apiClient.post('/ai/explain-career', { career_id: careerId }),
  explainTrajectory: (weeklyHours?: number, consistency?: number) =>
    apiClient.post('/ai/explain-trajectory', { weekly_hours: weeklyHours, consistency }),
  chat: (message: string, conversationId?: string, targetCareerId?: string) =>
    apiClient.post('/ai/chat', { message, conversation_id: conversationId, target_career_id: targetCareerId }),
  getHistory: (limit?: number) => apiClient.get('/ai/history', { params: { limit } }),
};

export const marketApi = {
  getSources: () => apiClient.get('/market/sources'),
  getCareerSignal: (careerId: string, region?: string) =>
    apiClient.get(`/market/careers/${careerId}`, { params: { region } }),
  getSkillSignal: (skillId: string, region?: string) =>
    apiClient.get(`/market/skills/${skillId}`, { params: { region } }),
  getCareerSkillsMarket: (careerId: string) =>
    apiClient.get(`/market/careers/${careerId}/skills`),
  getStudentAnalysis: (targetCareerId?: string) =>
    apiClient.post('/market/student-analysis', { target_career_id: targetCareerId }),
  compareCareers: (careerIds: string[]) =>
    apiClient.post('/market/career-comparison', { career_ids: careerIds }),
};

export const evidenceApi = {
  getEvidence: (params?: { skill_id?: string; evidence_type?: string; verification_status?: string }) =>
    apiClient.get('/evidence', { params }),
  getSummary: () => apiClient.get('/evidence/summary'),
  getSkillEvidence: (skillId: string) => apiClient.get(`/evidence/skills/${skillId}`),
  getSkillHistory: (skillId: string) => apiClient.get(`/evidence/skills/${skillId}/history`),
  createEvidence: (data: {
    skill_id: string;
    evidence_type: string;
    source_entity: string;
    source_entity_id: string;
    title: string;
    description?: string;
    observed_proficiency: number;
    source_metadata?: any;
  }) => apiClient.post('/evidence', data),
  verifyEvidence: (evidenceId: string, data: { verification_status: string; validator_type: string; notes?: string }) =>
    apiClient.post(`/evidence/${evidenceId}/verify`, data),
  applySkillState: (skillId: string) => apiClient.post(`/evidence/skills/${skillId}/apply-state`),
  syncArtifacts: () => apiClient.post('/evidence/sync-artifacts'),
};

export const learningIntelligenceApi = {
  getOverview: () => apiClient.get('/learning-intelligence/overview'),
  getTrajectory: () => apiClient.get('/learning-intelligence/trajectory'),
  getVelocity: () => apiClient.get('/learning-intelligence/velocity'),
  getConsistency: () => apiClient.get('/learning-intelligence/consistency'),
  getStagnation: () => apiClient.get('/learning-intelligence/stagnation'),
  getSkillHistory: (skillId: string) => apiClient.get(`/learning-intelligence/skills/${skillId}`),
  recordSnapshot: (targetCareerId?: string) =>
    apiClient.post('/learning-intelligence/snapshot', null, { params: { target_career_id: targetCareerId } }),
};

export const careerReadinessApi = {
  getAnalysis: (careerId: string) => apiClient.get(`/career-readiness/${careerId}`),
  getStrengths: (careerId: string) => apiClient.get(`/career-readiness/${careerId}/strengths`),
  getGaps: (careerId: string) => apiClient.get(`/career-readiness/${careerId}/gaps`),
  getEvidence: (careerId: string) => apiClient.get(`/career-readiness/${careerId}/evidence`),
  compareCareers: (careerIds: string[]) =>
    apiClient.get('/career-readiness/compare', { params: { career_ids: careerIds } }),
};

export const careerForecastApi = {
  getForecast: (careerId: string, horizon?: string, forceRefresh?: boolean) =>
    apiClient.get(`/career-forecast/${careerId}`, { params: { horizon, force_refresh: forceRefresh } }),
  getBottlenecks: (careerId: string, horizon?: string) =>
    apiClient.get(`/career-forecast/${careerId}/bottlenecks`, { params: { horizon } }),
  getHistory: (careerId: string, limit?: number) =>
    apiClient.get(`/career-forecast/${careerId}/history`, { params: { limit } }),
  simulateScenario: (careerId: string, request: {
    scenario_type: string;
    horizon: string;
    simulated_weekly_hours?: number;
    consistency_multiplier?: number;
    targeted_skills?: string[];
    remediation_focused?: boolean;
    custom_name?: string;
  }) => apiClient.post(`/career-forecast/${careerId}/simulate`, request),
  compareScenarios: (careerId: string, horizon?: string) =>
    apiClient.get('/career-forecast/compare-scenarios', { params: { career_id: careerId, horizon } }),
};



