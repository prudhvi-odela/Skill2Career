/**
 * Skill2Career Dedicated Job Recommendation & Matching Engine
 * Reuses existing student profile, career-matching, skill-gap, and readiness logic.
 * Computes transparent, deterministic compatibility, readiness alignment, and explainable breakdowns.
 */

import { store } from './store.js';
import type { NormalizedJob } from './jobNormalization.js';
import { CAREER_ROLES } from './seedData.js';

export interface MatchedSkillDetail {
  skill_name: string;
  student_level: number; // 1.0 - 5.0
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
  recommendation_score: number; // 0 - 100 composite ranking score
  match_reasons: string[];
  actionable_recommendations: string[];
  target_career_alignment: {
    target_role: string;
    aligned: boolean;
  };
}

/**
 * Calculates skill compatibility, eligibility, and readiness for a normalized job
 */
export function analyzeJobMatch(
  userId: string,
  job: NormalizedJob,
  preferredLocation?: string,
  preferredWorkMode?: string
): MatchAnalysisResult {
  const profile = store.getProfile(userId);
  const targetCareerId = profile?.target_career_id || 'CG_CSE_1_software_engineer';
  const targetCareerTitle = profile?.target_career_title || 'Software Engineer';

  // 1. Retrieve the student's existing skill gap & readiness score for their target career
  const careerGap = store.calculateSkillGap(userId, targetCareerId);
  const readinessScore = careerGap?.readiness_score || 75;

  const studentSkills = profile?.skills || [];
  const studentSkillMap = new Map<string, { level: number; verified: boolean }>();

  studentSkills.forEach((s: any) => {
    const sName = (s.name || s.skill_name || '').toLowerCase().trim();
    if (sName) {
      studentSkillMap.set(sName, {
        level: Number(s.level) || 3.0,
        verified: Boolean(s.verified),
      });
    }
  });

  // 2. Skill Matching
  const requiredSkills = job.required_skills || [];
  const matchedSkills: MatchedSkillDetail[] = [];
  const missingSkills: MissingSkillDetail[] = [];

  let skillMatchPercentage = 0;

  if (requiredSkills.length === 0) {
    // If the job didn't specify strict keywords in description, fallback match based on target career skills
    const careerReqs = careerGap.matched_skills || [];
    if (careerReqs.length > 0) {
      skillMatchPercentage = Math.round(careerGap.match_percentage * 0.8);
    } else {
      skillMatchPercentage = 65; // baseline for entry-level tech roles
    }
  } else {
    let matchedScore = 0;
    requiredSkills.forEach(req => {
      const reqLower = req.toLowerCase().trim();
      let matched = studentSkillMap.get(reqLower);

      // Fuzzy check if exact name wasn't mapped
      if (!matched) {
        for (const [sName, sData] of studentSkillMap.entries()) {
          if (sName.includes(reqLower) || reqLower.includes(sName)) {
            matched = sData;
            break;
          }
        }
      }

      if (matched) {
        matchedScore += 1;
        matchedSkills.push({
          skill_name: req,
          student_level: matched.level,
          verified: matched.verified,
          match_quality: matched.level >= 4.0 ? 'Strong' : matched.level >= 3.0 ? 'Adequate' : 'Basic',
        });
      } else {
        missingSkills.push({
          skill_name: req,
          recommended_target_level: 3.5,
          priority: missingSkills.length < 2 ? 'High' : 'Medium',
        });
      }
    });

    skillMatchPercentage = Math.round((matchedScore / requiredSkills.length) * 100);
  }

  // 3. Eligibility Check
  const eligibilityReasons: string[] = [];
  let eligibilityStatus: 'Eligible' | 'Ineligible' | 'Eligibility not verified' = 'Eligibility not verified';

  const descAndTitle = `${job.title} ${job.description}`.toLowerCase();
  const studentGradYear = Number(profile?.graduation_year) || 2026;
  const studentDegree = (profile?.degree || 'B.Tech').toLowerCase();

  let hasExplicitRequirement = false;

  // Education check
  if (job.education_requirements && job.education_requirements !== 'Not Specified') {
    hasExplicitRequirement = true;
    const reqLower = job.education_requirements.toLowerCase();
    if (reqLower.includes('b.tech') || reqLower.includes('b.e.') || reqLower.includes('bachelor')) {
      if (studentDegree.includes('b.tech') || studentDegree.includes('b.e') || studentDegree.includes('bachelor') || studentDegree.includes('cs')) {
        eligibilityReasons.push(`Degree matches: Requires ${job.education_requirements} (Student: ${profile.degree || 'B.Tech'})`);
      }
    }
  }

  // Batch / Year check
  if (descAndTitle.includes('2026') || descAndTitle.includes('2025') || descAndTitle.includes('fresher') || descAndTitle.includes('final year')) {
    hasExplicitRequirement = true;
    if (studentGradYear === 2026 || studentGradYear === 2025) {
      eligibilityReasons.push(`Graduation year aligned: Eligible for ${studentGradYear} batch`);
    }
  }

  // Experience level check
  if (job.experience_level === 'Senior') {
    hasExplicitRequirement = true;
    eligibilityStatus = 'Ineligible';
    eligibilityReasons.push('Role requires senior industry experience (5+ years). Students are typically ineligible.');
  } else if (job.experience_level === 'Entry-Level / Fresher' || job.employment_type === 'Internship') {
    hasExplicitRequirement = true;
    eligibilityReasons.push('Entry-level / campus internship friendly opportunity');
    if (eligibilityStatus !== 'Ineligible') {
      eligibilityStatus = 'Eligible';
    }
  }

  if (!hasExplicitRequirement) {
    eligibilityStatus = 'Eligibility not verified';
    eligibilityReasons.push('Listing did not specify strict GPA, graduation batch, or degree criteria in description.');
  }

  // 4. Location and Work Mode Compatibility
  const jobLoc = (job.location_display || job.city || '').toLowerCase();
  const prefLoc = (preferredLocation || '').toLowerCase().trim();
  const locationMatch = !prefLoc || prefLoc === 'all' || prefLoc === 'any' || job.work_mode === 'Remote' || jobLoc.includes(prefLoc) || prefLoc.includes(jobLoc);

  const prefMode = (preferredWorkMode || '').toLowerCase().trim();
  const workModeMatch = !prefMode || prefMode === 'all' || job.work_mode.toLowerCase() === prefMode || (prefMode === 'remote' && job.work_mode === 'Remote');

  // 5. Target Career Alignment
  const jobTitleLower = job.title.toLowerCase();
  const targetTitleLower = targetCareerTitle.toLowerCase();
  const targetWords = targetTitleLower.split(' ').filter(w => w.length > 2);
  const aligned = targetWords.some(w => jobTitleLower.includes(w)) || jobTitleLower.includes(targetTitleLower);

  // 6. Transparent Composite Recommendation Score (0 - 100)
  // 45% skill match + 25% target role alignment + 15% readiness alignment + 10% location/mode + 5% freshness
  let compositeScore = (skillMatchPercentage * 0.45);
  if (aligned) compositeScore += 25;
  compositeScore += (readinessScore * 0.15);
  if (locationMatch) compositeScore += 5;
  if (workModeMatch) compositeScore += 5;
  compositeScore += 5; // base posting freshness

  const finalRecommendationScore = Math.min(100, Math.max(10, Math.round(compositeScore)));

  // 7. Explanations Grounded in Actual Data
  const matchReasons: string[] = [];
  if (matchedSkills.length > 0) {
    matchReasons.push(`Matches ${matchedSkills.length} core competencies in your profile: ${matchedSkills.slice(0, 3).map(m => m.skill_name).join(', ')}.`);
  }
  if (aligned) {
    matchReasons.push(`Directly matches your target career objective as a ${targetCareerTitle}.`);
  }
  if (job.work_mode === 'Remote') {
    matchReasons.push('100% Remote flexibility matching student study schedules.');
  } else if (locationMatch && job.city) {
    matchReasons.push(`Located in ${job.city}, aligning with your regional preferences.`);
  }
  if (readinessScore >= 75) {
    matchReasons.push(`Your validated placement readiness score (${readinessScore}%) meets typical hiring benchmark for this role.`);
  }

  // 8. Actionable recommendations
  const actionableRecommendations: string[] = [];
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 2).map(m => m.skill_name).join(' and ');
    actionableRecommendations.push(`Boost your match by practicing ${topMissing} in the Skill2Career Practice Lab.`);
  }
  if (readinessScore < 75) {
    actionableRecommendations.push(`Take the diagnostic assessment in Topic Assessments to increase your verified placement readiness score.`);
  }
  if (matchedSkills.some(m => !m.verified)) {
    actionableRecommendations.push(`Submit evidence or pass skill quizzes to verify your self-reported skills for recruiter visibility.`);
  }

  return {
    job,
    skill_match_percentage: skillMatchPercentage,
    readiness_score: readinessScore,
    eligibility_status: eligibilityStatus,
    eligibility_reasons: eligibilityReasons,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    location_match: locationMatch,
    work_mode_match: workModeMatch,
    recommendation_score: finalRecommendationScore,
    match_reasons: matchReasons,
    actionable_recommendations: actionableRecommendations,
    target_career_alignment: {
      target_role: targetCareerTitle,
      aligned,
    },
  };
}
