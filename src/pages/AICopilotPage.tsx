import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Bot, User, Sparkles, Copy, Check, RotateCcw, Plus,
  MessageSquare, BookOpen, ExternalLink, Award, Compass, Target,
  ArrowRight, ShieldCheck, HelpCircle, Code, Layers, FileText,
  Cpu, Wrench, Building2, Zap, TestTube, Dna, Rocket, Bot as RobotIcon, BarChart2
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatThread {
  id: string;
  title: string;
  branch: string;
  lastMessage: string;
  date: string;
}

interface BranchInfo {
  code: string;
  name: string;
  emoji: string;
  defaultRole: string;
  defaultSubject: string;
}

const COPILOT_BRANCHES: BranchInfo[] = [
  { code: 'CSE', name: 'Computer Science (CSE)', emoji: '💻', defaultRole: 'Software Engineer', defaultSubject: 'Algorithms & Distributed Systems' },
  { code: 'ECE', name: 'Electronics & Comm (ECE)', emoji: '⚡', defaultRole: 'VLSI / Embedded Systems Engineer', defaultSubject: 'Digital System Design & VLSI' },
  { code: 'MECH', name: 'Mechanical (MECH)', emoji: '⚙️', defaultRole: 'CAD/CAE & Thermal Systems Engineer', defaultSubject: 'Applied Thermodynamics & FEA' },
  { code: 'CIVIL', name: 'Civil & Infrastructure (CIVIL)', emoji: '🏗️', defaultRole: 'Structural & BIM Engineer', defaultSubject: 'Structural Analysis & Concrete' },
  { code: 'EE', name: 'Electrical & Power (EE)', emoji: '🔌', defaultRole: 'Power Systems & Drives Engineer', defaultSubject: 'Power Transmission & Electronics' },
  { code: 'CHEM', name: 'Chemical (CHEM)', emoji: '⚗️', defaultRole: 'Process & Reaction Kinetics Engineer', defaultSubject: 'Chemical Reaction Engineering & Aspen' },
  { code: 'BIOTECH', name: 'Biotechnology (BIOTECH)', emoji: '🧬', defaultRole: 'Bioinformatics & Bioprocess Engineer', defaultSubject: 'Genomics & Bioreactor Kinetics' },
  { code: 'AERO', name: 'Aerospace (AERO)', emoji: '🚀', defaultRole: 'Rocket Propulsion & Aerodynamics Engineer', defaultSubject: 'Flight Dynamics & Supersonic Nozzles' },
  { code: 'ROBOTICS', name: 'Robotics & Automation', emoji: '🤖', defaultRole: 'Autonomous Mobile Robotics Engineer', defaultSubject: 'Robot Kinematics & ROS2' },
  { code: 'DS', name: 'Data Science & AI', emoji: '📊', defaultRole: 'Lead Data Scientist / AI Architect', defaultSubject: 'Deep Learning & Statistics' }
];

export const AICopilotPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Active discipline selection (defaults to user's branch if matches, or CSE)
  const [activeBranchCode, setActiveBranchCode] = useState<string>(() => {
    const profMajor = profile?.major_or_branch?.toUpperCase() || '';
    const match = COPILOT_BRANCHES.find((b) => profMajor.includes(b.code));
    return match ? match.code : 'CSE';
  });

  const activeBranch = useMemo(
    () => COPILOT_BRANCHES.find((b) => b.code === activeBranchCode) || COPILOT_BRANCHES[0],
    [activeBranchCode]
  );

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [threads, setThreads] = useState<ChatThread[]>([
    { id: 'th_1', title: "Universal Daily Placement Timetable", branch: 'All', lastMessage: 'Structured study routine...', date: 'Today' },
    { id: 'th_2', title: 'MECH: Rankine vs. Brayton Power Cycles', branch: 'MECH', lastMessage: 'Isentropic pumping, turbine...', date: 'Yesterday' },
    { id: 'th_3', title: 'ECE: Static Timing Analysis & Setup/Hold', branch: 'ECE', lastMessage: 'Slack calculations in STA...', date: 'Yesterday' },
    { id: 'th_4', title: 'CIVIL: Limit State Concrete Design (IS 456)', branch: 'CIVIL', lastMessage: 'Moment curvature & LSM...', date: '2 days ago' },
    { id: 'th_5', title: 'CSE: React 19 & Distributed Caching', branch: 'CSE', lastMessage: 'Async endpoints & Redis...', date: 'Last week' }
  ]);
  const [activeThreadId, setActiveThreadId] = useState<string>('th_1');

  const INITIAL_THREAD_MESSAGES: Record<string, ChatMessage[]> = {
    th_1: [
      {
        id: 'msg_1_1',
        role: 'user',
        content: 'What should I prepare today for my engineering placement schedule?',
        timestamp: '09:30 AM'
      },
      {
        id: 'msg_1_2',
        role: 'assistant',
        content: `### 📅 High-Yield Universal Engineering Placement Schedule
        
Here is your structured 4-stage technical preparation plan:

---

#### ⏱️ **Block 1: Core Mathematical & Engineering Fundamentals (60 Minutes)**
- **Objective**: Master the theoretical governing equations of your active discipline (**${activeBranch.name}**).
- **Key Task**: Derive core physical formulas, examine boundary conditions, and test numerical edge cases.
- **Reference**: Official academic textbooks, NPTEL video lectures, and lecture notes.

---

#### ⏱️ **Block 2: Industry Software & Simulation Toolchains (90 Minutes)**
- **Objective**: Hands-on workflow execution in standard engineering packages.
- **Tools**: MATLAB / Simulink, ANSYS, SolidWorks, Autodesk Revit, Cadence EDA, Aspen Plus, ROS2, or IDEs.
- **Goal**: Build and verify a concrete simulation model or software module with documented results.

---

#### ⏱️ **Block 3: Competitive Exam & Technical Interview Problem Solving (45 Minutes)**
- **Objective**: Solve 3-4 numerical problems typical of GATE, ESE, and top engineering placement rounds.
- **Pattern**: Apply first principles $\\rightarrow$ check dimensional consistency $\\rightarrow$ calculate numerical margins.

---

#### ⏱️ **Block 4: Diagnostic Skill Verification (15 Minutes)**
- **Objective**: Take a verified diagnostic quiz in our **Assessment Center** to prove competency in today's topic and update your profile!`,
        timestamp: '09:31 AM'
      }
    ],
    th_2: [
      {
        id: 'msg_2_1',
        role: 'user',
        content: 'Explain Rankine vs Brayton thermodynamic power cycles with formulas and diagrams.',
        timestamp: 'Yesterday'
      },
      {
        id: 'msg_2_2',
        role: 'assistant',
        content: `### ⚙️ Mechanical Engineering: Rankine vs. Brayton Power Cycles

Thermodynamic power cycles convert input heat into useful shaft work.

#### 1. The Ideal Rankine Cycle (Vapor Power Cycle)
Models steam turbine power plants (coal, nuclear, geothermal):
- **1 $\\rightarrow$ 2 (Isentropic Pumping)**: Reversible adiabatic compression of liquid water ($w_p = v(P_2 - P_1)$).
- **2 $\\rightarrow$ 3 (Isobaric Heat Addition)**: High-pressure water heated in boiler to superheated steam ($q_{in} = h_3 - h_2$).
- **3 $\\rightarrow$ 4 (Isentropic Expansion)**: Steam expands through turbine generating shaft power ($w_t = h_3 - h_4$).
- **4 $\\rightarrow$ 1 (Isobaric Condensation)**: Low-pressure steam condensed into water in surface condenser ($q_{out} = h_4 - h_1$).

**Thermal Efficiency**:
$$\\eta_{Rankine} = \\frac{w_{net}}{q_{in}} = \\frac{(h_3 - h_4) - (h_2 - h_1)}{h_3 - h_2}$$

---

#### 2. The Ideal Brayton Cycle (Gas Turbine Cycle)
Models aircraft jet propulsion and stationary gas turbine generators:
- Operates using open/closed gas loop with constant pressure ratio $r_p = \\frac{P_2}{P_1}$.
- **Thermal Efficiency as a function of pressure ratio**:
$$\\eta_{Brayton} = 1 - \\frac{1}{r_p^{(\\gamma - 1)/\\gamma}}$$
*(where $\\gamma = C_p / C_v \\approx 1.4$ for air)*.

#### 🌐 Recommended Engineering Learning Links:
- 🔗 [MIT OpenCourseWare Thermodynamics](https://ocw.mit.edu/courses/mechanical-engineering/)
- 🔗 [NIST Chemistry WebBook Thermophysical Fluid Tables](https://webbook.nist.gov/chemistry/fluid/)`,
        timestamp: 'Yesterday'
      }
    ],
    th_3: [
      {
        id: 'msg_3_1',
        role: 'user',
        content: 'Explain Static Timing Analysis (STA) setup and hold slack calculation formulas.',
        timestamp: 'Yesterday'
      },
      {
        id: 'msg_3_2',
        role: 'assistant',
        content: `### ⚡ ECE: Static Timing Analysis (STA) & Timing Closure

In synchronous digital VLSI circuits, every data path between flip-flops must satisfy both setup and hold timing constraints.

#### 1. Setup Time ($T_{setup}$) & Maximum Delay Constraint
Data must arrive and stabilize at the destination flip-flop before the active clock edge:
- **Data Arrival Time**: $T_{arrival} = T_{launch\_clk} + T_{cq} + T_{comb(max)}$
- **Data Required Time**: $T_{required} = T_{capture\_clk} + T_{period} - T_{setup} - T_{uncertainty}$
- **Setup Slack**:
$$\\text{Setup Slack} = T_{required} - T_{arrival} \\ge 0$$
*A negative setup slack violates maximum frequency. Solution: lower clock frequency or optimize combinational logic.*

---

#### 2. Hold Time ($T_{hold}$) & Minimum Delay Constraint
Data must remain stable after the clock edge to prevent premature overwrite:
- **Data Arrival Time**: $T_{arrival} = T_{launch\_clk} + T_{cq} + T_{comb(min)}$
- **Data Required Time**: $T_{required} = T_{capture\_clk} + T_{hold} + T_{uncertainty}$
- **Hold Slack**:
$$\\text{Hold Slack} = T_{arrival} - T_{required} \\ge 0$$
*Hold time violations are independent of clock period. Solution: insert delay buffer cells into fast data paths.*

#### 🌐 Recommended VLSI Documentation Links:
- 🔗 [Cadence VLSI Timing Closure Guides](https://www.cadence.com/)
- 🔗 [Synopsys PrimeTime STA Reference](https://www.synopsys.com/)`,
        timestamp: 'Yesterday'
      }
    ],
    th_4: [
      {
        id: 'msg_4_1',
        role: 'user',
        content: 'Explain the Limit State Method for reinforced concrete beam design per IS 456 / Eurocode 2.',
        timestamp: '2 days ago'
      },
      {
        id: 'msg_4_2',
        role: 'assistant',
        content: `### 🏗️ Civil Engineering: Reinforced Concrete Limit State Design

The Limit State Method (LSM) ensures that structures fulfill safety (Ultimate Limit State) and usability (Serviceability Limit State) criteria throughout their design life.

#### 1. Fundamental Design Principles:
- **Partial Safety Factors for Materials**:
  - Concrete: $\\gamma_c = 1.5$ (accounting for site batching variability).
  - Steel: $\\gamma_s = 1.15$ (high factory quality control).
- **Maximum Compressive Strain in Concrete**: $\\epsilon_{cu} = 0.0035$ at the extreme outer fiber.
- **Stress Block**: Rectangular-parabolic stress block with design compressive strength $0.446 f_{ck}$.

#### 2. Moment of Resistance ($M_u$) for Under-Reinforced Section:
$$\\frac{x_u}{d} = \\frac{0.87 f_y A_{st}}{0.36 f_{ck} b d}$$
$$M_u = 0.87 f_y A_{st} d \\left(1 - \\frac{f_y A_{st}}{f_{ck} b d}\\right)$$

*Under-reinforced design ensures ductile failure: tensile steel yields before concrete reaches crushing strain, giving visible cracking and deflection warning!*`,
        timestamp: '2 days ago'
      }
    ],
    th_5: [
      {
        id: 'msg_5_1',
        role: 'user',
        content: 'Explain React hooks and distributed Redis caching for high-performance software engineering.',
        timestamp: 'Last week'
      },
      {
        id: 'msg_5_2',
        role: 'assistant',
        content: `### 💻 Computer Science: Modern Web Architecture & Distributed Caching

High-throughput applications combine declarative client interfaces with in-memory caching layers:

#### 1. Core React 19 Patterns:
- **\`useState\` & State Immutability**: React relies on shallow reference equality (\`Object.is\`) to schedule micro-task re-renders.
- **\`useEffect\` vs \`useMemo\`**: Synchronize with external APIs with deterministic dependency arrays; memoize expensive transforms ($O(n \\log n)$ algorithms).

#### 2. Distributed Caching with Redis:
- **Sub-millisecond Latency**: Serving pre-computed queries from RAM drops p99 latency from ~140ms down to <4ms.
- **Cache-Aside Pattern**: Application checks Redis; on cache miss, queries PostgreSQL, populates Redis with Time-To-Live (TTL), and returns.`,
        timestamp: 'Last week'
      }
    ]
  };

  const [threadMessagesMap, setThreadMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_THREAD_MESSAGES);
  const messages = threadMessagesMap[activeThreadId] || INITIAL_THREAD_MESSAGES['th_1'];

  const setMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setThreadMessagesMap((prev) => {
      const currentList = prev[activeThreadId] || [];
      return {
        ...prev,
        [activeThreadId]: updater(currentList)
      };
    });
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Branch-specific quick prompt recommendations
  const branchQuickPrompts = useMemo(() => {
    switch (activeBranchCode) {
      case 'MECH':
        return [
          { label: '📐 Rankine vs Brayton Formulas', query: 'Derive the thermal efficiency formulas for Rankine and Brayton power cycles step-by-step.' },
          { label: '⚙️ FEA Von Mises Stress Calculation', query: 'Explain the Von Mises yield criterion tensor math and how to conduct a mesh convergence study in ANSYS.' },
          { label: '🌊 Navier-Stokes & Boundary Layers', query: 'Explain the Navier-Stokes equations and boundary layer separation in aerodynamics.' },
          { label: '🛠️ SolidWorks vs CATIA CAD Workflow', query: 'Compare SolidWorks and CATIA for automotive mechanical design and GD&T per ASME Y14.5.' },
          { label: '🎯 GATE Mechanical Syllabus Strategy', query: 'Give me a high-weightage study roadmap and key formulas for GATE Mechanical Engineering.' }
        ];
      case 'CIVIL':
        return [
          { label: '📐 Indeterminate Beam Bending Moments', query: 'Explain moment distribution method and shear force diagrams for continuous concrete beams.' },
          { label: '🏗️ Limit State Concrete Design (IS 456)', query: 'Explain under-reinforced vs over-reinforced beam design equations and neutral axis depth per IS 456 / Eurocodes.' },
          { label: '🌍 Terzaghi Effective Stress & Geotech', query: 'Explain Terzaghi effective stress equation and shallow foundation bearing capacity formulas.' },
          { label: '🏢 Autodesk Revit & BIM Clash Detection', query: 'Explain the ISO 19650 BIM execution protocol and Revit/Navisworks clash detection workflows.' },
          { label: '🎯 GATE Civil Engineering Roadmap', query: 'Provide a structured study blueprint for GATE Civil Engineering covering structures, geotech, and hydrology.' }
        ];
      case 'ECE':
        return [
          { label: '📐 STA Setup & Hold Slack Formulas', query: 'Derive the Static Timing Analysis (STA) setup and hold slack formulas with clock skew and jitter.' },
          { label: '⚡ Verilog HDL State Machine Design', query: 'Show how to write a Mealy and Moore finite state machine (FSM) in clean, synthesizable Verilog HDL.' },
          { label: '📡 5G OFDM Modulation & Beamforming', query: 'Explain Orthogonal Frequency Division Multiplexing (OFDM) and massive MIMO beamforming in 5G NR.' },
          { label: '🔌 ARM Cortex-M FreeRTOS Tasks', query: 'Explain task scheduling, semaphores, and interrupt priority handling on ARM Cortex-M microcontrollers.' },
          { label: '🎯 GATE ECE High-Yield Prep Plan', query: 'What are the top scoring topics and formulas for GATE Electronics and Communication Engineering?' }
        ];
      case 'EE':
        return [
          { label: '📐 DC-DC Buck Converter Ripple Derivation', query: 'Derive the inductor and capacitor ripple equations for a DC-DC Buck converter in continuous conduction mode.' },
          { label: '🔌 Newton-Raphson Load Flow Analysis', query: 'Explain the Newton-Raphson method for power system load flow analysis with Jacobian matrix formation.' },
          { label: '⚡ Field-Oriented Control (FOC) of Motors', query: 'Explain Field-Oriented Control (FOC) and Space Vector PWM for brushless DC (BLDC) motors.' },
          { label: '🏭 Substation Automation & IEC 61850', query: 'Explain IEC 61850 protocol standards, GOOSE messaging, and SCADA architectures in modern electrical substations.' },
          { label: '🎯 GATE Electrical Engineering Plan', query: 'Provide a high-yield study plan and key formula checklist for GATE Electrical Engineering.' }
        ];
      case 'CHEM':
        return [
          { label: '📐 CSTR vs PFR Reactor Design Equations', query: 'Derive and compare the performance equations for CSTR and PFR chemical reactors with positive-order kinetics.' },
          { label: '⚗️ McCabe-Thiele Distillation Sizing', query: 'Explain the step-by-step graphical McCabe-Thiele method for binary distillation column tray calculation.' },
          { label: '🔥 LMTD vs NTU Heat Exchanger Sizing', query: 'Compare the Log Mean Temperature Difference (LMTD) and NTU-effectiveness methods for shell-and-tube heat exchangers.' },
          { label: '💻 Aspen Plus Fluid Property Packages', query: 'How do you select appropriate thermodynamic fluid packages (NRTL, Peng-Robinson, UNIQUAC) in Aspen Plus?' },
          { label: '🎯 GATE Chemical Engineering Blueprint', query: 'Provide an intensive preparation guide for GATE Chemical Engineering covering reaction kinetics and thermodynamics.' }
        ];
      case 'BIOTECH':
        return [
          { label: '🧬 CRISPR-Cas9 sgRNA & PAM Mechanism', query: 'Explain the molecular mechanism of CRISPR-Cas9 genome editing, sgRNA design, and PAM sequence recognition.' },
          { label: '🔬 Monod Bioreactor Growth Kinetics', query: 'Explain Monod microbial growth kinetics and mass transfer of oxygen (kLa) in industrial fermentation bioreactors.' },
          { label: '💻 BLAST Algorithm & Alignment Scoring', query: 'Explain how the BLAST algorithm searches genomic databases using heuristic scoring and BLOSUM matrices.' },
          { label: '🧪 FPLC Downstream Protein Purification', query: 'Explain fast protein liquid chromatography (FPLC) workflows: affinity, ion-exchange, and size-exclusion chromatography.' },
          { label: '🎯 GATE Biotechnology Roadmap', query: 'Give me a high-yield preparation plan for GATE Biotechnology covering molecular biology and bioprocess technology.' }
        ];
      case 'AERO':
        return [
          { label: '📐 Tsiolkovsky Rocket Equation Derivation', query: 'Derive the Tsiolkovsky rocket equation and calculate delta-v budgets for orbital insertion.' },
          { label: '🚀 de Laval Supersonic Nozzle Physics', query: 'Explain compressible gas dynamics in converging-diverging (de Laval) nozzles with the Area-Mach relation.' },
          { label: '🛰️ Hohmann Transfer Orbit Math', query: 'Show the step-by-step calculation for a Hohmann transfer orbit between Earth and Mars with delta-v requirements.' },
          { label: '✈️ Longitudinal Flight Stability & Trim', query: 'Explain aircraft longitudinal static stability, neutral point, and static margin calculations.' },
          { label: '🎯 GATE Aerospace Engineering Roadmap', query: 'Provide a structured preparation roadmap for GATE Aerospace Engineering covering aerodynamics and propulsion.' }
        ];
      case 'ROBOTICS':
        return [
          { label: '📐 Denavit-Hartenberg (DH) Kinematics', query: 'Explain how to assign coordinate frames and derive DH parameter transformation matrices for a 3-DOF robot arm.' },
          { label: '🤖 ROS2 Nav2 Stack & Behavior Trees', query: 'Explain the ROS2 Nav2 navigation architecture, global/local costmaps, and behavior tree execution.' },
          { label: '📡 2D/3D LiDAR SLAM & EKF State Estimation', query: 'Explain Simultaneous Localization and Mapping (SLAM) and sensor fusion with Extended Kalman Filters (EKF).' },
          { label: '🕹️ Industrial PLC Ladder Logic & SCADA', query: 'Explain PLC ladder logic programming for industrial robot arm safety interlocks and SCADA integration.' },
          { label: '💼 Robotics Portfolio Projects Guide', query: 'What portfolio robotics projects will impress autonomous vehicle and robotics employers like Boston Dynamics and Tesla?' }
        ];
      case 'DS':
        return [
          { label: '📐 Transformer Self-Attention Formula', query: 'Derive the Scaled Dot-Product Attention equation in Transformers and explain multi-head attention.' },
          { label: '📊 Hypothesis Testing & p-value Intuition', query: 'Explain null hypothesis significance testing, p-values, Type I/II errors, and power in A/B testing.' },
          { label: '🧠 PyTorch Production Training Loop', query: 'Write a production-grade PyTorch training loop with mixed precision (AMP), gradient clipping, and learning rate scheduling.' },
          { label: '🚀 MLOps Docker Serving & Drift Monitoring', query: 'Explain how to containerize and serve ML models with Docker, FastAPI, and monitor feature drift in production.' },
          { label: '🎯 Data Science Technical Interview Questions', query: 'What are the top 10 machine learning and statistics technical interview questions asked at FAANG/Tier-1 firms?' }
        ];
      default: // CSE
        return [
          { label: '📅 What should I prepare today?', query: 'What should I prepare today for my target career goal?' },
          { label: '⚛️ React 19 Architecture & Hooks', query: 'Explain React 19 architecture, hooks (useState, useEffect, useMemo), and performance best practices.' },
          { label: '📄 Google STAR Resume Bullets', query: 'How to build a high-scoring ATS resume with Google STAR / X-Y-Z bullet points?' },
          { label: '⚡ FastAPI & Distributed Caching', query: 'Explain FastAPI async architecture and Redis distributed caching with code examples.' },
          { label: '📝 Recommend an Assessment', query: 'Recommend a diagnostic assessment for me to verify my technical competencies today.' }
        ];
    }
  }, [activeBranchCode]);

  const handleSend = async (queryText?: string) => {
    const query = (queryText || input).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await apiFetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          branch: activeBranch.name,
          role: activeBranch.defaultRole,
          subject: activeBranch.defaultSubject,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply || data.message || 'I am ready to help you with any engineering topic, formula, or code!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
    } catch (err: any) {
      console.error('AI chat error:', err);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered a momentary connection issue. Please try sending your query again!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleNewChat = () => {
    const newId = 'th_' + Date.now();
    const initMessage: ChatMessage = {
      id: 'init_msg_' + newId,
      role: 'assistant',
      content: `### 🚀 New Session Started (${activeBranch.emoji} ${activeBranch.name})

I am your Universal Engineering AI Copilot configured for **${activeBranch.name}**.

Ask me anything regarding:
- 📐 **Formula Derivations & Mathematical Proofs**
- 📖 **Core Concept Explanations & Physical Intuition**
- 🔬 **Lab & Simulation Software** (MATLAB, ANSYS, SolidWorks, Revit, Cadence, Aspen, ROS2, etc.)
- 🎯 **Semester Exams & GATE / Competitive Exam Problem Solving**
- 💼 **Career Roadmaps & Google STAR Resume Bullets**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setThreads((prev) => [
      { id: newId, title: `${activeBranch.code} Study Session`, branch: activeBranch.code, lastMessage: 'Starting new engineering session...', date: 'Just now' },
      ...prev
    ]);
    setActiveThreadId(newId);
    setThreadMessagesMap((prev) => ({
      ...prev,
      [newId]: [initMessage]
    }));
  };

  // Render markdown text cleanly with clickable links
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.6 }}>
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '8px 0 2px' }}>
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('#### ')) {
            return (
              <h4 key={idx} style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a', margin: '6px 0 2px' }}>
                {line.replace('#### ', '')}
              </h4>
            );
          }
          if (line.trim() === '---') {
            return <div key={idx} style={{ height: '1px', background: '#e2e8f0', margin: '6px 0' }} />;
          }

          // Check for link pattern [Text](url)
          const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
          if (linkMatch) {
            const parts = line.split(/\[(.*?)\]\((.*?)\)/);
            return (
              <div key={idx} style={{ fontSize: '13px' }}>
                {parts[0]}
                <a
                  href={linkMatch[2]}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#006EFF', fontWeight: 600, textDecoration: 'underline' }}
                >
                  {linkMatch[1]}
                </a>
                {parts[3] || ''}
              </div>
            );
          }

          // Bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#1e293b' }}>
                <span style={{ color: '#006EFF', fontWeight: 800 }}>•</span>
                <span>{line.replace(/^[-*]\s+/, '')}</span>
              </div>
            );
          }

          if (!line.trim()) {
            return <div key={idx} style={{ height: '4px' }} />;
          }

          return (
            <p key={idx} style={{ fontSize: '13px', color: '#1e293b', margin: 0 }}>
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 62px)', background: '#f8fafc', overflow: 'hidden' }}>
      {/* ── Left Sidebar (Chat Sessions & Branch Navigation) ── */}
      <aside
        style={{
          width: '270px',
          minWidth: '270px',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 12px'
        }}
      >
        <div>
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#006EFF',
              color: '#ffffff',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '16px',
              boxShadow: '0 2px 6px rgba(0, 110, 255, 0.25)'
            }}
          >
            <Plus size={16} />
            <span>New Chat Session</span>
          </button>

          {/* Active Discipline Indicator */}
          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Active Engineering Discipline
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              <span>{activeBranch.emoji}</span>
              <span>{activeBranch.name.split('(')[0]}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Track: <strong>{activeBranch.defaultRole}</strong>
            </div>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', padding: '0 8px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recent Sessions
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {threads.map((th) => (
              <div
                key={th.id}
                onClick={() => setActiveThreadId(th.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 10px',
                  borderRadius: '6px',
                  background: activeThreadId === th.id ? '#eff6ff' : 'transparent',
                  color: activeThreadId === th.id ? '#006EFF' : '#475569',
                  fontWeight: activeThreadId === th.id ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <MessageSquare size={15} style={{ color: activeThreadId === th.id ? '#006EFF' : '#94a3b8', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {th.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => navigate('/app/assessments')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              background: '#f1f5f9',
              borderRadius: '6px',
              border: 'none',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Multi-Branch Assessments (35+)</span>
          </button>
          <button
            onClick={() => navigate('/app/skill-gap')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              background: '#f1f5f9',
              borderRadius: '6px',
              border: 'none',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Compass size={15} className="text-blue-600" />
            <span>Skill Gap & Hierarchy Pathway</span>
          </button>
        </div>
      </aside>

      {/* ── Center Conversation Area ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '10px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1e40af 0%, #006EFF 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0, 110, 255, 0.25)'
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h1 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Skill2Career Universal AI Engineering & Educational Copilot
                  <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                    Gemini Multi-Discipline
                  </span>
                </h1>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Branch: <strong>{activeBranch.name}</strong> • Role Track: <strong>{activeBranch.defaultRole}</strong>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => navigate('/app/assessments')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '6px',
                  color: '#065f46',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ShieldCheck size={14} />
                <span>Take {activeBranch.code} Assessment</span>
              </button>
            </div>
          </div>

          {/* Discipline Selector Ribbon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>
              Switch Discipline:
            </span>
            {COPILOT_BRANCHES.map((b) => {
              const isSelected = activeBranchCode === b.code;
              return (
                <button
                  key={b.code}
                  onClick={() => setActiveBranchCode(b.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? '#006EFF' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#334155',
                    border: isSelected ? '1px solid #006EFF' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>{b.emoji}</span>
                  <span>{b.code}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '14px',
                maxWidth: '84%',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {msg.role === 'assistant' && (
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #1e40af 0%, #006EFF 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0, 110, 255, 0.2)',
                    flexShrink: 0
                  }}
                >
                  <Bot size={18} />
                </div>
              )}

              <div
                style={{
                  background: msg.role === 'user' ? '#006EFF' : '#ffffff',
                  color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                  border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                  borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  padding: '16px 20px',
                  boxShadow: msg.role === 'user' ? '0 2px 8px rgba(0, 110, 255, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}
              >
                {msg.role === 'assistant' ? (
                  renderFormattedContent(msg.content)
                ) : (
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>{msg.content}</p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginTop: '8px',
                    fontSize: '11px',
                    color: msg.role === 'user' ? '#bfdbfe' : '#94a3b8'
                  }}
                >
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedId === msg.id ? '#10b981' : '#94a3b8',
                        padding: 0
                      }}
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#e2e8f0',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '14px', maxWidth: '80%', alignSelf: 'flex-start' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1e40af 0%, #006EFF 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0, 110, 255, 0.2)'
                }}
              >
                <Bot size={18} />
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '13px' }}>
                <RotateCcw size={15} className="animate-spin text-blue-600" />
                <span>Formulating personalized engineering response for {activeBranch.name}…</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips (Dynamically based on active engineering branch) */}
        <div style={{ padding: '8px 32px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {branchQuickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              disabled={loading}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Bottom Input Area */}
        <div style={{ padding: '16px 32px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '8px 12px',
              transition: 'border-color 0.15s'
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask any question about ${activeBranch.name}, formulas, lab software, exams, or career advice...`}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: input.trim() && !loading ? '#006EFF' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
          <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '6px' }}>
            Skill2Career Universal AI supports all branches • Formula derivations, verified academic concepts & lab workflows
          </div>
        </div>
      </main>
    </div>
  );
};

export default AICopilotPage;
