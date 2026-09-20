# Learning Intelligence & Trajectory Engine Specification (Phase 09B)

## 1. Overview
The Learning Intelligence Engine evaluates longitudinal student learning history, verified evidence, and snapshot states to compute time-normalized velocity, study consistency, stagnation diagnostics, and skill evolution metrics.

---

## 2. Core Metrics & Mathematical Formulations

### 2.1 Time-Normalized Learning Velocity
Learning velocity measures the rate of meaningful competency and evidence progression over time.

$$\Delta t = \frac{t_{\text{latest}} - t_{\text{earliest}}}{86400} \quad (\text{elapsed days})$$

**Preconditions:**
- Requires $\ge 2$ historical snapshots.
- Requires $\Delta t \ge 0.5$ days. If $\Delta t < 0.5$, status is `INSUFFICIENT_HISTORY`.

**Calculated Metrics:**
1. **Skill Progression Velocity** (points per 30-day window):
   $$V_{\text{skill}} = \left(\frac{\bar{P}_{\text{latest}} - \bar{P}_{\text{earliest}}}{\Delta t}\right) \times 30.0$$
2. **Evidence Velocity** (verified artifacts per 30-day window):
   $$V_{\text{evidence}} = \left(\frac{E_{\text{latest}} - E_{\text{earliest}}}{\Delta t}\right) \times 30.0$$
3. **Activity Velocity** (learning activities per week):
   $$V_{\text{activity}} = \left(\frac{N_{\text{activities}}}{\max(1.0, \Delta t)}\right) \times 7.0$$
4. **Overall Learning Velocity Index** ($0.0 - 5.0$ scale):
   $$V_{\text{overall}} = \text{clip}\left(\min(2.5, V_{\text{skill}} \times 2.0) + \min(1.5, V_{\text{evidence}} \times 0.5) + \min(1.0, V_{\text{activity}} \times 0.2), 0.0, 5.0\right)$$

---

### 2.2 Multi-Dimensional Study Consistency
Evaluates regularity of learning engagement across calendar days while preventing duplicate spamming.

**Formulas:**
1. **Active Learning Days ($D_{\text{active}}$):** Count of unique calendar dates ($YYYY-MM-DD$) with at least one logged learning event. Multiple events on the same date count as $1$ active day.
2. **Current Streak ($S_{\text{current}}$):** Consecutive active calendar days continuing through today or yesterday.
3. **Longest Streak ($S_{\text{longest}}$):** Maximum consecutive active calendar days achieved historically.
4. **Study Frequency ($F_{\text{week}}$):** Active days per 7-day span:
   $$F_{\text{week}} = \frac{D_{\text{active}}}{\max(7, \text{span\_days}) / 7.0}$$
5. **Consistency Score ($0.0 - 100.0$):**
   $$\text{Score} = \text{clip}\left(\min(40.0, D_{\text{active}} \times 3.5) + \min(30.0, S_{\text{longest}} \times 6.0) + \min(30.0, F_{\text{week}} \times 8.0), 0.0, 100.0\right)$$

---

### 2.3 Stagnation Diagnostics
Identifies analytical momentum and stagnation states without false positives:

| Status | Condition | Meaning |
|---|---|---|
| `INSUFFICIENT_HISTORY` | $< 2$ snapshots | Insufficient historical baseline |
| `POSSIBLE_STAGNATION` | Inactive $> 28$ days OR $\ge 20$ activities with 0 skill increases | Sustained momentum slowdown or plateau |
| `ACTIVE_PROGRESS` | Active recently ($\le 3$ days) and $\ge 1$ skill improving | Rapid forward momentum |
| `STABLE_PROGRESS` | Active recently and skills stable | Consistent competency retention |
| `RECENTLY_RESTARTED` | Inactive $> 21$ days then resumed activity in last 3 days | Resumed learning journey |

---

### 2.4 Skill Progression Classification
Evaluates individual skill delta between previous snapshot ($P_{\text{prev}}$) and current level ($P_{\text{curr}}$):

- **`INSUFFICIENT_HISTORY`**: Only 1 observation recorded.
- **`NEWLY_ACQUIRED`**: Skill absent in earlier snapshot and present in current state.
- **`IMPROVING`**: $P_{\text{curr}} - P_{\text{prev}} > +0.05$.
- **`DECLINING`**: $P_{\text{curr}} - P_{\text{prev}} < -0.05$.
- **`STABLE`**: $|P_{\text{curr}} - P_{\text{prev}}| \le 0.05$.

---

## 3. REST API Reference

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/v1/learning-intelligence/overview` | `GET` | Full learning trajectory, velocity, consistency, and progression summary | Yes |
| `/api/v1/learning-intelligence/trajectory` | `GET` | Chronological checkpoint points for plotting trajectory timeline | Yes |
| `/api/v1/learning-intelligence/velocity` | `GET` | Time-normalized velocity metrics and momentum tier | Yes |
| `/api/v1/learning-intelligence/consistency` | `GET` | Study regularity, active streaks, and weekly calendar distribution | Yes |
| `/api/v1/learning-intelligence/stagnation` | `GET` | Momentum diagnostics and recommended intervention | Yes |
| `/api/v1/learning-intelligence/skills/{skill_id}` | `GET` | Chronological level history for an individual skill | Yes |
| `/api/v1/learning-intelligence/snapshot` | `POST` | Record an immutable point-in-time learning snapshot | Yes |

---

## 4. Architectural Boundaries

1. **ML Invariance**: Learning intelligence metrics are descriptive analytics and never overwrite or inject features into `readiness_pipeline.joblib` or `trajectory_pipeline.joblib`.
2. **Trajectory Confidence vs ML Confidence**: `trajectory_confidence` represents data completeness and timestamp coverage; it is never presented as employment probability or ML model certainty.
3. **Multi-Tenant Scoping**: All database operations are filtered by authenticated `user_id` / `student_id`.
