# Skill2Career — Career Forecasting & Scenario Intelligence Specification (Phase 10)

## 1. System Architecture & Core Principles

The **Career Forecasting & Scenario Intelligence Engine** extends Skill2Career's intelligence architecture (Phases 06 through 09C) by enabling students to explore longitudinal readiness trajectories, identify competency bottlenecks, estimate bounded time-to-target horizons, and execute in-memory what-if scenario simulations.

```mermaid
flowchart TD
    SP[Student Profile & Skills] --> CF_SVC[Career Forecast Engine]
    LE[Learning Evidence Ledger] --> CF_SVC
    LI[Learning Intelligence Engine] --> CF_SVC
    CR[Career Readiness Analyzer] --> CF_SVC
    DEP[Skill Dependency DAG] --> CF_SVC
    MI[Market Intelligence] --> CF_SVC
    ML[Authoritative ML Pipelines] --> CF_SVC

    CF_SVC --> SG[Skill Growth Projections [1.0, 5.0]]
    CF_SVC --> BN[Competency Bottleneck Discovery]
    CF_SVC --> TT[Time-to-Target Estimations]
    CF_SVC --> SIM[In-Memory Scenario Simulator]
    CF_SVC --> CMP[Multi-Scenario Comparison Matrix]
```

### Core Design Rules & Guardrails
1. **Authoritative ML Model Invariance**: Phase 06 readiness and trajectory models (`readiness_pipeline.joblib`, `trajectory_pipeline.joblib`) and their 13 canonical features are strictly immutable.
2. **Deterministic Bounded Skill Projections**: Longitudinal skill growth is derived from historical velocity ($0.0 - 5.0$ index) and study hours, strictly clamped to $[0.0, 5.0]$.
3. **No Synthetic State Mutations**: Scenario simulations (`INCREASED_CONSISTENCY`, `GAP_FOCUSED`, `CUSTOM`) run strictly in-memory without altering student profile, creating fake evidence, or modifying learning roadmaps.
4. **Transparent Uncertainty**: Surfacing clear uncertainty categories (`LOW`, `MEDIUM`, `HIGH`, `INSUFFICIENT_DATA`) and $[CI_{low}, CI_{high}]$ confidence intervals.
5. **No Employment Guarantees**: Time-to-target estimations evaluate competency acquisition time (e.g. "8–12 weeks") under explicit pace assumptions; they never claim or guarantee employment/hiring outcomes.

---

## 2. Mathematical Modeling & Algorithms

### 2.1 Longitudinal Skill Growth Projection
Let $S_i$ be the $i$-th required skill for target career $C$, with current proficiency $L_i \in [0.0, 5.0]$ and target proficiency $T_i \in [1.0, 5.0]$.
Let $V \in [0.5, 5.0]$ be the observed or simulated learning velocity index, and $H \in \{30, 60, 90, 180\}$ be the forecast horizon in days.

The monthly baseline progression capacity $G_{base}$ is defined as:
$$G_{base} = \max\left(0.15, \frac{V}{5.0} \times 0.45\right)$$

For focus/remediation skills in scenario $\mathcal{S}$, a multiplier $\mu_{skill}$ is applied:
$$\mu_{skill} = \begin{cases} 1.50 & \text{if } S_i \in \text{FocusSet}(\mathcal{S}) \\ 0.85 & \text{otherwise} \end{cases}$$

The projected proficiency $L_{i}'$ over $H$ days ($M = H/30$ months) is:
$$\Delta L_i = \min\left(T_i - L_i, G_{base} \times \mu_{skill} \times M\right)$$
$$L_{i}' = \text{clip}(L_i + \Delta L_i, 1.0, 5.0)$$

### 2.2 Competency Bottleneck Detection
A competency $S_i$ is classified as a bottleneck if $T_i - L_i > 0$ and any of the following deterministic criteria are met:
1. **`PREREQUISITE_BLOCKER`** (CRITICAL): Downstream skill has unfulfilled prerequisite competencies in the dependency DAG.
2. **`HIGH_SKILL_GAP`** (HIGH): Role importance $\ge 0.70$ and proficiency deficit $\ge 2.5$ levels.
3. **`LOW_LEARNING_VELOCITY`** (MODERATE): Learning velocity $< 1.0/5.0$ with deficit $\ge 1.5$ levels.
4. **`STAGNATING_SKILL`** (MODERATE): No progress observed over consecutive learning snapshots.
5. **`INSUFFICIENT_EVIDENCE`** (LOW/MODERATE): Self-reported proficiency unbacked by verified assessment or project evidence.

### 2.3 Time-to-Target Estimation
Total critical competency deficit $D_{tot}$ across role skills:
$$D_{tot} = \sum_{S_i \in \text{RequiredSkills}} \max(0.0, T_i - L_i)$$

Estimated weeks range $[W_{min}, W_{max}]$:
$$W_{mid} = \text{round}\left(\frac{D_{tot}}{\max(0.4, (V / 5.0) \times 1.5)} \times 4.3\right)$$
$$W_{min} = \max(2, \lfloor W_{mid} \times 0.80 \rfloor), \quad W_{max} = \max(W_{min} + 2, \lceil W_{mid} \times 1.25 \rceil)$$

---

## 3. Scenario Intelligence

### 3.1 Predefined Canonical Scenarios
| Scenario Type | Study Hours Assumption | Velocity Multiplier | Target Focus |
|---|---|---|---|
| `CURRENT_TRAJECTORY` | Current profile hours ($12.0$h/wk) | $1.0\times$ (Observed) | Balanced curriculum |
| `INCREASED_CONSISTENCY` | $+25\%$ hours ($18.0$h/wk) | $1.35\times$ (+35% retention) | Balanced curriculum |
| `GAP_FOCUSED` | Targeted hours ($15.0$h/wk) | $1.25\times$ | Top critical bottleneck gaps |
| `CUSTOM` | User-defined slider [$5, 40$]h/wk | User-defined slider [$0.5, 2.0$]x | Selected skills |

---

## 4. API Endpoints Specification

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/career-forecast/{career_id}` | Generate or retrieve longitudinal forecast snapshot | Yes |
| `GET` | `/api/v1/career-forecast/{career_id}/bottlenecks` | Retrieve discovered competency bottlenecks | Yes |
| `GET` | `/api/v1/career-forecast/{career_id}/history` | Chronological past forecast records | Yes |
| `POST` | `/api/v1/career-forecast/{career_id}/simulate` | Run in-memory what-if scenario simulation | Yes |
| `GET` | `/api/v1/career-forecast/compare-scenarios` | Side-by-side comparison of 3 canonical scenarios | Yes |

---

## 5. Security & Isolation Verification
- **Cross-Student Isolation**: Query criteria enforce `user_id == current_user["_id"]`.
- **401 Unauthorized Rejection**: Verified on all career forecast routes.
- **Determinism**: 25 consecutive evaluation iterations on static student state yield identical mathematical scores.
