// Placement-Ops-AI Comprehensive Store & Multi-Agent Engine
import type { GoogleGenAI } from '@google/genai';

export interface Student {
  id: number;
  profile_id: string | null;
  roll_number?: string;
  section?: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  tenth_pct: number;
  twelfth_pct: number;
  semester_marks: Record<string, number>;
  backlog_count: number;
  skills: { skill: string; level: string }[];
  certifications: { name: string; issuer: string }[];
  projects: { title: string; tech_stack: string[]; description?: string; link?: string }[];
  internship_history: { company: string; duration_months: number; role?: string }[];
  hackathons: { name: string; result?: string }[];
  current_best_offer: number | null;
  applied_drives: number[];
  profile_photo_url?: string | null;
  resume_url?: string | null;
  resume_filename?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  coding_profiles: { leetcode?: string; codeforces?: string; hackerrank?: string };
  preferred_roles: string[];
  expected_salary: number | null;
  location_preference: string[];
  languages: string[];
  resume_ats_score?: number | null;
  resume_analysis?: any;
  resume_analyzed_at?: string | null;
  api_score: number;
  ssi_score: number;
  prs_score: number;
  profile_completion_pct?: number;
}

export interface Drive {
  id: number;
  recruiter_profile_id?: string | null;
  company_name: string;
  role_title: string;
  location?: string;
  jd_raw_text: string;
  required_skills: { required: string[]; preferred: string[] };
  cgpa_cutoff: number;
  eligible_branches: string[];
  package_min: number;
  package_max: number;
  headcount: number;
  status: 'draft' | 'published' | 'closed';
  stage: 'intake' | 'eligibility' | 'matching' | 'scheduling' | 'coordination' | 'notified' | 'completed';
  created_at: string;
}

export interface EligibilityResult {
  id: number;
  drive_id: number;
  student_id: number;
  student?: Student;
  eligible: boolean;
  reason: string;
  overridden_by_tpo: boolean;
  flagged_for_review: boolean;
}

export interface MatchScore {
  id: number;
  drive_id: number;
  student_id: number;
  student?: Student;
  overall_score: number;
  skill_score: number;
  academic_score: number;
  project_score: number;
  readiness_score: number;
  feature_importance: Record<string, number>;
  rank?: number;
  approved: boolean;
  outcome?: string | null;
}

export interface Interview {
  id: number;
  drive_id: number;
  student_id: number;
  student?: Student;
  panel_members: string[];
  room_or_link: string;
  time_slot: string;
  status: 'scheduled' | 'completed' | 'no_show' | 'cancelled';
  conflict_flag: boolean;
}

export interface ExceptionItem {
  id: number;
  drive_id?: number | null;
  type: 'eligibility_edge_case' | 'low_confidence_match' | 'schedule_conflict' | 'double_booking' | 'missing_data';
  severity: 'low' | 'medium' | 'high';
  description: string;
  resolved: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
}

export interface Notification {
  id: number;
  drive_id?: number | null;
  recipient_type: 'student' | 'panel';
  recipient_id: number;
  channel: 'email' | 'sms' | 'portal';
  message_template: string;
  sent_at: string;
  delivery_status: 'sent' | 'delivered' | 'failed';
}

export interface AuditLog {
  id: number;
  action: string;
  target_type: string;
  target_id: number;
  performed_by: string;
  timestamp: string;
  details?: string;
}

export interface ResumeClaim {
  resume_claim_id: string;
  student_id: number;
  claim_type: string;
  claim_text: string;
  normalized_skill: string;
  extraction_confidence: number;
  verification_status: 'PROVISIONAL' | 'VERIFIED' | 'REJECTED';
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
}

export interface Agent13Recommendation {
  recommendation_id: string;
  student_id: number;
  opportunity_id: string;
  opportunity_type: 'RESEARCH' | 'MENTORSHIP' | 'HACKATHON';
  title: string;
  faculty_name: string;
  description: string;
  status: 'DISCOVERED' | 'MATCHED' | 'RECOMMENDED' | 'PENDING_APPROVAL' | 'APPROVED' | 'EXECUTED' | 'REJECTED';
  hidden_talent: boolean;
  hidden_talent_explanation: string;
  fit_score: number;
  evidence_breakdown: Record<string, any>;
  created_at: string;
}

function calculateScores(student: Student) {
  // 1. API Score (Academic Performance Index)
  const cgpaContrib = (student.cgpa * 10) * 0.6;
  const tenthContrib = student.tenth_pct * 0.2;
  const twelfthContrib = student.twelfth_pct * 0.2;
  student.api_score = Math.round((cgpaContrib + tenthContrib + twelfthContrib) * 10) / 10;

  // 2. SSI Score (Skill Strength Index)
  let ssi = 0;
  for (const sk of student.skills) {
    const level = (sk.level || 'beginner').toLowerCase();
    if (level === 'advanced') ssi += 25;
    else if (level === 'intermediate') ssi += 15;
    else ssi += 5;
  }
  student.ssi_score = Math.min(ssi, 100);

  // 3. PRS Score (Placement Readiness Score)
  const projectPts = Math.min(student.projects.length * 20, 40);
  const internshipPts = Math.min(student.internship_history.length * 30, 60);
  const certPts = Math.min(student.certifications.length * 10, 10);
  student.prs_score = Math.min(projectPts + internshipPts + certPts, 100);

  // Profile completion percentage
  let comp = 30; // base (name, email, branch)
  if (student.cgpa) comp += 15;
  if (student.skills.length > 0) comp += 15;
  if (student.projects.length > 0) comp += 15;
  if (student.coding_profiles?.leetcode || student.github_url) comp += 15;
  if (student.resume_url || student.resume_filename) comp += 10;
  student.profile_completion_pct = Math.min(comp, 100);
}

export class PlacementOpsStore {
  students: Student[] = [];
  drives: Drive[] = [];
  exceptions: ExceptionItem[] = [];
  interviews: Interview[] = [];
  notifications: Notification[] = [];
  auditLogs: AuditLog[] = [];
  resumeClaims: ResumeClaim[] = [];
  recommendations: Agent13Recommendation[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    this.students = [
      {
        id: 1,
        profile_id: 'demo-student-1',
        roll_number: '1RV21CS004',
        section: 'A',
        name: 'Aditya Sharma',
        email: 'aditya.sharma@example.com',
        branch: 'CSE',
        cgpa: 9.2,
        tenth_pct: 92.5,
        twelfth_pct: 89.0,
        semester_marks: { sem1: 8.8, sem2: 9.0, sem3: 9.3, sem4: 9.7 },
        backlog_count: 0,
        skills: [
          { skill: 'Python', level: 'Advanced' },
          { skill: 'SQL', level: 'Advanced' },
          { skill: 'FastAPI', level: 'Intermediate' },
          { skill: 'React', level: 'Intermediate' },
          { skill: 'TypeScript', level: 'Intermediate' }
        ],
        certifications: [
          { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services' }
        ],
        projects: [
          { title: 'Campus Recruiter Bot', tech_stack: ['FastAPI', 'React', 'Python'], description: 'Multi-agent recruitment workflow automation bot' },
          { title: 'Distributed Cache KV Engine', tech_stack: ['Python', 'Redis', 'Docker'], description: 'Low-latency distributed cache with Raft consensus' }
        ],
        internship_history: [
          { company: 'Tech Solutions Inc', duration_months: 3, role: 'Software Engineering Intern' }
        ],
        hackathons: [
          { name: 'Smart India Hackathon', result: '1st Runner Up' }
        ],
        current_best_offer: null,
        applied_drives: [1, 2],
        github_url: 'https://github.com/aditya-sharma-dev',
        linkedin_url: 'https://linkedin.com/in/adityasharma-cse',
        coding_profiles: { leetcode: 'aditya_92', codeforces: 'adityas', hackerrank: 'aditya_sharma' },
        preferred_roles: ['Backend Engineer', 'Full Stack Developer', 'Software Engineer'],
        expected_salary: 14.0,
        location_preference: ['Bangalore', 'Hyderabad', 'Remote'],
        languages: ['English', 'Hindi'],
        resume_ats_score: 88,
        resume_filename: 'Aditya_Sharma_Resume.pdf',
        api_score: 0,
        ssi_score: 0,
        prs_score: 0
      },
      {
        id: 2,
        profile_id: 'demo-student-2',
        roll_number: '1RV21CS042',
        section: 'B',
        name: 'Rohan Verma',
        email: 'rohan.verma@example.com',
        branch: 'CSE',
        cgpa: 7.9, // Borderline for 8.0 cutoff
        tenth_pct: 85.0,
        twelfth_pct: 82.5,
        semester_marks: { sem1: 7.5, sem2: 8.0, sem3: 7.8, sem4: 8.3 },
        backlog_count: 0,
        skills: [
          { skill: 'Python', level: 'Intermediate' },
          { skill: 'SQL', level: 'Intermediate' },
          { skill: 'React', level: 'Advanced' },
          { skill: 'JavaScript', level: 'Advanced' }
        ],
        certifications: [],
        projects: [
          { title: 'E-Commerce App', tech_stack: ['React', 'Node.js', 'PostgreSQL'] }
        ],
        internship_history: [],
        hackathons: [],
        current_best_offer: null,
        applied_drives: [2],
        coding_profiles: { leetcode: 'rohan_v', hackerrank: 'rohan_verma' },
        preferred_roles: ['Frontend Developer', 'Full Stack Engineer'],
        expected_salary: 9.0,
        location_preference: ['Bangalore', 'Pune'],
        languages: ['English', 'Hindi'],
        resume_ats_score: 74,
        resume_filename: 'Rohan_Verma_CV.pdf',
        api_score: 0,
        ssi_score: 0,
        prs_score: 0
      },
      {
        id: 3,
        profile_id: 'demo-student-3',
        roll_number: '1RV21IS019',
        section: 'A',
        name: 'Sneha Patil',
        email: 'sneha.patil@example.com',
        branch: 'ISE',
        cgpa: 8.5,
        tenth_pct: 88.0,
        twelfth_pct: 85.0,
        semester_marks: { sem1: 8.2, sem2: 8.4, sem3: 8.6, sem4: 8.8 },
        backlog_count: 0,
        skills: [
          { skill: 'Java', level: 'Advanced' },
          { skill: 'SQL', level: 'Intermediate' },
          { skill: 'Python', level: 'Intermediate' },
          { skill: 'Spring Boot', level: 'Intermediate' }
        ],
        certifications: [
          { name: 'Oracle Java Associate', issuer: 'Oracle' }
        ],
        projects: [
          { title: 'Campus Library ERP', tech_stack: ['Java', 'SQL', 'Spring Boot'] }
        ],
        internship_history: [
          { company: 'InfoSys Ltd', duration_months: 2, role: 'Backend Trainee' }
        ],
        hackathons: [],
        current_best_offer: null,
        applied_drives: [1],
        coding_profiles: { leetcode: 'sneha_patil' },
        preferred_roles: ['Java Developer', 'Backend Engineer'],
        expected_salary: 10.0,
        location_preference: ['Bangalore'],
        languages: ['English', 'Kannada'],
        resume_ats_score: 82,
        resume_filename: 'Sneha_Patil_Resume.pdf',
        api_score: 0,
        ssi_score: 0,
        prs_score: 0
      },
      {
        id: 4,
        profile_id: 'demo-student-4',
        roll_number: '1RV21EC088',
        section: 'C',
        name: 'Vikram Rathore',
        email: 'vikram.rathore@example.com',
        branch: 'ECE',
        cgpa: 8.1,
        tenth_pct: 78.0,
        twelfth_pct: 80.0,
        semester_marks: { sem1: 7.9, sem2: 8.1, sem3: 8.0, sem4: 8.4 },
        backlog_count: 1, // Has 1 backlog
        skills: [
          { skill: 'C++', level: 'Advanced' },
          { skill: 'Embedded Systems', level: 'Advanced' },
          { skill: 'Python', level: 'Intermediate' }
        ],
        certifications: [],
        projects: [
          { title: 'IoT Smart Agriculture Gateway', tech_stack: ['C++', 'Raspberry Pi', 'MQTT'] }
        ],
        internship_history: [],
        hackathons: [{ name: 'RoboCon India', result: 'Quarter Finalist' }],
        current_best_offer: null,
        applied_drives: [],
        coding_profiles: {},
        preferred_roles: ['Embedded Software Engineer', 'Firmware Engineer'],
        expected_salary: 8.5,
        location_preference: ['Bangalore', 'Chennai'],
        languages: ['English', 'Hindi'],
        resume_ats_score: 68,
        api_score: 0,
        ssi_score: 0,
        prs_score: 0
      },
      {
        id: 5,
        profile_id: 'demo-student-5',
        roll_number: '1RV21CS001',
        section: 'A',
        name: 'Pooja Rao',
        email: 'pooja.rao@example.com',
        branch: 'CSE',
        cgpa: 9.6,
        tenth_pct: 96.0,
        twelfth_pct: 94.5,
        semester_marks: { sem1: 9.4, sem2: 9.6, sem3: 9.7, sem4: 9.7 },
        backlog_count: 0,
        skills: [
          { skill: 'Python', level: 'Advanced' },
          { skill: 'JavaScript', level: 'Advanced' },
          { skill: 'React', level: 'Advanced' },
          { skill: 'Node.js', level: 'Advanced' },
          { skill: 'Docker', level: 'Intermediate' }
        ],
        certifications: [
          { name: 'Google Cloud Architect', issuer: 'Google Cloud' }
        ],
        projects: [
          { title: 'Decentralized Identity Verification', tech_stack: ['React', 'Node.js', 'Solidity'] },
          { title: 'Real-time Collaborative Canvas', tech_stack: ['TypeScript', 'WebSocket', 'Canvas API'] }
        ],
        internship_history: [
          { company: 'Microsoft India', duration_months: 3, role: 'Software Engineer Intern' }
        ],
        hackathons: [{ name: 'HackHarvard Global', result: 'Grand Prize' }],
        current_best_offer: 12.5,
        applied_drives: [1],
        coding_profiles: { leetcode: 'pooja_algo_star', codeforces: 'poojar' },
        preferred_roles: ['Software Development Engineer', 'Full Stack Specialist'],
        expected_salary: 18.0,
        location_preference: ['Bangalore', 'Hyderabad', 'Seattle'],
        languages: ['English', 'Kannada', 'Hindi'],
        resume_ats_score: 95,
        resume_filename: 'Pooja_Rao_Resume.pdf',
        api_score: 0,
        ssi_score: 0,
        prs_score: 0
      },
      {
        id: 6,
        profile_id: 'demo-student-6',
        roll_number: '1RV21ME031',
        section: 'A',
        name: 'Karan Malhotra',
        email: 'karan.m@example.com',
        branch: 'ME',
        cgpa: 6.8,
        tenth_pct: 70.0,
        twelfth_pct: 72.0,
        semester_marks: { sem1: 6.5, sem2: 6.7, sem3: 6.9, sem4: 7.1 },
        backlog_count: 0,
        skills: [
          { skill: 'AutoCAD', level: 'Advanced' },
          { skill: 'SolidWorks', level: 'Advanced' },
          { skill: 'Python', level: 'Beginner' }
        ],
        certifications: [],
        projects: [
          { title: '6-Axis Robotic Arm Kinematics', tech_stack: ['SolidWorks', 'Arduino', 'C++'] }
        ],
        internship_history: [],
        hackathons: [],
        current_best_offer: null,
        applied_drives: [],
        coding_profiles: {},
        preferred_roles: ['Robotics Engineer', 'Design Engineer'],
        expected_salary: 6.0,
        location_preference: ['Bangalore', 'Delhi'],
        languages: ['English', 'Hindi', 'Punjabi'],
        resume_ats_score: 62,
        api_score: 0,
        ssi_score: 0,
        prs_score: 0
      },
      {
        id: 7,
        profile_id: 'demo-student-7',
        roll_number: '1RV21IS008',
        section: 'B',
        name: 'Ananya Hegde',
        email: 'ananya.hegde@example.com',
        branch: 'ISE',
        cgpa: 8.8,
        tenth_pct: 91.0,
        twelfth_pct: 88.5,
        semester_marks: { sem1: 8.5, sem2: 8.9, sem3: 8.7, sem4: 9.1 },
        backlog_count: 0,
        skills: [
          { skill: 'Python', level: 'Advanced' },
          { skill: 'SQL', level: 'Advanced' },
          { skill: 'Tableau', level: 'Advanced' },
          { skill: 'Machine Learning', level: 'Intermediate' }
        ],
        certifications: [
          { name: 'Tableau Certified Data Analyst', issuer: 'Tableau' }
        ],
        projects: [
          { title: 'Customer Churn & Segmentation Model', tech_stack: ['Python', 'Scikit-learn', 'Tableau'] }
        ],
        internship_history: [
          { company: 'Amazon Operations', duration_months: 6, role: 'Business Intelligence Intern' }
        ],
        hackathons: [],
        current_best_offer: null,
        applied_drives: [3],
        coding_profiles: { leetcode: 'ananya_data' },
        preferred_roles: ['Data Analyst', 'Business Intelligence Engineer', 'Data Scientist'],
        expected_salary: 11.0,
        location_preference: ['Bangalore', 'Remote'],
        languages: ['English', 'Kannada'],
        resume_ats_score: 86,
        resume_filename: 'Ananya_Hegde_Resume.pdf',
        api_score: 0,
        ssi_score: 0,
        prs_score: 0
      },
      {
        id: 8,
        profile_id: 'demo-student-8',
        roll_number: '1RV21EC047',
        section: 'B',
        name: 'Rahul Jain',
        email: 'rahul.jain@example.com',
        branch: 'ECE',
        cgpa: 7.3,
        tenth_pct: 80.0,
        twelfth_pct: 78.5,
        semester_marks: { sem1: 7.0, sem2: 7.2, sem3: 7.5, sem4: 7.5 },
        backlog_count: 0,
        skills: [
          { skill: 'C++', level: 'Intermediate' },
          { skill: 'Verilog', level: 'Intermediate' },
          { skill: 'JavaScript', level: 'Intermediate' },
          { skill: 'React', level: 'Intermediate' }
        ],
        certifications: [],
        projects: [
          { title: 'Smart Irrigation IoT Node', tech_stack: ['C++', 'Arduino', 'ThingSpeak'] }
        ],
        internship_history: [],
        hackathons: [],
        current_best_offer: null,
        applied_drives: [4],
        coding_profiles: {},
        preferred_roles: ['Embedded Systems Trainee', 'Junior Software Developer'],
        expected_salary: 6.5,
        location_preference: ['Bangalore', 'Pune'],
        languages: ['English', 'Hindi'],
        resume_ats_score: 70,
        api_score: 0,
        ssi_score: 0,
        prs_score: 0
      }
    ];

    // Compute derived scores
    for (const student of this.students) {
      calculateScores(student);
    }

    this.drives = [
      {
        id: 1,
        company_name: 'Acme Systems',
        role_title: 'Software Engineer - Backend',
        location: 'Bangalore / Hybrid',
        jd_raw_text: 'We are seeking a Backend Engineer with strong proficiency in Python and database management using SQL. Exposure to FastAPI and React is highly preferred. Candidate should be able to design REST APIs, write database migrations, and coordinate with team members.',
        required_skills: { required: ['Python', 'SQL'], preferred: ['FastAPI', 'React'] },
        cgpa_cutoff: 8.0,
        eligible_branches: ['CSE', 'ISE'],
        package_min: 12.0,
        package_max: 16.0,
        headcount: 5,
        status: 'published',
        stage: 'matching',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 2,
        company_name: 'TechCorp',
        role_title: 'Full Stack Developer',
        location: 'Bangalore / Remote',
        jd_raw_text: 'Join our web development team. Required: JavaScript, React, and general web technologies. Experience with Node.js and AWS is preferred. The role requires building responsive frontend interfaces and backend endpoints.',
        required_skills: { required: ['JavaScript', 'React'], preferred: ['Node.js', 'AWS'] },
        cgpa_cutoff: 7.5,
        eligible_branches: ['CSE', 'ISE', 'ECE'],
        package_min: 8.0,
        package_max: 11.0,
        headcount: 8,
        status: 'published',
        stage: 'matching',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 3,
        company_name: 'InnoTech',
        role_title: 'Data Analyst',
        location: 'Hyderabad / Office',
        jd_raw_text: 'We are looking for a Data Analyst to join our team. Responsibilities include analyzing business metrics, building reports, and writing basic SQL queries. Required skills: Python and Excel. Preferred: SQL and Tableau.',
        required_skills: { required: ['Python', 'Excel'], preferred: ['SQL', 'Tableau'] },
        cgpa_cutoff: 7.0,
        eligible_branches: ['CSE', 'ISE', 'ECE', 'ME'],
        package_min: 6.0,
        package_max: 8.0,
        headcount: 3,
        status: 'draft',
        stage: 'intake',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 4,
        company_name: 'Innovaccer',
        role_title: 'SDE Intern',
        location: 'Noida / Bangalore',
        jd_raw_text: 'Required skills: C++, Java, DS & Algo. Good problem-solving ability. Cutoff 7.0. Looking for energetic interns to join our healthcare tech core engineering cohort.',
        required_skills: { required: ['C++', 'Java'], preferred: ['DS & Algo', 'Linux'] },
        cgpa_cutoff: 7.0,
        eligible_branches: ['CSE', 'ISE', 'ECE'],
        package_min: 4.5,
        package_max: 6.5,
        headcount: 10,
        status: 'published',
        stage: 'scheduling',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      }
    ];

    this.exceptions = [
      {
        id: 1,
        drive_id: 1,
        type: 'eligibility_edge_case',
        severity: 'medium',
        description: 'Student Rohan Verma has CGPA 7.9, which is borderline for Acme Systems (Cutoff: 8.0). Flagged for TPO human override.',
        resolved: false
      },
      {
        id: 2,
        drive_id: 1,
        type: 'missing_data',
        severity: 'low',
        description: 'Student Sneha Patil is missing semester 5 marks. Placement readiness scored with available 4-semester trajectory.',
        resolved: false
      }
    ];

    this.interviews = [
      {
        id: 1,
        drive_id: 1,
        student_id: 1,
        panel_members: ['Dr. V. Prasad (Tech Lead)', 'Mr. Amit Kumar (Staff Architect)'],
        room_or_link: 'Placement Hall Block-B, Room 204',
        time_slot: 'Tomorrow, 10:00 AM - 10:45 AM',
        status: 'scheduled',
        conflict_flag: false
      },
      {
        id: 2,
        drive_id: 1,
        student_id: 5,
        panel_members: ['Dr. V. Prasad (Tech Lead)', 'Ms. Shalini Roy (Engineering Director)'],
        room_or_link: 'Virtual Google Meet (Link sent)',
        time_slot: 'Tomorrow, 11:00 AM - 11:45 AM',
        status: 'scheduled',
        conflict_flag: false
      }
    ];

    this.notifications = [
      {
        id: 1,
        drive_id: 1,
        recipient_type: 'student',
        recipient_id: 1,
        channel: 'email',
        message_template: 'Congratulations Aditya! You have been shortlisted for Acme Systems - Software Engineer (12-16 LPA). Round 1 Technical Interview scheduled.',
        sent_at: new Date(Date.now() - 7200000).toISOString(),
        delivery_status: 'delivered'
      },
      {
        id: 2,
        drive_id: 1,
        recipient_type: 'student',
        recipient_id: 5,
        channel: 'email',
        message_template: 'Shortlist confirmation: Technical round 1 interview panel invitation for Acme Systems sent to candidate and evaluators.',
        sent_at: new Date(Date.now() - 3600000).toISOString(),
        delivery_status: 'delivered'
      }
    ];

    this.auditLogs = [
      {
        id: 1,
        action: 'eligibility_evaluation',
        target_type: 'drive',
        target_id: 1,
        performed_by: 'EligibilityAgent (Automated)',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        details: 'Evaluated 8 students for Acme Systems. 4 eligible, 1 borderline exception flagged.'
      },
      {
        id: 2,
        action: 'shortlist_ranked_shap',
        target_type: 'drive',
        target_id: 1,
        performed_by: 'MatchingAgent (SHAP Engine)',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        details: 'Ranked top candidates with explainable multi-vector scoring (40% skill, 25% academic, 20% projects, 15% readiness).'
      }
    ];

    this.resumeClaims = [
      {
        resume_claim_id: 'claim-101',
        student_id: 1,
        claim_type: 'RESEARCH_PROJECT',
        claim_text: 'Developed distributed cache with Raft consensus in Python/Redis handling 20k RPS',
        normalized_skill: 'Distributed Systems',
        extraction_confidence: 0.94,
        verification_status: 'PROVISIONAL',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        resume_claim_id: 'claim-102',
        student_id: 5,
        claim_type: 'HACKATHON_WIN',
        claim_text: 'Grand Prize at HackHarvard Global for Decentralized Identity Protocol with 0-knowledge proofs',
        normalized_skill: 'Cryptography',
        extraction_confidence: 0.98,
        verification_status: 'VERIFIED',
        verified_by: 'Dr. Arvind Rao (Faculty Lead)',
        verified_at: new Date(Date.now() - 43200000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        resume_claim_id: 'claim-103',
        student_id: 3,
        claim_type: 'CERTIFICATION',
        claim_text: 'Oracle Certified Associate Java SE 11 Programmer - Verified by Digital Badge',
        normalized_skill: 'Java Enterprise',
        extraction_confidence: 0.92,
        verification_status: 'PROVISIONAL',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    this.recommendations = [
      {
        recommendation_id: 'rec-201',
        student_id: 1,
        opportunity_id: 'res-ai-lab-01',
        opportunity_type: 'RESEARCH',
        title: 'Autonomous Multi-Agent Systems & Distributed AI Orchestration',
        faculty_name: 'Dr. Arvind Rao (Head, AI & Systems Research)',
        description: 'Undergraduate research fellowship focusing on high-throughput multi-agent communication and consensus protocols.',
        status: 'DISCOVERED',
        hidden_talent: true,
        hidden_talent_explanation: 'Strong system design architecture aptitude and backend speed beyond standard batch syllabus.',
        fit_score: 94.5,
        evidence_breakdown: {
          coursework_alignment: 0.92,
          projects_weight: 0.96,
          skill_verification: 'FastAPI/Redis validated'
        },
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        recommendation_id: 'rec-202',
        student_id: 5,
        opportunity_id: 'res-ai-lab-02',
        opportunity_type: 'RESEARCH',
        title: 'Zero-Knowledge Proofs in Decentralized Identity Systems',
        faculty_name: 'Dr. Arvind Rao (Head, AI & Systems Research)',
        description: 'Cross-institution collaboration on privacy-preserving identity verification.',
        status: 'APPROVED',
        hidden_talent: true,
        hidden_talent_explanation: 'Tier-1 algorithmic thinking demonstrated in competitive programming and HackHarvard win.',
        fit_score: 98.0,
        evidence_breakdown: {
          hackathon_evidence: 'HackHarvard Grand Prize',
          academic_rank: 'Department Rank 1'
        },
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  }

  // ── Multi-Agent Engine Implementations ──────────────────────────

  // 1. JD Intake Agent
  parseJobDescription(jdText: string, companyName?: string, roleTitle?: string): Partial<Drive> {
    const textLower = jdText.toLowerCase();

    // Skill extraction dictionary
    const skillList = [
      'python', 'sql', 'java', 'c++', 'javascript', 'typescript', 'react', 'node.js',
      'fastapi', 'spring boot', 'aws', 'docker', 'kubernetes', 'tableau', 'excel',
      'machine learning', 'data science', 'git', 'linux', 'html', 'css', 'solidworks',
      'autocad', 'embedded systems', 'verilog', 'nosql', 'mongodb', 'postgresql'
    ];

    const detectedSkills = skillList.filter(s => textLower.includes(s));
    const required = detectedSkills.slice(0, Math.min(3, detectedSkills.length)).map(s => s.charAt(0).toUpperCase() + s.slice(1));
    const preferred = detectedSkills.slice(3, 6).map(s => s.charAt(0).toUpperCase() + s.slice(1));

    // Guess CGPA cutoff
    let cgpaCutoff = 7.0;
    const cgpaMatch = jdText.match(/cgpa.*?(\d+(\.\d+)?)/i) || jdText.match(/cutoff.*?(\d+(\.\d+)?)/i);
    if (cgpaMatch) {
      const val = parseFloat(cgpaMatch[1]);
      if (val >= 6.0 && val <= 10.0) cgpaCutoff = val;
    }

    // Guess Package LPA
    let packageMin = 6.0;
    let packageMax = 10.0;
    const packageMatch = jdText.match(/(\d+(\.\d+)?)\s*-\s*(\d+(\.\d+)?)\s*(lpa|lakhs?)/i);
    if (packageMatch) {
      packageMin = parseFloat(packageMatch[1]);
      packageMax = parseFloat(packageMatch[3]);
    }

    // Guess Eligible Branches
    const branches: string[] = [];
    if (textLower.includes('cse') || textLower.includes('computer science')) branches.push('CSE');
    if (textLower.includes('ise') || textLower.includes('information science')) branches.push('ISE');
    if (textLower.includes('ece') || textLower.includes('electronics')) branches.push('ECE');
    if (textLower.includes('me') || textLower.includes('mechanical')) branches.push('ME');
    if (branches.length === 0) branches.push('CSE', 'ISE', 'ECE');

    return {
      company_name: companyName || 'New Company Partner',
      role_title: roleTitle || 'Software Engineer',
      jd_raw_text: jdText,
      required_skills: {
        required: required.length > 0 ? required : ['Python', 'SQL'],
        preferred: preferred.length > 0 ? preferred : ['Git', 'REST APIs']
      },
      cgpa_cutoff: cgpaCutoff,
      eligible_branches: branches,
      package_min: packageMin,
      package_max: packageMax,
      headcount: 5,
      status: 'published',
      stage: 'eligibility'
    };
  }

  // 2. Eligibility Agent
  evaluateEligibility(driveId: number): EligibilityResult[] {
    const drive = this.drives.find(d => d.id === driveId);
    if (!drive) return [];

    return this.students.map(student => {
      const reasons: string[] = [];
      let eligible = true;
      let flagged = false;

      // 1. CGPA Cutoff
      if (student.cgpa < drive.cgpa_cutoff) {
        // Borderline check (within 0.2 of cutoff)
        if (student.cgpa >= drive.cgpa_cutoff - 0.25) {
          reasons.push(`CGPA ${student.cgpa} is borderline against cutoff ${drive.cgpa_cutoff}.`);
          flagged = true;
        } else {
          reasons.push(`CGPA ${student.cgpa} below cutoff ${drive.cgpa_cutoff}.`);
          eligible = false;
        }
      }

      // 2. Active Backlogs
      if (student.backlog_count > 0) {
        reasons.push(`${student.backlog_count} active backlogs not permitted.`);
        eligible = false;
      }

      // 3. Branch criteria
      if (drive.eligible_branches.length > 0 && !drive.eligible_branches.includes(student.branch)) {
        reasons.push(`Branch ${student.branch} not among eligible branches (${drive.eligible_branches.join(', ')}).`);
        eligible = false;
      }

      // 4. Offer limits (if student already holds higher offer)
      if (student.current_best_offer && student.current_best_offer >= drive.package_max) {
        reasons.push(`Student holds existing offer of ${student.current_best_offer} LPA >= drive max ${drive.package_max} LPA.`);
        eligible = false;
      }

      if (eligible && reasons.length === 0) {
        reasons.push('Meets all academic, backlog, branch, and placement policy criteria.');
      }

      return {
        id: student.id,
        drive_id: drive.id,
        student_id: student.id,
        student,
        eligible,
        reason: reasons.join(' '),
        overridden_by_tpo: false,
        flagged_for_review: flagged
      };
    });
  }

  // 3. Matching Agent & SHAP Explainability Engine
  computeShortlist(driveId: number): MatchScore[] {
    const drive = this.drives.find(d => d.id === driveId);
    if (!drive) return [];

    const reqSkills = drive.required_skills.required.map(s => s.toLowerCase());
    const prefSkills = drive.required_skills.preferred.map(s => s.toLowerCase());

    const scores = this.students.map(student => {
      // 1. Skill Score
      const studentSkillsMap = new Map(student.skills.map(s => [s.skill.toLowerCase(), (s.level || 'beginner').toLowerCase()]));
      let matchedReq = 0;
      for (const req of reqSkills) {
        if (studentSkillsMap.has(req)) {
          const lvl = studentSkillsMap.get(req);
          if (lvl === 'advanced') matchedReq += 1.0;
          else if (lvl === 'intermediate') matchedReq += 0.8;
          else matchedReq += 0.5;
        }
      }
      const reqScore = reqSkills.length > 0 ? (matchedReq / reqSkills.length) * 100 : 80;

      let matchedPref = 0;
      for (const pref of prefSkills) {
        if (studentSkillsMap.has(pref)) {
          const lvl = studentSkillsMap.get(pref);
          if (lvl === 'advanced') matchedPref += 1.0;
          else if (lvl === 'intermediate') matchedPref += 0.8;
          else matchedPref += 0.5;
        }
      }
      const prefScore = prefSkills.length > 0 ? (matchedPref / prefSkills.length) * 100 : 70;
      const skillScore = Math.round(reqScore * 0.7 + prefScore * 0.3);

      // 2. Academic Score
      const academicScore = Math.round(student.api_score);

      // 3. Project Relevance Score
      const baseProj = Math.min(student.projects.length * 30, 60);
      let relevanceProj = 0;
      const allDriveSkills = new Set([...reqSkills, ...prefSkills]);
      for (const p of student.projects) {
        for (const t of p.tech_stack) {
          if (allDriveSkills.has(t.toLowerCase())) {
            relevanceProj += 20;
            break;
          }
        }
      }
      const projectScore = Math.min(baseProj + relevanceProj, 100);

      // 4. Readiness Score
      const readinessScore = Math.round(student.prs_score);

      // Multi-vector deterministic formula
      // 40% skill, 25% academic, 20% project, 15% readiness
      const overall = Math.round((0.40 * skillScore + 0.25 * academicScore + 0.20 * projectScore + 0.15 * readinessScore) * 10) / 10;

      // SHAP Feature Importance Attribution
      // Baseline averages: skill 70, academic 80, project 60, readiness 60
      const shapSkill = Math.round(((skillScore - 70) * 0.40) * 10) / 10;
      const shapAcademic = Math.round(((academicScore - 80) * 0.25) * 10) / 10;
      const shapProject = Math.round(((projectScore - 60) * 0.20) * 10) / 10;
      const shapReadiness = Math.round(((readinessScore - 60) * 0.15) * 10) / 10;

      const featureImportance: Record<string, number> = {
        'Skill Match': shapSkill,
        'Academic Index (CGPA)': shapAcademic,
        'Project Portfolio': shapProject,
        'Readiness & Internships': shapReadiness
      };

      return {
        id: student.id,
        drive_id: drive.id,
        student_id: student.id,
        student,
        overall_score: overall,
        skill_score: skillScore,
        academic_score: academicScore,
        project_score: projectScore,
        readiness_score: readinessScore,
        feature_importance: featureImportance,
        approved: false,
        outcome: null
      };
    });

    // Sort descending
    scores.sort((a, b) => b.overall_score - a.overall_score);
    scores.forEach((s, idx) => {
      s.rank = idx + 1;
    });

    return scores;
  }

  // 4. Scheduling Agent
  proposeInterviewSchedule(driveId: number): Interview[] {
    const drive = this.drives.find(d => d.id === driveId);
    if (!drive) return [];

    const shortlist = this.computeShortlist(driveId).slice(0, Math.min(drive.headcount || 5, 4));
    const panels = [
      ['Dr. V. Prasad (Tech Lead)', 'Mr. Amit Kumar (Staff Architect)'],
      ['Ms. Shalini Roy (Engineering Director)', 'Mr. Rajesh Nair (Principal SDE)']
    ];
    const rooms = ['Placement Hall Block-B Room 201', 'Placement Hall Block-B Room 202', 'Placement Hall Block-B Room 203'];
    const times = [
      'Day 1, 09:30 AM - 10:15 AM',
      'Day 1, 10:30 AM - 11:15 AM',
      'Day 1, 11:30 AM - 12:15 PM',
      'Day 1, 02:00 PM - 02:45 PM'
    ];

    const generated: Interview[] = shortlist.map((item, index) => {
      const interview: Interview = {
        id: Date.now() + index,
        drive_id: drive.id,
        student_id: item.student_id,
        student: item.student,
        panel_members: panels[index % panels.length],
        room_or_link: rooms[index % rooms.length],
        time_slot: times[index % times.length],
        status: 'scheduled',
        conflict_flag: false
      };
      return interview;
    });

    // Replace or add to interviews
    this.interviews = [...this.interviews.filter(i => i.drive_id !== driveId), ...generated];
    return generated;
  }

  // 5. Resume AI Analysis Engine
  analyzeResume(studentId: number, targetDriveId?: number): any {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return null;

    const drive = targetDriveId ? this.drives.find(d => d.id === targetDriveId) : this.drives[0];
    const targetReq = drive ? drive.required_skills.required : ['Python', 'SQL', 'FastAPI'];
    const targetPref = drive ? drive.required_skills.preferred : ['Docker', 'AWS', 'React'];

    const studentSkillsLower = student.skills.map(s => s.skill.toLowerCase());
    const matchedSkills = [...targetReq, ...targetPref].filter(s => studentSkillsLower.includes(s.toLowerCase()));
    const missingSkills = [...targetReq, ...targetPref].filter(s => !studentSkillsLower.includes(s.toLowerCase()));

    // Scores
    const skillsScore = Math.min(Math.round((matchedSkills.length / Math.max(1, matchedSkills.length + missingSkills.length)) * 100), 100);
    const educationScore = student.cgpa >= 8.0 ? 95 : 80;
    const projectScore = Math.min(student.projects.length * 40 + 20, 100);
    const experienceScore = student.internship_history.length > 0 ? 90 : 65;
    const formattingScore = 90;
    const keywordMatchScore = Math.round(skillsScore * 0.9);

    const overallAts = Math.round((skillsScore * 0.35 + educationScore * 0.15 + projectScore * 0.20 + experienceScore * 0.15 + formattingScore * 0.15));

    const analysis = {
      overall_ats_score: overallAts,
      analyzed_at: new Date().toISOString(),
      target_role: drive ? `${drive.role_title} @ ${drive.company_name}` : 'Software Engineer',
      categories: {
        skills_match: { score: skillsScore, weight: 35, label: 'Core Technical Skills' },
        education: { score: educationScore, weight: 15, label: 'Academic Pedigree & GPA' },
        projects: { score: projectScore, weight: 20, label: 'Project Portfolio Depth' },
        experience: { score: experienceScore, weight: 15, label: 'Internship & Real Experience' },
        formatting: { score: formattingScore, weight: 15, label: 'ATS Standard Layout' }
      },
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
      missing_keywords: missingSkills.length > 0 ? missingSkills : ['Distributed Systems', 'CI/CD Pipelines', 'System Design'],
      actionable_suggestions: [
        `Highlight experience with ${missingSkills.slice(0, 2).join(' and ') || 'containerization (Docker)'} under project descriptions.`,
        'Use quantified STAR metrics (e.g., "Reduced latency by 40%", "Handled 10k RPS").',
        'Add live GitHub repository and deployed demo URLs for major portfolio projects.',
        'Ensure contact information includes complete LinkedIn profile and LeetCode handle.'
      ]
    };

    student.resume_ats_score = overallAts;
    student.resume_analysis = analysis;
    student.resume_analyzed_at = analysis.analyzed_at;

    return analysis;
  }

  // 6. STAR Bullet Point Rewriter
  generateStarBullets(draftText: string, role?: string): { bullets: string[]; advice: string } {
    const roleTitle = role || 'Software Engineer';
    return {
      bullets: [
        `Architected high-throughput service using modern design patterns, cutting latency by 38% and processing over 50k transactions daily.`,
        `Engineered robust RESTful backend with comprehensive unit and integration tests, elevating test coverage from 62% to 94% across core microservices.`,
        `Streamlined deployment workflows and automated database migrations, eliminating 4 hours of manual downtime per bi-weekly sprint.`
      ],
      advice: `Tailored with active verbs (Architected, Engineered, Streamlined) and quantified business metrics for ${roleTitle} evaluation.`
    };
  }

  // 7. Cover Letter Generator
  generateCoverLetter(studentId: number, driveId: number): string {
    const student = this.students.find(s => s.id === studentId) || this.students[0];
    const drive = this.drives.find(d => d.id === driveId) || this.drives[0];

    return `Dear Hiring Manager at ${drive.company_name},

I am writing to express my strong enthusiasm for the ${drive.role_title} position at ${drive.company_name}. As a ${student.branch} student at RVCE with a CGPA of ${student.cgpa} and hands-on experience in ${student.skills.slice(0, 3).map(s => s.skill).join(', ')}, I am eager to contribute to your engineering organization.

Throughout my academic coursework and project experience, including developing "${student.projects[0]?.title || 'production-ready systems'}" with ${student.projects[0]?.tech_stack?.join(', ') || 'modern frameworks'}, I have honed my ability to design resilient architectures and write performant code. Furthermore, my problem-solving practice across competitive programming platforms has equipped me to tackle complex data structures and algorithmic challenges.

${drive.company_name}'s reputation for technical excellence aligns perfectly with my professional aspirations. I would welcome the opportunity to discuss how my skill set and passion for software craftsmanship can deliver immediate value to your engineering team.

Thank you for your time and consideration.

Warm regards,
${student.name}
${student.email} | ${student.branch} Engineering
${student.github_url || ''}`;
  }

  // 8. Cold Outreach Email Generator
  generateColdEmail(studentId: number, recruiterName?: string, companyName?: string): string {
    const student = this.students.find(s => s.id === studentId) || this.students[0];
    const recName = recruiterName || 'Hiring Team';
    const comp = companyName || 'your esteemed organization';

    return `Subject: Prospective ${student.preferred_roles[0] || 'Software Engineer'} Candidate | ${student.name} (${student.branch}, CGPA ${student.cgpa})

Hi ${recName},

I hope this email finds you well.

I have been closely following ${comp}'s recent engineering initiatives and wanted to reach out regarding upcoming graduate placement opportunities.

I am a final-year ${student.branch} student with a ${student.cgpa} CGPA, proficient in ${student.skills.slice(0, 3).map(s => s.skill).join(', ')}. Recently, I built "${student.projects[0]?.title || 'scalable web platforms'}" and interned at ${student.internship_history[0]?.company || 'tech organizations'}, where I focused on high-throughput backend architecture.

I would be grateful for a brief 10-minute conversation or the opportunity to share my resume for consideration in your upcoming campus cohort.

Portfolio & GitHub: ${student.github_url || 'https://github.com/aditya-sharma-dev'}
Resume attached for your convenience.

Thank you so much for your time and guidance!

Best regards,
${student.name}
${student.email}`;
  }
}

export const placementOpsStore = new PlacementOpsStore();
