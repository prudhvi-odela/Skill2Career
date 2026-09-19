# Learning Evidence Engine Specification (Phase 09A)

## 1. Overview
The Learning Evidence Engine provides an auditable, deterministic, and provenance-backed system for collecting, scoring, verifying, and aggregating evidence of student skill competencies across projects, assessments, certifications, and learning activities.

---

## 2. Taxonomy & Enumerations

### 2.1 Evidence Types (`EvidenceType`)
- `PROJECT`: Evidence derived from practical software repositories, completed builds, and portfolio implementations.
- `ASSESSMENT`: Evidence derived from structured quizzes, standardized skill checks, and automated problem-solving tests.
- `CERTIFICATION`: Evidence derived from accredited industry certifications or university coursework.
- `LEARNING_ACTIVITY`: Evidence derived from practice tasks, guided tutorials, or roadmap milestone completions.
- `MANUAL_VERIFICATION`: Explicit evaluation and sign-off by a mentor, instructor, or subject-matter expert.
- `PEER_REVIEW`: Structured feedback or code review from student peers.

### 2.2 Verification Status (`VerificationStatus`)
- `UNVERIFIED`: Self-reported or logged without automated/manual validation.
- `SYSTEM_VERIFIED`: Automatically validated by internal test runners, quiz evaluation engines, or system-tracked project completions.
- `MANUALLY_VERIFIED`: Confirmed by an authorized instructor or human reviewer.
- `REJECTED`: Invalidated or flagged as insufficient. Excluded from proficiency aggregation.
- `EXPIRED`: Time-bounded credential whose validity period has elapsed.

### 2.3 Evidence Strength (`EvidenceStrength`)
- `WEAK`: Low evidentiary confidence (score $< 60.0$).
- `MODERATE`: Moderate evidentiary confidence ($60.0 \le \text{score} < 80.0$).
- `STRONG`: High evidentiary confidence ($80.0 \le \text{score} < 90.0$).
- `VERY_STRONG`: Exceptional evidentiary confidence ($\text{score} \ge 90.0$).

---

## 3. Heuristic Scoring Formulas

### 3.1 Base Scores by Evidence Type
1. **Assessment**:
   $$\text{Base Score} = \min(100.0, \max(0.0, \text{score\_percentage}))$$
   - If $\text{score} \ge 85\%$ and passed: Strength = `VERY_STRONG` ($\ge 90$).
   - If $\text{score} \ge 70\%$ and passed: Strength = `STRONG` ($80$).
   - If passed: Strength = `MODERATE` ($65$).
   - Failed assessment: Strength = `WEAK` ($35$).

2. **Project**:
   - Complexity $\ge 4.0$ with Repository: `STRONG` ($85.0$).
   - Complexity $\ge 3.0$: `STRONG` ($75.0$).
   - Complexity $\ge 2.0$: `MODERATE` ($60.0$).
   - Basic project ($< 2.0$): `WEAK` ($40.0$).

3. **Certification**:
   - Accredited / Verified issuer: `STRONG` ($80.0$).
   - Self-reported documentation: `MODERATE` ($58.0$).

4. **Learning Activity**:
   - Hours spent $\ge 5.0$ or project-based activity: `MODERATE` ($62.0$).
   - Short practice session ($< 5$ hours): `WEAK` ($35.0$).

5. **Manual Verification**:
   - Instructor / Faculty endorsement: `VERY_STRONG` ($95.0$).
   - General peer/mentor verification: `STRONG` ($80.0$).

### 3.2 Aggregation & Observed Proficiency Formula
When aggregating multiple evidence items $i \in \{1 \dots n\}$ for a skill:
$$\text{Observed Proficiency} = \frac{\sum_{i=1}^n w_i \cdot p_i}{\sum_{i=1}^n w_i}$$

Where weights $w_i$ are assigned according to evidence strength:
- $w_{\text{VERY\_STRONG}} = 1.0$
- $w_{\text{STRONG}} = 0.7$
- $w_{\text{MODERATE}} = 0.4$
- $w_{\text{WEAK}} = 0.2$

*Note: Rejected evidence items are excluded ($w_{\text{REJECTED}} = 0$).*

The final aggregated evidence score includes a $+15.0$ point bonus if at least one item is verified:
$$\text{Aggregated Score} = \min\left(100.0, \bar{S}_{\text{weighted}} + 15.0 \cdot \mathbb{I}(\text{verified\_count} > 0)\right)$$

---

## 4. REST API Reference

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/v1/evidence` | `GET` | Retrieve student's evidence records (with filter support) | Yes (Student) |
| `/api/v1/evidence/summary` | `GET` | Aggregate student evidence portfolio summary & stats | Yes (Student) |
| `/api/v1/evidence/skills/{skill_id}` | `GET` | Evidence breakdown for a specific skill | Yes (Student) |
| `/api/v1/evidence/skills/{skill_id}/history` | `GET` | Chronological evidence timeline for a skill | Yes (Student) |
| `/api/v1/evidence` | `POST` | Record a new validated evidence item | Yes (Student) |
| `/api/v1/evidence/{evidence_id}/verify` | `POST` | Update verification status or submit evaluator notes | Yes (Student/Admin) |
| `/api/v1/evidence/skills/{skill_id}/apply-state` | `POST` | Update student profile skill level from verified evidence | Yes (Student) |
| `/api/v1/evidence/sync-artifacts` | `POST` | Automatically discover and index evidence from student artifacts | Yes (Student) |

---

## 5. Architectural Boundaries & Provenance

1. **State Boundary**: Evidence records do not modify ML model weights or feature extractors directly.
2. **Profile Boundary**: When `apply-state` is invoked, the verified aggregated proficiency is written to `student_profiles.skills` and flagged with `verified: true`.
3. **Inference Boundary**: The standard `MLInferenceService` calculates readiness and trajectory predictions based on the updated profile state through the 13 canonical features.
4. **LLM Context Grounding**: The AI Career Intelligence layer receives a dedicated `evidence_engine` block in its prompt context and must adhere to grounded evidence claims.
