import { Router } from 'express';
import { placementOpsStore } from './placementOpsStore.js';
import { GoogleGenAI } from '@google/genai';

export const placementOpsRouter = Router();

// Gemini Client Lazy Initializer
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('[Gemini Init Failed]:', e);
    }
  }
  return aiClient;
}

// ── Auth Sync ───────────────────────────────────────────────────
placementOpsRouter.post(['/auth/sync-profile', '/api/auth/sync-profile'], (req, res) => {
  const role = req.body?.role || 'student';
  const student = placementOpsStore.students[0];
  res.json({
    role,
    profile_id: student.profile_id,
    student_id: student.id,
    email: student.email,
    name: student.name,
    profile_complete: (student.profile_completion_pct || 80) >= 80
  });
});

// ── Students Endpoints ──────────────────────────────────────────
placementOpsRouter.get(['/students', '/api/students'], (req, res) => {
  res.json(placementOpsStore.students);
});

placementOpsRouter.get(['/students/me', '/api/students/me'], (req, res) => {
  const student = placementOpsStore.students[0];
  res.json(student);
});

placementOpsRouter.patch(['/students/me', '/api/students/me'], (req, res) => {
  const student = placementOpsStore.students[0];
  Object.assign(student, req.body);
  res.json(student);
});

placementOpsRouter.get(['/students/me/dashboard', '/api/students/me/dashboard'], (req, res) => {
  const student = placementOpsStore.students[0];
  const eligible_jobs = placementOpsStore.drives.filter(d => d.status === 'published');
  const applied_jobs = placementOpsStore.drives
    .filter(d => student.applied_drives.includes(d.id))
    .map(d => ({
      ...d,
      application_status: d.id === 1 ? 'shortlisted' : 'applied',
      applied_at: new Date(Date.now() - 86400000).toISOString()
    }));

  const upcoming_interviews = placementOpsStore.interviews.filter(i => i.student_id === student.id);
  const timeline = placementOpsStore.auditLogs;
  const agent13_profile = placementOpsStore.recommendations.filter(r => r.student_id === student.id);

  res.json({
    student,
    eligible_jobs,
    applied_jobs,
    interviews: upcoming_interviews,
    timeline,
    agent13_profile
  });
});

placementOpsRouter.get(['/students/me/role-suggestions', '/api/students/me/role-suggestions'], (req, res) => {
  const student = placementOpsStore.students[0];
  res.json({
    top_role: 'Backend Systems Engineer',
    match_percentage: 94.2,
    base_salary_range: '12 - 18 LPA',
    confidence_level: 'High (Deterministic + Trajectory Match)',
    matching_skills: ['Python', 'SQL', 'FastAPI', 'Distributed Systems'],
    missing_skills: ['Docker', 'Kubernetes'],
    why_matched: 'Your advanced score in Python and SQL combined with real-world experience in FastAPI systems positions you in the top 5% of campus candidates for tier-1 product backend roles.',
    recommended_action: 'Complete the Docker & Containerization sprint to achieve 98% compatibility with Acme Systems & FinTech tier-1 cohorts.'
  });
});

placementOpsRouter.post(['/students/me/apply/:drive_id', '/api/students/me/apply/:drive_id'], (req, res) => {
  const driveId = parseInt(req.params.drive_id, 10);
  const student = placementOpsStore.students[0];
  if (!student.applied_drives.includes(driveId)) {
    student.applied_drives.push(driveId);
  }
  placementOpsStore.auditLogs.unshift({
    id: Date.now(),
    action: 'student_applied_drive',
    target_type: 'drive',
    target_id: driveId,
    performed_by: student.name,
    timestamp: new Date().toISOString(),
    details: `Student applied to drive ID ${driveId}`
  });
  res.json({ success: true, applied_drives: student.applied_drives });
});

placementOpsRouter.get(['/students/:id', '/api/students/:id'], (req, res) => {
  const id = parseInt(req.params.id, 10);
  const student = placementOpsStore.students.find(s => s.id === id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

// ── Resume AI Endpoints ─────────────────────────────────────────
placementOpsRouter.post(['/students/me/resume/analyze', '/api/students/me/resume/analyze'], (req, res) => {
  const targetDriveId = req.body?.drive_id ? parseInt(req.body.drive_id, 10) : undefined;
  const analysis = placementOpsStore.analyzeResume(1, targetDriveId);
  res.json(analysis);
});

placementOpsRouter.get(['/students/me/resume/analysis', '/api/students/me/resume/analysis'], (req, res) => {
  const student = placementOpsStore.students[0];
  if (!student.resume_analysis) {
    const fresh = placementOpsStore.analyzeResume(1);
    return res.json(fresh);
  }
  res.json(student.resume_analysis);
});

placementOpsRouter.post(['/students/me/resume/bullets', '/api/students/me/resume/bullets'], async (req, res) => {
  const { draft, role } = req.body || {};
  const ai = getAI();

  if (ai && draft) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an elite campus placement resume reviewer. Rewrite this project note/bullet into 3 high-impact STAR (Situation, Task, Action, Result) bullet points with active verbs and quantifiable metrics:
Role Target: ${role || 'Software Engineer'}
Input Draft: "${draft}"

Return valid JSON with format:
{
  "bullets": ["bullet 1", "bullet 2", "bullet 3"],
  "advice": "one sentence explaining why these stand out to recruiters"
}`
      });
      const text = response.text || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return res.json(JSON.parse(match[0]));
      }
    } catch (err) {
      console.warn('Gemini bullets generation fallback:', err);
    }
  }

  // Deterministic high-quality fallback
  res.json(placementOpsStore.generateStarBullets(draft || '', role));
});

placementOpsRouter.post(['/students/me/resume/cover-letter', '/api/students/me/resume/cover-letter'], async (req, res) => {
  const driveId = parseInt(req.body?.drive_id || '1', 10);
  const letter = placementOpsStore.generateCoverLetter(1, driveId);
  res.json({ cover_letter: letter });
});

placementOpsRouter.post(['/students/me/resume/cold-email', '/api/students/me/resume/cold-email'], async (req, res) => {
  const { recruiter_name, company_name } = req.body || {};
  const emailText = placementOpsStore.generateColdEmail(1, recruiter_name, company_name);
  res.json({ email: emailText });
});

placementOpsRouter.post(['/students/me/resume/match-drive', '/api/students/me/resume/match-drive'], (req, res) => {
  const driveId = parseInt(req.body?.drive_id || '1', 10);
  const analysis = placementOpsStore.analyzeResume(1, driveId);
  res.json(analysis);
});

// ── Drives & JD Intake ──────────────────────────────────────────
placementOpsRouter.get(['/drives', '/api/drives'], (req, res) => {
  res.json(placementOpsStore.drives);
});

placementOpsRouter.get(['/drives/:id', '/api/drives/:id'], (req, res) => {
  const id = parseInt(req.params.id, 10);
  const drive = placementOpsStore.drives.find(d => d.id === id);
  if (!drive) return res.status(404).json({ error: 'Drive not found' });
  res.json(drive);
});

placementOpsRouter.post(['/drives', '/api/drives'], (req, res) => {
  const { company_name, role_title, jd_raw_text } = req.body || {};
  const parsed = placementOpsStore.parseJobDescription(jd_raw_text || '', company_name, role_title);
  const newDrive: any = {
    id: placementOpsStore.drives.length + 1,
    ...parsed,
    created_at: new Date().toISOString()
  };
  placementOpsStore.drives.unshift(newDrive);

  placementOpsStore.auditLogs.unshift({
    id: Date.now(),
    action: 'jd_intake_created',
    target_type: 'drive',
    target_id: newDrive.id,
    performed_by: 'JDIntakeAgent (AI Assisted)',
    timestamp: new Date().toISOString(),
    details: `Parsed and registered new drive for ${newDrive.company_name} - ${newDrive.role_title}`
  });

  res.status(201).json(newDrive);
});

// ── Eligibility Engine ──────────────────────────────────────────
placementOpsRouter.get(['/drives/:id/eligibility', '/api/drives/:id/eligibility'], (req, res) => {
  const id = parseInt(req.params.id, 10);
  const results = placementOpsStore.evaluateEligibility(id);
  res.json(results);
});

placementOpsRouter.patch(['/eligibility/:id/override', '/api/eligibility/:id/override'], (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  placementOpsStore.auditLogs.unshift({
    id: Date.now(),
    action: 'eligibility_override_tpo',
    target_type: 'student',
    target_id: studentId,
    performed_by: 'TPO Placement Director',
    timestamp: new Date().toISOString(),
    details: `TPO Manual Override applied for student ID ${studentId}. Marked ELIGIBLE.`
  });
  res.json({ success: true, student_id: studentId, overridden: true });
});

// ── Matching Agent & SHAP Shortlists ────────────────────────────
placementOpsRouter.get(['/drives/:id/shortlist', '/api/drives/:id/shortlist'], (req, res) => {
  const id = parseInt(req.params.id, 10);
  const shortlist = placementOpsStore.computeShortlist(id);
  res.json(shortlist);
});

placementOpsRouter.patch(['/drives/:id/shortlist/approve', '/api/drives/:id/shortlist/approve'], (req, res) => {
  const driveId = parseInt(req.params.id, 10);
  const drive = placementOpsStore.drives.find(d => d.id === driveId);
  if (drive) drive.stage = 'scheduling';

  placementOpsStore.auditLogs.unshift({
    id: Date.now(),
    action: 'shortlist_locked_approved',
    target_type: 'drive',
    target_id: driveId,
    performed_by: 'TPO Placement Director',
    timestamp: new Date().toISOString(),
    details: `Shortlist approved and locked for Drive ID ${driveId}. Advanced to SchedulingAgent.`
  });
  res.json({ success: true, drive_id: driveId, stage: 'scheduling' });
});

// ── Scheduling Agent ────────────────────────────────────────────
placementOpsRouter.post(['/drives/:id/schedule/propose', '/api/drives/:id/schedule/propose'], (req, res) => {
  const driveId = parseInt(req.params.id, 10);
  const proposed = placementOpsStore.proposeInterviewSchedule(driveId);
  res.json({ success: true, count: proposed.length, interviews: proposed });
});

placementOpsRouter.get(['/drives/:id/interviews', '/api/drives/:id/interviews'], (req, res) => {
  const driveId = parseInt(req.params.id, 10);
  const interviews = placementOpsStore.interviews.filter(i => i.drive_id === driveId);
  res.json(interviews);
});

placementOpsRouter.patch(['/interviews/:id/resolve', '/api/interviews/:id/resolve'], (req, res) => {
  const id = parseInt(req.params.id, 10);
  const interview = placementOpsStore.interviews.find(i => i.id === id);
  if (interview) {
    interview.conflict_flag = false;
  }
  res.json({ success: true, resolved: true });
});

// ── Exceptions Queue ────────────────────────────────────────────
placementOpsRouter.get(['/exceptions', '/api/exceptions'], (req, res) => {
  res.json(placementOpsStore.exceptions);
});

placementOpsRouter.patch(['/exceptions/:id/resolve', '/api/exceptions/:id/resolve'], (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = placementOpsStore.exceptions.find(e => e.id === id);
  if (item) {
    item.resolved = true;
    item.resolved_by = 'TPO Placement Cell';
    item.resolved_at = new Date().toISOString();
  }
  res.json({ success: true, exception: item });
});

placementOpsRouter.post(['/exceptions/:id/dismiss', '/api/exceptions/:id/dismiss'], (req, res) => {
  const id = parseInt(req.params.id, 10);
  placementOpsStore.exceptions = placementOpsStore.exceptions.filter(e => e.id !== id);
  res.json({ success: true, dismissed: id });
});

// ── Analytics & Reports ─────────────────────────────────────────
placementOpsRouter.get(['/analytics/skill-gap', '/api/analytics/skill-gap'], (req, res) => {
  res.json({
    campus_gaps: [
      { skill: 'Docker & Containerization', industry_demand_pct: 78, student_supply_pct: 32, gap_pct: 46 },
      { skill: 'FastAPI / Asynchronous Python', industry_demand_pct: 65, student_supply_pct: 28, gap_pct: 37 },
      { skill: 'System Design & Distributed Systems', industry_demand_pct: 82, student_supply_pct: 41, gap_pct: 41 },
      { skill: 'React & TypeScript', industry_demand_pct: 70, student_supply_pct: 55, gap_pct: 15 },
      { skill: 'SQL & Query Optimization', industry_demand_pct: 85, student_supply_pct: 72, gap_pct: 13 }
    ],
    summary: '46% shortage in containerization & DevOps tooling among 2026 cohort. Target remedial lab sprint recommended.'
  });
});

placementOpsRouter.get(['/analytics/readiness-trend', '/api/analytics/readiness-trend'], (req, res) => {
  res.json({
    departments: [
      { branch: 'CSE', average_cgpa: 8.6, avg_prs: 84.5, placement_eligible_pct: 92 },
      { branch: 'ISE', average_cgpa: 8.4, avg_prs: 81.2, placement_eligible_pct: 88 },
      { branch: 'ECE', average_cgpa: 7.9, avg_prs: 74.0, placement_eligible_pct: 76 },
      { branch: 'ME', average_cgpa: 7.2, avg_prs: 62.8, placement_eligible_pct: 64 }
    ],
    overall_placed_estimate_pct: 86.4
  });
});

placementOpsRouter.get(['/reports/:drive_id', '/api/reports/:drive_id'], (req, res) => {
  const driveId = parseInt(req.params.drive_id, 10);
  const drive = placementOpsStore.drives.find(d => d.id === driveId) || placementOpsStore.drives[0];
  res.json({
    drive_id: drive.id,
    company_name: drive.company_name,
    role: drive.role_title,
    registered_candidates: 8,
    eligible_candidates: 5,
    shortlisted_candidates: 3,
    scheduled_interviews: 2,
    conversion_rate_pct: 60.0,
    average_shortlist_cgpa: 9.1,
    top_driver: 'Python & SQL proficiency with verified projects'
  });
});

placementOpsRouter.get(['/reports/:drive_id/csv', '/api/reports/:drive_id/csv'], (req, res) => {
  const driveId = parseInt(req.params.drive_id, 10);
  const drive = placementOpsStore.drives.find(d => d.id === driveId) || placementOpsStore.drives[0];
  const csv = `Student Name,Branch,CGPA,Match Score,Status\nAditya Sharma,CSE,9.2,94.2,Shortlisted\nPooja Rao,CSE,9.6,96.5,Shortlisted\nSneha Patil,ISE,8.5,82.4,Eligible\nRohan Verma,CSE,7.9,78.0,Borderline Override`;
  res.header('Content-Type', 'text/csv');
  res.attachment(`Placement_Report_${drive.company_name.replace(/\s+/g, '_')}.csv`);
  res.send(csv);
});

// ── Notifications & Audit Logs ──────────────────────────────────
placementOpsRouter.get(['/notifications', '/api/notifications'], (req, res) => {
  res.json(placementOpsStore.notifications);
});

placementOpsRouter.get(['/audit-logs', '/api/audit-logs'], (req, res) => {
  res.json(placementOpsStore.auditLogs);
});

// ── Agent 13 Intelligence Endpoints ─────────────────────────────
placementOpsRouter.get(['/api/agent13/recommendations', '/agents/13/recommendations'], (req, res) => {
  res.json(placementOpsStore.recommendations);
});

placementOpsRouter.get(['/api/agent13/verification-queue', '/agents/13/verification-queue'], (req, res) => {
  res.json(placementOpsStore.resumeClaims);
});

placementOpsRouter.post(['/api/agent13/resume-claims/:claim_id/verify', '/agents/13/resume-claims/:claim_id/verify'], (req, res) => {
  const claimId = req.params.claim_id;
  const status = req.body?.status || 'VERIFIED';
  const claim = placementOpsStore.resumeClaims.find(c => c.resume_claim_id === claimId);
  if (claim) {
    claim.verification_status = status;
    claim.verified_by = 'Dr. Arvind Rao (Faculty Lead)';
    claim.verified_at = new Date().toISOString();
  }
  res.json({ success: true, claim });
});

placementOpsRouter.post(['/api/agent13/recommendations/:id/review', '/agents/13/recommendations/:id/review'], (req, res) => {
  const id = req.params.id;
  const status = req.body?.status || 'APPROVED';
  const rec = placementOpsStore.recommendations.find(r => r.recommendation_id === id);
  if (rec) {
    rec.status = status;
  }
  res.json({ success: true, recommendation: rec });
});

placementOpsRouter.get(['/api/agent13/audit/fairness', '/agents/13/audit/fairness'], (req, res) => {
  res.json({
    metrics: {
      total_students_monitored: 8,
      hidden_talent_identified: 2,
      department_equity_score: 92.4,
      branch_distribution: {
        CSE: { total: 3, identified: 1 },
        ISE: { total: 2, identified: 0 },
        ECE: { total: 2, identified: 0 },
        ME: { total: 1, identified: 0 }
      },
      audit_pass: true,
      explanation: 'No statistical disparity detected in high-potential learner identification.'
    }
  });
});

placementOpsRouter.get(['/api/agent13/student/:student_id/profile', '/agents/13/student/:student_id'], (req, res) => {
  const studentId = parseInt(req.params.student_id, 10);
  const student = placementOpsStore.students.find(s => s.id === studentId) || placementOpsStore.students[0];
  const rec = placementOpsStore.recommendations.find(r => r.student_id === studentId) || placementOpsStore.recommendations[0];
  res.json({
    student,
    recommendation: rec,
    next_best_action: 'Enroll in Faculty Research Project: Autonomous Multi-Agent Systems to cement Tier-1 SDE candidacy.',
    hidden_talent: rec ? rec.hidden_talent : true,
    pathway: [
      { phase: 1, title: 'Foundational Systems Design', duration: 'Weeks 1-3', status: 'Completed' },
      { phase: 2, title: 'Distributed Consensus & Raft Implementation', duration: 'Weeks 4-6', status: 'Active' },
      { phase: 3, title: 'Research Paper Co-Authorship & Review', duration: 'Weeks 7-9', status: 'Upcoming' },
      { phase: 4, title: 'Tier-1 Direct Interview Fast-Track', duration: 'Weeks 10-12', status: 'Upcoming' }
    ]
  });
});

// ── Multi-Agent AI Chat Co-Pilot ────────────────────────────────
placementOpsRouter.post(['/ai/chat', '/api/ai/chat'], async (req, res) => {
  const { message, model, history } = req.body || {};
  const ai = getAI();

  if (ai && message) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are Placement Ops AI's Autonomous Co-Pilot, an intelligent campus recruitment and career accelerator agent.
Help the user with placement management, recruitment drives, SHAP explainable shortlists, interview preparation, ATS resume scoring, or skill gap roadmaps.
Keep your answer clear, actionable, structured with bullet points, and highly professional.

User Query: "${message}"`
      });

      return res.json({
        reply: response.text || 'I analyzed your request. What specific drive or candidate cohort would you like to review?'
      });
    } catch (err) {
      console.warn('Gemini chat fallback:', err);
    }
  }

  // Smart grounded conversational fallback
  const msgLower = (message || '').toLowerCase();
  let reply = `I am your Placement Ops AI Assistant. Here is what I found:\n\n`;

  if (msgLower.includes('jd') || msgLower.includes('intake') || msgLower.includes('drive')) {
    reply += `• **JD Intake Status**: Currently tracking 4 campus drives (Acme Systems, TechCorp, InnoTech, Innovaccer).\n• **Top Skill In-Demand**: Python (85%), SQL (80%), React (72%), and Distributed Systems.\n• You can use the **Recruitment Drives** tab to paste raw JD text for instant auto-parsing of cutoffs and tech stacks.`;
  } else if (msgLower.includes('shap') || msgLower.includes('match') || msgLower.includes('shortlist')) {
    reply += `• **SHAP Explainability Engine**: Candidates are scored across 4 vectors: Skill Match (40%), Academic CGPA (25%), Projects (20%), and PRS (15%).\n• Aditya Sharma is ranked #1 for Acme Systems with +38% positive attribution in core Python/SQL and +28% academic consistency.\n• TPO can lock and approve shortlists directly in the dashboard.`;
  } else if (msgLower.includes('resume') || msgLower.includes('ats')) {
    reply += `• **Resume AI Studio**: Access the Resume AI tab to calculate your live ATS score (0-100), extract missing critical keywords, and convert informal project notes into quantifiable **STAR bullet points**.\n• Current top missing keyword: *Distributed Systems & Docker Containerization*.`;
  } else if (msgLower.includes('schedule') || msgLower.includes('interview')) {
    reply += `• **Scheduling Agent**: Proposed 4 conflict-free interview slots across 2 evaluation panels in Placement Hall Block-B.\n• CoordinationAgent detected 0 double-booking collisions.`;
  } else {
    reply += `• **Campus Placement Overview**: 8 candidates tracked, 5 currently eligible across active drives.\n• **Agent 13 Insight**: 2 high-potential learners identified for faculty research fast-tracking.\n• How can I assist you with your placement workflows today?`;
  }

  res.json({ reply });
});
