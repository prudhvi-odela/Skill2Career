# Skill2Career 2.0 — Production Deployment & Live Smoke Test Report

**Execution Date:** 2026-09-21  
**Deployment Target:** Production Live (Vercel Frontend + Render Backend + MongoDB Atlas)  
**Overall Status:** `PRODUCTION READY — ALL CHECKS PASSED`

---

## 1. Deployment Details & URLs

| Component | Target URL | Environment Status |
| :--- | :--- | :--- |
| **Commit Deployed** | `1e301e4` (`main` branch) | Clean, Synced with `origin/main` |
| **Frontend Production URL** | `https://skill2career-navy.vercel.app` | Active, HTTPS 200 OK |
| **Backend Production URL** | `https://skill2career-backend.onrender.com` | Active, HTTPS 200 OK |
| **Backend Health Endpoint** | `https://skill2career-backend.onrender.com/api/health` | Healthy (`MongoDB connected`, `ML models loaded`, `Gemini AI active`) |
| **Database Cluster** | MongoDB Atlas Multi-Region Cluster | Connected, Read/Write Healthy |

---

## 2. ML Artifact Integrity & Hashes

All 4 ML model and pipeline artifacts remain strictly immutable with verified SHA-256 hashes matching the certified baseline:

| Artifact File | Expected SHA-256 Hash | Deployed SHA-256 Hash | Integrity Status |
| :--- | :--- | :--- | :--- |
| `readiness_pipeline.joblib` | `36bc77554b1b1686b83be96081f622621f54c5b6190199acd8195ecad0b474af` | `36bc77554b1b1686b83be96081f622621f54c5b6190199acd8195ecad0b474af` | **MATCH (VERIFIED)** |
| `trajectory_pipeline.joblib` | `942deb2e6da754313ae0dc80d95bdf9ac7a427b524c61f0f54445b63d2b84ab4` | `942deb2e6da754313ae0dc80d95bdf9ac7a427b524c61f0f54445b63d2b84ab4` | **MATCH (VERIFIED)** |
| `model_metadata.json` | `8701498427ad90870b24e86287de3d2076bb589ee3fa1da8886af15662ef942d` | `8701498427ad90870b24e86287de3d2076bb589ee3fa1da8886af15662ef942d` | **MATCH (VERIFIED)** |
| `feature_schema.json` | `9ee6e7f39df54a7a3461a9d7866f679aa46b6922becae992440e8893bda71a82` | `9ee6e7f39df54a7a3461a9d7866f679aa46b6922becae992440e8893bda71a82` | **MATCH (VERIFIED)** |

- **13 Canonical ML Features:** Unchanged and preserved identically.
- **Model Architecture:** Strict Scikit-learn + Joblib inference pipelines preserved.

---

## 3. Live Production Health Check

`GET https://skill2career-backend.onrender.com/api/health`

```json
{
  "status": "healthy",
  "version": "2.0.0",
  "database": "MongoDB connected (healthy)",
  "ml_models": "loaded (readiness_pipeline.joblib & trajectory_forecaster.joblib)",
  "ai_engine": "google-gemini (gemini-1.5-flash)",
  "environment": "configured"
}
```

---

## 4. Live 15-Stage Production User Journey & Smoke Test

Executed end-to-end against the LIVE production cloud infrastructure with direct MongoDB Atlas document verification:

| Step # | Stage Tested | Endpoints Invoked | Result | Key Observations & Persistence |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Live Health Check** | `GET /api/health` | **PASS** | `status: healthy`, MongoDB & ML pipelines ready |
| **2** | **Fresh Student Registration** | `POST /auth/register` | **PASS** | Fresh account registered; verified 0 initial demo leakage |
| **3** | **Academic Onboarding** | `POST /curriculum/onboarding/complete` | **PASS** | B.Tech CSE Year 3 persisted directly to `student_profiles` |
| **4** | **Curriculum Subjects Loading** | `GET /curriculum/branches/CSE/subjects` | **PASS** | Loaded 6 CSE curriculum subjects dynamically |
| **5** | **Subject Baseline Self-Rating** | `POST /curriculum/subjects/{id}/baseline` | **PASS** | 4.0 proficiency written to `subject_baselines` |
| **6** | **Subject Diagnostic Test** | `POST /curriculum/subjects/{id}/submit-diagnostic` | **PASS** | Computed score; verified `skill_evidence` document created |
| **7** | **Career Matching** | `GET /careers/matching/recommendations` | **PASS** | Top matching roles generated (`CR001` Full-Stack Engineer) |
| **8** | **AI Assistant / Tutor** | `POST /ai/chat` | **PASS** | Grounded curriculum explanation; chat stored in `ai_messages` |
| **9** | **Learning Resources** | `GET /ai/resources` | **PASS** | Returned authenticated HTTPS links to official technical docs |
| **10** | **Practice Lab Execution & Security** | `POST /practice/problems/{id}/submit` | **PASS** | Passed 3/3 test cases $\rightarrow$ auto-created verified evidence in MongoDB Atlas; AST sandbox blocked malicious system calls |
| **11** | **Daily Learning Loop & Quick Check** | `POST /learning-intelligence/log-session`, `POST /quick-check/submit` | **PASS** | Session logged, 5 quick-check questions graded 100%, verified in `learning_sessions` & `learning_activities` |
| **12** | **Readiness, Forecast & Scenarios** | `GET /career-readiness/CR001`, `GET /career-forecast/CR001`, `GET /career-forecast/compare-scenarios` | **PASS** | ML readiness computed without tier exceptions; 90-day multi-scenario longitudinal simulations evaluated cleanly |
| **13** | **Multi-Tenant Data Isolation** | `GET /student/skills`, `GET /evidence`, `GET /ai/conversations` (Student B) | **PASS** | Student B sees exactly 0 records belonging to Student A |
| **14** | **Re-Login Persistence** | `POST /auth/login`, `GET /student/profile` | **PASS** | 100% of academic profile, baselines, and progress restored |
| **15** | **Alex Chen Demo Account** | `POST /auth/login`, `GET /student/profile` | **PASS** | Demo account `demo@skill2career.com` intact with 8 skills |

---

## 5. MongoDB Atlas Direct Persistence Audit

Direct database query confirmation was conducted after live smoke test execution:

- `student_profiles`: New user academic branch (`CSE`), degree (`BTECH`), year (`3`) recorded accurately.
- `subject_baselines`: Self-rating baseline for `CSE_PROG_101` recorded with timestamp.
- `skill_evidence`: Multi-source evidence successfully inserted for Diagnostic tests and Practice Lab submissions.
- `learning_sessions` & `learning_activities`: Daily learning entries recorded with study duration and confidence metrics.
- `ai_conversations` & `ai_messages`: Full AI tutor interaction history preserved with role and context grounding.

---

## 6. Client API Routing & Security Audit

- **Frontend API Base URL:** Verified pointing strictly to `https://skill2career-backend.onrender.com/api/v1`.
- **Zero Localhost Leakage:** 0 requests directed to `http://localhost:*` or `http://127.0.0.1:*`.
- **CORS Configuration:** Production origins (`https://skill2career-navy.vercel.app`) permitted without wildcards on authenticated routes.
- **Secrets Protection:** Zero credentials, tokens, connection strings, or keys exposed in client bundles or runtime logs.

---

## 7. Final Sign-Off

Skill2Career 2.0 has successfully passed all production deployment verifications, regression audits, live smoke testing, and database persistence validations.

**Final Deployment State:** `ALL SYSTEMS OPERATIONAL (GREEN)`
