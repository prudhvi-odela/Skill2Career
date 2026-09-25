import { GoogleGenAI } from '@google/genai';

// Lazy Gemini AI Client initialization
let aiClient: GoogleGenAI | null = null;
let aiClientFailed = false;

function getValidApiKey(): string | null {
  const possibleKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.VITE_GEMINI_API_KEY
  ];

  for (const k of possibleKeys) {
    if (k && typeof k === 'string') {
      const trimmed = k.trim();
      if (trimmed.length > 15 && !trimmed.toLowerCase().includes('placeholder') && !trimmed.startsWith('AQ.')) {
        return trimmed;
      }
    }
  }
  return null;
}

export function getAI(): GoogleGenAI | null {
  if (aiClientFailed) return null;
  if (!aiClient) {
    try {
      const apiKey = getValidApiKey();
      if (apiKey) {
        aiClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'skill2career-ai-engine'
            }
          }
        });
      }
    } catch (e) {
      console.warn('GoogleGenAI initialization skipped or failed:', e);
      aiClientFailed = true;
      aiClient = null;
    }
  }
  return aiClient;
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 20000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export interface ChatContext {
  query: string;
  branch?: string;
  subject?: string;
  role?: string;
  history?: Array<{ role: string; content?: string; message?: string; text?: string }>;
}

export async function generateEngineeringAIResponse(context: ChatContext): Promise<string> {
  const { query, branch, subject, role, history } = context;
  const activeBranch = branch || 'Computer Science (CSE)';
  const activeRole = role || 'Software Engineer';
  const activeSubject = subject || 'Core Computer Science & Engineering';

  // 1. Try real Gemini API if client available
  const ai = getAI();
  if (ai) {
    try {
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-8)) {
          const itemText = item.content || item.message || item.text;
          if (!itemText) continue;
          const roleKey = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';
          contents.push({
            role: roleKey,
            parts: [{ text: String(itemText).trim() }]
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: query }]
      });

      const systemInstruction = `You are Skill2Career Universal AI Engineering & Educational Mentor, an elite, comprehensive conversational tutor and advisor across ALL engineering branches (Computer Science, Electronics & Communication, Mechanical, Civil, Electrical, Chemical, Biotechnology, Aerospace, Robotics, and Data Science).

Active Student Context:
- Discipline / Branch: ${activeBranch}
- Focus Subject / Topic: ${activeSubject}
- Target Career Role: ${activeRole}

Educational & Conversational Guidelines:
1. Provide rich, deep, and conversational answers just like ChatGPT or Gemini across ANY engineering discipline.
2. If asked about an engineering concept or theory (like Python, DSA, System Design, Rankine cycles, VLSI, etc.), explain the physical intuition, mathematical governing principles, practical code snippets or equations, and real-world industrial relevance.
3. If asked for preparation advice or links, provide curated high-value learning roadmaps, official documentation links, top practice platforms (LeetCode, NeetCode, GitHub repos, Real Python), and clear week-by-week milestones.
4. If asked for formula derivations or mathematical problems, provide step-by-step proofs with clear notation, boundary conditions, and units.
5. If asked about lab/simulation software (MATLAB, Simulink, ANSYS, SolidWorks, AutoCAD, ETABS, Revit, Cadence, Aspen Plus, ROS2, PyTorch, Docker, etc.), provide clear step-by-step software workflows.
6. If asked for resume advice, formulate high-impact Google STAR / X-Y-Z bullet points tailored specifically to their engineering branch.
7. Format responses cleanly with GitHub Markdown headers, code blocks with syntax highlighting, and bullet points.`;

      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
      for (const modelCandidate of candidateModels) {
        try {
          const response = await withTimeout(
            ai.models.generateContent({
              model: modelCandidate,
              contents,
              config: {
                systemInstruction,
                temperature: 0.7,
              }
            }),
            18000
          );

          if (response && response.text && response.text.trim().length > 0) {
            return response.text.trim();
          }
        } catch (mErr: any) {
          console.warn(`Model ${modelCandidate} failed:`, mErr?.message || mErr);
        }
      }
    } catch (err: any) {
      console.error('Gemini Chat error:', err?.message || err);
    }
  }

  // 2. Intelligent Multi-Domain Fallback Reasoning Engine
  return generateGroundedResponse(query, activeBranch, activeRole, activeSubject);
}

function generateGroundedResponse(query: string, branch: string, role: string, subject: string): string {
  const q = query.toLowerCase().trim();

  // ── PYTHON & PYTHON PREPARATION / ROADMAP ──
  if (q.includes('python') || (q.includes('py') && (q.includes('explain') || q.includes('learn') || q.includes('prepare') || q.includes('link')))) {
    return `### 🐍 Complete Guide to Python: Core Concepts & Preparation Roadmap

**Python** is a high-level, interpreted, dynamically typed, garbage-collected programming language known for its clear syntax, batteries-included standard library, and dominance in **Software Engineering, Data Science, AI/ML, and Automation**.

---

### 1. 🔑 Core Python Architecture & Concepts

1. **Interpreted & Dynamic Typing**:
   - Python compiles source code into bytecode (\`.pyc\`), which is executed by the **CPython Virtual Machine (PVM)**.
   - Variables are references to objects in heap memory, with types checked dynamically at runtime.

2. **Built-in Data Structures & Time Complexities**:
   - **Lists** (Dynamic Arrays): $O(1)$ amortized append/pop, $O(n)$ insertion/deletion.
   - **Dictionaries & Sets** (Hash Tables): $O(1)$ average lookup, insert, and delete.
   - **Tuples** (Immutable sequences): Fixed memory footprint, hashable if containing immutable items.

3. **Advanced Language Features**:
   - **List/Dict/Set Comprehensions**: \`[x**2 for x in nums if x % 2 == 0]\`
   - **Generators & Iterators**: Lazy evaluation using \`yield\` minimizing memory ($O(1)$ space).
   - **Decorators**: Higher-order functions modifying behavior (\`@functools.wraps\`, \`@property\`, \`@lru_cache\`).
   - **Global Interpreter Lock (GIL)**: Mutex preventing multiple native threads from executing Python bytecodes concurrently (use \`multiprocessing\` or \`asyncio\` for concurrency).

---

### 2. 📚 Curated Learning Links & Resources

Here are the highest-rated free, high-yield resources for mastering Python:

- 📖 **Official Documentation & Tutorial**: [Python 3 Official Tutorial](https://docs.python.org/3/tutorial/) — Comprehensive reference directly from python.org.
- 🚀 **Practical Guides & OOP**: [Real Python](https://realpython.com/) — In-depth tutorials on OOP, decorators, async, and best practices.
- 🧩 **DSA in Python (Top Pick)**: [NeetCode.io Python Roadmap](https://neetcode.io/roadmap) — Structured algorithm preparation with video breakdowns.
- 💻 **Hands-on LeetCode Practice**: [LeetCode Python Problemset](https://leetcode.com/problemset/all/?topicSlugs=python) — Coding drills from Easy to Hard.
- 🌐 **Web Development (FastAPI / Django)**: [Full Stack Python](https://www.fullstackpython.com/) & [FastAPI Official Docs](https://fastapi.tiangolo.com/tutorial/).
- 🤖 **Data Science & AI**: [Fast.ai Practical Deep Learning](https://course.fast.ai/) & [Kaggle Python Course](https://www.kaggle.com/learn/python).

---

### 3. 🗓️ 4-Week Strategic Preparation Plan

| Week | Focus Area | Key Milestones & Topics |
| :--- | :--- | :--- |
| **Week 1** | **Language Fundamentals & OOP** | Control flow, functions, \`*args/\`**kwargs\`, Classes, inheritance, magic methods (\`__str__\`, \`__repr__\`, \`__len__\`). |
| **Week 2** | **Data Structures & Collections** | List, dict, set, \`collections.deque\`, \`heapq\`, \`itertools\`, generators, and decorators. |
| **Week 3** | **Algorithms & LeetCode Drills** | Two Pointers, Sliding Window, Binary Search, Trees, Graphs, DP. Aim for 30-40 LeetCode Mediums. |
| **Week 4** | **Frameworks & Production Code** | Build a REST API with **FastAPI / Django**, write \`pytest\` unit tests, containerize with Docker. |

---

### 4. 💡 Quick Syntax Reference Example

\`\`\`python
from typing import List, Dict
import functools

# Efficient memoized dynamic programming with type annotations
@functools.lru_cache(maxsize=None)
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Generator demonstration (O(1) memory)
def batch_stream(data: List[int], batch_size: int = 10):
    for i in range(0, len(data), batch_size):
        yield data[i:i + batch_size]
\`\`\`

> 💡 **Next Step**: Head over to the **Skill2Career Coding Practice Arena** to practice algorithmic problems in Python with instant feedback!`;
  }

  // ── DATA STRUCTURES & ALGORITHMS (DSA) ──
  if (q.includes('dsa') || q.includes('algorithm') || q.includes('data structure') || q.includes('leetcode') || q.includes('neetcode') || q.includes('quicksort') || q.includes('binary tree') || q.includes('dynamic programming')) {
    return `### ⚡ Data Structures & Algorithms (DSA) Mastery Guide

Mastering DSA is the single most critical pillar for cracking technical interviews at top tier tech companies (FAANG/MANG & Product Startups).

---

### 1. 🗺️ High-Yield Topic Hierarchy

1. **Arrays & Hashing**: Frequency counters, two-pointers, sliding window ($O(n)$ time).
2. **Linked Lists & Stacks/Queues**: Fast & slow pointers, monotonic stacks, bracket matching.
3. **Trees & Graphs**: BFS (Queues), DFS (Recursion/Stacks), Dijkstra's algorithm, Topological Sort.
4. **Dynamic Programming**: 1D DP (Climbing stairs, Coin change), 2D DP (LCS, Knapsack), Bitmask DP.
5. **Sorting & Searching**: Binary search on answer space, QuickSort ($O(n \\log n)$ average), MergeSort.

---

### 2. 🔗 Top Curated Preparation Links

- 🧭 **NeetCode 150 Roadmap**: [NeetCode Roadmap](https://neetcode.io/roadmap) — The gold standard curated list of coding interview questions.
- 📚 **Striver's A2Z DSA Sheet**: [TakeUForward A2Z Sheet](https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/) — Step-by-step conceptual walkthroughs.
- 🎯 **LeetCode Core Patterns**: [LeetCode Explore](https://leetcode.com/explore/) — Top interview 150 questions.
- 📊 **Visualgo**: [Visualgo.net](https://visualgo.net/) — Interactive algorithm visualizer for trees, graphs, and sorting.

---

### 3. 🎯 3-Step Problem Solving Framework
1. **Understand & Clarify**: Identify edge cases ($N=0, N=1$, duplicates, negative values, integer overflows).
2. **Find Brute Force & Optimize**: State $O(N^2)$ solution first, then identify bottleneck (e.g. redundant recalculations $\\rightarrow$ Hash Map or DP).
3. **Write Clean Code & Dry Run**: Use descriptive variable names, handle boundary conditions cleanly, and verify time & space complexity.`;
  }

  // ── SYSTEM DESIGN & WEB ARCHITECTURE ──
  if (q.includes('system design') || q.includes('microservice') || q.includes('scalability') || q.includes('load balancer') || q.includes('kafka') || q.includes('redis') || q.includes('api design')) {
    return `### 🏗️ System Design & Distributed Systems Interview Blueprint

System design evaluates your ability to build scalable, fault-tolerant, and high-availability software architectures.

---

### 1. ⚙️ Core Architecture Building Blocks

1. **Load Balancing & DNS**: Round-robin, Least connections, GeoDNS, Layer 4 (TCP) vs Layer 7 (HTTP) proxies (Nginx, Envoy).
2. **Caching Strategy**: Redis / Memcached with cache-aside, write-through, write-back patterns and LRU eviction.
3. **Database Sharding & Replication**: Master-slave read replicas, horizontal partitioning by hash key, ACID vs BASE / CAP Theorem ($C, A, P$).
4. **Asynchronous Processing & Message Queues**: Apache Kafka, RabbitMQ, Celery for decoupling spike workloads and event-driven architectures.
5. **Rate Limiting & Security**: Token bucket, Leaky bucket algorithms, OAuth2/JWT authentication.

---

### 2. 🔗 Recommended Preparation Resources

- 📘 **System Design Primer**: [GitHub System Design Primer](https://github.com/donnemartin/system-design-primer) — The definitive open-source guide.
- 📺 **ByteByteGo (Alex Xu)**: [ByteByteGo Channel](https://www.youtube.com/@ByteByteGo) — Visual diagrams and case studies.
- 📖 **Designing Data-Intensive Applications (DDIA)**: By Martin Kleppmann — The ultimate reference text for distributed data systems.
- 🛠️ **High Scalability**: [HighScalability.com](http://highscalability.com/) — Real-world architectures of Uber, Netflix, and Discord.`;
  }

  // ── JAVASCRIPT & TYPESCRIPT / FRONTEND ──
  if (q.includes('javascript') || q.includes('typescript') || q.includes('react') || q.includes('frontend') || q.includes('node') || q.includes('css')) {
    return `### 🌐 Modern JavaScript & TypeScript Architecture Guide

JavaScript and TypeScript power full-stack modern web engineering across frontends (React, Next.js, Vue) and backends (Node.js, Bun).

---

### 1. 🔑 Critical Concepts to Master

1. **V8 Engine & Event Loop**: Call stack, Web APIs, Microtask queue (Promises) vs Macrotask queue (\`setTimeout\`, I/O).
2. **Closures & Scope Chain**: Lexical scoping, variable hoisting, IIFE, and data encapsulation.
3. **Asynchronous JS**: Promises, \`async/await\`, \`Promise.all()\`, \`Promise.allSettled()\`, and error boundaries.
4. **TypeScript Type System**: Generics, Discriminated Unions, Utility Types (\`Partial\`, \`Record\`, \`Omit\`), and Strict Null Checks.
5. **React 19 Core**: Server Components (RSC), Virtual DOM reconciliation, Hooks (\`useMemo\`, \`useCallback\`, custom hooks), and state management.

---

### 2. 🔗 Curated Learning Links

- 📖 **MDN Web Docs**: [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript) — Authoritative web reference.
- 📘 **JavaScript.info**: [JavaScript.info](https://javascript.info/) — Comprehensive tutorial from basics to advanced.
- 🔷 **TypeScript Handbook**: [Official TS Documentation](https://www.typescriptlang.org/docs/handbook/intro.html).
- 🗺️ **Frontend Roadmap**: [roadmap.sh/frontend](https://roadmap.sh/frontend) — Visual step-by-step learning path.`;
  }

  // ── SQL & DATABASES ──
  if (q.includes('sql') || q.includes('database') || q.includes('postgres') || q.includes('mongodb') || q.includes('rdbms') || q.includes('nosql') || q.includes('indexing')) {
    return `### 🗄️ SQL & Database Engineering Guide

Databases form the persistence backbone of every enterprise application.

---

### 1. 🔑 High-Yield Database Concepts

1. **ACID Properties**: Atomicity (all-or-nothing), Consistency, Isolation (Read Committed, Repeatable Read, Serializable), Durability (Write-Ahead Logging / WAL).
2. **Indexing & B-Trees**:
   - Primary B+ Tree clustered index vs Secondary unclustered index.
   - Covering indexes avoiding table lookups ($O(\\log n)$ seek).
3. **Database Normalization**: 1NF (atomic values), 2NF (no partial dependency), 3NF (no transitive dependency), BCNF.
4. **Window Functions & Complex Analytical Queries**: \`ROW_NUMBER()\`, \`RANK()\`, \`DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...)\`, \`LEAD()\`, \`LAG()\`.

---

### 2. 🔗 Curated SQL Practice Links

- 💻 **SQLZoo**: [sqlzoo.net](https://sqlzoo.net/) — Interactive browser-based SQL tutorial and drills.
- 🎯 **LeetCode SQL 50**: [LeetCode SQL Study Plan](https://leetcode.com/studyplan/top-sql-50/) — Essential queries asked in interviews.
- 📖 **Use The Index, Luke!**: [use-the-index-luke.com](https://use-the-index-luke.com/) — The definitive guide to database indexing and performance tuning.
- 🐘 **PostgreSQL Official Tutorial**: [PostgreSQL Docs](https://www.postgresql.org/docs/current/tutorial.html).`;
  }

  // ── MACHINE LEARNING & AI ──
  if (q.includes('machine learning') || q.includes('deep learning') || q.includes('ai') || q.includes('pytorch') || q.includes('tensorflow') || q.includes('nlp') || q.includes('neural network') || q.includes('llm')) {
    return `### 🧠 Machine Learning & Artificial Intelligence Roadmap

Machine Learning bridges statistical optimization, linear algebra, and software systems.

---

### 1. 🔑 Core ML Foundations

1. **Mathematics for ML**: Linear Algebra (Eigenvalues, SVD, Matrix decomposition), Calculus (Gradients, Backpropagation), Probability & Statistics (Bayes' Theorem, Maximum Likelihood Estimation).
2. **Classical Algorithms**: Linear/Logistic Regression, Decision Trees, Random Forests, XGBoost, K-Means Clustering, PCA.
3. **Deep Learning & Neural Networks**: CNNs (Computer Vision), RNNs/LSTMs, Transformers (Self-Attention mechanism: $\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$).
4. **MLOps & Deployment**: Model quantization, ONNX runtime, Triton Inference Server, FastAPI model endpoints, MLflow tracking.

---

### 2. 🔗 Top AI/ML Learning Resources

- 🎓 **Fast.ai Practical Deep Learning**: [course.fast.ai](https://course.fast.ai/) — Top-down coding approach using PyTorch.
- 📺 **Andrew Ng Machine Learning Specialization**: [Coursera DeepLearning.AI](https://www.deeplearning.ai/courses/).
- 🤖 **Hugging Face NLP Course**: [huggingface.co/learn](https://huggingface.co/learn) — Transformers, LLMs, and tokenization in practice.
- 🏆 **Kaggle Competitions & Datasets**: [kaggle.com](https://www.kaggle.com/) — Real-world problem solving with reproducible notebooks.`;
  }

  // ── CORE COMPUTER SCIENCE: OS & NETWORKING ──
  if (q.includes('operating system') || q.includes('os') || q.includes('computer network') || q.includes('tcp') || q.includes('udp') || q.includes('deadlock') || q.includes('paging') || q.includes('thread') || q.includes('process')) {
    return `### 💻 Core CS: Operating Systems & Computer Networks

Core CS subjects form the foundation for all backend, systems engineering, and technical interview assessments.

---

### 1. 🖥️ Operating Systems Essentials

- **Process vs Thread**: Processes have independent virtual address spaces; threads share code, data, and heap but maintain private stacks and registers.
- **Concurrency & Synchronization**: Critical section problem, Mutex, Semaphores (counting vs binary), Deadlock prevention (Banker's Algorithm: Mutual exclusion, Hold & wait, No preemption, Circular wait).
- **Memory Management**: Virtual memory, Paging, Page Faults, TLB (Translation Lookaside Buffer), Page replacement algorithms (LRU, Clock).

---

### 2. 🌐 Computer Networks Essentials

- **OSI 7-Layer & TCP/IP Model**: Physical $\\rightarrow$ Data Link $\\rightarrow$ Network (IP) $\\rightarrow$ Transport (TCP/UDP) $\\rightarrow$ Application (HTTP/HTTPS, DNS).
- **TCP 3-Way Handshake**: \`SYN\` $\\rightarrow$ \`SYN-ACK\` $\\rightarrow$ \`ACK\` connection establishment; 4-way termination with \`FIN\` / \`TIME_WAIT\`.
- **HTTP/1.1 vs HTTP/2 vs HTTP/3**: Pipelining vs Multiplexed binary streams (TCP) vs QUIC (UDP) eliminating head-of-line blocking.`;
  }

  // ── MECHANICAL ENGINEERING ──
  if (/\b(rankine|brayton|carnot|thermodynamic|thermodynamics|ansys|solidworks|cad|fluid mechanics|heat transfer|refrigeration)\b/i.test(q)) {
    return `### ⚙️ Mechanical Engineering: Thermal Cycles & Applied Mechanics

- **Rankine Cycle (Steam Power Plants)**:
  - Stages: 1-2 Isentropic Pumping ($W_p = v(P_2 - P_1)$), 2-3 Isobaric Boiler Heat Addition ($Q_{in} = h_3 - h_2$), 3-4 Isentropic Turbine Expansion ($W_t = h_3 - h_4$), 4-1 Isobaric Condenser Heat Rejection ($Q_{out} = h_4 - h_1$).
  - Efficiency: $\\eta_{th} = \\frac{W_{net}}{Q_{in}} = \\frac{W_t - W_p}{Q_{in}}$.

- **Brayton Cycle (Gas Turbines & Jet Engines)**:
  - Continuous adiabatic compression, constant pressure combustion, and isentropic expansion.
  - Efficiency as a function of pressure ratio $r_p = \\frac{P_2}{P_1}$:
    $$\\eta_{Brayton} = 1 - \\frac{1}{r_p^{(\\gamma - 1)/\\gamma}}$$

- **CAE & Simulation Workflows**:
  - **ANSYS Mechanical (FEA)**: Geometry cleanup $\\rightarrow$ Mesh sizing (Hex/Tetrahedral with boundary inflation) $\\rightarrow$ Boundary constraints & structural loads $\\rightarrow$ von Mises stress evaluation against yield strength.
  - **SolidWorks / Fusion 360**: Parametric 3D modeling, GD&T tolerancing, assembly dynamic motion simulation.`;
  }

  // ── ECE / VLSI / EMBEDDED ──
  if (/\b(vlsi|verilog|systemverilog|sta|setup time|hold time|fpga|microcontroller|embedded|arm cortex|rtos|cmos)\b/i.test(q)) {
    return `### ⚡ ECE & VLSI Engineering: Timing Analysis & Embedded Architecture

- **Static Timing Analysis (STA) & Timing Closure**:
  - **Setup Time ($T_{setup}$)**: Data must arrive and settle before active clock edge:
    $$T_{clk} + T_{skew} \\ge T_{cq} + T_{comb(max)} + T_{setup}$$
    *Slack = Required Arrival Time - Actual Data Arrival Time* (Must be $\\ge 0$).
  - **Hold Time ($T_{hold}$)**: Data must remain stable after clock edge:
    $$T_{cq} + T_{comb(min)} \\ge T_{hold} + T_{skew}$$
    *Fixing hold violations*: Add non-inverting delay buffers into data path; independent of clock frequency!

- **Embedded Systems & RTOS**:
  - **Preemptive vs Cooperative Scheduling**: FreeRTOS task priority preemption with tick interrupts.
  - **Hardware Protocols**: I2C (2-wire open-drain with pull-ups), SPI (4-wire synchronous full-duplex), UART (asynchronous start/stop bits), CAN Bus (differential signaling in automotive).`;
  }

  // ── CIVIL ENGINEERING ──
  if (/\b(concrete|structural|beam|truss|is 456|eurocode|soil mechanics|terzaghi|etabs|staad|civil|foundation)\b/i.test(q)) {
    return `### 🏗️ Civil & Structural Engineering: Limit State Design

- **Euler-Bernoulli Bending Equation**:
  $$\\frac{M}{I} = \\frac{\\sigma}{y} = \\frac{E}{R}$$
  - $M$: Bending moment, $I$: Second moment of area, $\\sigma$: Flexural stress, $y$: Distance from neutral axis.

- **Reinforced Concrete Limit State Method (IS 456 / Eurocode 2)**:
  - Ultimate Limit State (ULS) of collapse: Flexure, compression, shear, torsion with partial safety factors $\\gamma_c = 1.5$ (concrete) and $\\gamma_s = 1.15$ (steel).
  - Serviceability Limit State (SLS): Crack width limits ($w_{max} \\le 0.3\\text{ mm}$) and vertical deflection limits ($\span/250$).

- **Soil Mechanics & Bearing Capacity**:
  - **Terzaghi Bearing Capacity Equation (Strip Footing)**:
    $$q_{ult} = c N_c + q N_q + 0.5 \\gamma B N_\\gamma$$`;
  }

  // ── RESUME & INTERVIEW PREPARATION ──
  if (q.includes('resume') || q.includes('ats') || q.includes('bullet') || q.includes('interview')) {
    return `### 📄 High-Impact Engineering Resume & Interview Strategy

To pass ATS screeners and impress technical hiring managers, structure your resume bullets using the **Google X-Y-Z / STAR Formula**:
> *"Accomplished [X], as measured by [Y], by doing [Z]"*

---

### 📝 Before vs. After Examples

- ❌ **Weak**: *"Worked on a Python backend and wrote test cases."*
- ✅ **Strong**: *"Architected high-throughput REST API using **FastAPI** and **PostgreSQL**, optimizing database indexing and connection pooling to reduce p99 query latency by **42%** under 5,000 req/sec peak load."*

- ❌ **Weak**: *"Designed mechanical parts in SolidWorks."*
- ✅ **Strong**: *"Engineered modular CNC-machined aluminum chassis in **SolidWorks**, validating structural load limits with **ANSYS FEA** to decrease component mass by **18%** while maintaining a safety factor of **2.2**."*

---

### 🎯 4-Step Technical Interview Checklist
1. **Behavioral**: Prepare 4 stories using STAR (Situation, Task, Action, Result) covering leadership, technical conflicts, and system outages.
2. **Live Coding / Problem Solving**: Communicate your thought process out loud before typing.
3. **Edge Case Analysis**: Test for null inputs, extremes, and time/space constraints proactively.
4. **Questions for Interviewer**: Ask about their CI/CD deployment cadence, telemetry observability, and roadmap priorities.`;
  }

  // ── STUDY PLAN / DAILY GOALS ──
  if (q.includes('daily plan') || q.includes('study plan') || q.includes('what to prepare today') || q.includes('schedule')) {
    return `### 📅 High-Yield Daily Preparation Plan (${branch})

Targeting role: **${role}** | Subject: **${subject}**

1. 📖 **Core Concept Deep Dive (45 mins)**:
   - Study 1 key foundational topic or governing theory. Write concise 1-page synthesis notes.
2. 💻 **Hands-on Practical / Coding Drills (60 mins)**:
   - Solve 2 targeted problems in the **Coding Practice Arena** or execute a software simulation workflow.
3. 🎯 **Competency Verification (15 mins)**:
   - Take the topic assessment in the **Assessment Center** to validate retention and earn skill badges.
4. 🚀 **Portfolio & Resume Expansion (30 mins)**:
   - Commit clean, documented code or project models to your GitHub / Engineering portfolio.`;
  }

  // ── GENERAL DYNAMIC FALLBACK ──
  return `### 🎓 Skill2Career Engineering Advisor (${branch})

Here is a focused breakdown regarding **"${query.slice(0, 100)}"** for your target role as **${role}**:

---

### 1. 🔑 Fundamental Principles & Key Concepts
- **Core Concept**: In ${subject}, addressing this problem requires breaking it down into first principles, understanding the governing constraints, and applying industry-standard best practices.
- **Technical Standards**: Ensure modular architecture, optimal time/space complexity, error handling, and unit test coverage.

---

### 2. 🛠️ Step-by-Step Implementation Approach
1. **Define Requirements & Scope**: Identify inputs, expected outputs, constraints, and boundary conditions.
2. **Select Appropriate Tools & Frameworks**: Choose proven industry stacks and algorithms that balance performance with maintainability.
3. **Execute & Benchmark**: Implement the core logic iteratively and verify performance through testing and profiling.

---

### 3. 📚 Recommended Practice & Next Steps
- **Take the Domain Assessment**: Validate your readiness in the **Assessment Center**.
- **Code Drills**: Practice real problems in the **Skill2Career Coding Practice Arena**.
- **Ask a Follow-Up**: Feel free to ask for a specific code implementation, formula derivation, or resume bullet point!`;
}
