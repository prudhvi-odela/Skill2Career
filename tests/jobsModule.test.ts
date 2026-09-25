/**
 * Comprehensive Automated Test Suite for Skill2Career Jobs & Internships Module
 * Runs with `tsx tests/jobsModule.test.ts`
 */

import { AdzunaClient, AdzunaRawJob } from '../server/adzunaClient.js';
import {
  normalizeAdzunaJob,
  extractSkills,
  detectWorkMode,
  detectEmploymentType,
  detectExperienceLevel,
  detectEducationRequirements,
  formatSalaryDisplay,
} from '../server/jobNormalization.js';
import { analyzeJobMatch } from '../server/jobMatchingEngine.js';
import { store } from '../server/store.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('   SKILL2CAREER JOBS & INTERNSHIPS MODULE TEST SUITE  ');
  console.log('======================================================\n');

  // ------------------------------------------------------------------
  // 1. ADZUNA CLIENT CONFIGURATION & ERROR HANDLING
  // ------------------------------------------------------------------
  console.log('1. Testing Adzuna Client & Graceful Unconfigured State...');
  const testClient = new AdzunaClient();
  const status = testClient.getStatus();
  assert(typeof status.configured === 'boolean', 'getStatus returns configuration status');
  assert(status.provider === 'adzuna', 'provider is identified as adzuna');
  assert(status.default_country === 'in', 'default country is India (in)');

  // When unconfigured, searchJobs must return safe status without throwing
  if (!testClient.isConfigured()) {
    const unconfiguredRes = await testClient.searchJobs({ what: 'Python' });
    assert(unconfiguredRes.configured === false, 'searchJobs returns configured: false when credentials missing');
    assert(Boolean(unconfiguredRes.error), 'searchJobs returns clear error message explaining missing credentials');
    assert(!unconfiguredRes.data, 'searchJobs does not fabricate mock data');
  }

  // ------------------------------------------------------------------
  // 2. NORMALIZATION & DETERMINISTIC SKILL EXTRACTION
  // ------------------------------------------------------------------
  console.log('\n2. Testing Job Normalization & Deterministic Skill Extraction...');
  const sampleRawJob: AdzunaRawJob = {
    id: '99887766',
    title: 'Junior Software Engineer - Python / React',
    description: 'We are seeking a Junior Software Developer with hands-on skills in Python, FastAPI, Docker, and React. Must understand SQL and Git. Freshers with B.Tech in CS/IT are welcome. 100% Remote flexibility.',
    company: { display_name: 'TechCorp India Solutions' },
    location: { display_name: 'Bengaluru, Karnataka', area: ['India', 'Karnataka', 'Bengaluru'] },
    salary_min: 650000,
    salary_max: 950000,
    salary_is_predicted: '0',
    contract_type: 'permanent',
    contract_time: 'full_time',
    redirect_url: 'https://www.adzuna.in/land/ad/99887766?se=test',
    created: '2026-03-20T10:00:00Z',
    category: { tag: 'it-jobs', label: 'IT Jobs' },
  };

  const normalized = normalizeAdzunaJob(sampleRawJob, 'in');
  assert(normalized.id === 'adzuna_in_99887766', 'id formatted as adzuna_in_99887766');
  assert(normalized.company_name === 'TechCorp India Solutions', 'company name preserved');
  assert(normalized.company_initials === 'TI', 'initials calculated correctly (TI)');
  assert(normalized.work_mode === 'Remote', 'work mode identified as Remote');
  assert(normalized.employment_type === 'Full-Time', 'employment type identified as Full-Time');
  assert(normalized.experience_level === 'Junior' || normalized.experience_level === 'Entry-Level / Fresher', 'experience tier identified');
  assert(normalized.education_requirements.includes('B.Tech'), 'education detected as B.Tech');
  assert(normalized.salary_formatted.includes('LPA'), 'salary formatted in LPA format: ' + normalized.salary_formatted);
  assert(normalized.application_url === sampleRawJob.redirect_url, 'original application url preserved intact');

  // Verify skills extraction
  const extracted = extractSkills(sampleRawJob.description);
  assert(extracted.includes('Python'), 'extracted Python skill');
  assert(extracted.includes('FastAPI'), 'extracted FastAPI skill');
  assert(extracted.includes('Docker'), 'extracted Docker skill');
  assert(extracted.includes('React'), 'extracted React skill');
  assert(extracted.includes('SQL'), 'extracted SQL skill');

  // ------------------------------------------------------------------
  // 3. WORK MODE & EMPLOYMENT TYPE CLASSIFICATION
  // ------------------------------------------------------------------
  console.log('\n3. Testing Classification Rules...');
  assert(detectWorkMode('Backend Dev', 'Office location in Whitefield', 'Bengaluru') === 'On-Site', 'On-Site detection');
  assert(detectWorkMode('Fullstack Dev', '2 days a week in office, hybrid model', 'Pune') === 'Hybrid', 'Hybrid detection');
  assert(detectWorkMode('Data Analyst', 'Work from home anywhere in India', 'Remote') === 'Remote', 'Remote detection');

  const internshipRaw: AdzunaRawJob = {
    ...sampleRawJob,
    title: 'Machine Learning Engineering Intern (Summer 2026)',
    description: 'Looking for ML Interns and Graduate Trainees with PyTorch knowledge.',
    contract_time: 'part_time',
  };
  assert(detectEmploymentType(internshipRaw) === 'Internship', 'Internship detected from title keywords');
  assert(detectExperienceLevel('Senior Staff Architect', 'Requires 8+ years') === 'Senior', 'Senior experience detected');

  // ------------------------------------------------------------------
  // 4. PERSONALIZED MATCHING ENGINE & READINESS INTEGRATION
  // ------------------------------------------------------------------
  console.log('\n4. Testing Personalized Matching Engine & Readiness Integration...');
  const demoUserId = 'usr_demo_01';
  const matchResult = analyzeJobMatch(demoUserId, normalized, 'Bengaluru', 'Remote');

  assert(matchResult.skill_match_percentage > 50, 'calculated skill match % above baseline (' + matchResult.skill_match_percentage + '%)');
  assert(matchResult.readiness_score > 0, 'integrated readiness score is present (' + matchResult.readiness_score + '%)');
  assert(matchResult.matched_skills.length > 0, 'identified matched skills with student profile');
  assert(matchResult.match_reasons.length > 0, 'produced explainable match reasons');
  assert(matchResult.recommendation_score >= 10 && matchResult.recommendation_score <= 100, 'recommendation composite score valid');

  // Check Senior Ineligibility rule
  const seniorJob = normalizeAdzunaJob({
    ...sampleRawJob,
    id: '112233',
    title: 'Senior Principal Cloud Architect',
    description: 'Minimum 10 years experience leading distributed systems.',
  });
  const seniorMatch = analyzeJobMatch(demoUserId, seniorJob);
  assert(seniorMatch.eligibility_status === 'Ineligible', 'senior role marked as Ineligible for undergraduate student');

  // Check Unverified Eligibility transparency rule
  const vagueJob = normalizeAdzunaJob({
    ...sampleRawJob,
    id: '445566',
    title: 'Consultant',
    description: 'Join our team for exciting projects.',
  });
  const vagueMatch = analyzeJobMatch(demoUserId, vagueJob);
  assert(vagueMatch.eligibility_status === 'Eligibility not verified', 'vague job marked as "Eligibility not verified" honestly');

  // ------------------------------------------------------------------
  // 5. SAVED JOBS & USER ISOLATION
  // ------------------------------------------------------------------
  console.log('\n5. Testing Saved Jobs & Persistence Layer...');
  const savedRecord = store.saveJob(demoUserId, normalized);
  assert(savedRecord.job_id === normalized.id, 'saved job returned with matching job_id');
  assert(store.isJobSaved(demoUserId, normalized.id) === true, 'isJobSaved returns true');

  const savedList = store.getSavedJobs(demoUserId);
  assert(savedList.some(r => r.job_id === normalized.id), 'getSavedJobs includes the saved job');

  // User isolation
  const otherUserId = 'usr_other_99';
  assert(store.isJobSaved(otherUserId, normalized.id) === false, 'user isolation: other user does not see saved job');
  assert(store.getSavedJobs(otherUserId).length === 0, 'user isolation: other user saved list is isolated');

  // ------------------------------------------------------------------
  // 6. APPLICATION STATUS TRACKING LIFECYCLE
  // ------------------------------------------------------------------
  console.log('\n6. Testing Application Status Tracking Lifecycle...');
  const updatedStatus = store.updateJobApplicationStatus(demoUserId, normalized.id, 'Applied', 'Applied on company careers portal');
  assert(updatedStatus?.application_status === 'Applied', 'status updated to Applied');
  assert(updatedStatus?.notes === 'Applied on company careers portal', 'application notes persisted');

  const interviewStatus = store.updateJobApplicationStatus(demoUserId, normalized.id, 'Interview');
  assert(interviewStatus?.application_status === 'Interview', 'status transitioned to Interview');

  const offerStatus = store.updateJobApplicationStatus(demoUserId, normalized.id, 'Offer');
  assert(offerStatus?.application_status === 'Offer', 'status transitioned to Offer');

  // Unsave cleanup
  const unsaved = store.unsaveJob(demoUserId, normalized.id);
  assert(unsaved === true, 'job successfully unsaved');
  assert(store.isJobSaved(demoUserId, normalized.id) === false, 'isJobSaved returns false after unsave');

  // ------------------------------------------------------------------
  // 7. EXISTING SKILL2CAREER CORE READINESS ENGINE CHECK
  // ------------------------------------------------------------------
  console.log('\n7. Verifying Existing Core Engine Functionality (No Regressions)...');
  const gap = store.calculateSkillGap(demoUserId, 'CG_CSE_1_software_engineer');
  assert(gap.match_percentage > 0, 'calculateSkillGap returns match percentage');
  assert(gap.readiness_score > 0, 'calculateSkillGap returns readiness score');

  const trajectory = store.calculateTrajectory(demoUserId, 15, 0.9, 'CG_CSE_1_software_engineer');
  assert(trajectory.trajectory_points.length === 13, 'calculateTrajectory returns week 0-12 points (13 points)');
  assert(trajectory.target_readiness === 85.0, 'target readiness benchmark intact');

  console.log('\n------------------------------------------------------');
  console.log(`TOTAL TESTS: ${passedTests + failedTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('------------------------------------------------------\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test runner encountered unexpected error:', err);
  process.exit(1);
});
