import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Bot, User, Sparkles, Copy, Check, RotateCcw, Plus,
  MessageSquare, BookOpen, ExternalLink, Award, Compass, Target,
  ArrowRight, ShieldCheck, HelpCircle, Code, Layers, FileText
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
  lastMessage: string;
  date: string;
}

export const AICopilotPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [threads, setThreads] = useState<ChatThread[]>([
    { id: 'th_1', title: "Today's Placement Preparation", lastMessage: 'What to prepare today...', date: 'Today' },
    { id: 'th_2', title: 'React Hooks & Frontend Architecture', lastMessage: 'useEffect, state immutability...', date: 'Yesterday' },
    { id: 'th_3', title: 'Google X-Y-Z STAR Resume Bullets', lastMessage: 'Quantified impact metrics...', date: '2 days ago' },
    { id: 'th_4', title: 'FastAPI & Distributed Caching', lastMessage: 'Async endpoints & Redis...', date: 'Last week' }
  ]);
  const [activeThreadId, setActiveThreadId] = useState<string>('th_1');

  const INITIAL_THREAD_MESSAGES: Record<string, ChatMessage[]> = {
    th_1: [
      {
        id: 'msg_1_1',
        role: 'user',
        content: 'What should I prepare today for my placement schedule?',
        timestamp: '09:30 AM'
      },
      {
        id: 'msg_1_2',
        role: 'assistant',
        content: `### 📅 High-Yield Daily Preparation Plan for Today

Here is your structured 4-stage placement readiness routine:

#### ⏱️ **Block 1: Data Structures & Algorithms (60 Minutes)**
- **Topic**: Two-Pointer Patterns & Binary Search (Search in Rotated Sorted Array, Container With Most Water).
- **Goal**: Solve 2 LeetCode Medium problems in under 25 minutes each.
- **Resource**: 🌐 [NeetCode 150 Blind Roadmap](https://neetcode.io/roadmap) | 🌐 [LeetCode Blind 75](https://leetcode.com/studyplan/blind-75/)

---

#### ⏱️ **Block 2: Core Stack & System APIs (90 Minutes)**
- **Topic**: Asynchronous APIs & Database Indexing (FastAPI / Node.js + PostgreSQL).
- **Goal**: Implement clean CRUD endpoints with input validation and connection pooling.
- **Resources**: 🌐 [FastAPI Async Documentation](https://fastapi.tiangolo.com/tutorial/)

---

#### ⏱️ **Block 3: System Design & CS Fundamentals (45 Minutes)**
- **Topic**: Distributed Caching (Redis LRU Eviction & Write-Through vs Write-Back Caching).
- **Goal**: Understand CAP Theorem tradeoffs and partition tolerance.

---

#### ⏱️ **Block 4: Diagnostic Assessment Verification (15 Minutes)**
- **Goal**: Complete today's topic assessment in our **Assessment Center** to earn a verified skill badge on your profile!`,
        timestamp: '09:31 AM'
      }
    ],
    th_2: [
      {
        id: 'msg_2_1',
        role: 'user',
        content: 'Explain React hooks and frontend architecture best practices with official Chrome docs links.',
        timestamp: 'Yesterday'
      },
      {
        id: 'msg_2_2',
        role: 'assistant',
        content: `### ⚛️ React 19 Architecture, Hooks & Modern Best Practices

React builds dynamic web interfaces through declarative components and state reactivity.

#### 1. Core Hooks Every Engineer Must Master:
- **\`useState\`**: Declares local component state. Always treat state as **immutable**; React uses shallow reference equality (\`Object.is\`) to trigger re-renders.
- **\`useEffect\`**: Synchronizes with external systems (APIs, subscriptions, DOM mutations). Empty dependency array \`[]\` executes only on mount; omit dependencies carefully to avoid stale closures.
- **\`useMemo\` & \`useCallback\`**: Cache CPU-intensive calculations and callback function instances between re-renders.
- **\`useRef\`**: Persists mutable values without triggering re-renders (useful for DOM access and interval timers).

#### 🌐 Official Chrome Documentation & Learning Links:
- 🔗 [React.dev Official Interactive Tutorials](https://react.dev/learn) — Official modern docs with interactive sandboxes.
- 🔗 [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript) — Core closures, promises, and async event loop.
- 🔗 [React Patterns & Custom Hooks Guide](https://reactpatterns.js.org/) — Real-world architectural composition patterns.`,
        timestamp: 'Yesterday'
      }
    ],
    th_3: [
      {
        id: 'msg_3_1',
        role: 'user',
        content: 'How do I convert my project notes into Google STAR resume bullets for ATS?',
        timestamp: '2 days ago'
      },
      {
        id: 'msg_3_2',
        role: 'assistant',
        content: `### 📄 Resume Architecture & High-Scoring ATS Strategy

To pass automated Applicant Tracking Systems (ATS) and impress technical interviewers at top tech firms, structure your resume using the **Google X-Y-Z / STAR Formula**:

> *"Accomplished [X], as measured by [Y], by doing [Z]"*

#### Project Bullet Before & After:
- ❌ **Before**: *"Made an e-commerce backend API using Python and Docker."*
- ✅ **After**: *"Architected high-throughput RESTful backend service using **FastAPI** and **PostgreSQL**, containerizing deployment with **Docker** multi-stage builds to serve **5,000+** daily requests with **<80ms** response latency."*

#### 🌐 Recommended Resume & Career Tools:
- 🔗 [Resume AI Studio](/app/resume-ai) — Run real-time ATS scoring, generate STAR bullets, and tailor cold emails.
- 🔗 [Google Technical Resume Guide](https://www.techinterviewhandbook.org/resume/) — Comprehensive format rules.`,
        timestamp: '2 days ago'
      }
    ],
    th_4: [
      {
        id: 'msg_4_1',
        role: 'user',
        content: 'How does Redis distributed caching improve FastAPI response times?',
        timestamp: 'Last week'
      },
      {
        id: 'msg_4_2',
        role: 'assistant',
        content: `### ⚡ FastAPI & Redis Distributed Caching Architecture

Redis acts as an in-memory key-value data structure store used as a database, cache, and message broker.

#### Key Architectural Benefits:
1. **Sub-millisecond Latency**: Serving pre-computed queries from RAM drops p99 latency from ~120ms to <4ms.
2. **Cache-Aside Pattern**:
   - Application checks Redis for key.
   - If *Cache Hit*, return data immediately.
   - If *Cache Miss*, fetch from PostgreSQL, write to Redis with TTL (e.g. 300s), and return.
3. **Connection Pooling**: Use \`redis.asyncio\` connection pool in FastAPI startup event.

#### Official Documentation:
- 🔗 [FastAPI Advanced Caching](https://fastapi.tiangolo.com/advanced/custom-response/)
- 🔗 [Redis Official Documentation](https://redis.io/docs/)`,
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

  // Comprehensive Client-Side Intelligence Engine (Resilient fallback for all query types)
  const getSmartResponse = (queryText: string): string => {
    const q = queryText.toLowerCase();

    if (q.includes('react') || q.includes('hook') || q.includes('frontend')) {
      return `### ⚛️ React 19 Architecture, Hooks & Modern Best Practices

React builds dynamic web interfaces through declarative components and state reactivity.

#### 1. Core Hooks Every Engineer Must Master:
- **\`useState\`**: Declares local component state. Always treat state as **immutable**; React uses shallow reference equality (\`Object.is\`) to trigger re-renders.
- **\`useEffect\`**: Synchronizes with external systems (APIs, subscriptions, DOM mutations). Empty dependency array \`[]\` executes only on mount; omit dependencies carefully to avoid stale closures.
- **\`useMemo\` & \`useCallback\`**: Cache CPU-intensive calculations and callback function instances between re-renders.
- **\`useRef\`**: Persists mutable values without triggering re-renders (useful for DOM access and interval timers).

#### 2. Component Performance Principles:
- Avoid inline arrow functions inside high-frequency mapped lists.
- Keep state local to where it is needed instead of lifting everything globally.

#### 🌐 Official Chrome Documentation & Learning Links:
- 🔗 [React.dev Official Interactive Tutorials](https://react.dev/learn) — Official modern docs with interactive sandboxes.
- 🔗 [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript) — Core closures, promises, and async event loop.
- 🔗 [React Patterns & Custom Hooks Guide](https://reactpatterns.js.org/) — Real-world architectural composition patterns.

👉 *Ready to benchmark your knowledge? Take the **React Architecture & Hooks Assessment** in the Assessment Center!*`;
    }

    if (q.includes('resume') || q.includes('ats') || q.includes('build a new resume') || q.includes('bullet') || q.includes('cv')) {
      return `### 📄 Resume Architecture & High-Scoring ATS Strategy

To pass automated Applicant Tracking Systems (ATS) and impress technical interviewers at top tech firms, structure your resume using the **Google X-Y-Z / STAR Formula**:

> *"Accomplished [X], as measured by [Y], by doing [Z]"*

#### 1. The 4 Essential Resume Sections:
1. **Header**: Name, Email, LinkedIn, GitHub, Portfolio URL, and Contact.
2. **Technical Skills**: Grouped by *Languages* (Python, JS, C++), *Frameworks* (FastAPI, React), *Databases* (PostgreSQL, Redis), and *DevOps* (Docker, Git, AWS).
3. **Featured Projects**: 2-3 deep projects with live demo and GitHub links + 3 quantified bullet points per project.
4. **Education & Certifications**: Degree, GPA, relevant coursework, and verified certificates.

#### 2. Project Bullet Before & After:
- ❌ **Before**: *"Made an e-commerce backend API using Python and Docker."*
- ✅ **After**: *"Architected high-throughput RESTful backend service using **FastAPI** and **PostgreSQL**, containerizing deployment with **Docker** multi-stage builds to serve **5,000+** daily requests with **<80ms** response latency."*

#### 🌐 Recommended Resume & Career Tools:
- 🔗 [Resume AI Studio](/app/resume-ai) — Run real-time ATS scoring, generate STAR bullets, and tailor cold emails.
- 🔗 [Google Technical Resume Guide](https://www.techinterviewhandbook.org/resume/) — Comprehensive format rules.

👉 *Would you like me to rewrite a specific project description for you right now?*`;
    }

    if (q.includes('what to prepare today') || q.includes('what should i prepare') || q.includes('daily schedule') || q.includes('today')) {
      return `### 📅 High-Yield Daily Preparation Plan for Today

Here is your structured 4-stage placement readiness routine:

---

#### ⏱️ **Block 1: Data Structures & Algorithms (60 Minutes)**
- **Topic**: Two-Pointer Patterns & Binary Search (e.g., Search in Rotated Sorted Array, Container With Most Water).
- **Goal**: Solve 2 LeetCode Medium problems in under 25 minutes each.
- **Resource**: 🌐 [NeetCode 150 Blind Roadmap](https://neetcode.io/roadmap) | 🌐 [LeetCode Blind 75](https://leetcode.com/studyplan/blind-75/)

---

#### ⏱️ **Block 2: Core Stack & System APIs (90 Minutes)**
- **Topic**: Asynchronous APIs & Database Indexing (FastAPI / Node.js + PostgreSQL).
- **Goal**: Implement clean CRUD endpoints with input validation and connection pooling.
- **Resources**:
  - 🌐 [FastAPI Async Documentation](https://fastapi.tiangolo.com/tutorial/)
  - 🌐 [PostgreSQL Indexing & B-Tree Guide](https://use-the-index-luke.com/)

---

#### ⏱️ **Block 3: System Design & CS Fundamentals (45 Minutes)**
- **Topic**: Distributed Caching (Redis LRU Eviction & Write-Through vs Write-Back Caching).
- **Goal**: Understand CAP Theorem tradeoffs and partition tolerance.
- **Resource**: 🌐 [System Design Primer (GitHub)](https://github.com/donnemartin/system-design-primer)

---

#### ⏱️ **Block 4: Diagnostic Assessment Verification (15 Minutes)**
- **Goal**: Complete today's topic assessment in our **Assessment Center** to earn a verified skill badge on your profile!`;
    }

    if (q.includes('how to prepare') || q.includes('study plan') || q.includes('preparation strategy')) {
      return `### 🚀 Step-by-Step Technical Placement Blueprint

Follow this 5-step engineering study method:

1. **Active Recall & Implementation**: Never passively read tutorials. Immediately write runnable code in your IDE to test edge cases.
2. **The UMPIRE Problem-Solving Pattern**:
   - **U**nderstand constraints $\\rightarrow$ **M**atch pattern (Hash Map, Sliding Window, BFS) $\\rightarrow$ **P**lan pseudocode $\\rightarrow$ **I**mplement $\\rightarrow$ **R**eview test cases $\\rightarrow$ **E**valuate Big-O time/space complexity.
3. **Build Complete End-to-End Projects**: Implement backend authentication, relational database migrations, Docker containerization, and unit tests.
4. **Daily Diagnostic Verification**: Take topic assessments on Skill2Career to prove competencies.

#### 🌐 Essential Chrome Learning Links:
- 🔗 [Python 3 Official Docs](https://docs.python.org/3/tutorial/)
- 🔗 [FastAPI Official Docs](https://fastapi.tiangolo.com)
- 🔗 [React.dev Interactive Guides](https://react.dev/learn)
- 🔗 [NeetCode Algorithms Roadmap](https://neetcode.io/roadmap)
- 🔗 [System Design Primer](https://github.com/donnemartin/system-design-primer)`;
    }

    if (q.includes('fastapi') || q.includes('backend') || q.includes('api')) {
      return `### ⚡ FastAPI High-Performance Backend Architecture

FastAPI is a modern, high-performance web framework for Python 3.10+ based on standard Python type hints.

#### Key Architecture Principles:
1. **Pydantic Data Validation**: Automatic serialization, deserialization, and JSON schema validation.
2. **Async I/O Support**: Native \`async def\` route handlers running concurrently on the \`asyncio\` event loop.
3. **Dependency Injection**: Modular \`Depends()\` system for database connection pooling, JWT auth validation, and rate limiting.

#### 🌐 Official Chrome Links:
- 🔗 [FastAPI Official Documentation](https://fastapi.tiangolo.com/)
- 🔗 [Pydantic V2 Documentation](https://docs.pydantic.dev/latest/)

👉 *Test your skills: Try the **FastAPI & Async APIs Assessment** in the Assessment Center!*`;
    }

    if (q.includes('python') || q.includes('py')) {
      return `### 🐍 Python Core & OOP Mastery

Python is the leading language for AI/ML, backend microservices, and algorithmic interviews.

#### High-Frequency Interview Concepts:
- **Dictionary & Set Internals**: Hash tables providing $O(1)$ average lookup and amortized insertion.
- **Generators & Iterators**: Memory-efficient stream processing with \`yield\` ($O(1)$ auxiliary memory).
- **List Comprehensions**: Execute in optimized C bytecode inside CPython.
- **Object-Oriented Design**: \`@property\`, \`__dunder__\` methods, and abstract base classes (\`abc\`).

#### 🌐 Official Chrome Links:
- 🔗 [Python 3 Official Tutorial](https://docs.python.org/3/tutorial/)
- 🔗 [Real Python Advanced Tutorials](https://realpython.com/)

👉 *Test your skills: Take the **Python Core & OOP Assessment** in the Assessment Center!*`;
    }

    // Default intelligent greeting & guide
    return `### 🤖 Skill2Career AI Placement Advisor

I analyzed your question: **"${queryText}"**.

Here are targeted recommendations based on your target role (**${profile?.target_career_title || 'Software Engineer'}**):

1. 📅 **Daily Timetable**: Ask *"What should I prepare today?"* to get a 4-hour prioritized study routine.
2. 🌐 **Chrome Documentation Links**: Ask for official documentation on Python, React, FastAPI, PyTorch, Docker, or SQL.
3. 📝 **Topic Assessments**: Take quizzes in our **Assessment Center** across 16+ competencies to earn verified badges.
4. 📄 **Resume Optimization**: Check the **Resume AI Studio** to score your resume on ATS and craft Google STAR bullets.

*What specific technical topic or project would you like to explore next?*`;
  };

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
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply || data.message || 'I am ready to help you with any questions or code!',
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
        content: `I encountered a temporary connection issue. Please try sending your message again!`,
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
      content: `### 🚀 New Session Started

How can I help you prepare today? You can ask for:
- 📅 **"What should I prepare today?"**
- ⚛️ **"Explain React hooks and give official Chrome documentation links"**
- 📄 **"How do I build a strong engineering resume?"**
- 📝 **"Test my skills with a quiz"**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setThreads((prev) => [
      { id: newId, title: 'New Conversation', lastMessage: 'Starting new prep session...', date: 'Just now' },
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
              <h3 key={idx} style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px' }}>
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('#### ')) {
            return (
              <h4 key={idx} style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a', margin: '4px 0 2px' }}>
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
                  target={linkMatch[2].startsWith('http') ? '_blank' : '_self'}
                  rel="noreferrer"
                  onClick={(e) => {
                    if (linkMatch[2].startsWith('/')) {
                      e.preventDefault();
                      navigate(linkMatch[2]);
                    }
                  }}
                  style={{
                    color: '#006EFF',
                    fontWeight: 700,
                    textDecoration: 'none',
                    background: '#eff6ff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #bfdbfe',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{linkMatch[1]}</span>
                  <ExternalLink size={12} />
                </a>
                {parts[3]}
              </div>
            );
          }

          if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
            return (
              <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', paddingLeft: '8px' }}>
                <span style={{ color: '#006EFF', fontWeight: 700 }}>•</span>
                <span>{line.replace(/^[-•]\s*/, '')}</span>
              </div>
            );
          }

          if (!line.trim()) {
            return <div key={idx} style={{ height: '4px' }} />;
          }

          return (
            <div key={idx} style={{ fontSize: '13px' }}>
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  const quickPrompts = [
    { label: '📅 What should I prepare today?', query: 'What should I prepare today for my target career goal?' },
    { label: '⚛️ Explain React Hooks & Chrome Docs', query: 'Explain React hooks and give official Chrome documentation links' },
    { label: '📄 How to Build a Strong Resume', query: 'How to build a high-scoring ATS resume with STAR bullet points?' },
    { label: '⚡ FastAPI & Async Microservices', query: 'Explain FastAPI async architecture and give official Chrome docs links' },
    { label: '📝 Recommend an Assessment', query: 'Recommend a diagnostic assessment for me to verify my skills today' }
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 62px)', background: '#f8fafc', overflow: 'hidden' }}>
      {/* ── Left Sidebar (Chat Sessions) ── */}
      <aside
        style={{
          width: '260px',
          minWidth: '260px',
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
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              marginBottom: '16px',
              boxShadow: '0 2px 6px rgba(0, 110, 255, 0.2)'
            }}
          >
            <Plus size={16} />
            <span>New Chat Session</span>
          </button>

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
            <span>Topic Assessments (16+)</span>
          </button>
          <button
            onClick={() => navigate('/app/resume-ai')}
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
            <Sparkles size={15} className="text-blue-600" />
            <span>Resume AI Studio</span>
          </button>
        </div>
      </aside>

      {/* ── Center Conversation Area ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
        {/* Header */}
        <header
          style={{
            height: '56px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
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
                Skill2Career AI Mentor
                <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  Gemini & Multi-Agent Active
                </span>
              </h1>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Target: <strong>{profile?.target_career_title || 'Software Engineer'}</strong> • Student: <strong>{profile?.full_name || 'Alex Chen'}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <span>Skill Assessments</span>
            </button>
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
                maxWidth: msg.role === 'user' ? '80%' : '88%',
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
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0, 110, 255, 0.2)'
                  }}
                >
                  <Bot size={18} />
                </div>
              )}

              <div
                style={{
                  background: msg.role === 'user' ? '#006EFF' : '#ffffff',
                  color: msg.role === 'user' ? '#ffffff' : '#1e293b',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                  fontSize: '14px'
                }}
              >
                {renderFormattedContent(msg.content)}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    paddingTop: '8px',
                    borderTop: msg.role === 'user' ? '1px solid rgba(255,255,255,0.2)' : '1px solid #f1f5f9',
                    fontSize: '11px',
                    color: msg.role === 'user' ? '#dbeafe' : '#94a3b8'
                  }}
                >
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Copy message"
                    >
                      {copiedId === msg.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
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
                    background: '#cbd5e1',
                    color: '#334155',
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
                <span>Formulating personalized response and fetching Chrome docs…</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '8px 32px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {quickPrompts.map((p, idx) => (
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
              placeholder="Ask anything: Explain React hooks, what to prepare today, build a new resume, get Chrome docs..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                resize: 'none',
                outline: 'none',
                fontSize: '14px',
                color: '#0f172a',
                lineHeight: 1.4,
                maxHeight: '120px'
              }}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                background: '#006EFF',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                opacity: !input.trim() || loading ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Send</span>
              <Send size={15} />
            </button>
          </form>

          <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
            Skill2Career AI provides structured guidance, verified documentation links, and real-time assessments.
          </div>
        </div>
      </main>
    </div>
  );
};
export default AICopilotPage;
