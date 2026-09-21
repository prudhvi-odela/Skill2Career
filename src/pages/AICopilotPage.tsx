import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Bot, User, Sparkles, Copy, Check, RotateCcw, Plus,
  MessageSquare, BookOpen, ExternalLink, Award, Compass, Target,
  ArrowRight, ShieldCheck, HelpCircle
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
    { id: 'th_2', title: 'FastAPI & Async Microservices', lastMessage: 'Official docs and code...', date: 'Yesterday' },
    { id: 'th_3', title: 'System Design: Distributed Caching', lastMessage: 'CAP theorem and Redis...', date: '3 days ago' },
    { id: 'th_4', title: 'Google STAR Resume Bullets', lastMessage: 'Quantified impact formula...', date: 'Last week' }
  ]);
  const [activeThreadId, setActiveThreadId] = useState<string>('th_1');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_msg',
      role: 'assistant',
      content: `### 👋 Welcome to Skill2Career AI Copilot

I am your intelligent technical career mentor and tutor, powered by Google Gemini and grounded placement operations agents.

Here is what I can do for you right now:
- 📅 **Daily Timetable**: Ask *"What should I prepare today?"* or *"How to prepare today?"* for an optimal time-blocked plan.
- 🌐 **Chrome Documentation Links**: Get direct official links to [FastAPI Documentation](https://fastapi.tiangolo.com), [MDN Web Docs](https://developer.mozilla.org), [PyTorch Tutorials](https://pytorch.org/tutorials/), and [NeetCode 150](https://neetcode.io/roadmap).
- 📝 **Diagnostic Assessments**: Recommend and launch skill quizzes in Python, SQL, React, Docker, and DSA with instant verified profile badges.
- 📄 **Resume Optimization**: Convert project descriptions into quantified Google X-Y-Z / STAR bullet points.

*Select a quick prompt below or type your career question!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
          history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply || 'Here is what I recommend for your preparation today.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error('Chat API returned error');
      }
    } catch (err) {
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `### 📅 Recommended Preparation for Today

Here is your high-yield placement preparation strategy:

1. ⏱️ **Block 1: Data Structures & Algorithms (60m)**
   - Practice Two Pointers and Binary Search.
   - Resource: 🌐 [NeetCode 150 Algorithms Roadmap](https://neetcode.io/roadmap)

2. ⏱️ **Block 2: Tech Stack & System APIs (90m)**
   - Build a verified FastAPI / Express service with PostgreSQL and Docker.
   - Resource: 🌐 [FastAPI Official Documentation](https://fastapi.tiangolo.com) | 🌐 [MDN JavaScript Guide](https://developer.mozilla.org)

3. ⏱️ **Block 3: Diagnostic Assessment (15m)**
   - Complete the **Python Core Assessment** or **React Architecture Assessment** in our **Assessment Center** to earn your verified badge.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMessage]);
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
    setThreads((prev) => [
      { id: newId, title: 'New Conversation', lastMessage: 'Starting new prep session...', date: 'Just now' },
      ...prev
    ]);
    setActiveThreadId(newId);
    setMessages([
      {
        id: 'init_msg_' + newId,
        role: 'assistant',
        content: `### 🚀 New Session Started

How can I help you prepare today? You can ask for:
- 📅 **"What should I prepare today?"**
- 🚀 **"How to prepare step-by-step?"**
- 🌐 **"Give me official Chrome documentation links for Python / React / Docker"**
- 📝 **"Test my skills with a quiz"**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to parse markdown links and render interactive tags
  const renderFormattedContent = (content: string) => {
    // Check if message mentions taking an assessment
    const hasAssessmentMention =
      content.toLowerCase().includes('assessment center') ||
      content.toLowerCase().includes('take the') ||
      content.toLowerCase().includes('diagnostic assessment');

    return (
      <div>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{content}</div>

        {/* Embedded action buttons if relevant */}
        {hasAssessmentMention && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '13px', fontWeight: 600 }}>
              <Award size={18} className="text-emerald-600" />
              <span>Diagnostic Topic Assessments Available Now</span>
            </div>
            <button
              onClick={() => navigate('/app/assessments')}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Go to Assessment Center</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const quickPrompts = [
    { label: '📅 What should I prepare today?', query: 'What should I prepare today for my target career goal?' },
    { label: '🚀 How to prepare step-by-step?', query: 'How to prepare today step-by-step with high-yield study techniques?' },
    { label: '⚡ FastAPI & Async APIs', query: 'Explain FastAPI async architecture, best practices, and official Chrome docs links' },
    { label: '⚛️ React 19 & Hooks', query: 'Explain React hooks and give official Chrome documentation links' },
    { label: '📝 Recommend an Assessment', query: 'Recommend a diagnostic assessment for me to verify my skills today' },
    { label: '📄 Quantified STAR Resume Bullet', query: 'How to write a high-scoring ATS STAR bullet point for a backend project?' }
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
                <MessageSquare size={15} style={{ color: activeThreadId === th.id ? '#006EFF' : '#94a3b8', shrink: 0 }} />
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
            <Award size={15} className="text-emerald-600" />
            <span>Topic Assessments</span>
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
                  Gemini & Grounded Multi-Agent
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
              <span>Skill Assessments (16+)</span>
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
                    shrink: 0,
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
                    shrink: 0
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
                <span>Formulating personalized preparation plan and fetching Chrome docs…</span>
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
              placeholder="Ask anything: What to prepare today? How to prepare? Get official Chrome docs or take a quiz..."
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
            Skill2Career AI provides structured guidance, verified documentation links, and real-time assessments to boost your placement outcomes.
          </div>
        </div>
      </main>
    </div>
  );
};
export default AICopilotPage;
