# Skill2Career — Career Readiness & Adaptive Forecasting Specification (Phase 09C)

**Version**: 1.0.0  
**Phase**: PHASE_09C  
**Status**: Production & Verified  
**Target Engine**: Evidence-Grounded Career Readiness & Adaptive Career Forecasting  

---

## 1. Executive Summary & Purpose

Phase 09C introduces an **evidence-grounded career interpretation layer** that synthesizes the student's authoritative skill state, verified learning evidence (Phase 09A), longitudinal learning intelligence (Phase 09B), canonical career requirements, external market intelligence (Phase 07/08.2), and existing ML inference predictions (Phase 06) into a multi-dimensional, transparent readiness analysis.

The system explains:
1. *Why* a student is progressing toward a selected career role.
2. *What* competency deficits remain missing.
3. *How* their learning trajectory and study momentum are evolving over time.
4. *Which* empirical evidence artifacts substantiate each strength and gap.

### Critical System Boundaries
- **No Unexplained Composite Metric**: Every dimension (ML readiness benchmark, skill alignment %, verified evidence ratio, trajectory momentum, market demand index) remains individually visible and interpretable.
- **ML Boundary Preservation**: The existing ML models (`readiness_pipeline.joblib`, `trajectory_pipeline.joblib`) and the 13 canonical features remain 100% frozen, authoritative, and unmutated.
- **Mastered Skills Policy**: Already-mastered competencies ($gap \le 0$) are excluded from actionable remediation.
- **Zero Employment Guarantee**: The engine produces observational competency evaluations, strictly prohibiting employment or hiring probability claims.

---

## 2. Target Architecture & Information Flow

```
+-----------------------------------------------------------------------------------+
|                              STUDENT PROFILE & ARTIFACTS                         |
|  - Authoritative Skills  - Projects Repository  - Assessments  - Certifications   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------+   +-----------------------+   +--------------------------+
|  SKILL EVIDENCE (09A) |   | LEARNING INTELL. (09B)|   |   MARKET INTELL. (07/08) |
|  - Verified Ledgers   |   | - Velocity (0-5.0)    |   | - Industry Demand Index  |
|  - Coverage Ratios    |   | - Consistency & Streak|   | - Freshness & Provenance |
|  - Rejection Tracking |   | - Stagnation Status   |   | - Neutral Fallback Flags |
+-----------------------+   +-----------------------+   +--------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|               PHASE 09C CAREER READINESS & ADAPTIVE FORECASTING ENGINE            |
|  - Authoritative ML Benchmark (Frozen Random Forest/Linear Regression)           |
|  - Canonical Role Requirement Alignment (Gap Analyzer Matrix)                     |
|  - Multi-Source Evidence Ledger Alignment                                          |
|  - Evidence-Backed Strengths & Prioritized Gaps                                   |
|  - Categorized Readiness Factors (Positive vs Limiting)                            |
|  - Actionable Remediation Roadmap (Mapped to Adaptive Recommendations)            |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+------------------------------------+      +---------------------------------------+
|  FastAPI REST API (/api/v1/career- |      | Grounded AI Assistant (Principle 8)   |
|  readiness/*)                      |      | Explains without hallucinating scores |
+------------------------------------+      +---------------------------------------+
```

---

## 3. Core Component Specifications

### 3.1 ML Readiness Benchmark
- **Source**: Directly from `MLInferenceService` / `readiness_predictions`.
- **Fields**:
  - `readiness_score`: float (5.0 - 99.0%)
  - `readiness_tier`: e.g., "Job Ready", "Strong Candidate", "Developing", "Early Stage"
  - `confidence_margin`: Model test MAE (e.g., $\pm 2.2\%$)
  - `model_version`: e.g., `v1.0.0-production`
  - `model_algorithm`: e.g., `LinearRegression`

### 3.2 Canonical Skill Alignment
- **Source**: `SkillGapAnalyzer` comparing student profile against canonical `career_roles` requirements.
- **Fields**:
  - `required_skill_count`: Total role requirements
  - `covered_skill_count`: Demonstrated skills ($proficiency > 0$)
  - `proficient_skill_count`: Mastered skills ($proficiency \ge target$)
  - `missing_skill_count`: Unobserved skills ($proficiency = 0$)
  - `coverage_percentage`: $covered / required \times 100$
  - `average_requirement_gap`: Mean proficiency deficit across required skills

### 3.3 Evidence Coverage Ledger
- **Source**: `EvidenceAggregationService` and direct query on `skill_evidence`.
- **Distinction of States**:
  - `SYSTEM_VERIFIED`, `ASSESSMENT_VERIFIED`, `MANUALLY_VERIFIED`: Contributes to `verified_evidence_count` and verified skill coverage.
  - `UNVERIFIED`: Tracked separately as self-reported evidence.
  - `REJECTED`: Contributes 0 and is explicitly flagged.
- **Metrics**:
  - `career_relevant_skills_with_verified_evidence`
  - `career_relevant_skills_without_verified_evidence`
  - `evidence_coverage_ratio`: $verified\_skills / total\_required\_skills$
  - `coverage_evaluation`: "Well Grounded" ($\ge 0.70$), "Moderately Backed" ($\ge 0.40$), or "Developing Evidence" ($< 0.40$)

### 3.4 Longitudinal Trajectory Integration
- **Source**: `LearningIntelligenceService` (Phase 09B).
- **Fields**:
  - `trajectory_direction`: `ACCELERATING`, `STEADY`, `DECELERATING`, `STAGNANT`, or `INSUFFICIENT_HISTORY`
  - `overall_learning_velocity`: $0.0 - 5.0$ normalized index
  - `consistency_score`: $0.0 - 100.0\%$ calendar study regularity
  - `current_streak_days`: Contiguous active study days
  - `stagnation_status`: `ACTIVE_PROGRESS`, `STABLE_PROGRESS`, or `POSSIBLE_STAGNATION`
  - `top_improving_skills`: List of competencies demonstrating positive progression deltas

### 3.5 External Market Alignment
- **Source**: `MarketIntelligenceService` (Phase 07/08.2).
- **Fields**:
  - `demand_score`: $0.0 - 100.0$ index
  - `trend_direction`: `growing`, `stable`, `declining`, or `unobserved`
  - `market_signal_status`: `OBSERVED`, `STALE`, `EXPIRING_SOON`, or `FALLBACK_UNAVAILABLE`
  - `is_fallback`: Boolean indicating whether neutral baseline benchmark (75.0) was applied
  - `market_source`: Authoritative external source title

### 3.6 Multi-Artifact Alignment
- **Projects**: Filtered by student ID, mapped to career-relevant technologies, with complexity ratings and code repository links.
- **Assessments**: Pass rates, scores, and verified evaluation dates.
- **Certifications**: Verified vs unverified credentials mapped to required skills.

### 3.7 Categorized Readiness Factors
Factors are classified across 7 categories:
1. `SKILL_ALIGNMENT`
2. `EVIDENCE_COVERAGE`
3. `LEARNING_TRAJECTORY`
4. `PROJECT_EXPERIENCE`
5. `ASSESSMENT_SUPPORT`
6. `CERTIFICATION_SUPPORT`
7. `MARKET_ALIGNMENT`

Each factor declares an `impact_type` (`POSITIVE`, `LIMITING`, or `NEUTRAL`), detailed narrative, and empirical `evidence_source`.

### 3.8 Actionable Next Steps
- Reuses `RecommendationService` priority scores ($0.30 \times Gap + 0.25 \times Career + 0.20 \times Market + 0.15 \times Dependency + 0.10 \times Feasibility$).
- Mastered skills are excluded.
- Actions specify an `action_type` (`STUDY_MODULE`, `PROJECT_BUILD`, `ASSESSMENT_VERIFICATION`, or `PREREQUISITE_STUDY`), effort level, and estimated hours.

---

## 4. API Specification

| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/career-readiness/{career_id}` | Full career readiness analysis | Authenticated JWT |
| `GET` | `/api/v1/career-readiness/{career_id}/strengths` | Verified career strengths | Authenticated JWT |
| `GET` | `/api/v1/career-readiness/{career_id}/gaps` | Prioritized competency gaps | Authenticated JWT |
| `GET` | `/api/v1/career-readiness/{career_id}/evidence` | Multi-artifact evidence alignment | Authenticated JWT |
| `GET` | `/api/v1/career-readiness/compare?career_ids=...` | Multi-career side-by-side comparison | Authenticated JWT |

---

## 5. Security & Multi-Tenant Isolation

- All endpoints validate JWT authorization through `get_current_user`.
- Student ID is extracted from server-validated credentials.
- Cross-student access is impossible.
- Invalid career IDs return `404 Not Found`.

---

## 6. Grounded AI Integration (Principle 8)

The Grounded AI system incorporates `career_readiness` context. Under Principle 8:
- The AI synthesizes skill alignment, verified evidence coverage, trajectory momentum, and external market signals.
- The AI explains why specific skills are critical and what actions to take.
- The AI is strictly prohibited from fabricating prediction percentages or claiming guaranteed hiring outcomes.
