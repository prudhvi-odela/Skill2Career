// Branch Career Roles Knowledge Base for Skill2Career
// Strictly structured so that for each chosen branch, ONLY its respective career goals appear.

import { getAllCareerGoals, getCareerGoalsForBranch, normalizeBranchCode } from './careerGoalsHierarchy';
import type { CareerGoalDefinition } from './careerGoalsHierarchy';

export interface BranchCareerRole {
  career_id: string;
  id?: string;
  career_title: string;
  title: string;
  domain: string;
  category: string;
  branch_codes: string[];
  description: string;
  min_exp_years: number;
  avg_salary_usd: number;
  market_demand: 'Extremely High' | 'High' | 'Steady' | 'Explosive Growth';
  key_workflows: string[];
  required_skills: {
    skill_id: string;
    skill_name: string;
    required_level: number;
    importance: number;
    is_core: boolean;
  }[];
}

function goalToRole(g: CareerGoalDefinition): BranchCareerRole {
  return {
    career_id: g.id,
    id: g.id,
    career_title: g.title,
    title: g.title,
    domain: g.branch_name,
    category: g.category,
    branch_codes: [g.branch_code],
    description: g.description,
    min_exp_years: g.min_exp_years,
    avg_salary_usd: g.avg_salary_usd,
    market_demand: g.market_demand,
    key_workflows: g.roadmap_stages.map(s => `${s.title}: ${s.focus_skills.join(', ')}`),
    required_skills: g.required_skills.map(s => ({
      skill_id: s.skill_id,
      skill_name: s.skill_name,
      required_level: s.required_level,
      importance: s.importance,
      is_core: s.priority === 'Critical'
    }))
  };
}

// Master list of all roles generated directly from the structured hierarchy
export const ALL_CAREER_ROLES: BranchCareerRole[] = getAllCareerGoals().map(goalToRole);

/**
 * Returns strictly and exclusively the career roles for a specific branch.
 * Example: for 'CSE', returns ONLY ['Software Engineer', 'Full-Stack Developer', 'Backend Developer', 'System Engineer', 'Application Developer']
 */
export function getCareersForBranch(branchCode?: string): BranchCareerRole[] {
  if (!branchCode || branchCode === 'All' || branchCode === 'All Disciplines') {
    return ALL_CAREER_ROLES;
  }
  const goals = getCareerGoalsForBranch(branchCode);
  return goals.map(goalToRole);
}
