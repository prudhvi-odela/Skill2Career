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

