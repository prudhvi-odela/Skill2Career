import {
  SKILLS_CATALOG,
  CAREER_ROLES,
  ASSESSMENT_DATA,
  ACADEMIC_PROGRAMS,
  BRANCHES,
  SUBJECTS,
  PRACTICE_PROBLEMS,
  Skill,
  CareerRole
} from './seedData.js';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface StudentSkill {
  skill_id: string;
  name: string;
  category: string;
  domain: string;
  level: number;
  verified: boolean;
  verification_source: string;
  years_experience?: number;
}

export interface Project {
  id: string;
  student_id: string;
  title: string;
  description: string;
  repository_url: string;
  live_url: string;
  technologies: string;
  complexity_rating: number;
  created_at: string;
}

export interface Certification {
  id: string;
  student_id: string;
  name: string;
  issuer: string;
  issue_date: string;
  credential_url: string;
  is_verified: boolean;
  created_at: string;
}

export interface WorkExperience {
  id: string;
  student_id: string;
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
  skills_used: string[];
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  skill_id: string;
  target_level: number;
  estimated_weeks: number;
  is_completed: boolean;
  category: string;
}

// In-Memory Storage
class DataStore {
  users: Map<string, User> = new Map();
  profiles: Map<string, any> = new Map();
  projects: Map<string, Project[]> = new Map();
  certifications: Map<string, Certification[]> = new Map();
  workExperiences: Map<string, WorkExperience[]> = new Map();
  roadmaps: Map<string, RoadmapItem[]> = new Map();
  evidenceList: Map<string, any[]> = new Map();
  peerReviews: Map<string, any[]> = new Map();
  conversations: Map<string, { id: string; title: string; messages: any[] }[]> = new Map();
  practiceAttempts: Map<string, any[]> = new Map();

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    const demoId = 'usr_demo_01';
    const demoUser: User = {
      id: demoId,
      email: 'demo@skill2career.com',
      full_name: 'Alex Chen',
      role: 'student'
    };
    this.users.set(demoId, demoUser);
    this.users.set('demo@skill2career.com', demoUser);

    const initialSkills: StudentSkill[] = [
      { skill_id: 'SK001', name: 'Python', category: 'Languages', domain: 'General', level: 4.0, verified: true, verification_source: 'Self-Reported', years_experience: 2.0 },
      { skill_id: 'SK008', name: 'SQL', category: 'Languages', domain: 'Databases', level: 3.5, verified: true, verification_source: 'Assessment Quiz', years_experience: 1.5 },
      { skill_id: 'SK009', name: 'React', category: 'Frontend', domain: 'Web Development', level: 3.0, verified: false, verification_source: 'Self-Reported', years_experience: 1.0 },
      { skill_id: 'SK015', name: 'FastAPI', category: 'Backend', domain: 'Backend & APIs', level: 3.5, verified: true, verification_source: 'Self-Reported', years_experience: 1.0 },
      { skill_id: 'SK026', name: 'Pandas & NumPy', category: 'AI & ML', domain: 'Data Analysis', level: 4.0, verified: true, verification_source: 'Assessment Quiz', years_experience: 2.0 },
      { skill_id: 'SK027', name: 'Scikit-Learn', category: 'AI & ML', domain: 'Machine Learning', level: 3.5, verified: true, verification_source: 'Assessment Quiz', years_experience: 1.5 },
      { skill_id: 'SK040', name: 'Data Structures & Algorithms', category: 'Core CS', domain: 'Fundamentals', level: 3.5, verified: true, verification_source: 'Self-Reported', years_experience: 2.0 },
      { skill_id: 'SK043', name: 'Git & Version Control', category: 'Software Tools', domain: 'Collaboration', level: 4.0, verified: true, verification_source: 'Self-Reported', years_experience: 2.0 }
    ];

    this.profiles.set(demoId, {
      user_id: demoId,
      full_name: 'Alex Chen',
      email: 'demo@skill2career.com',
      headline: 'Aspiring AI Engineer & Full-Stack Developer',
      bio: 'Passionate computer science student building intelligent web systems and learning distributed architectures.',
      degree: 'B.Tech Computer Science',
      institution: 'National Institute of Technology',
      institution_tier: 1,
      graduation_year: 2026,
      gpa: 8.8,
      target_career_id: 'CR004',
      target_career_title: 'Machine Learning Engineer',
      skills: initialSkills,
      statistics: {
        weekly_study_hours: 16.0,
        learning_velocity_index: 1.4,
        assessments_passed: 3,
        projects_count: 2,
        certifications_count: 1
      },
      updated_at: new Date().toISOString()
    });

    this.projects.set(demoId, [
      {
        id: 'prj_01',
        student_id: demoId,
        title: 'Skill2Career AI Engine',
        description: 'Engineered skill-gap mapping and job-readiness forecasting pipeline using FastAPI and Scikit-Learn.',
        repository_url: 'https://github.com/namitha-koduru/Skill2Career',
        live_url: 'https://skill2career.dev',
        technologies: 'Python, FastAPI, Scikit-Learn, React, TypeScript',
        complexity_rating: 4.5,
        created_at: new Date().toISOString()
      },
      {
        id: 'prj_02',
        student_id: demoId,
        title: 'Distributed Task Queue & Caching System',
        description: 'Constructed an asynchronous worker queue utilizing Redis and Python asyncio with real-time updates.',
        repository_url: 'https://github.com/demo/distributed-task-queue',
        live_url: 'https://demo-tasks.io',
        technologies: 'Python, Redis, WebSockets, Docker',
        complexity_rating: 4.0,
        created_at: new Date().toISOString()
      }
    ]);

    this.certifications.set(demoId, [
      {
        id: 'crt_01',
        student_id: demoId,
        name: 'TensorFlow Developer Certificate',
        issuer: 'DeepLearning.AI / Google',
        issue_date: '2025-11',
        credential_url: 'https://coursera.org/verify/TF-12345',
        is_verified: true,
        created_at: new Date().toISOString()
      }
    ]);

    this.workExperiences.set(demoId, [
      {
        id: 'exp_01',
        student_id: demoId,
        company: 'Neural Labs Inc.',
        role: 'Machine Learning Intern',
        start_date: '2025-06-01',
        end_date: '2025-08-31',
        is_current: false,
        description: 'Assisted in feature engineering and preprocessing pipelines for tabular customer churn models.',
        skills_used: ['Python', 'Scikit-Learn', 'Pandas & NumPy']
      }
    ]);

    this.roadmaps.set(demoId, [
      { id: 'rd_01', title: 'Deep Learning with PyTorch', description: 'Complete neural networks and backpropagation fundamentals.', skill_id: 'SK028', target_level: 4.0, estimated_weeks: 4, is_completed: false, category: 'AI & ML' },
      { id: 'rd_02', title: 'MLOps Pipeline Deployment', description: 'Containerize machine learning services and setup model registry.', skill_id: 'SK033', target_level: 4.0, estimated_weeks: 3, is_completed: false, category: 'DevOps & MLOps' },
      { id: 'rd_03', title: 'System Design for ML', description: 'Design feature store and low-latency inference endpoints.', skill_id: 'SK041', target_level: 4.0, estimated_weeks: 3, is_completed: true, category: 'Core CS' }
    ]);

    this.evidenceList.set(demoId, [
      {
        id: 'ev_01',
        skill_id: 'SK027',
        skill_name: 'Scikit-Learn',
        evidence_type: 'assessment',
        title: 'Machine Learning Assessment Exam',
        description: 'Scored 88% on intermediate hyperparameter tuning and model evaluation.',
        observed_proficiency: 4.0,
        verification_status: 'verified',
        created_at: new Date().toISOString()
      },
      {
        id: 'ev_02',
        skill_id: 'SK001',
        skill_name: 'Python',
        evidence_type: 'project',
        title: 'Skill2Career Engine Code Repository',
        description: 'Verified repository commits showcasing clean architecture and unit tests.',
        observed_proficiency: 4.5,
        verification_status: 'verified',
        created_at: new Date().toISOString()
      }
    ]);
  }

  getOrCreateUser(email: string, fullName?: string): User {
    let user = this.users.get(email);
    if (!user) {
      const id = 'usr_' + Math.random().toString(36).substring(2, 9);
      user = {
        id,
        email,
        full_name: fullName || email.split('@')[0],
        role: 'student'
      };
      this.users.set(id, user);
      this.users.set(email, user);

      // Create default profile
      this.profiles.set(id, {
        user_id: id,
        full_name: user.full_name,
        email: user.email,
        headline: 'Student / Aspiring Technologist',
        bio: 'Welcome to Skill2Career. Update your profile to get personalized career insights.',
        degree: 'B.Tech Computer Science',
        institution: 'University of Technology',
        institution_tier: 2,
        graduation_year: 2026,
        gpa: 8.0,
        target_career_id: 'CR001',
        target_career_title: 'Full-Stack Software Engineer',
        skills: [
          { skill_id: 'SK001', name: 'Python', category: 'Languages', domain: 'General', level: 3.0, verified: false, verification_source: 'Self-Reported' },
          { skill_id: 'SK002', name: 'JavaScript', category: 'Languages', domain: 'Web Development', level: 3.0, verified: false, verification_source: 'Self-Reported' }
        ],
        statistics: {
          weekly_study_hours: 10.0,
          learning_velocity_index: 1.0,
          assessments_passed: 0,
          projects_count: 0,
          certifications_count: 0
        },
        updated_at: new Date().toISOString()
      });

      this.projects.set(id, []);
      this.certifications.set(id, []);
      this.workExperiences.set(id, []);
      this.roadmaps.set(id, []);
      this.evidenceList.set(id, []);
    }
    return user;
  }

  getProfile(userId: string) {
    let profile = this.profiles.get(userId);
    if (!profile) {
      const user = this.users.get(userId);
      this.getOrCreateUser(user ? user.email : 'demo@skill2career.com', user?.full_name);
      profile = this.profiles.get(userId) || this.profiles.get('usr_demo_01')!;
    }
    return profile;
  }

  updateProfile(userId: string, data: any) {
    const current = this.getProfile(userId);
    const updated = {
      ...current,
      ...data,
      statistics: {
        ...current.statistics,
        ...(data.statistics || {})
      },
      updated_at: new Date().toISOString()
    };
    if (data.target_career_id) {
      const career = CAREER_ROLES.find(c => c.career_id === data.target_career_id);
      if (career) {
        updated.target_career_title = career.career_title;
      }
    }
    this.profiles.set(userId, updated);
    return updated;
  }

  // Skill Gap Analysis Engine
  calculateSkillGap(userId: string, targetCareerId?: string) {
    const profile = this.getProfile(userId);
    const careerId = (targetCareerId && targetCareerId.trim() !== '') ? targetCareerId : (profile.target_career_id || 'CR001');
    const career = CAREER_ROLES.find(c => c.career_id === careerId) || CAREER_ROLES[0];

    const studentSkills: StudentSkill[] = profile.skills || [];
    const skillMap = new Map<string, StudentSkill>();
    const nameMap = new Map<string, StudentSkill>();
    studentSkills.forEach(s => {
      if (s.skill_id) skillMap.set(s.skill_id, s);
      if (s.name) nameMap.set(s.name.toLowerCase().trim(), s);
    });

    let matchedSkills: any[] = [];
    let missingSkills: any[] = [];
    let weightedScoreTotal = 0;
    let weightTotal = 0;

    career.required_skills.forEach(req => {
      weightTotal += req.importance;
      const reqNameLower = (req.skill_name || '').toLowerCase().trim();
      
      // Match by skill_id, exact name, or fuzzy inclusion
      let studentSkill = skillMap.get(req.skill_id) || nameMap.get(reqNameLower);
      if (!studentSkill) {
        studentSkill = studentSkills.find(s => {
          const sName = (s.name || '').toLowerCase().trim();
          return sName && (sName === reqNameLower || reqNameLower.includes(sName) || sName.includes(reqNameLower));
        });
      }

      if (studentSkill) {
        const currentLevel = Number(studentSkill.level) || 3.0;
        const gap = Math.max(0, req.required_level - currentLevel);
        const matchPct = Math.min(100, Math.round((currentLevel / req.required_level) * 100));
        const contribution = (Math.min(currentLevel, req.required_level) / req.required_level) * req.importance;
        weightedScoreTotal += contribution;

        matchedSkills.push({
          skill_id: req.skill_id,
          skill_name: req.skill_name,
          required_level: req.required_level,
          current_level: currentLevel,
          gap,
          match_percentage: matchPct,
          importance: req.importance,
          is_core: req.is_core,
          status: gap === 0 ? 'Mastered' : 'In Progress'
        });
      } else {
        missingSkills.push({
          skill_id: req.skill_id,
          skill_name: req.skill_name,
          required_level: req.required_level,
          current_level: 0,
          gap: req.required_level,
          match_percentage: 0,
          importance: req.importance,
          is_core: req.is_core,
          priority: req.importance >= 0.9 ? 'Critical' : req.importance >= 0.7 ? 'High' : 'Medium'
        });
      }
    });

    const matchPercentage = weightTotal > 0 ? Math.round((weightedScoreTotal / weightTotal) * 100) : 0;
    const readinessScore = Math.min(98, Math.max(25, Math.round(matchPercentage * 0.85 + (profile.gpa || 8) * 1.5)));

    const gaps = [
      ...matchedSkills.map(m => ({
        skill_id: m.skill_id,
        skill_name: m.skill_name,
        category: m.category || 'Core Competency',
        current_level: m.current_level,
        required_level: m.required_level,
        gap: m.gap,
        priority: m.gap === 0 ? 'Mastered' : m.priority,
        estimated_hours: Math.round(m.gap * 12)
      })),
      ...missingSkills.map(ms => ({
        skill_id: ms.skill_id,
        skill_name: ms.skill_name,
        category: ms.category || 'Specialized Competency',
        current_level: ms.current_level,
        required_level: ms.required_level,
        gap: ms.gap,
        priority: ms.priority,
        estimated_hours: Math.round(ms.gap * 15)
      }))
    ];

    const totalRemediationHours = gaps.reduce((acc, g) => acc + (g.estimated_hours || 0), 0);
    const proficientCount = matchedSkills.filter(s => s.gap === 0).length;

    return {
      career_id: career.career_id,
      career_title: career.career_title,
      domain: career.domain,
      match_percentage: matchPercentage,
      readiness_score: readinessScore,
      coverage_percentage: matchPercentage,
      total_skills_required: career.required_skills.length,
      total_required_skills: career.required_skills.length,
      matched_skills_count: matchedSkills.length,
      missing_skills_count: missingSkills.length,
      proficient_count: proficientCount,
      estimated_remediation_hours: totalRemediationHours,
      gaps: gaps,
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
      strengths: matchedSkills.filter(s => s.gap === 0).map(s => s.skill_name),
      critical_gaps: missingSkills.filter(s => s.priority === 'Critical').map(s => s.skill_name),
      benchmark_comparison: {
        peer_average_readiness: 62.4,
        top_decile_readiness: 89.1,
        student_percentile: Math.min(99, Math.round(readinessScore * 1.08))
      }
    };
  }

  // Trajectory Forecast Engine
  calculateTrajectory(userId: string, weeklyHours = 15, consistency = 0.9, targetCareerId?: string) {
    const gap = this.calculateSkillGap(userId, targetCareerId);
    const initialScore = gap.readiness_score;
    const weeksCount = 12;
    const trajectoryPoints: any[] = [];

    let currentScore = initialScore;
    const velocityPerWeek = (weeklyHours / 12) * consistency * 1.8;

    for (let week = 0; week <= weeksCount; week++) {
      if (week > 0) {
        // Diminishing returns ceiling curve
        const growth = velocityPerWeek * (1 - currentScore / 100);
        currentScore = Math.min(99.5, currentScore + growth);
      }
      trajectoryPoints.push({
        week,
        predicted_readiness: Math.round(currentScore * 10) / 10,
        lower_bound: Math.max(0, Math.round((currentScore - (2 + week * 0.3)) * 10) / 10),
        upper_bound: Math.min(100, Math.round((currentScore + (2 + week * 0.3)) * 10) / 10),
        cumulative_study_hours: Math.round(week * weeklyHours)
      });
    }

    return {
      career_id: gap.career_id,
      career_title: gap.career_title,
      initial_readiness: initialScore,
      target_readiness: 85.0,
      estimated_weeks_to_ready: Math.max(2, Math.round((85 - initialScore) / Math.max(0.5, velocityPerWeek))),
      weekly_study_hours: weeklyHours,
      consistency_rate: consistency,
      trajectory_points: trajectoryPoints,
      recommended_milestones: [
        { week: 3, milestone: 'Master PyTorch Tensors & Custom Datasets' },
        { week: 6, milestone: 'Deploy Model Serving Endpoint on Docker' },
        { week: 9, milestone: 'Complete End-to-End MLOps Pipeline Portfolio Project' },
        { week: 12, milestone: 'Pass Senior ML Engineer Mock Technical Interview' }
      ]
    };
  }
}

export const store = new DataStore();
