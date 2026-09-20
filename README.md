# Skill2Career 🧭

**AI/ML-Powered Skill-to-Career Intelligence & Strategic Trajectory Platform**

Skill2Career is a production-grade, evidence-grounded career intelligence platform that analyzes a student's evolving skill state, evaluates competency benchmarks using trained supervised machine learning models, executes granular skill-gap and prerequisite dependency analysis, incorporates verified external market intelligence signals, tracks longitudinal learning velocity, projects competency growth trajectories, and models strategic career transitions.

---

## 🌟 Key Product Modules & Intelligence Layers

1. **Student Skill Profiling & Dynamic Inventory:** Searchable taxonomy of 50+ industry technical and soft skills with 1–5 proficiency ratings, verification sources, and experience tracking.
2. **Career Role Benchmarking:** Comprehensive requirement mapping across 10 canonical tech career tracks with salary benchmarks, required proficiency levels, and importance weights.
3. **Supervised ML Job Readiness Benchmark (Phase 06):** Real-time inference using trained scikit-learn models evaluated on 5,000+ benchmark student records ($R^2 = 0.9840$, $\text{MAE} = 2.22$ score points).
4. **Career Market Intelligence & Provenance (Phase 07 & 08.2):** Macroeconomic demand signals, trend directions, and data freshness tracking backed by Tier-1 data sources (BLS, Stack Overflow, O*NET) with clear fallback indicators.
5. **Personalized Recommendations & Skill Dependency DAG (Phase 08):** Acyclic prerequisite graph ensuring valid sequencing and high-ROI multi-factor skill prioritization.
6. **Adaptive Multi-Phase Learning Roadmap (Phase 08):** Dynamic weekly study journeys structured into Foundations, Core Systems, and Capstone Validation with interactive progress tracking.
7. **Verified Learning Evidence Foundation (Phase 09A):** Cryptographically grounded evidence records (projects, certifications, assessments) tied to verified student proficiencies.
8. **Longitudinal Learning Intelligence & Trajectory (Phase 09B):** Point-in-time snapshots tracking learning velocity, study consistency streaks, stagnation risks, and skill progression momentum.
9. **Evidence-Grounded Career Readiness Synthesis (Phase 09C):** Multi-dimensional alignment analysis explaining why a student is progressing, what remains missing, and which evidence validates each evaluation.
10. **Longitudinal Career Forecasting & What-If Scenarios (Phase 10):** Multi-horizon competency projections (30, 60, 90, 180 days) with bottleneck detection, time-to-target estimations, and in-memory isolated scenario simulations.
11. **Strategic Career Transition Analysis (Phase 11):** Cross-career mobility intelligence identifying transferable skills, remediation gaps, prerequisite chains, and milestone pathways with factual multi-career comparisons.
12. **Grounded AI Career Coaching:** Conversational and structured guidance grounded strictly in verified backend telemetry and ML predictions with 100% deterministic offline fallback.

---

## 🏗️ System Architecture

```
Skill2Career/
├── backend/
│   ├── config.py                 # Pydantic v2 application settings & environment variables
│   ├── main.py                   # FastAPI application entrypoint & lifespan management
│   ├── data/                     # Benchmark datasets, taxonomies, and dataset validator
│   │   ├── skills_taxonomies.csv
│   │   ├── career_roles_skills.csv
│   │   ├── student_profiles_training.csv
│   │   └── learning_trajectory_training.csv
│   ├── database/                 # MongoDB async client, indexes, and idempotent seeder
│   │   ├── mongodb.py
│   │   ├── indexes.py
│   │   └── seed.py
│   ├── ml/                       # Scikit-Learn training pipelines, feature schemas & artifacts
│   │   ├── artifacts/            # readiness_pipeline.joblib, trajectory_forecaster.joblib
│   │   ├── gap_analyzer.py
│   │   ├── inference.py
│   │   └── train.py
│   ├── schemas/                  # Type-safe Pydantic request/response schemas
│   ├── services/                 # Business logic, intelligence engines, and AI context builders
│   │   ├── auth_service.py
│   │   ├── ai_service.py
│   │   ├── ai_context_builder.py
│   │   ├── market_intelligence_service.py
│   │   ├── dependency_service.py
│   │   ├── recommendation_service.py
│   │   ├── adaptive_roadmap_service.py
│   │   ├── evidence_service.py
│   │   ├── evidence_aggregation_service.py
│   │   ├── learning_intelligence_service.py
│   │   ├── career_readiness_service.py
│   │   ├── career_forecast_service.py
│   │   └── career_transition_service.py
│   ├── routers/                  # Modular FastAPI routers
│   └── tests/                    # Comprehensive Pytest test suite (182+ tests)
├── frontend/                     # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── api/client.ts         # Axios client with JWT interceptors
│   │   ├── context/AuthContext.tsx # User session & profile state
│   │   ├── components/           # Reusable UI cards, gauges, charts, skeletons, navigation
│   │   ├── pages/                # 23 student portal views and dashboards
│   │   ├── App.tsx               # Client-side router configuration
│   │   └── index.css             # Glassmorphism dark modern design tokens
│   ├── package.json
│   ├── nginx.conf                # Nginx SPA routing fallback for Docker
│   └── vite.config.ts
├── Procfile                      # PaaS production command (Render / Railway / Heroku)
├── docker-compose.yml            # Multi-container orchestration (Backend + Frontend + MongoDB)
├── backend.Dockerfile            # Python 3.11 backend container
├── .env.example                  # Documented environment configuration template
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python:** 3.11+
- **Node.js:** v18+ (Node 20/22 recommended)
- **MongoDB:** Local instance on `mongodb://localhost:27017` or MongoDB Atlas URI

### 2. Backend Setup
```bash
# In repository root:
python -m venv env
# Windows:
env\Scripts\activate
# Unix/macOS:
source env/bin/activate

# Install dependencies:
pip install -r backend/requirements.txt

# Run database seeder (seeds taxonomies, market signals, DAG, and demo student):
python -m backend.database.seed

# Start backend server:
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API interactive documentation will be available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Account Credentials

- **Email:** `demo@skill2career.com`
- **Password:** `Password123!`
*(Or click the "Use Demo Student Account" button on the Login page for 1-click access)*

---

## 🧪 Testing & Validation

### Backend Full Regression Suite (182 Tests)
```bash
python -m pytest backend/tests -v
```

### Backend Compilation Check
```bash
python -m compileall backend
```

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 🐳 Docker Deployment

To launch the full production-ready stack with Docker Compose:
```bash
docker-compose up --build -d
```
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000`
- **Health Check:** `http://localhost:8000/api/health`

---

## ⚙️ Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PROJECT_NAME` | Application name | `Skill2Career` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `skill2career-super-secret-key-2026` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Session validity duration | `1440` (24 hours) |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DATABASE` | MongoDB database name | `skill2career` |
| `GEMINI_API_KEY` | Optional Google Gemini API key for enhanced LLM narratives | `""` (Uses deterministic offline fallback) |
| `AI_PROVIDER` | AI provider selection (`auto`, `gemini`, `openai`, `fallback`) | `auto` |
| `VITE_API_BASE_URL` | Frontend API client base URL | `http://localhost:8000/api/v1` |

---

## 🔬 Scientific & Ethical Integrity Constraints

1. **Competency Benchmark vs. Employment Probability:** The ML readiness score is a synthetic competency benchmark based on demonstrated skills, coursework, projects, and learning velocity. It is **never** described as an employment probability, hiring guarantee, or job offer prediction.
2. **Model Error Margins:** Uncertainty is represented as an empirical model residual error margin ($\pm 2.2$ score points based on validation/test MAE), never falsely labeled as a 95% statistical confidence interval.
3. **Zero Hidden Composite Scoring:** Skill gaps, learning velocities, market demand, and transition effort remain independent transparent dimensions. No hidden composite index or ungrounded career ranking is generated.
4. **State Immutability in Simulations:** What-if scenario forecasting and transition simulations operate in-memory on deep-copied state and cannot mutate the student's authoritative database profile or historical records.
5. **Multi-Tenant Security:** All protected endpoints enforce token authentication and tenant boundaries. Cross-student data tampering is strictly prohibited.

---

## 📄 License
MIT License. Built for students, universities, and educational institutions.
